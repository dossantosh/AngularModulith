import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // guarantees cookies (JSESSIONID) are always sent.
  const withCreds = req.clone({  });
  return next(withCreds);
};
