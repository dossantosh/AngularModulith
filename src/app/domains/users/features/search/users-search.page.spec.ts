import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { UsersFacade } from '../../application/users.facade';
import { UsersSearchPage } from './users-search.page';

function createFacadeStub() {
  return {
    filters: vi.fn(() => ({ id: null, username: '', email: '' })),
    setFilters: vi.fn(),
    search: vi.fn(),
    clearFiltersAndSearch: vi.fn(),
    loadNext: vi.fn(),
    loadPrevious: vi.fn(),
  };
}

describe('UsersSearchPage', () => {
  let fixture: ComponentFixture<UsersSearchPage>;
  let facade: ReturnType<typeof createFacadeStub>;

  beforeEach(() => {
    facade = createFacadeStub();

    TestBed.configureTestingModule({
      providers: [{ provide: UsersFacade, useValue: facade }],
    });

    TestBed.overrideComponent(UsersSearchPage, {
      set: { template: '' },
    });

    fixture = TestBed.createComponent(UsersSearchPage);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('searches once when the page initializes', () => {
    expect(facade.search).toHaveBeenCalledOnce();
  });

  it('syncs form changes into the facade filters', () => {
    fixture.componentInstance.filtersForm.patchValue({
      id: 7,
      username: 'ana',
      email: 'ana@example.com',
    });

    expect(facade.setFilters).toHaveBeenCalledWith({
      id: 7,
      username: 'ana',
      email: 'ana@example.com',
    });
  });

  it('clears filters through the facade without emitting intermediate form changes', () => {
    facade.setFilters.mockClear();

    fixture.componentInstance.clearFilters();

    expect(facade.setFilters).not.toHaveBeenCalled();
    expect(facade.clearFiltersAndSearch).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.filtersForm.getRawValue()).toEqual({
      id: null,
      username: '',
      email: '',
    });
  });

  it('delegates pagination actions to the facade', () => {
    fixture.componentInstance.loadPrevious();
    fixture.componentInstance.loadNext();

    expect(facade.loadPrevious).toHaveBeenCalledOnce();
    expect(facade.loadNext).toHaveBeenCalledOnce();
  });
});
