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
      <nav aria-label="Breadcrumb" class="mb-2 text-xs font-medium app-text-muted">
        <ol class="flex flex-wrap items-center gap-1">
          @for (item of items; track item.label; let last = $last) {
            <li class="flex items-center gap-1">
              @if (item.routerLink && !last) {
                <a
                  [routerLink]="item.routerLink"
                  class="app-rounded-sm app-link-muted"
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
