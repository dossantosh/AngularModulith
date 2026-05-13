import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { type AppNavNode } from '../app-nav-node';

@Component({
  selector: 'app-section-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    @if (items().length) {
      <nav aria-label="Navegacion de seccion" class="border-b app-border app-surface px-4">
        <ul class="flex gap-1 overflow-x-auto py-2">
          @for (item of items(); track item.key) {
            <li>
              @if (item.route && !item.disabled) {
                <a
                  [routerLink]="item.route"
                  routerLinkActive="app-section-nav__link--active"
                  [routerLinkActiveOptions]="{ exact: item.exact ?? true }"
                  class="app-section-nav__link"
                  [class.app-section-nav__link--active]="isActive(item)"
                  [attr.aria-current]="isActive(item) ? 'page' : null"
                >
                  {{ item.label }}
                </a>
              } @else {
                <span
                  class="app-section-nav__link app-section-nav__link--disabled"
                  [attr.title]="item.hint || null"
                >
                  {{ item.label }}
                </span>
              }
            </li>
          }
        </ul>
      </nav>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .app-section-nav__link {
      border-radius: var(--mat-sys-corner-full);
      color: var(--color-text-muted);
      display: inline-flex;
      font: var(--mat-sys-label-large);
      padding: 0.5rem 0.875rem;
      text-decoration: none;
      transition:
        background-color 160ms ease,
        color 160ms ease;
      white-space: nowrap;
    }

    .app-section-nav__link:hover {
      background-color: var(--color-surface-container);
      color: var(--color-text);
    }

    .app-section-nav__link--active {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }

    .app-section-nav__link--disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }
  `,
})
export class AppSectionNavComponent {
  readonly items = input<readonly AppNavNode[]>([]);
  readonly activeItemKey = input<string | null>(null);

  isActive(item: AppNavNode): boolean {
    return this.activeItemKey() === item.key;
  }
}
