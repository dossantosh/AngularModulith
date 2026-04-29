import { booleanAttribute, Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [MatCardModule],
  host: {
    class: 'block',
  },
  template: `
    <mat-card
      appearance="outlined"
      [class.overflow-hidden]="overflowHidden"
    >
      @if (title || subtitle) {
        <header class="flex flex-col gap-2 border-b app-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            @if (title) {
              <h2 class="text-sm font-semibold app-text">
                {{ title }}
              </h2>
            }

            @if (subtitle) {
              <p class="mt-1 text-xs app-text-muted">
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
