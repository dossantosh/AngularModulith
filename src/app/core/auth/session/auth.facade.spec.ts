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

  it('login() loads the full session, stores scopes and preserves the selected data source', () => {
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
      scopes: ['systems:read'],
      navigation: [
        {
          key: 'systems',
          label: 'Sistemas',
          icon: 'settings',
          items: [
            {
              key: 'users_search',
              label: 'Usuarios',
              icon: 'group',
              route: '/users/search',
            },
          ],
        },
      ],
    });

    expect(result).toBe('john');
    expect(facade.username()).toBe('john');
    expect(facade.dataSource()).toBe('historic');
    expect(facade.hasScope('systems:read')).toBe(true);
    expect(facade.hasAnyScope(['systems:write', 'systems:read'])).toBe(true);
    expect(facade.hasAllScopes(['systems:read'])).toBe(true);
    expect(facade.navigation()).toHaveLength(1);
    expect(facade.navigation()[0]?.items[0]?.route).toBe('/users/search');
  });

  it('loadSession() caches until logout resets it', () => {
    let firstResult: AuthenticatedUser | undefined;
    facade.loadSession().subscribe((value) => (firstResult = value));

    const firstRequest = http.expectOne((req) => req.url === '/api/auth/me');
    firstRequest.flush({
      username: 'john',
      dataSource: 'historic',
      scopes: [],
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
    });

    expect(facade.username()).toBe('john');
    expect(facade.dataSource()).toBe('historic');
  });

  it('logout() resets username, scopes, navigation, and data source', () => {
    facade.login({ username: 'john', password: 'pw', dataSource: 'historic' }).subscribe();
    http.expectOne((req) => req.url === '/api/auth/login').flush({ username: 'john' });
    http.expectOne((req) => req.url === '/api/auth/me').flush({
      username: 'john',
      dataSource: 'historic',
      scopes: ['systems:read'],
    });

    facade.logout().subscribe();

    const request = http.expectOne((req) => req.url === '/api/auth/logout');
    expect(request.request.method).toBe('POST');
    request.flush(null);

    expect(facade.username()).toBe(null);
    expect(facade.dataSource()).toBe('prod');
    expect(facade.hasScope('systems:read')).toBe(false);
    expect(facade.navigation()).toEqual([]);
  });

  it('clearSessionAfterUnauthorized() resets session and invalidates the cached /me response', () => {
    facade.loadSession().subscribe();

    http.expectOne((req) => req.url === '/api/auth/me').flush({
      username: 'john',
      dataSource: 'historic',
      scopes: ['systems:read'],
    });

    expect(facade.username()).toBe('john');

    facade.clearSessionAfterUnauthorized();

    expect(facade.username()).toBe(null);
    expect(facade.dataSource()).toBe('prod');
    expect(facade.hasScope('systems:read')).toBe(false);

    facade.loadSession().subscribe();
    http.expectOne((req) => req.url === '/api/auth/me').flush({
      username: 'jane',
      dataSource: 'prod',
      scopes: [],
    });

    expect(facade.username()).toBe('jane');
  });

  it('loadSession() reads scopes as the permission contract', () => {
    facade.loadSession().subscribe();

    http.expectOne((req) => req.url === '/api/auth/me').flush({
      username: 'john',
      dataSource: 'prod',
      scopes: ['systems:write'],
    });

    expect(facade.hasScope('systems:write')).toBe(true);
    expect(facade.hasAnyScope(['systems:read', 'systems:write'])).toBe(true);
    expect(facade.hasAllScopes(['systems:write'])).toBe(true);
  });
});
