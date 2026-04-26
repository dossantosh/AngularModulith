import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthFacade } from '../application/auth.facade';

export const scopeGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthFacade);
  const router = inject(Router);
  const requiredScopes = route.data['requiredScopes'];

  return auth.loadSession().pipe(
    map(() => {
      if (!Array.isArray(requiredScopes) || auth.hasAllScopes(requiredScopes)) {
        return true;
      }
      return router.createUrlTree(['/forbidden']);
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};
