import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthFacade } from '../auth/session/auth.facade';
import { buildNavigationTree, resolveActiveNavigation } from '../navigation/app-navigation';
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
      [navigationTree]="navigationTree()"
      [activeNavigation]="activeNavigation()"
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
  readonly userName = computed(() => this.username() ?? 'Invitado');
  readonly dataSource = this.auth.dataSource;
  private readonly currentUrl = signal(this.router.url);
  readonly navigation = this.auth.navigation;
  readonly navigationTree = computed(() => buildNavigationTree(this.navigation()));
  readonly activeNavigation = computed(() =>
    resolveActiveNavigation(this.navigationTree(), this.currentUrl()),
  );

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));
  }

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
