import { Component, Input } from '@angular/core';

import { AppBreadcrumbComponent, AppBreadcrumbItem } from '../breadcrumb/app-breadcrumb.component';

type AppPageLayout = 'default' | 'wide' | 'full';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [AppBreadcrumbComponent],
  template: `
    <div class="min-h-full bg-background">
      <main class="mx-auto w-full px-4 py-4 md:px-6 md:py-5" [style.max-width]="maxWidth">
        <app-breadcrumb [items]="breadcrumbs" />

        @if (title || subtitle) {
          <header class="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
            <div class="min-w-0">
              @if (eyebrow) {
                <p class="text-xs font-semibold uppercase tracking-wide text-primary">
                  {{ eyebrow }}
                </p>
              }

              @if (title) {
                <h1 class="text-2xl font-semibold tracking-tight text-text">
                  {{ title }}
                </h1>
              }

              @if (subtitle) {
                <p class="mt-1 max-w-3xl text-sm text-muted">
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
  @Input() layout: AppPageLayout = 'wide';
  @Input() breadcrumbs: readonly AppBreadcrumbItem[] = [];

  get maxWidth(): string {
    const widths: Record<AppPageLayout, string> = {
      default: '80rem',
      wide: '1440px',
      full: 'none',
    };

    return widths[this.layout];
  }
}
