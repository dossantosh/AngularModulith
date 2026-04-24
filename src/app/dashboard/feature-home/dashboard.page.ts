import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthFacade } from '@angular-modulith/auth';
import { CardComponent, PageComponent } from '@angular-modulith/shared/ui';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [CardComponent, PageComponent, RouterLink],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {
  private readonly auth = inject(AuthFacade);

  readonly username = this.auth.username;
  readonly userName = computed(() => this.username() ?? 'Guest');
  readonly canReadUsers = computed(() => this.auth.canReadUsers());
}
