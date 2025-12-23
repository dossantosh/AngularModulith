// libs/.../main-layout.component.ts
import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'lib-base-layout',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, FooterComponent],
  template: `
    <div class="dashboard">
      <lib-header
        [companyName]="companyName"
        [userName]="userName()"
        (logout)="logout()"
      ></lib-header>

      <main>
        <router-outlet></router-outlet>
      </main>

      <lib-footer [companyName]="companyName" [year]="year"></lib-footer>
    </div>
  `,
})
export class MainLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  companyName = "Seb's Perfumes";
  year = new Date().getFullYear();

  // Convert username$ (Observable) -> Signal
  private readonly usernameSig = toSignal(this.auth.username$, { initialValue: null });

  // Keep same API your template already uses: userName()
  userName = computed(() => this.usernameSig() ?? 'Guest');

  constructor() {
    // 1) Ensure CSRF cookie is present early
    this.auth.initCsrf().subscribe();

    // 2) Try to load current user if a session already exists
    // (If not logged in, /me returns 401; you can ignore it)
    this.auth.me().subscribe({
      error: () => {}, // ignore 401
    });
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        void this.router.navigateByUrl('/login');
      },
      error: () => {
        void this.router.navigateByUrl('/login');
      },
    });
  }
}
