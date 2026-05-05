import { Component, DestroyRef, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';

import { AuthFacade } from '../auth/session/auth.facade';
import { buildSidebarNavigation } from '../navigation/app-navigation';
import { MainLayoutComponent } from './main-layout.component';

@Component({
  selector: 'app-shell-container',
  standalone: true,
  imports: [MainLayoutComponent, RouterOutlet],
  template: `
    <app-main-layout
      [companyName]="companyName"
      [userName]="userName()"
      [dataSource]="dataSource()"
      [navigationItems]="navigationItems()"
      (logout)="logout()"
    >
      <router-outlet></router-outlet>
    </app-main-layout>
  `,
})
export class ShellContainer {
  private readonly auth = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly companyName = "Seb's Perfumes";
  readonly username = this.auth.username;
  readonly userName = computed(() => this.username() ?? 'Guest');
  readonly dataSource = this.auth.dataSource;
  readonly scopes = this.auth.scopes;
  readonly navigation = this.auth.navigation;
  readonly navigationItems = computed(() => buildSidebarNavigation(this.scopes(), this.navigation()));

  logout(): void {
    this.auth
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigateByUrl('/login'),
        error: () => void this.router.navigateByUrl('/login'),
      });
  }
}
