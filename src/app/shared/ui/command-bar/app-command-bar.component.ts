import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-command-bar',
  standalone: true,
  template: `
    <section class="rounded-lg border border-border bg-surface shadow-sm">
      @if (title || subtitle) {
        <header class="flex flex-col gap-1 border-b border-border px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            @if (title) {
              <h2 class="text-sm font-semibold text-text">{{ title }}</h2>
            }

            @if (subtitle) {
              <p class="text-xs text-muted">{{ subtitle }}</p>
            }
          </div>

          <div class="flex shrink-0 flex-wrap items-center gap-2">
            <ng-content select="[command-actions]" />
          </div>
        </header>
      }

      <div class="px-4 py-3">
        <ng-content />
      </div>
    </section>
  `,
})
export class AppCommandBarComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
