import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AppSearchResultsComponent } from './app-search-results.component';

@Component({
  standalone: true,
  imports: [AppSearchResultsComponent],
  template: `
    <app-search-results
      title="Resultados"
      subtitle="Listado operativo"
      [loading]="loading"
      [empty]="empty"
      [error]="error"
      [previousDisabled]="previousDisabled"
      [nextDisabled]="nextDisabled"
      (retry)="retry()"
      (previous)="previous()"
      (next)="next()"
    >
      <button result-actions type="button">Exportar</button>
      <button empty-actions type="button">Limpiar filtros</button>
      <div id="projected-results">Tabla del dominio</div>
    </app-search-results>
  `,
})
class SearchResultsHostComponent {
  loading = false;
  empty = false;
  error: string | null = null;
  previousDisabled = false;
  nextDisabled = false;

  retry = vi.fn();
  previous = vi.fn();
  next = vi.fn();
}

describe('AppSearchResultsComponent', () => {
  let fixture: ComponentFixture<SearchResultsHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SearchResultsHostComponent],
    });

    fixture = TestBed.createComponent(SearchResultsHostComponent);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders title, actions, projected content and pagination', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Resultados');
    expect(text).toContain('Exportar');
    expect(text).toContain('Tabla del dominio');
    expect(text).toContain('Anterior');
    expect(text).toContain('Siguiente');
  });

  it('renders loading state instead of projected content when the result is empty and loading', () => {
    fixture.componentInstance.loading = true;
    fixture.componentInstance.empty = true;
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Cargando resultados...');
    expect(text).not.toContain('Tabla del dominio');
  });

  it('renders empty state with projected empty actions', () => {
    fixture.componentInstance.empty = true;
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Sin resultados');
    expect(text).toContain('Limpiar filtros');
    expect(text).not.toContain('Tabla del dominio');
  });

  it('renders error state and emits retry', () => {
    fixture.componentInstance.error = 'Fallo de red';
    fixture.detectChanges();

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    ) as HTMLButtonElement[];
    const button = buttons.find((element) => element.textContent?.includes('Reintentar'));

    expect(fixture.nativeElement.textContent).toContain('Fallo de red');
    button?.click();

    expect(fixture.componentInstance.retry).toHaveBeenCalledOnce();
  });

  it('emits pagination events', () => {
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('app-pagination-bar button');
    (buttons[0] as HTMLButtonElement).click();
    (buttons[1] as HTMLButtonElement).click();

    expect(fixture.componentInstance.previous).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.next).toHaveBeenCalledOnce();
  });
});
