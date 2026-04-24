import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthApi } from './auth.api';

describe('AuthApi', () => {
  let api: AuthApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthApi, provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(AuthApi);
    TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('initCsrf() swallows errors and completes', () => {
    let completed = false;

    api.initCsrf().subscribe({
      complete: () => (completed = true),
    });

    const request = http.expectOne((req) => req.url === '/api/auth/csrf');
    request.flush('boom', { status: 500, statusText: 'Server Error' });

    expect(completed).toBe(true);
  });
});
