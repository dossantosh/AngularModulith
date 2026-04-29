import { booleanAttribute, Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [MatCardModule],
  host: {
    class: 'block',
  },
  styles: `
    .app-card__header {
      background: color-mix(in srgb, var(--color-surface-container) 55%, transparent);
      border-color: var(--color-border);
    }

    .app-card__title {
      color: var(--color-text);
      font: var(--mat-sys-title-small);
      font-weight: 500;
      letter-spacing: 0;
    }

    .app-card__subtitle {
      color: var(--color-text-muted);
      font: var(--mat-sys-body-small);
    }
  `,
  template: `
    <mat-card
      appearance="outlined"
      [class.overflow-hidden]="overflowHidden"
    >
      @if (title || subtitle) {
        <header class="app-card__header flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            @if (title) {
              <h2 class="app-card__title">
                {{ title }}
              </h2>
            }

            @if (subtitle) {
              <p class="app-card__subtitle mt-1">
                {{ subtitle }}
              </p>
            }
          </div>

          <div class="flex shrink-0 flex-wrap items-center gap-2">
            <ng-content select="[card-actions]" />
          </div>
        </header>
      }

      <div [class.p-4]="padded" [class.p-6]="padded && spacious">
        <ng-content />
      </div>
    </mat-card>
  `,
})
export class AppCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input({ transform: booleanAttribute }) padded = true;
  @Input({ transform: booleanAttribute }) spacious = false;
  @Input({ transform: booleanAttribute }) overflowHidden = false;
}
