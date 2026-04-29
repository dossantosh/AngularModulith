import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type AppStatusBadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <span
      class="app-status-badge"
      [class.app-status-badge--success]="variant === 'success'"
      [class.app-status-badge--danger]="variant === 'danger'"
      [class.app-status-badge--warning]="variant === 'warning'"
      [class.app-status-badge--info]="variant === 'info'"
      [class.app-status-badge--neutral]="variant === 'neutral'"
    >
      @if (icon) {
        <mat-icon class="app-status-badge__icon" aria-hidden="true">{{ icon }}</mat-icon>
      }
      <span>{{ label }}</span>
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
      font-weight: 600;
      line-height: 1rem;
      white-space: nowrap;
    }

    .app-status-badge--success {
      background: var(--app-success-surface);
      color: var(--app-success);
    }

    .app-status-badge--danger {
      background: var(--app-danger-surface);
      color: var(--app-danger);
    }

    .app-status-badge--warning {
      background: var(--app-warning-surface);
      color: var(--app-warning);
    }

    .app-status-badge--info {
      background: var(--app-info-surface);
      color: var(--app-info);
    }

    .app-status-badge--neutral {
      background: var(--app-surface-container);
      color: var(--app-text-muted);
    }

    .app-status-badge__icon {
      width: 0.875rem;
      height: 0.875rem;
      font-size: 0.875rem;
    }
  `,
})
export class AppStatusBadgeComponent {
  @Input() label = '';
  @Input() icon = '';
  @Input() variant: AppStatusBadgeVariant = 'neutral';
}
