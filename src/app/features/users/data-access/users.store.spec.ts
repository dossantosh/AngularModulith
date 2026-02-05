import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { UsersStore } from './users.store';
import { UsersApi } from './searchUsers.api';

describe('UsersStore', () => {
  it('search() sets loading true while request is in-flight, then success', () => {
    const subj = new Subject<any>();
    const api = { search: vi.fn(() => subj.asObservable()) };

    TestBed.configureTestingModule({
      providers: [UsersStore, { provide: UsersApi, useValue: api }],
    });

    const store = TestBed.inject(UsersStore);

    store.search();

    expect(store.loading()).toBe(true);
    expect(store.status()).toBe('loading');
    
    subj.next({
      content: [{ id: 1, username: 'john', email: 'a@b.com' }],
      hasNext: true,
      hasPrevious: false,
      nextId: 10,
      previousId: null,
      empty: false,
    });
    subj.complete();

    expect(store.loading()).toBe(false);
    expect(store.status()).toBe('success');
    expect(store.users().length).toBe(1);
    expect(store.hasNext()).toBe(true);
    expect(store.nextId()).toBe(10);
  });

  it('search() sets error state on failure', () => {
    TestBed.configureTestingModule({
      providers: [
        UsersStore,
        { provide: UsersApi, useValue: { search: () => throwError(() => new Error('boom')) } },
      ],
    });

    const store = TestBed.inject(UsersStore);

    store.search();

    expect(store.status()).toBe('error');
    expect(store.error()).toBe('Failed to load users');
    expect(store.users().length).toBe(0);
    expect(store.loading()).toBe(false);
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
      providers: [UsersStore, { provide: UsersApi, useValue: api }],
    });

    const store = TestBed.inject(UsersStore);

    store.search();
    api.search.mockClear();

    store.loadNext();
    expect(api.search).toHaveBeenCalledOnce();
    expect(store.direction()).toBe('NEXT');
    expect(store.lastId()).toBe(123);

    api.search.mockClear();

    store.loadPrevious();
    expect(api.search).toHaveBeenCalledOnce();
    expect(store.direction()).toBe('PREVIOUS');
    expect(store.lastId()).toBe(55);
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
      providers: [UsersStore, { provide: UsersApi, useValue: api }],
    });

    const store = TestBed.inject(UsersStore);

    store.search();
    api.search.mockClear();

    store.loadNext();
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
      providers: [UsersStore, { provide: UsersApi, useValue: api }],
    });

    const store = TestBed.inject(UsersStore);

    store.search();
    api.search.mockClear();

    store.loadPrevious();
    expect(api.search).not.toHaveBeenCalled();
  });
});
