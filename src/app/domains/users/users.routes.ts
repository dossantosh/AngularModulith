import { Routes } from '@angular/router';

import { scopeMatchGuard } from '../../core/auth/guards/scope.guard';
import { AUTH_SCOPES, requireScopes } from '../../core/auth/permissions/permissions';
import { UserProfileFacade } from './state/user-profile.facade';

export const USERS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/users-search/users-search.page').then(
        (component) => component.UsersSearchPage,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/manage-user/users-manage-shell.page').then(
        (component) => component.UsersManageShellPage,
      ),
    providers: [UserProfileFacade],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'personal-data' },
      {
        path: 'personal-data',
        loadComponent: () =>
          import('./pages/user-profile/users-personal-data.page').then(
            (component) => component.UsersPersonalDataPage,
          ),
      },
      {
        path: 'personal-data/edit',
        canMatch: [scopeMatchGuard],
        data: requireScopes(AUTH_SCOPES.systems.write),
        loadComponent: () =>
          import('./pages/user-profile/users-edit.page').then(
            (component) => component.UsersEditPage,
          ),
      },
      {
        path: 'roles',
        canMatch: [scopeMatchGuard],
        data: requireScopes(AUTH_SCOPES.systems.write),
        loadComponent: () =>
          import('./pages/user-roles/users-roles.page').then(
            (component) => component.UsersRolesPage,
          ),
      },
      { path: 'edit', redirectTo: 'personal-data/edit' },
    ],
  },
];
