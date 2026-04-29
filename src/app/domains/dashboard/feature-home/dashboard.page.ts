import { Component, computed, inject } from '@angular/core';

import { HasScopeDirective } from '../../../core/auth/permissions/has-scope.directive';
import { AUTH_SCOPES } from '../../../core/auth/permissions/permissions';
import { AuthFacade } from '../../../core/auth/session/auth.facade';
import { AppButtonComponent, AppCardComponent, AppPageComponent } from '../../../shared/ui';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [AppButtonComponent, AppCardComponent, AppPageComponent, HasScopeDirective],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {
  private readonly auth = inject(AuthFacade);

  readonly username = this.auth.username;
  readonly userName = computed(() => this.username() ?? 'Guest');
  readonly scopes = AUTH_SCOPES;
}
