import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSearchFiltersComponent } from './app-search-filters.component';

@Component({
  standalone: true,
  imports: [AppSearchFiltersComponent],
  template: `
    <app-search-filters title="Busqueda" subtitle="Encuentra usuarios por sus datos principales">
      <span search-filter-actions>Accion secundaria</span>
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
    expect(text).toContain('Busqueda');
    expect(text).toContain('Encuentra usuarios por sus datos principales');
    expect(text).toContain('Accion secundaria');
    expect(text).toContain('Nombre');
    expect(text).toContain('Limpiar');
  });
});
