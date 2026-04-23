import { Routes } from '@angular/router';

import {
  authGuard,
  authorityGuard,
  ForbiddenPage,
  LoginPage,
} from '@angular-modulith/auth';
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
        canActivate: [authorityGuard('MODULE_USERS')],
        loadChildren: () => import('@angular-modulith/users').then((m) => m.USERS_ROUTES),
      },
    ],
  },
  { path: 'login', component: LoginPage },
  { path: '**', redirectTo: 'forbidden' },
];
