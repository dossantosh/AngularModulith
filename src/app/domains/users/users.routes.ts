import { Routes } from '@angular/router';

import { UsersUserShellPage } from './features/detail/users-user-shell.page';
import { UsersEditPage } from './features/edit/users-edit.page';
import { UsersPersonalDataPage } from './features/personal-data/users-personal-data.page';
import { UsersRolesPage } from './features/roles/users-roles.page';
import { UsersSearchPage } from './features/search/users-search.page';

export const USERS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  { path: 'search', component: UsersSearchPage },
  {
    path: ':id',
    component: UsersUserShellPage,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'personal-data' },
      { path: 'personal-data', component: UsersPersonalDataPage },
      { path: 'personal-data/edit', component: UsersEditPage },
      { path: 'roles', component: UsersRolesPage },
      { path: 'edit', redirectTo: 'personal-data/edit' },
    ],
  },
];
