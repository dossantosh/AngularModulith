import { Routes } from '@angular/router';

import { authGuard } from './core/auth/guards/auth.guard';
import { scopeGuard } from './core/auth/guards/scope.guard';
import { AUTH_SCOPES } from './core/auth/permissions/permissions';
import { ShellContainer } from './core/layout/shell.container';
import { ForbiddenPage } from './domains/auth/feature-forbidden/forbidden.page';
import { LoginPage } from './domains/auth/feature-login/login.page';
import { DashboardPage } from './domains/dashboard/feature-home/dashboard.page';

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
