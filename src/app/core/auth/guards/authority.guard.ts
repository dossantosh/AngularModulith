import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../auth.service';

/**
 * Guard that requires at least one authority.
 * Example: canActivate: [authorityGuard('MODULE_USERS')]
 */
export const authorityGuard =
  (...required: string[]): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return auth.me().pipe(
      map(() => {
        if (auth.hasAnyAuthority(...required)) return true;
        return router.createUrlTree(['/forbidden']);
      }),
      catchError(() => of(router.createUrlTree(['/login'])))
    );
  };
