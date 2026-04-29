import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface AppBreadcrumbItem {
  label: string;
  routerLink?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (items.length) {
      <nav aria-label="Breadcrumb" class="mb-2 text-xs font-medium text-muted">
        <ol class="flex flex-wrap items-center gap-1">
          @for (item of items; track item.label; let last = $last) {
            <li class="flex items-center gap-1">
              @if (item.routerLink && !last) {
                <a
                  [routerLink]="item.routerLink"
                  class="rounded-sm text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  {{ item.label }}
                </a>
              } @else {
                <span [attr.aria-current]="last ? 'page' : null">{{ item.label }}</span>
              }

              @if (!last) {
                <span aria-hidden="true">/</span>
              }
            </li>
          }
        </ol>
      </nav>
    }
  `,
})
export class AppBreadcrumbComponent {
  @Input() items: readonly AppBreadcrumbItem[] = [];
}
