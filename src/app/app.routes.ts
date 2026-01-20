import { Routes } from '@angular/router';

import { IndexComponent } from './features/index/index.component';
import { LoginComponent } from './features/login/login.component';

import { MainLayoutComponent } from './layout/components/main/main-layout.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  /**
   * Authenticated area
   */
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      /**
       * Index route
       */
      { path: '', component: IndexComponent },

      /**
       * Users
       */
      {
        path: 'usersmanagement',
        loadChildren: () => import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
      },
    ],
  },

  /**
   * Public login page route
   */
  { path: 'login', component: LoginComponent },

  /**
   * Wildcard route
   * Javadoc: Redirect unknown paths to the root (auth area).
   */
  { path: '**', redirectTo: '' },
];
