import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { isRequiredScopesRouteData } from '../permissions/permissions';
import { AuthFacade } from '../session/auth.facade';

export const scopeGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthFacade);
  const router = inject(Router);

  return auth.loadSession().pipe(
    map(() => {
      const routeData = route.data;
      if (!isRequiredScopesRouteData(routeData)) {
        return router.createUrlTree(['/forbidden']);
      }

      return auth.hasAllScopes(routeData.requiredScopes) ? true : router.createUrlTree(['/forbidden']);
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};

