import { CanActivateFn } from '@angular/router';

import { AUTH_SCOPES } from '../domain/auth-scopes';
import { scopeGuard } from './scope.guard';

export const canReadUsersGuard: CanActivateFn = (route, state) => {
  route.data = {
    ...route.data,
    requiredScopes: [AUTH_SCOPES.users.read],
  };
  return scopeGuard(route, state);
};
