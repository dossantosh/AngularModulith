import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { UsersApi } from '../data-access/users.api';
import { UsersFacade } from './users.facade';

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

type UsersApiStub = Pick<UsersApi, 'search'> &
  Partial<
    Pick<
      UsersApi,
      'getById' | 'update' | 'getPersonalData' | 'updatePersonalData' | 'getRoles' | 'updateRoles'
    >
  >;

function setup(api: UsersApiStub) {
  TestBed.configureTestingModule({
    providers: [UsersFacade, { provide: UsersApi, useValue: api }],
  });

  return TestBed.inject(UsersFacade);
}

describe('UsersFacade', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('search() sets loading true while request is in-flight, then success', () => {
    const subject = new Subject<ReturnType<typeof userPage>>();
    const api = { search: vi.fn(() => subject.asObservable()) };
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
      search: vi
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
      search: () => throwError(() => new Error('boom')),
    });

    facade.search();

    expect(facade.error()).toBe('Failed to load users');
    expect(facade.users().length).toBe(0);
    expect(facade.loading()).toBe(false);
  });

  it('loadNext/loadPrevious set direction/lastId and call search()', () => {
    const api = {
      search: vi.fn(() =>
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
    api.search.mockClear();

    facade.loadNext();
    expect(api.search).toHaveBeenCalledOnce();
    expect(api.search).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'NEXT', lastId: 123 }),
    );

    api.search.mockClear();

    facade.loadPrevious();
    expect(api.search).toHaveBeenCalledOnce();
    expect(api.search).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'PREVIOUS', lastId: 55 }),
    );
  });

  it('resets keyset pagination when filters change before a new search', () => {
    const api = {
      search: vi.fn(() =>
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
    api.search.mockClear();

    facade.setFilters({ username: 'ana' });
    facade.search();

    expect(api.search).toHaveBeenCalledOnce();
    expect(api.search).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'NEXT',
        lastId: null,
        filters: expect.objectContaining({ username: 'ana' }),
      }),
    );
  });

  it('loadNext does nothing when hasNext is false or nextId is null', () => {
    const api = { search: vi.fn(() => of(userPage())) };
    const facade = setup(api);

    facade.search();
    api.search.mockClear();

    facade.loadNext();
    expect(api.search).not.toHaveBeenCalled();
  });

  it('loadPrevious does nothing when hasPrevious is false or previousId is null', () => {
    const api = { search: vi.fn(() => of(userPage())) };
    const facade = setup(api);

    facade.search();
    api.search.mockClear();

    facade.loadPrevious();
    expect(api.search).not.toHaveBeenCalled();
  });

  it('clearFiltersAndSearch resets filters and pagination before searching', () => {
    const api = { search: vi.fn(() => of(userPage())) };
    const facade = setup(api);

    facade.setFilters({ id: 7, username: 'john', email: 'john@example.com' });

    facade.clearFiltersAndSearch();

    expect(api.search).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'NEXT',
        lastId: null,
        filters: { id: null, username: '', email: '' },
      }),
    );
  });

  it('delegates user detail loading and updates to the users API', async () => {
    const user = {
      id: 7,
      username: 'ana',
      email: 'ana@example.com',
      enabled: true,
      isAdmin: false,
      roles: [],
    };
    const api = {
      search: vi.fn(() => of(userPage())),
      getById: vi.fn(() => of(user)),
      update: vi.fn(() => of(user)),
    };
    const facade = setup(api);

    facade.loadUser(7).subscribe();
    facade
      .updateUser(7, {
        username: 'ana',
        email: 'ana@example.com',
        enabled: true,
        isAdmin: false,
      })
      .subscribe();

    expect(api.getById).toHaveBeenCalledWith(7);
    expect(api.update).toHaveBeenCalledWith(7, {
      username: 'ana',
      email: 'ana@example.com',
      enabled: true,
      isAdmin: false,
    });
  });

  it('delegates personal data and roles operations to the users API', () => {
    const personalData = {
      userId: 7,
      username: 'ana',
      employeeCode: 'EMP-7',
      firstName: 'Ana',
      lastName: 'Lopez',
      corporateEmail: 'ana@company.local',
      phone: '',
      identityDocument: '',
      birthDate: '',
      address: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      country: '',
      jobTitle: '',
      department: '',
      hireDate: '',
      status: 'ACTIVE' as const,
      contractType: null,
      internalNotes: '',
    };
    const roles = {
      userId: 7,
      username: 'ana',
      roles: [{ id: 1, name: 'SYSTEMS' }],
      availableRoles: [{ id: 1, name: 'SYSTEMS' }],
    };
    const api = {
      search: vi.fn(() => of(userPage())),
      getPersonalData: vi.fn(() => of(personalData)),
      updatePersonalData: vi.fn(() => of(personalData)),
      getRoles: vi.fn(() => of(roles)),
      updateRoles: vi.fn(() => of(roles)),
    };
    const facade = setup(api);

    facade.loadPersonalData(7).subscribe();
    facade.updatePersonalData(7, personalData).subscribe();
    facade.loadRoles(7).subscribe();
    facade.updateRoles(7, [1]).subscribe();

    expect(api.getPersonalData).toHaveBeenCalledWith(7);
    expect(api.updatePersonalData).toHaveBeenCalledWith(7, personalData);
    expect(api.getRoles).toHaveBeenCalledWith(7);
    expect(api.updateRoles).toHaveBeenCalledWith(7, [1]);
  });
});
