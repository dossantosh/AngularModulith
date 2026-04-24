import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { UsersApi } from '../data-access/users.api';
import { UsersQueryStore } from '../data-access/users-query.store';
import { UsersSearchFlowStore } from '../state/users-search-flow.store';
import { ClearUserFiltersUseCase } from './clear-user-filters.use-case';
import { PaginateUsersUseCase } from './paginate-users.use-case';
import { SearchUsersUseCase } from './search-users.use-case';
import { UsersFacade } from './users.facade';

describe('UsersFacade', () => {
  it('search() sets loading true while request is in-flight, then success', () => {
    const subject = new Subject<{
      content: Array<{ id: number; username: string; email: string; enabled: boolean; isAdmin: boolean }>;
      hasNext: boolean;
      hasPrevious: boolean;
      nextId: number | null;
      previousId: number | null;
      empty: boolean;
    }>();
    const api = { search: vi.fn(() => subject.asObservable()) };

    TestBed.configureTestingModule({
      providers: [
        UsersFacade,
        SearchUsersUseCase,
        ClearUserFiltersUseCase,
        PaginateUsersUseCase,
        UsersSearchFlowStore,
        UsersQueryStore,
        { provide: UsersApi, useValue: api },
      ],
    });

    const facade = TestBed.inject(UsersFacade);

    facade.search();

    expect(facade.loading()).toBe(true);

    subject.next({
      content: [{ id: 1, username: 'john', email: 'a@b.com', enabled: true, isAdmin: false }],
      hasNext: true,
      hasPrevious: false,
      nextId: 10,
      previousId: null,
      empty: false,
    });
    subject.complete();

    expect(facade.loading()).toBe(false);
    expect(facade.users().length).toBe(1);
    expect(facade.hasNext()).toBe(true);
  });

  it('search() sets error state on failure', () => {
    TestBed.configureTestingModule({
      providers: [
        UsersFacade,
        SearchUsersUseCase,
        ClearUserFiltersUseCase,
        PaginateUsersUseCase,
        UsersSearchFlowStore,
        UsersQueryStore,
        { provide: UsersApi, useValue: { search: () => throwError(() => new Error('boom')) } },
      ],
    });

    const facade = TestBed.inject(UsersFacade);

    facade.search();

    expect(facade.error()).toBe('Failed to load users');
    expect(facade.users().length).toBe(0);
    expect(facade.loading()).toBe(false);
  });

  it('loadNext/loadPrevious set direction/lastId and call search()', () => {
    const api = {
      search: vi.fn(() =>
        of({
          content: [],
          hasNext: true,
          hasPrevious: true,
          nextId: 123,
          previousId: 55,
          empty: true,
        }),
      ),
    };

    TestBed.configureTestingModule({
      providers: [
        UsersFacade,
        SearchUsersUseCase,
        ClearUserFiltersUseCase,
        PaginateUsersUseCase,
        UsersSearchFlowStore,
        UsersQueryStore,
        { provide: UsersApi, useValue: api },
      ],
    });

    const facade = TestBed.inject(UsersFacade);

    facade.search();
    api.search.mockClear();

    facade.loadNext();
    expect(api.search).toHaveBeenCalledOnce();
    expect(api.search).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'NEXT', lastId: 123 })
    );

    api.search.mockClear();

    facade.loadPrevious();
    expect(api.search).toHaveBeenCalledOnce();
    expect(api.search).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'PREVIOUS', lastId: 55 })
    );
  });

  it('loadNext does nothing when hasNext is false or nextId is null', () => {
    const api = {
      search: vi.fn(() =>
        of({
          content: [],
          hasNext: false,
          hasPrevious: false,
          nextId: null,
          previousId: null,
          empty: true,
        }),
      ),
    };

    TestBed.configureTestingModule({
      providers: [
        UsersFacade,
        SearchUsersUseCase,
        ClearUserFiltersUseCase,
        PaginateUsersUseCase,
        UsersSearchFlowStore,
        UsersQueryStore,
        { provide: UsersApi, useValue: api },
      ],
    });

    const facade = TestBed.inject(UsersFacade);

    facade.search();
    api.search.mockClear();

    facade.loadNext();
    expect(api.search).not.toHaveBeenCalled();
  });

  it('loadPrevious does nothing when hasPrevious is false or previousId is null', () => {
    const api = {
      search: vi.fn(() =>
        of({
          content: [],
          hasNext: false,
          hasPrevious: false,
          nextId: null,
          previousId: null,
          empty: true,
        }),
      ),
    };

    TestBed.configureTestingModule({
      providers: [
        UsersFacade,
        SearchUsersUseCase,
        ClearUserFiltersUseCase,
        PaginateUsersUseCase,
        UsersSearchFlowStore,
        UsersQueryStore,
        { provide: UsersApi, useValue: api },
      ],
    });

    const facade = TestBed.inject(UsersFacade);

    facade.search();
    api.search.mockClear();

    facade.loadPrevious();
    expect(api.search).not.toHaveBeenCalled();
  });
});
