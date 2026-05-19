import { Routes } from '@angular/router';

import { authGuard } from './core/auth/guards/auth.guard';
import { scopeMatchGuard } from './core/auth/guards/scope.guard';
import { AUTH_SCOPES, requireScopes } from './core/auth/permissions/permissions';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/shell.container').then((component) => component.ShellContainer),
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./domains/dashboard/pages/dashboard/dashboard.page').then(
            (component) => component.DashboardPage,
          ),
      },
      {
        path: 'forbidden',
        loadComponent: () =>
          import('./domains/auth/pages/forbidden/forbidden.page').then(
            (component) => component.ForbiddenPage,
          ),
      },
      {
        path: 'users',
        canMatch: [scopeMatchGuard],
        data: requireScopes(AUTH_SCOPES.systems.read),
        loadChildren: () => import('./domains/users/users.routes').then((m) => m.USERS_ROUTES),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./domains/auth/pages/login/login.page').then((component) => component.LoginPage),
  },
  { path: '**', redirectTo: '/forbidden' },
];
