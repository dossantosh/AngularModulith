import { Component, Input } from '@angular/core';

import { AppBreadcrumbComponent, AppBreadcrumbItem } from '../breadcrumb/app-breadcrumb.component';

type AppPageLayout = 'default' | 'wide' | 'full';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [AppBreadcrumbComponent],
  styles: `
    .app-page__eyebrow {
      color: var(--color-primary);
      font: var(--mat-sys-label-medium);
      font-weight: 500;
      letter-spacing: 0;
    }

    .app-page__title {
      color: var(--color-text);
      font: var(--mat-sys-headline-small);
      font-weight: 500;
      letter-spacing: 0;
    }
  `,
  template: `
    <div class="min-h-full app-bg-background">
      <main class="mx-auto w-full px-4 py-4 md:px-6 md:py-5" [style.max-width]="maxWidth">
        <app-breadcrumb [items]="breadcrumbs" />

        @if (title || subtitle) {
          <header class="mb-4 flex flex-col gap-3 border-b app-border pb-4 md:flex-row md:items-end md:justify-between">
            <div class="min-w-0">
              @if (eyebrow) {
                <p class="app-page__eyebrow uppercase">
                  {{ eyebrow }}
                </p>
              }

              @if (title) {
                <h1 class="app-page__title">
                  {{ title }}
                </h1>
              }

              @if (subtitle) {
                <p class="mt-1 max-w-3xl text-sm app-text-muted">
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
