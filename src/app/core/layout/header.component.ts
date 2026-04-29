import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { AppButtonComponent } from '../../shared/ui';
import { ThemeToggleComponent } from '../theme/theme-toggle.component';

type ShellDataSource = 'prod' | 'historic';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AppButtonComponent, MatIconModule, ThemeToggleComponent],
  template: `
    <header class="flex h-16 items-center justify-between gap-3 border-b border-[var(--app-border)] bg-[var(--app-shell)] px-4 shadow-sm">
      <div class="flex min-w-0 items-center gap-3">
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--app-text-muted)] transition hover:bg-[var(--app-surface-container)] hover:text-[var(--app-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus)] lg:hidden"
          aria-label="Abrir navegacion"
          (click)="menuToggle.emit()"
        >
          <mat-icon aria-hidden="true">menu</mat-icon>
        </button>

        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-[var(--app-text)]">{{ companyName }}</p>
          <p class="hidden text-xs text-[var(--app-text-subtle)] sm:block">Workspace operativo</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        @if (dataSource === 'historic') {
          <span
            class="rounded-full bg-[var(--app-warning-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--app-warning)]"
            title="Estas navegando contra el origen historico"
          >
            Historico
          </span>
        }

        <app-theme-toggle />

        <span class="hidden items-center gap-2 rounded-full bg-[var(--app-surface-container)] px-3 py-1.5 text-sm text-[var(--app-text-muted)] sm:inline-flex">
          <mat-icon class="!h-4 !w-4 !text-base" aria-hidden="true">account_circle</mat-icon>
          <span class="font-medium text-[var(--app-text)]">{{ userName }}</span>
        </span>

        <app-button
          variant="danger"
          type="button"
          (clicked)="logout.emit()"
        >
          Salir
        </app-button>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  @Input() companyName = 'My Company';
  @Input() userName = 'User';
  @Input() dataSource: ShellDataSource = 'prod';

  @Output() menuToggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
}
