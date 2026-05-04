import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthFacade } from '../session/auth.facade';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthFacade);
  const router = inject(Router);
  const withCredentials = req.clone({ withCredentials: true });
  return next(withCredentials).pipe(
    catchError((error: unknown) => {
      if (isUnauthorized(error) && isProtectedApiRequest(req.url)) {
        auth.clearSessionAfterUnauthorized();
        void router.navigateByUrl('/login');
      }

      return throwError(() => error);
    })
  );
};

function isUnauthorized(error: unknown): error is HttpErrorResponse {
  return error instanceof HttpErrorResponse && error.status === 401;
}

function isProtectedApiRequest(url: string): boolean {
  const path = getPath(url);
  return path.startsWith('/api/') && !path.startsWith('/api/auth/');
}

function getPath(url: string): string {
  return new URL(url, 'http://localhost').pathname;
}
