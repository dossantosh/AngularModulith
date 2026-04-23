import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthFacade } from '@angular-modulith/auth';
import { ThemeFacade } from '../application/theme.facade';
import { MainLayoutComponent } from '../ui/main-layout.component';

@Component({
  selector: 'app-shell-container',
  standalone: true,
  imports: [MainLayoutComponent, RouterOutlet],
  template: `
    <app-main-layout
      [companyName]="companyName"
      [userName]="userName()"
      [view]="view()"
      [canAccessUsers]="canAccessUsers()"
      [isDark]="isDark()"
      (logout)="logout()"
      (toggleTheme)="toggleTheme()"
    >
      <router-outlet></router-outlet>
    </app-main-layout>
  `,
})
export class ShellContainer {
  private readonly auth = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeFacade);

  readonly companyName = "Seb's Perfumes";
  readonly username = this.auth.username;
  readonly userName = computed(() => this.username() ?? 'Guest');
  readonly view = this.auth.view;
  readonly canAccessUsers = computed(() => this.auth.hasAuthority('MODULE_USERS'));
  readonly isDark = this.theme.isDark;

  constructor() {
    this.theme.initialize();
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => void this.router.navigateByUrl('/login'),
      error: () => void this.router.navigateByUrl('/login'),
    });
  }

  toggleTheme(): void {
    this.theme.toggle();
  }
}
