import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  it('clones request with withCredentials=true', () => {
    const request = new HttpRequest('GET', '/api/test');

    const next: HttpHandlerFn = (nextRequest): Observable<HttpEvent<unknown>> => {
      expect(nextRequest.withCredentials).toBe(true);
      return of();
    };

    authInterceptor(request, next).subscribe();
  });
});
