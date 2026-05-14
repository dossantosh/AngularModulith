import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { UsersSearchApi } from '../data-access/users-search.api';
import { UsersSearchFacade } from './users-search.facade';

function userPage(overrides = {}) {
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

function setup(api: Pick<UsersSearchApi, 'searchUsers'>) {
  TestBed.configureTestingModule({
    providers: [UsersSearchFacade, { provide: UsersSearchApi, useValue: api }],
  });

  return TestBed.inject(UsersSearchFacade);
}

describe('UsersSearchFacade', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('search() sets loading true while request is in-flight, then success', () => {
    const subject = new Subject<ReturnType<typeof userPage>>();
    const api = { searchUsers: vi.fn(() => subject.asObservable()) };
    const facade = setup(api);

    facade.search();

    expect(facade.loading()).toBe(true);

    subject.next(
      userPage({
        content: [{ id: 1, username: 'john', email: 'a@b.com', enabled: true, isAdmin: false }],
        hasNext: true,
        nextId: 10,
        empty: false,
      }),
    );
    subject.complete();

    expect(facade.loading()).toBe(false);
    expect(facade.users().length).toBe(1);
    expect(facade.hasNext()).toBe(true);
  });

  it('search() ignores an older in-flight request when a newer search starts', () => {
    const first = new Subject<ReturnType<typeof userPage>>();
    const second = new Subject<ReturnType<typeof userPage>>();
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
    const facade = setup(api);

    facade.search();
    facade.setFilters({ username: 'new' });
    facade.search();

    first.next(userPage({ content: [oldUser], empty: false }));
    expect(facade.users()).toEqual([]);

    second.next(userPage({ content: [newUser], empty: false }));
    expect(facade.users()).toEqual([newUser]);
  });

  it('search() sets error state on failure', () => {
    const facade = setup({
      searchUsers: () => throwError(() => new Error('boom')),
    });

    facade.search();

    expect(facade.error()).toBe('Failed to load users');
    expect(facade.users().length).toBe(0);
    expect(facade.loading()).toBe(false);
  });

  it('loadNext/loadPrevious set direction/lastId and call search()', () => {
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
    const facade = setup(api);

    facade.search();
    api.searchUsers.mockClear();

    facade.loadNext();
    expect(api.searchUsers).toHaveBeenCalledOnce();
    expect(api.searchUsers).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'NEXT', lastId: 123 }),
    );

    api.searchUsers.mockClear();

    facade.loadPrevious();
    expect(api.searchUsers).toHaveBeenCalledOnce();
    expect(api.searchUsers).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'PREVIOUS', lastId: 55 }),
    );
  });

  it('resets keyset pagination when filters change before a new search', () => {
    const api = {
      searchUsers: vi.fn(() =>
        of(
          userPage({
            hasNext: true,
            nextId: 123,
          }),
        ),
      ),
    };
    const facade = setup(api);

    facade.search();
    facade.loadNext();
    api.searchUsers.mockClear();

    facade.setFilters({ username: 'ana' });
    facade.search();

    expect(api.searchUsers).toHaveBeenCalledOnce();
    expect(api.searchUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'NEXT',
        lastId: null,
        filters: expect.objectContaining({ username: 'ana' }),
      }),
    );
  });

  it('loadNext does nothing when hasNext is false or nextId is null', () => {
    const api = { searchUsers: vi.fn(() => of(userPage())) };
    const facade = setup(api);

    facade.search();
    api.searchUsers.mockClear();

    facade.loadNext();
    expect(api.searchUsers).not.toHaveBeenCalled();
  });

  it('loadPrevious does nothing when hasPrevious is false or previousId is null', () => {
    const api = { searchUsers: vi.fn(() => of(userPage())) };
    const facade = setup(api);

    facade.search();
    api.searchUsers.mockClear();

    facade.loadPrevious();
    expect(api.searchUsers).not.toHaveBeenCalled();
  });

  it('clearFiltersAndSearch resets filters and pagination before searching', () => {
    const api = { searchUsers: vi.fn(() => of(userPage())) };
    const facade = setup(api);

    facade.setFilters({ id: 7, username: 'john', email: 'john@example.com' });

    facade.clearFiltersAndSearch();

    expect(api.searchUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'NEXT',
        lastId: null,
        filters: { id: null, username: '', email: '' },
      }),
    );
  });
});
