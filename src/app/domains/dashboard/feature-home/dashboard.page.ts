import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthFacade } from '../../auth/application/auth.facade';
import { HasScopeDirective } from '../../auth/directives/has-scope.directive';
import { AUTH_SCOPES } from '../../auth/domain/auth-scopes';
import { CardComponent, PageComponent } from '../../../shared/ui';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [CardComponent, HasScopeDirective, PageComponent, RouterLink],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {
  private readonly auth = inject(AuthFacade);

  readonly username = this.auth.username;
  readonly userName = computed(() => this.username() ?? 'Guest');
  readonly scopes = AUTH_SCOPES;
}
