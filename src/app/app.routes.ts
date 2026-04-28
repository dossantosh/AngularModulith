import { Routes } from '@angular/router';

import { AUTH_SCOPES } from './domains/auth/domain/auth-scopes';
import { ForbiddenPage } from './domains/auth/feature-forbidden/forbidden.page';
import { LoginPage } from './domains/auth/feature-login/login.page';
import { authGuard } from './domains/auth/routing/auth.guard';
import { scopeGuard } from './domains/auth/routing/scope.guard';
import { DashboardPage } from './domains/dashboard/feature-home/dashboard.page';
import { ShellContainer } from './domains/shell/feature-shell/shell.container';

export const routes: Routes = [
  {
    path: '',
    component: ShellContainer,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: DashboardPage,
      },
      {
        path: 'forbidden',
        component: ForbiddenPage,
      },
      {
        path: 'users',
        canActivate: [scopeGuard],
        data: {
          requiredScopes: [AUTH_SCOPES.users.read],
        },
        loadChildren: () => import('./domains/users/users.routes').then((m) => m.USERS_ROUTES),
      },
    ],
  },
  { path: 'login', component: LoginPage },
  { path: '**', redirectTo: 'forbidden' },
];
