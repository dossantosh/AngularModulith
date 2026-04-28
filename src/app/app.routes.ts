import { Routes } from '@angular/router';

import { AUTH_SCOPES } from '@angular-modulith/auth';
import { ForbiddenPage, LoginPage } from '@angular-modulith/auth/pages';
import { authGuard, scopeGuard } from '@angular-modulith/auth/routing';
import { DashboardPage } from '@angular-modulith/dashboard';
import { ShellContainer } from '@angular-modulith/shell';

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
        loadChildren: () => import('@angular-modulith/users').then((m) => m.USERS_ROUTES),
      },
    ],
  },
  { path: 'login', component: LoginPage },
  { path: '**', redirectTo: 'forbidden' },
];
