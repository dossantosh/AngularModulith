import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ThemeToggleComponent } from '../theme/theme-toggle.component';

type ShellDataSource = 'prod' | 'historic';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButtonModule, RouterLink, RouterLinkActive, ThemeToggleComponent],
  template: `
    <header class="sticky top-0 z-40 bg-white ring-1 ring-gray-200 shadow-sm dark:bg-gray-900 dark:ring-gray-800">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <div class="flex items-center gap-3">
          <img src="/favicon.ico" alt="Logo" class="h-8 w-8 rounded-md" />
          <h1 class="text-base font-semibold text-gray-900 dark:text-gray-100">
            {{ companyName }}
          </h1>
        </div>

        <nav class="hidden items-center gap-1 md:flex">
          <a
            routerLink="/"
            routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            [routerLinkActiveOptions]="{ exact: true }"
            class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-300/40 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:focus-visible:ring-gray-700/40"
          >
            Dashboard
          </a>

          @if (canReadUsers) {
            <a
              routerLink="/users/search"
              routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
              class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-300/40 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:focus-visible:ring-gray-700/40"
            >
              Usuarios
            </a>
          }
        </nav>

        <div class="flex items-center gap-3">
          <app-theme-toggle />

          <span class="hidden text-sm text-gray-600 dark:text-gray-300 sm:block">
            Hola,
            <span class="font-medium text-gray-900 dark:text-gray-100">
              {{ userName }}
            </span>
          </span>

          @if (dataSource === 'historic') {
            <span
              class="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900 dark:text-amber-200"
              title="Estas navegando contra el origen historico"
            >
              Historic
            </span>
          }

          <button
            matButton="filled"
            type="button"
            (click)="logout.emit()"
            class="whitespace-nowrap"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  @Input() companyName = 'My Company';
  @Input() userName = 'User';
  @Input() dataSource: ShellDataSource = 'prod';
  @Input() canReadUsers = false;

  @Output() logout = new EventEmitter<void>();
}
