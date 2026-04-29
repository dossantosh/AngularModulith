import { Component, computed, inject } from '@angular/core';

import { HasScopeDirective } from '../../../core/auth/permissions/has-scope.directive';
import { AUTH_SCOPES } from '../../../core/auth/permissions/permissions';
import { AuthFacade } from '../../../core/auth/session/auth.facade';
import {
  AppButtonComponent,
  AppCardComponent,
  AppPageComponent,
  AppStatusBadgeComponent,
} from '../../../shared/ui';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [
    AppButtonComponent,
    AppCardComponent,
    AppPageComponent,
    AppStatusBadgeComponent,
    HasScopeDirective,
  ],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {
  private readonly auth = inject(AuthFacade);

  readonly username = this.auth.username;
  readonly dataSource = this.auth.dataSource;
  readonly userName = computed(() => this.username() ?? 'Guest');
  readonly dataSourceLabel = computed(() => (this.dataSource() === 'historic' ? 'Historico' : 'Prod'));
  readonly scopes = AUTH_SCOPES;
  readonly breadcrumbs = [{ label: 'Inicio' }];
}
