import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { type AppNavNode } from '../app-nav-node';

@Component({
  selector: 'app-navigation-rail',
  standalone: true,
  imports: [MatIconModule, RouterLink, RouterLinkActive],
  template: `
    <nav
      aria-label="Navegacion principal"
      class="flex h-full w-22 flex-col items-center border-r app-border app-surface px-2 py-3"
    >
      <div
        class="mb-4 flex h-10 w-10 items-center justify-center app-rounded-lg app-surface-container"
      >
        <img src="/favicon.ico" alt="" class="h-7 w-7 app-rounded-sm" />
      </div>

      <ul class="flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto">
        @for (item of items(); track item.key) {
          <li class="w-full">
            @if (targetFor(item); as target) {
              <a
                [routerLink]="target"
                routerLinkActive="app-navigation-rail__item--active"
                [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
                class="app-navigation-rail__item"
                [class.app-navigation-rail__item--active]="isActive(item)"
                [attr.aria-current]="isActive(item) ? 'page' : null"
                (click)="navigated.emit()"
              >
                <span class="app-navigation-rail__indicator">
                  @if (item.icon) {
                    <mat-icon aria-hidden="true">{{ item.icon }}</mat-icon>
                  }
                </span>
                <span class="app-navigation-rail__label">{{ item.label }}</span>
              </a>
            } @else {
              <span
                class="app-navigation-rail__item app-navigation-rail__item--disabled"
                [attr.title]="item.hint || null"
              >
                <span class="app-navigation-rail__indicator">
                  @if (item.icon) {
                    <mat-icon aria-hidden="true">{{ item.icon }}</mat-icon>
                  }
                </span>
                <span class="app-navigation-rail__label">{{ item.label }}</span>
              </span>
            }
          </li>
        }
      </ul>
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }

    .w-22 {
      width: 5.5rem;
    }

    .app-navigation-rail__item {
      align-items: center;
      border-radius: var(--mat-sys-corner-large);
      color: var(--color-text-muted);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-block-size: 4rem;
      padding: 0.375rem 0.25rem;
      text-align: center;
      text-decoration: none;
      transition:
        background-color 160ms ease,
        color 160ms ease;
      width: 100%;
    }

    .app-navigation-rail__item:hover {
      background-color: var(--color-surface-container);
      color: var(--color-text);
    }

    .app-navigation-rail__item--disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .app-navigation-rail__indicator {
      align-items: center;
      border-radius: var(--mat-sys-corner-full);
      display: inline-flex;
      height: 2rem;
      justify-content: center;
      width: 3.5rem;
    }

    .app-navigation-rail__item--active {
      color: var(--mat-sys-on-primary-container);
    }

    .app-navigation-rail__item--active .app-navigation-rail__indicator {
      background-color: var(--mat-sys-primary-container);
    }

    .app-navigation-rail__label {
      font: var(--mat-sys-label-medium);
      max-width: 100%;
      overflow-wrap: anywhere;
    }
  `,
})
export class AppNavigationRailComponent {
  readonly items = input<readonly AppNavNode[]>([]);
  readonly activeItemKey = input<string | null>(null);

  readonly navigated = output<void>();

  isActive(item: AppNavNode): boolean {
    return this.activeItemKey() === item.key;
  }

  targetFor(item: AppNavNode): string | null {
    if (!item.disabled && item.route) {
      return item.route;
    }

    return this.firstChildRoute(item) ?? null;
  }

  private firstChildRoute(item: AppNavNode): string | undefined {
    for (const child of item.children ?? []) {
      if (!child.disabled && child.route) {
        return child.route;
      }

      const nestedRoute = this.firstChildRoute(child);

      if (nestedRoute) {
        return nestedRoute;
      }
    }

    return undefined;
  }
}
