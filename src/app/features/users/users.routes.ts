// src/app/features/users/users.routes.ts
import { Routes } from '@angular/router';
import { SearchUsersComponent } from './search/search.component';

export const USERS_ROUTES: Routes = [

  { path: 'searchUsers', component: SearchUsersComponent },
  
];
