import { Component, input } from '@angular/core';

@Component({
  selector: 'app-command-bar',
  standalone: true,
  template: `
    <section class="app-rounded-lg border app-border app-surface app-shadow-sm">
      @if (title() || subtitle()) {
        <header class="flex flex-col gap-1 border-b app-border px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            @if (title()) {
              <h2 class="text-sm app-text">{{ title() }}</h2>
            }

            @if (subtitle()) {
              <p class="text-xs app-text-muted">{{ subtitle() }}</p>
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
  readonly title = input('');
  readonly subtitle = input('');
}
