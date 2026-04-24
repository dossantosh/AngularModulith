import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthFacade } from '../application/auth.facade';

export const canAccessUsersGuard: CanActivateFn = () => {
  const auth = inject(AuthFacade);
  const router = inject(Router);

  return auth.loadSession().pipe(
    map(() => {
      if (auth.canAccessUsers()) return true;
      return router.createUrlTree(['/forbidden']);
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};
