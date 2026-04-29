import { booleanAttribute, Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  host: {
    class: 'block',
  },
  template: `
    <section
      class="rounded-xl bg-[var(--app-surface)] shadow-sm ring-1 ring-[var(--app-border)]"
      [class.overflow-hidden]="overflowHidden"
    >
      @if (title || subtitle) {
        <header class="flex flex-col gap-2 border-b border-[var(--app-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            @if (title) {
              <h2 class="text-sm font-semibold text-[var(--app-text)]">
                {{ title }}
              </h2>
            }

            @if (subtitle) {
              <p class="mt-1 text-xs text-[var(--app-text-muted)]">
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
    </section>
  `,
})
export class AppCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input({ transform: booleanAttribute }) padded = true;
  @Input({ transform: booleanAttribute }) spacious = false;
  @Input({ transform: booleanAttribute }) overflowHidden = false;
}
