import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

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

  it('login() stores username and view, and returns username', () => {
    let result: string | undefined;

    facade
      .login({ username: 'john', password: 'pw', view: 'historic' })
      .subscribe((value) => (result = value));

    const request = http.expectOne((req) => req.url === '/api/auth/login');
    expect(request.request.method).toBe('POST');

    request.flush({ username: 'john' });

    expect(result).toBe('john');
    expect(facade.username()).toBe('john');
    expect(facade.currentView).toBe('historic');
  });

  it('loadSession() caches until logout resets it', () => {
    let firstResult: any;
    facade.loadSession().subscribe((value) => (firstResult = value));

    const firstRequest = http.expectOne((req) => req.url === '/api/auth/me');
    firstRequest.flush({ username: 'john', authorities: ['MODULE_USERS'] });

    expect(firstResult?.username).toBe('john');

    let secondResult: any;
    facade.loadSession().subscribe((value) => (secondResult = value));
    http.expectNone((req) => req.url === '/api/auth/me');
    expect(secondResult?.username).toBe('john');

    facade.logout().subscribe();
    const logoutRequest = http.expectOne((req) => req.url === '/api/auth/logout');
    logoutRequest.flush(null);

    facade.loadSession().subscribe();
    const secondMeRequest = http.expectOne((req) => req.url === '/api/auth/me');
    secondMeRequest.flush({ username: 'john', authorities: [] });
  });

  it('logout() resets username, authorities, and view', () => {
    facade.login({ username: 'john', password: 'pw', view: 'historic' }).subscribe();
    http.expectOne((req) => req.url === '/api/auth/login').flush({ username: 'john' });

    facade.logout().subscribe();

    const request = http.expectOne((req) => req.url === '/api/auth/logout');
    expect(request.request.method).toBe('POST');
    request.flush(null);

    expect(facade.username()).toBe(null);
    expect(facade.authorities()).toEqual([]);
    expect(facade.currentView).toBe('prod');
  });

  it('initCsrf() swallows errors and completes', () => {
    let completed = false;

    facade.initCsrf().subscribe({
      complete: () => (completed = true),
    });

    const request = http.expectOne((req) => req.url === '/api/auth/csrf');
    request.flush('boom', { status: 500, statusText: 'Server Error' });

    expect(completed).toBe(true);
  });
});
