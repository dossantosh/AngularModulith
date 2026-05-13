import { Routes } from '@angular/router';

import { UsersEditPage } from './features/edit/users-edit.page';
import { UsersSearchPage } from './features/search/users-search.page';

export const USERS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  { path: 'search', component: UsersSearchPage },
  { path: ':id/edit', component: UsersEditPage },
];
