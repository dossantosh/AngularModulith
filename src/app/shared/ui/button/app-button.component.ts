import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

export type AppButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type AppButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, NgTemplateOutlet, RouterLink],
  host: {
    class: 'inline-flex',
    '[class.w-full]': 'fullWidth',
  },
  styles: `
    .app-button {
      min-inline-size: max-content;
      white-space: nowrap;
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
    @if (routerLink) {
      @switch (variant) {
        @case ('primary') {
          <a
            matButton="filled"
            [routerLink]="routerLink"
            [attr.aria-label]="ariaLabel || null"
            [attr.aria-disabled]="disabled || loading"
            [attr.tabindex]="disabled || loading ? -1 : null"
            [class]="buttonClasses"
            (click)="handleClick($event)"
          >
            <ng-container [ngTemplateOutlet]="content" />
          </a>
        }

        @case ('secondary') {
          <a
            matButton="outlined"
            [routerLink]="routerLink"
            [attr.aria-label]="ariaLabel || null"
            [attr.aria-disabled]="disabled || loading"
            [attr.tabindex]="disabled || loading ? -1 : null"
            [class]="buttonClasses"
            (click)="handleClick($event)"
          >
            <ng-container [ngTemplateOutlet]="content" />
          </a>
        }

        @case ('danger') {
          <a
            matButton="filled"
            [routerLink]="routerLink"
            [attr.aria-label]="ariaLabel || null"
            [attr.aria-disabled]="disabled || loading"
            [attr.tabindex]="disabled || loading ? -1 : null"
            [class]="buttonClasses + ' app-button--danger'"
            (click)="handleClick($event)"
          >
            <ng-container [ngTemplateOutlet]="content" />
          </a>
        }

        @case ('ghost') {
          <a
            matButton
            [routerLink]="routerLink"
            [attr.aria-label]="ariaLabel || null"
            [attr.aria-disabled]="disabled || loading"
            [attr.tabindex]="disabled || loading ? -1 : null"
            [class]="buttonClasses"
            (click)="handleClick($event)"
          >
            <ng-container [ngTemplateOutlet]="content" />
          </a>
        }
      }
    } @else {
      @switch (variant) {
        @case ('primary') {
          <button
            matButton="filled"
            [type]="type"
            [disabled]="disabled || loading"
            [attr.aria-label]="ariaLabel || null"
            [class]="buttonClasses"
            (click)="handleClick($event)"
          >
            <ng-container [ngTemplateOutlet]="content" />
          </button>
        }

        @case ('secondary') {
          <button
            matButton="outlined"
            [type]="type"
            [disabled]="disabled || loading"
            [attr.aria-label]="ariaLabel || null"
            [class]="buttonClasses"
            (click)="handleClick($event)"
          >
            <ng-container [ngTemplateOutlet]="content" />
          </button>
        }

        @case ('danger') {
          <button
            matButton="filled"
            [type]="type"
            [disabled]="disabled || loading"
            [attr.aria-label]="ariaLabel || null"
            [class]="buttonClasses + ' app-button--danger'"
            (click)="handleClick($event)"
          >
            <ng-container [ngTemplateOutlet]="content" />
          </button>
        }

        @case ('ghost') {
          <button
            matButton
            [type]="type"
            [disabled]="disabled || loading"
            [attr.aria-label]="ariaLabel || null"
            [class]="buttonClasses"
            (click)="handleClick($event)"
          >
            <ng-container [ngTemplateOutlet]="content" />
          </button>
        }
      }
    }

    <ng-template #content>
      @if (loading) {
        <mat-progress-spinner
          class="app-button__spinner"
          mode="indeterminate"
          diameter="16"
          aria-hidden="true"
        />
      } @else if (icon) {
        <mat-icon aria-hidden="true">{{ icon }}</mat-icon>
      }

      <span>
        <ng-content />
      </span>
    </ng-template>
  `,
})
export class AppButtonComponent {
  @Input() variant: AppButtonVariant = 'primary';
  @Input() type: AppButtonType = 'button';
  @Input() icon = '';
  @Input() ariaLabel = '';
  @Input() routerLink: string | unknown[] | null = null;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) loading = false;
  @Input({ transform: booleanAttribute }) fullWidth = false;

  @Output() clicked = new EventEmitter<Event>();

  get buttonClasses(): string {
    return [
      'app-button',
      this.fullWidth ? 'w-full' : '',
      this.loading ? 'app-button--loading' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  handleClick(event: Event): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.clicked.emit(event);
  }
}
