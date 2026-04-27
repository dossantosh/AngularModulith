import { CanActivateFn } from '@angular/router';

import { AUTH_SCOPES } from '../domain/auth-scopes';
import { scopeGuardFor } from './scope.guard';

export const canReadUsersGuard: CanActivateFn = scopeGuardFor([AUTH_SCOPES.users.read]);
