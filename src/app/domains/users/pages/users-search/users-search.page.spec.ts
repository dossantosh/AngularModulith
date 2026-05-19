import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { UsersSearchApi, type UserPageDto } from '../../api/users-search.api';
import { UsersSearchPage } from './users-search.page';

function userPage(overrides: Partial<UserPageDto> = {}): UserPageDto {
  return {
    content: [],
    hasNext: false,
    hasPrevious: false,
    nextId: null,
    previousId: null,
    empty: true,
    ...overrides,
  };
}

function setup(api: Pick<UsersSearchApi, 'searchUsers'>): ComponentFixture<UsersSearchPage> {
  TestBed.configureTestingModule({
    providers: [{ provide: UsersSearchApi, useValue: api }],
  });

  TestBed.overrideComponent(UsersSearchPage, {
    set: { template: '' },
  });

  const fixture = TestBed.createComponent(UsersSearchPage);
  fixture.detectChanges();

  return fixture;
}

describe('UsersSearchPage', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('searches once when the page initializes', () => {
    const api = { searchUsers: vi.fn(() => of(userPage())) };

    setup(api);

    expect(api.searchUsers).toHaveBeenCalledOnce();
  });

  it('syncs form changes into the search request after debounce', async () => {
    const api = { searchUsers: vi.fn(() => of(userPage())) };
    const fixture = setup(api);

    fixture.componentInstance.filtersForm.patchValue({
      id: 7,
      username: 'ana',
      email: 'ana@example.com',
    });

    expect(api.searchUsers).toHaveBeenCalledOnce();

    await new Promise((resolve) => setTimeout(resolve, 450));

    expect(api.searchUsers).toHaveBeenCalledTimes(2);
    expect(api.searchUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({
        direction: 'NEXT',
        lastId: null,
        filters: {
          id: 7,
          username: 'ana',
          email: 'ana@example.com',
        },
      }),
    );
  });

  it('clears filters without emitting an intermediate form search', () => {
    const api = { searchUsers: vi.fn(() => of(userPage())) };
    const fixture = setup(api);

    api.searchUsers.mockClear();
    fixture.componentInstance.filtersForm.patchValue(
      { id: 7, username: 'ana', email: 'ana@example.com' },
      { emitEvent: false },
    );

    fixture.componentInstance.clearFilters();

    expect(api.searchUsers).toHaveBeenCalledOnce();
    expect(api.searchUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'NEXT',
        lastId: null,
        filters: { id: null, username: '', email: '' },
      }),
    );
    expect(fixture.componentInstance.filtersForm.getRawValue()).toEqual({
      id: null,
      username: '',
      email: '',
    });
  });

  it('loads next and previous pages when keyset ids are available', () => {
    const api = {
      searchUsers: vi.fn(() =>
        of(
          userPage({
            hasNext: true,
            hasPrevious: true,
            nextId: 123,
            previousId: 55,
          }),
        ),
      ),
    };
    const fixture = setup(api);

    api.searchUsers.mockClear();

    fixture.componentInstance.loadNext();
    expect(api.searchUsers).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'NEXT', lastId: 123 }),
    );

    api.searchUsers.mockClear();

    fixture.componentInstance.loadPrevious();
    expect(api.searchUsers).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'PREVIOUS', lastId: 55 }),
    );
  });

  it('ignores an older in-flight request when a newer search starts', async () => {
    const first = new Subject<UserPageDto>();
    const second = new Subject<UserPageDto>();
    const oldUser = {
      id: 1,
      username: 'old',
      email: 'old@example.com',
      enabled: true,
      isAdmin: false,
    };
    const newUser = {
      id: 2,
      username: 'new',
      email: 'new@example.com',
      enabled: true,
      isAdmin: false,
    };
    const api = {
      searchUsers: vi
        .fn()
        .mockReturnValueOnce(first.asObservable())
        .mockReturnValueOnce(second.asObservable()),
    };
    const fixture = setup(api);

    fixture.componentInstance.filtersForm.patchValue({ username: 'new' });
    await new Promise((resolve) => setTimeout(resolve, 450));

    first.next(userPage({ content: [oldUser], empty: false }));
    expect(fixture.componentInstance.users()).toEqual([]);

    second.next(userPage({ content: [newUser], empty: false }));
    expect(fixture.componentInstance.users()).toEqual([newUser]);
  });

  it('sets error state on failure', () => {
    const fixture = setup({
      searchUsers: () => throwError(() => new Error('boom')),
    });

    expect(fixture.componentInstance.error()).toBe('Failed to load users');
    expect(fixture.componentInstance.users()).toEqual([]);
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('does not paginate when keyset ids are missing', () => {
    const api = { searchUsers: vi.fn(() => of(userPage())) };
    const fixture = setup(api);

    api.searchUsers.mockClear();
    fixture.componentInstance.loadNext();
    fixture.componentInstance.loadPrevious();

    expect(api.searchUsers).not.toHaveBeenCalled();
  });

  it('exposes the edit action as the last table column', () => {
    const fixture = setup({ searchUsers: vi.fn(() => of(userPage())) });

    expect(fixture.componentInstance.displayedColumns.at(-1)).toBe('actions');
    expect(fixture.componentInstance.userDetailsLink(7)).toEqual(['/users', 7, 'personal-data']);
  });
});
