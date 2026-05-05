import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSearchFiltersComponent } from './app-search-filters.component';

@Component({
  standalone: true,
  imports: [AppSearchFiltersComponent],
  template: `
    <app-search-filters title="Filtros" subtitle="Busqueda incremental">
      <span search-filter-actions>Debounce 400ms</span>
      <label>
        Nombre
        <input />
      </label>
      <button type="button">Limpiar</button>
    </app-search-filters>
  `,
})
class SearchFiltersHostComponent {}

describe('AppSearchFiltersComponent', () => {
  let fixture: ComponentFixture<SearchFiltersHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SearchFiltersHostComponent],
    });

    fixture = TestBed.createComponent(SearchFiltersHostComponent);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders title, action slot and projected filters', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Filtros');
    expect(text).toContain('Busqueda incremental');
    expect(text).toContain('Debounce 400ms');
    expect(text).toContain('Nombre');
    expect(text).toContain('Limpiar');
  });
});
