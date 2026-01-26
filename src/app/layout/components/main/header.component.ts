import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { HasAuthorityDirective } from '../../../core/auth/directives/has-authority.directive';

type Theme = 'light' | 'dark';

@Component({
  selector: 'lib-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, HasAuthorityDirective],
  template: `
    <header
      class="sticky top-0 z-40 bg-white ring-1 ring-gray-200 shadow-sm
             dark:bg-gray-900 dark:ring-gray-800"
    >
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <!-- Left: Logo + Company -->
        <div class="flex items-center gap-3">
          <img src="/favicon.ico" alt="Logo" class="h-8 w-8 rounded-md" />
          <h1 class="text-base font-semibold text-gray-900 dark:text-gray-100">
            {{ companyName }}
          </h1>
        </div>

        <!-- Center: Navigation -->
        <nav class="hidden items-center gap-1 md:flex">
          <a
            routerLink="/"
            routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            [routerLinkActiveOptions]="{ exact: true }"
            class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600
                   transition hover:bg-gray-100 hover:text-gray-900
                   focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-300/40
                   dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100
                   dark:focus-visible:ring-gray-700/40"
          >
            Dashboard
          </a>

          <a
            routerLink="/usersmanagement/searchUsers"
            routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600
                   transition hover:bg-gray-100 hover:text-gray-900
                   focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-300/40
                   dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100
                   dark:focus-visible:ring-gray-700/40"
            *hasAuthority="'MODULE_USERS'"
          >
            Usuarios
          </a>

          <a
            routerLink="/perfumes"
            routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600
                   transition hover:bg-gray-100 hover:text-gray-900
                   focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-300/40
                   dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100
                   dark:focus-visible:ring-gray-700/40"
            *hasAuthority="'MODULE_PERFUMES'"
          >
            Perfumes
          </a>

          <a
            routerLink="/configuration"
            routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600
                   transition hover:bg-gray-100 hover:text-gray-900
                   focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-300/40
                   dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100
                   dark:focus-visible:ring-gray-700/40"
          >
            Configuración
          </a>
        </nav>

        <!-- Right: Theme + User + Logout -->
        <div class="flex items-center gap-3">
          <!-- Theme toggle -->
          <button
            type="button"
            (click)="toggleTheme()"
            class="inline-flex items-center justify-center rounded-lg p-2
                   text-gray-600 transition hover:bg-gray-100 hover:text-gray-900
                   focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-300/40
                   dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100
                   dark:focus-visible:ring-gray-700/40"
            [attr.aria-pressed]="isDark"
            [attr.aria-label]="isDark ? 'Activar modo claro' : 'Activar modo oscuro'"
            title="Cambiar tema"
          >
            <!-- simple icon swap -->
            <span class="text-base">{{ isDark ? '☀️' : '🌙' }}</span>
          </button>

          <span class="hidden text-sm text-gray-600 dark:text-gray-300 sm:block">
            Hola,
            <span class="font-medium text-gray-900 dark:text-gray-100">
              {{ userName }}
            </span>
          </span>

          <button
            type="button"
            (click)="logout.emit()"
            class="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white
                   shadow-sm transition hover:bg-red-700 active:bg-red-800
                   focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-600/25"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent implements OnInit {
  @Input() companyName = 'My Company';
  @Input() userName = 'User';
  @Output() logout = new EventEmitter<void>();

  isDark = false;

  ngOnInit(): void {
    this.applySavedTheme();
  }

  toggleTheme(): void {
    const root = document.documentElement;

    this.isDark = !this.isDark;
    root.classList.toggle('dark', this.isDark);

    const theme: Theme = this.isDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
  }

  private applySavedTheme(): void {
    const saved = localStorage.getItem('theme') as Theme | null;

    // If nothing saved, default to system preference
    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.isDark = saved ? saved === 'dark' : prefersDark;

    document.documentElement.classList.toggle('dark', this.isDark);
  }
}
