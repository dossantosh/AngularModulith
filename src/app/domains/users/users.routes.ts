import { Routes } from '@angular/router';

import { UsersManageShellPage } from './manage-user/shell/users-manage-shell.page';
import { UsersEditPage } from './manage-user/profile/pages/users-edit.page';
import { UsersPersonalDataPage } from './manage-user/profile/pages/users-personal-data.page';
import { UsersRolesPage } from './manage-user/roles/pages/users-roles.page';
import { UsersSearchPage } from './search/pages/users-search.page';

export const USERS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  { path: 'search', component: UsersSearchPage },
  {
    path: ':id',
    component: UsersManageShellPage,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'personal-data' },
      { path: 'personal-data', component: UsersPersonalDataPage },
      { path: 'personal-data/edit', component: UsersEditPage },
      { path: 'roles', component: UsersRolesPage },
      { path: 'edit', redirectTo: 'personal-data/edit' },
    ],
  },
];
