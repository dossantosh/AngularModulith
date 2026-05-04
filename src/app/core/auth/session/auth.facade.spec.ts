import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthFacade } from './auth.facade';
import { AuthenticatedUser } from './session.model';

describe('AuthFacade', () => {
  let facade: AuthFacade;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    facade = TestBed.inject(AuthFacade);
    TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('login() loads the full session, stores capabilities and preserves the selected data source', () => {
    let result: string | undefined;

    facade
      .login({ username: 'john', password: 'pw', dataSource: 'historic' })
      .subscribe((value) => (result = value));

    const request = http.expectOne((req) => req.url === '/api/auth/login');
    expect(request.request.method).toBe('POST');

    request.flush({ username: 'john' });
    http.expectOne((req) => req.url === '/api/auth/me').flush({
      username: 'john',
      dataSource: 'historic',
      scopes: ['users:read'],
      capabilities: {
        users: {
          canAccess: true,
          canRead: true,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
        perfumes: {
          canAccess: false,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
      },
    });

    expect(result).toBe('john');
    expect(facade.username()).toBe('john');
    expect(facade.dataSource()).toBe('historic');
    expect(facade.can('users', 'access')).toBe(true);
    expect(facade.can('users', 'read')).toBe(true);
    expect(facade.can('users', 'write')).toBe(false);
    expect(facade.hasScope('users:read')).toBe(true);
    expect(facade.hasAnyScope(['users:create', 'users:read'])).toBe(true);
    expect(facade.hasAllScopes(['users:read'])).toBe(true);
    expect(facade.can('users', 'read')).toBe(true);
  });

  it('loadSession() caches until logout resets it', () => {
    let firstResult: AuthenticatedUser | undefined;
    facade.loadSession().subscribe((value) => (firstResult = value));

    const firstRequest = http.expectOne((req) => req.url === '/api/auth/me');
    firstRequest.flush({
      username: 'john',
      dataSource: 'historic',
      scopes: [],
      capabilities: {
        users: {
          canAccess: true,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
        perfumes: {
          canAccess: false,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
      },
    });

    expect(firstResult?.username).toBe('john');
    expect(facade.dataSource()).toBe('historic');

    let secondResult: AuthenticatedUser | undefined;
    facade.loadSession().subscribe((value) => (secondResult = value));
    http.expectNone((req) => req.url === '/api/auth/me');
    expect(secondResult?.username).toBe('john');

    facade.logout().subscribe();
    const logoutRequest = http.expectOne((req) => req.url === '/api/auth/logout');
    logoutRequest.flush(null);

    facade.loadSession().subscribe();
    const secondMeRequest = http.expectOne((req) => req.url === '/api/auth/me');
    secondMeRequest.flush({
      username: 'john',
      dataSource: 'prod',
      scopes: [],
      capabilities: {
        users: {
          canAccess: false,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
        perfumes: {
          canAccess: false,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
      },
    });
  });

  it('loadSession() clears the cache when the session request fails', () => {
    facade.loadSession().subscribe({ error: () => undefined });

    const failedRequest = http.expectOne((req) => req.url === '/api/auth/me');
    failedRequest.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(facade.username()).toBe(null);
    expect(facade.dataSource()).toBe('prod');

    facade.loadSession().subscribe();
    http.expectOne((req) => req.url === '/api/auth/me').flush({
      username: 'john',
      dataSource: 'historic',
      scopes: [],
      capabilities: {
        users: {
          canAccess: true,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
        perfumes: {
          canAccess: false,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
      },
    });

    expect(facade.username()).toBe('john');
    expect(facade.dataSource()).toBe('historic');
  });

  it('logout() resets username, capabilities, and data source', () => {
    facade.login({ username: 'john', password: 'pw', dataSource: 'historic' }).subscribe();
    http.expectOne((req) => req.url === '/api/auth/login').flush({ username: 'john' });
    http.expectOne((req) => req.url === '/api/auth/me').flush({
      username: 'john',
      dataSource: 'historic',
      scopes: ['users:read'],
      capabilities: {
        users: {
          canAccess: true,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
        perfumes: {
          canAccess: false,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
      },
    });

    facade.logout().subscribe();

    const request = http.expectOne((req) => req.url === '/api/auth/logout');
    expect(request.request.method).toBe('POST');
    request.flush(null);

    expect(facade.username()).toBe(null);
    expect(facade.dataSource()).toBe('prod');
    expect(facade.can('users', 'access')).toBe(false);
    expect(facade.hasScope('users:read')).toBe(false);
  });

  it('clearSessionAfterUnauthorized() resets session and invalidates the cached /me response', () => {
    facade.loadSession().subscribe();

    http.expectOne((req) => req.url === '/api/auth/me').flush({
      username: 'john',
      dataSource: 'historic',
      scopes: ['users:read'],
      capabilities: {
        users: {
          canAccess: true,
          canRead: true,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
        perfumes: {
          canAccess: false,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
      },
    });

    expect(facade.username()).toBe('john');

    facade.clearSessionAfterUnauthorized();

    expect(facade.username()).toBe(null);
    expect(facade.dataSource()).toBe('prod');
    expect(facade.can('users', 'read')).toBe(false);

    facade.loadSession().subscribe();
    http.expectOne((req) => req.url === '/api/auth/me').flush({
      username: 'jane',
      dataSource: 'prod',
      scopes: [],
      capabilities: {
        users: {
          canAccess: false,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
        perfumes: {
          canAccess: false,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
      },
    });

    expect(facade.username()).toBe('jane');
  });

  it('loadSession() reads capabilities as the permission contract', () => {
    facade.loadSession().subscribe();

    http.expectOne((req) => req.url === '/api/auth/me').flush({
      username: 'john',
      dataSource: 'prod',
      scopes: ['users:update'],
      capabilities: {
        users: {
          canAccess: true,
          canRead: false,
          canCreate: false,
          canUpdate: true,
          canDelete: false,
        },
        perfumes: {
          canAccess: false,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
      },
    });

    expect(facade.can('users', 'access')).toBe(true);
    expect(facade.can('users', 'read')).toBe(false);
    expect(facade.can('users', 'write')).toBe(true);
    expect(facade.hasScope('users:update')).toBe(true);
    expect(facade.can('users', 'update')).toBe(true);
  });
});
