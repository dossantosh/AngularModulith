import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AuthFacade } from '../session/auth.facade';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let auth: { clearSessionAfterUnauthorized: ReturnType<typeof vi.fn> };
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    auth = {
      clearSessionAfterUnauthorized: vi.fn(),
    };
    router = {
      navigateByUrl: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthFacade, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('clones request with withCredentials=true', () => {
    const request = new HttpRequest('GET', '/api/test');

    const next: HttpHandlerFn = (nextRequest): Observable<HttpEvent<unknown>> => {
      expect(nextRequest.withCredentials).toBe(true);
      return of();
    };

    intercept(request, next).subscribe();
  });

  it('clears session and redirects to login when a protected API request returns 401', () => {
    const request = new HttpRequest('GET', '/api/users');
    const error = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      url: '/api/users',
    });

    intercept(request, () => throwError(() => error)).subscribe({ error: () => undefined });

    expect(auth.clearSessionAfterUnauthorized).toHaveBeenCalledOnce();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('does not redirect when an auth endpoint returns 401', () => {
    const request = new HttpRequest('POST', '/api/auth/login', {});
    const error = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      url: '/api/auth/login',
    });

    intercept(request, () => throwError(() => error)).subscribe({ error: () => undefined });

    expect(auth.clearSessionAfterUnauthorized).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('does not redirect on 403 because forbidden is handled by route permissions', () => {
    const request = new HttpRequest('GET', '/api/users');
    const error = new HttpErrorResponse({
      status: 403,
      statusText: 'Forbidden',
      url: '/api/users',
    });

    intercept(request, () => throwError(() => error)).subscribe({ error: () => undefined });

    expect(auth.clearSessionAfterUnauthorized).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});

function intercept(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  return TestBed.runInInjectionContext(() => authInterceptor(request, next));
}
