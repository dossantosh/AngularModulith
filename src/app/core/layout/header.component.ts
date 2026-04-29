import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AppButtonComponent, AppStatusBadgeComponent } from '../../shared/ui';
import { ThemeToggleComponent } from '../theme/theme-toggle.component';

type ShellDataSource = 'prod' | 'historic';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    AppButtonComponent,
    AppStatusBadgeComponent,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    ThemeToggleComponent,
  ],
  template: `
    <mat-toolbar class="flex h-16 items-center justify-between gap-3 border-b app-border px-4">
      <div class="flex min-w-0 items-center gap-3">
        <button
          mat-icon-button
          type="button"
          class="lg:hidden"
          aria-label="Abrir navegacion"
          (click)="menuToggle.emit()"
        >
          <mat-icon aria-hidden="true">menu</mat-icon>
        </button>

        <div class="min-w-0">
          <p class="truncate text-sm app-text">{{ companyName }}</p>
          <p class="hidden text-xs app-text-muted sm:block">Workspace operativo</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        @if (dataSource === 'historic') {
          <app-status-badge
            label="Historico"
            icon="history"
            variant="warning"
            title="Estas navegando contra el origen historico"
          />
        }

        <app-theme-toggle />

        <span class="hidden items-center gap-2 app-rounded-full app-surface-container px-3 py-1.5 text-sm app-text-muted sm:inline-flex">
          <mat-icon class="app-icon-sm" aria-hidden="true">account_circle</mat-icon>
          <span class="font-medium app-text">{{ userName }}</span>
        </span>

        <app-button
          variant="danger"
          type="button"
          (clicked)="logout.emit()"
        >
          Salir
        </app-button>
      </div>
    </mat-toolbar>
  `,
})
export class HeaderComponent {
  @Input() companyName = 'My Company';
  @Input() userName = 'User';
  @Input() dataSource: ShellDataSource = 'prod';

  @Output() menuToggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
}
