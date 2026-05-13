import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type AppStatusBadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <span
      class="app-status-badge"
      [class.app-status-badge--success]="variant() === 'success'"
      [class.app-status-badge--danger]="variant() === 'danger'"
      [class.app-status-badge--warning]="variant() === 'warning'"
      [class.app-status-badge--info]="variant() === 'info'"
      [class.app-status-badge--neutral]="variant() === 'neutral'"
    >
      @if (icon()) {
        <mat-icon class="app-status-badge__icon" aria-hidden="true">{{ icon() }}</mat-icon>
      }
      <span>{{ label() }}</span>
    </span>
  `,
  styles: `
    .app-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      border-radius: 9999px;
      padding: 0.125rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 400;
      line-height: 1rem;
      white-space: nowrap;
    }

    .app-status-badge--success {
      background: var(--color-success-container);
      color: var(--color-success);
    }

    .app-status-badge--danger {
      background: var(--color-danger-container);
      color: var(--color-on-danger-container);
    }

    .app-status-badge--warning {
      background: var(--color-warning-container);
      color: var(--color-warning);
    }

    .app-status-badge--info {
      background: var(--color-info-container);
      color: var(--color-on-info-container);
    }

    .app-status-badge--neutral {
      background: var(--color-surface-container);
      color: var(--color-text-muted);
    }

    .app-status-badge__icon {
      width: 0.875rem;
      height: 0.875rem;
      font-size: 0.875rem;
    }
  `,
})
export class AppStatusBadgeComponent {
  readonly label = input('');
  readonly icon = input('');
  readonly variant = input<AppStatusBadgeVariant>('neutral');
}
