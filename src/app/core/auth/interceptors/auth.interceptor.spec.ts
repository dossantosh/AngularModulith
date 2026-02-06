import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  it('clones request with withCredentials=true', () => {
    const req = new HttpRequest('GET', '/api/test');

    const next: HttpHandlerFn = (r): Observable<HttpEvent<unknown>> => {
      expect(r.withCredentials).toBe(true);
      return of();
    };

    authInterceptor(req, next).subscribe();
  });
});
