import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page',
  standalone: true,
  template: `
    <div class="min-h-full bg-gray-50 dark:bg-slate-950">
      <main class="mx-auto w-full max-w-7xl px-4 py-4 md:py-6">
        @if (title || subtitle) {
          <header class="mb-4 flex flex-col gap-3 border-b border-gray-200 pb-4 dark:border-gray-800 md:flex-row md:items-end md:justify-between">
            <div class="min-w-0">
              @if (eyebrow) {
                <p class="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  {{ eyebrow }}
                </p>
              }

              @if (title) {
                <h1 class="text-2xl font-semibold tracking-tight text-gray-950 dark:text-gray-50">
                  {{ title }}
                </h1>
              }

              @if (subtitle) {
                <p class="mt-1 max-w-3xl text-sm text-gray-600 dark:text-gray-300">
                  {{ subtitle }}
                </p>
              }
            </div>

            <div class="flex shrink-0 flex-wrap items-center gap-2">
              <ng-content select="[page-actions]" />
            </div>
          </header>
        }

        <ng-content />
      </main>
    </div>
  `,
})
export class AppPageComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() eyebrow = '';
}
