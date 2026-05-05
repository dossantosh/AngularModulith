import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

export type AppButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type AppButtonType = 'button' | 'submit' | 'reset';
type MaterialButtonAppearance = 'filled' | 'outlined' | 'text';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, NgTemplateOutlet, RouterLink],
  host: {
    class: 'inline-flex',
    '[class.w-full]': 'fullWidth()',
  },
  styles: `
    .app-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-inline-size: max-content;
      line-height: 1;
      white-space: nowrap;
    }

    .app-button mat-icon {
      width: 1.125rem;
      height: 1.125rem;
      font-size: 1.125rem;
      line-height: 1;
    }

    .app-button span {
      display: inline-flex;
      align-items: center;
      line-height: 1.25rem;
    }

    .app-button--danger {
      --mat-button-filled-container-color: var(--color-danger);
      --mat-button-filled-label-text-color: var(--mat-sys-on-error);
      --mat-button-filled-state-layer-color: var(--mat-sys-on-error);
      --mat-button-filled-ripple-color: color-mix(in srgb, var(--mat-sys-on-error) 12%, transparent);
    }

    .app-button--loading {
      pointer-events: none;
    }

    .app-button__spinner {
      --mdc-circular-progress-active-indicator-color: currentColor;
    }
  `,
  template: `
    @if (routerLink()) {
      <a
        matButton
        [matButton]="buttonAppearance()"
        [routerLink]="isDisabled() ? null : routerLink()"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-disabled]="isDisabled() ? 'true' : null"
        [attr.tabindex]="isDisabled() ? -1 : null"
        [class]="buttonClasses()"
        [class.app-button--danger]="variant() === 'danger'"
        (click)="handleClick($event)"
      >
        <ng-container [ngTemplateOutlet]="content" />
      </a>
    } @else {
      <button
        matButton
        [matButton]="buttonAppearance()"
        [type]="type()"
        [disabled]="isDisabled()"
        [attr.aria-label]="ariaLabel() || null"
        [class]="buttonClasses()"
        [class.app-button--danger]="variant() === 'danger'"
        (click)="handleClick($event)"
      >
        <ng-container [ngTemplateOutlet]="content" />
      </button>
    }

    <ng-template #content>
      @if (loading()) {
        <mat-progress-spinner
          class="app-button__spinner"
          mode="indeterminate"
          diameter="16"
          aria-hidden="true"
        />
      } @else if (icon()) {
        <mat-icon aria-hidden="true">{{ icon() }}</mat-icon>
      }

      <span>
        <ng-content />
      </span>
    </ng-template>
  `,
})
export class AppButtonComponent {
  readonly variant = input<AppButtonVariant>('primary');
  readonly type = input<AppButtonType>('button');
  readonly icon = input('');
  readonly ariaLabel = input('');
  readonly routerLink = input<string | unknown[] | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });

  readonly clicked = output<Event>();

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());
  protected readonly buttonAppearance = computed<MaterialButtonAppearance>(() => {
    const appearances: Record<AppButtonVariant, MaterialButtonAppearance> = {
      primary: 'filled',
      secondary: 'outlined',
      danger: 'filled',
      ghost: 'text',
    };

    return appearances[this.variant()];
  });
  protected readonly buttonClasses = computed(() =>
    [
      'app-button',
      this.fullWidth() ? 'w-full' : '',
      this.loading() ? 'app-button--loading' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  handleClick(event: Event): void {
    if (this.isDisabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.clicked.emit(event);
  }
}
