import { Routes } from '@angular/router';

import { UserProfileFacade } from './manage-user/profile/application/user-profile.facade';
import { UsersEditPage } from './manage-user/profile/pages/users-edit.page';
import { UsersPersonalDataPage } from './manage-user/profile/pages/users-personal-data.page';
import { UserRolesFacade } from './manage-user/roles/application/user-roles.facade';
import { UsersRolesPage } from './manage-user/roles/pages/users-roles.page';
import { UsersManageShellPage } from './manage-user/shell/users-manage-shell.page';
import { UsersSearchPage } from './search/pages/users-search.page';

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
      { path: 'roles', component: UsersRolesPage, providers: [UserRolesFacade] },
      { path: 'edit', redirectTo: 'personal-data/edit' },
    ],
  },
];
