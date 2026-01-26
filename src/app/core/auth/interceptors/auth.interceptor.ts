import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // guarantees cookies (SESSION/JSESSIONID) are always sent.
  const withCreds = req.clone({ withCredentials: true });
  return next(withCreds);
};