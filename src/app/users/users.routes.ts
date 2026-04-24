import { Routes } from '@angular/router';

import { UsersSearchPage } from './feature-search/users-search.page';

export const USERS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  { path: 'search', component: UsersSearchPage },
];
