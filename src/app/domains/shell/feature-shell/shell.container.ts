import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthFacade } from '../../auth/application/auth.facade';
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
      [dataSource]="dataSource()"
      [canReadUsers]="canReadUsers()"
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
  readonly dataSource = this.auth.dataSource;
  readonly canReadUsers = computed(() => this.auth.can('users', 'read'));
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
