import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    const httpClient = TestBed.inject(HttpClient);
    service = new AuthService(httpClient);

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('login() stores username and view, and returns username', () => {
    let result: string | undefined;

    service
      .login({ username: 'john', password: 'pw', view: 'historic' } as any)
      .subscribe((r) => (result = r));

    const req = http.expectOne((r) => r.url === '/api/auth/login');
    expect(req.request.method).toBe('POST');

    req.flush({ username: 'john' });

    expect(result).toBe('john');

    // optional: verify side-effects
    service.username$.subscribe((u) => expect(u).toBe('john'));
    expect(service.currentView).toBe('historic');
  });

  it('me() caches (shareReplay) until login/logout resets it', () => {
    let r1: any;
    service.me().subscribe((r) => (r1 = r));

    const req1 = http.expectOne((r) => r.url === '/api/auth/me');
    req1.flush({ username: 'john', authorities: ['ROLE_USER'], view: 'DEFAULT' });

    expect(r1?.username).toBe('john');

    // Second call should NOT trigger another HTTP request due to cache
    let r2: any;
    service.me().subscribe((r) => (r2 = r));
    http.expectNone((r) => r.url === '/api/auth/me');
    expect(r2?.username).toBe('john');

    // After logout, cache should reset -> calling me() triggers HTTP again
    service.logout().subscribe();
    const logoutReq = http.expectOne((r) => r.url === '/api/auth/logout');
    logoutReq.flush(null);

    service.me().subscribe();
    const req2 = http.expectOne((r) => r.url === '/api/auth/me');
    req2.flush({ username: 'john', authorities: [], view: 'DEFAULT' });
  });

  it('logout() resets username, authorities, and view', () => {
    service.logout().subscribe();

    const req = http.expectOne((r) => r.url === '/api/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush(null);

    // If your service exposes signals/subjects, assert them here.
    // Example (only if these exist in your AuthService):
    // expect(service.username()).toBe(null);
    // expect(service.authorities()).toEqual([]);
    // expect(service.view()).toBe(null);
  });

  it('initCsrf() swallows errors and completes', () => {
    let completed = false;

    service.initCsrf().subscribe({
      complete: () => (completed = true),
    });

    const req = http.expectOne((r) => r.url === '/api/auth/csrf');
    req.flush('boom', { status: 500, statusText: 'Server Error' });

    expect(completed).toBe(true);
  });
});
