import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthenticatedUser } from '../domain/authenticated-user';
import { AuthFacade } from './auth.facade';

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
      userId: 1,
      username: 'john',
      dataSource: 'historic',
      roles: ['USER'],
      scopes: ['user:read'],
      capabilities: {
        users: {
          access: true,
          read: true,
          write: false,
          canRead: true,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
        perfumes: {
          access: false,
          read: false,
          write: false,
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
    expect(facade.canAccessUsers()).toBe(true);
    expect(facade.canReadUsers()).toBe(true);
    expect(facade.canWriteUsers()).toBe(false);
    expect(facade.hasScope('user:read')).toBe(true);
    expect(facade.hasAnyScope(['user:create', 'user:read'])).toBe(true);
    expect(facade.hasAllScopes(['user:read'])).toBe(true);
    expect(facade.can('users', 'read')).toBe(true);
  });

  it('loadSession() caches until logout resets it', () => {
    let firstResult: AuthenticatedUser | undefined;
    facade.loadSession().subscribe((value) => (firstResult = value));

    const firstRequest = http.expectOne((req) => req.url === '/api/auth/me');
    firstRequest.flush({
      username: 'john',
      dataSource: 'historic',
      roles: [],
      scopes: [],
      capabilities: {
        users: {
          access: true,
          read: false,
          write: false,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
        perfumes: {
          access: false,
          read: false,
          write: false,
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
      roles: [],
      scopes: [],
      capabilities: {
        users: {
          access: false,
          read: false,
          write: false,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
        perfumes: {
          access: false,
          read: false,
          write: false,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
      },
    });
  });

  it('logout() resets username, capabilities, and data source', () => {
    facade.login({ username: 'john', password: 'pw', dataSource: 'historic' }).subscribe();
    http.expectOne((req) => req.url === '/api/auth/login').flush({ username: 'john' });
    http.expectOne((req) => req.url === '/api/auth/me').flush({
      username: 'john',
      dataSource: 'historic',
      roles: ['USER'],
      scopes: ['user:read'],
      capabilities: {
        users: {
          access: true,
          read: false,
          write: false,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
        perfumes: {
          access: false,
          read: false,
          write: false,
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
    expect(facade.canAccessUsers()).toBe(false);
    expect(facade.hasScope('user:read')).toBe(false);
  });

  it('loadSession() reads capabilities as the permission contract', () => {
    facade.loadSession().subscribe();

    http.expectOne((req) => req.url === '/api/auth/me').flush({
      username: 'john',
      dataSource: 'prod',
      roles: ['ADMIN'],
      scopes: ['user:update'],
      capabilities: {
        users: {
          access: true,
          read: false,
          write: true,
          canRead: false,
          canCreate: false,
          canUpdate: true,
          canDelete: false,
        },
        perfumes: {
          access: false,
          read: false,
          write: false,
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
      },
    });

    expect(facade.canAccessUsers()).toBe(true);
    expect(facade.canReadUsers()).toBe(false);
    expect(facade.canWriteUsers()).toBe(true);
    expect(facade.hasScope('user:update')).toBe(true);
    expect(facade.can('users', 'update')).toBe(true);
  });
});
