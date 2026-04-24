import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthenticatedUser } from '../domain/authenticated-user';
import { AUTHORITY } from '../domain/authority';
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

  it('login() loads the full session, stores authorities and preserves the selected data source', () => {
    let result: string | undefined;

    facade
      .login({ username: 'john', password: 'pw', dataSource: 'historic' })
      .subscribe((value) => (result = value));

    const request = http.expectOne((req) => req.url === '/api/auth/login');
    expect(request.request.method).toBe('POST');

    request.flush({ username: 'john' });
    http.expectOne((req) => req.url === '/api/auth/me').flush({
      username: 'john',
      authorities: [AUTHORITY.moduleUsers],
      dataSource: 'historic',
      capabilities: {
        users: { access: true, read: true, write: false },
        perfumes: { access: false, read: false, write: false },
      },
    });

    expect(result).toBe('john');
    expect(facade.username()).toBe('john');
    expect(facade.authorities()).toEqual([AUTHORITY.moduleUsers]);
    expect(facade.dataSource()).toBe('historic');
    expect(facade.canAccessUsers()).toBe(true);
    expect(facade.canReadUsers()).toBe(true);
    expect(facade.canWriteUsers()).toBe(false);
  });

  it('loadSession() caches until logout resets it', () => {
    let firstResult: AuthenticatedUser | undefined;
    facade.loadSession().subscribe((value) => (firstResult = value));

    const firstRequest = http.expectOne((req) => req.url === '/api/auth/me');
    firstRequest.flush({
      username: 'john',
      authorities: [AUTHORITY.moduleUsers],
      dataSource: 'historic',
      capabilities: {
        users: { access: true, read: false, write: false },
        perfumes: { access: false, read: false, write: false },
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
    secondMeRequest.flush({ username: 'john', authorities: [], dataSource: 'prod' });
  });

  it('logout() resets username, authorities, and data source', () => {
    facade.login({ username: 'john', password: 'pw', dataSource: 'historic' }).subscribe();
    http.expectOne((req) => req.url === '/api/auth/login').flush({ username: 'john' });
    http.expectOne((req) => req.url === '/api/auth/me').flush({
      username: 'john',
      authorities: [AUTHORITY.moduleUsers],
      dataSource: 'historic',
      capabilities: {
        users: { access: true, read: false, write: false },
        perfumes: { access: false, read: false, write: false },
      },
    });

    facade.logout().subscribe();

    const request = http.expectOne((req) => req.url === '/api/auth/logout');
    expect(request.request.method).toBe('POST');
    request.flush(null);

    expect(facade.username()).toBe(null);
    expect(facade.authorities()).toEqual([]);
    expect(facade.dataSource()).toBe('prod');
    expect(facade.canAccessUsers()).toBe(false);
  });

  it('loadSession() derives capabilities from authorities when the backend does not send capabilities yet', () => {
    facade.loadSession().subscribe();

    http.expectOne((req) => req.url === '/api/auth/me').flush({
      username: 'john',
      authorities: [AUTHORITY.moduleUsers, AUTHORITY.submoduleWriteUsers],
      dataSource: 'prod',
    });

    expect(facade.canAccessUsers()).toBe(true);
    expect(facade.canReadUsers()).toBe(false);
    expect(facade.canWriteUsers()).toBe(true);
  });
});
