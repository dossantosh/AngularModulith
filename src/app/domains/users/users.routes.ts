import { Routes } from '@angular/router';

import { UsersManageShellPage } from './pages/manage-user/users-manage-shell.page';
import { UsersEditPage } from './pages/user-profile/users-edit.page';
import { UsersPersonalDataPage } from './pages/user-profile/users-personal-data.page';
import { UsersRolesPage } from './pages/user-roles/users-roles.page';
import { UsersSearchPage } from './pages/users-search/users-search.page';
import { UserProfileFacade } from './state/user-profile.facade';

export const USERS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  { path: 'search', component: UsersSearchPage },
  {
    path: ':id',
    component: UsersManageShellPage,
    providers: [UserProfileFacade],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'personal-data' },
      { path: 'personal-data', component: UsersPersonalDataPage },
      { path: 'personal-data/edit', component: UsersEditPage },
      { path: 'roles', component: UsersRolesPage },
      { path: 'edit', redirectTo: 'personal-data/edit' },
    ],
  },
];
