import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { type AppNavNode } from '../app-nav-node';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule, NgTemplateOutlet, RouterLink],
  template: `
    <nav
      aria-label="Navegacion contextual"
      class="app-context-sidebar flex h-full w-72 flex-col border-r app-border"
    >
      <div class="flex h-16 items-center gap-3 border-b app-border px-4">
        @if (primaryItem()?.icon) {
          <mat-icon aria-hidden="true">{{ primaryItem()?.icon }}</mat-icon>
        }

        <div class="min-w-0">
          <p class="truncate text-sm font-medium">{{ primaryItem()?.label || 'Seccion' }}</p>
          <p class="app-context-sidebar__muted text-xs">Navegacion secundaria</p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-3 py-4">
        @if (items().length) {
          <ul class="space-y-1">
            @for (item of items(); track item.key) {
              <li>
                <ng-container
                  [ngTemplateOutlet]="navNode"
                  [ngTemplateOutletContext]="{ $implicit: item, level: 0 }"
                />
              </li>
            }
          </ul>
        } @else {
          <p class="app-context-sidebar__muted px-3 py-2 text-sm">Sin navegacion secundaria</p>
        }
      </div>
    </nav>

    <ng-template #navNode let-item let-level="level">
      @if (hasChildren(item)) {
        <div class="app-sidebar__group" [class.app-sidebar__group--active]="isNodeActive(item)">
          @if (item.route && !item.disabled) {
            <div class="app-sidebar__group-row">
              <a
                [routerLink]="item.route"
                class="app-sidebar__link min-w-0 flex-1"
                [class.app-sidebar__link--active]="isNodeActive(item)"
                [class.app-sidebar__link--nested]="level > 0"
                [attr.aria-current]="isNodeActive(item) ? 'page' : null"
                (click)="navigated.emit()"
              >
                @if (item.icon) {
                  <mat-icon aria-hidden="true">{{ item.icon }}</mat-icon>
                }
                <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
              </a>

              <button
                type="button"
                class="app-sidebar__icon-button"
                [attr.aria-label]="toggleLabel(item)"
                [attr.aria-controls]="childrenId(item)"
                [attr.aria-expanded]="isGroupExpanded(item)"
                (click)="toggleGroup(item.key)"
              >
                <mat-icon aria-hidden="true">
                  {{ isGroupExpanded(item) ? 'expand_less' : 'expand_more' }}
                </mat-icon>
              </button>
            </div>
          } @else {
            <button
              type="button"
              class="app-sidebar__link app-sidebar__group-button"
              [class.app-sidebar__link--nested]="level > 0"
              [attr.aria-controls]="childrenId(item)"
              [attr.aria-expanded]="isGroupExpanded(item)"
              (click)="toggleGroup(item.key)"
            >
              @if (item.icon) {
                <mat-icon aria-hidden="true">{{ item.icon }}</mat-icon>
              }
              <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
              <mat-icon class="app-sidebar__module-chevron" aria-hidden="true">
                {{ isGroupExpanded(item) ? 'expand_less' : 'expand_more' }}
              </mat-icon>
            </button>
          }

          <ul
            class="app-sidebar__children space-y-1"
            [id]="childrenId(item)"
            [class.hidden]="!isGroupExpanded(item)"
            [attr.aria-hidden]="!isGroupExpanded(item)"
          >
            @for (child of item.children ?? []; track child.key) {
              <li>
                <ng-container
                  [ngTemplateOutlet]="navNode"
                  [ngTemplateOutletContext]="{ $implicit: child, level: level + 1 }"
                />
              </li>
            }
          </ul>
        </div>
      } @else {
        @if (item.disabled || !item.route) {
          <span
            class="app-sidebar__link app-context-sidebar__muted cursor-not-allowed opacity-60"
            [class.app-sidebar__link--nested]="level > 0"
            [attr.title]="item.hint || null"
          >
            @if (item.icon) {
              <mat-icon aria-hidden="true">{{ item.icon }}</mat-icon>
            }
            <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
          </span>
        } @else {
          <a
            [routerLink]="item.route"
            class="app-sidebar__link"
            [class.app-sidebar__link--active]="isNodeActive(item)"
            [class.app-sidebar__link--nested]="level > 0"
            [attr.aria-current]="isNodeActive(item) ? 'page' : null"
            (click)="navigated.emit()"
          >
            @if (item.icon) {
              <mat-icon aria-hidden="true">{{ item.icon }}</mat-icon>
            }
            <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
          </a>
        }
      }
    </ng-template>
  `,
  styles: `
    .app-context-sidebar {
      background-color: var(--mat-sys-surface);
      color: var(--mat-sys-on-surface);
    }

    .app-context-sidebar__muted {
      color: var(--mat-sys-on-surface-variant);
    }

    .app-sidebar__link,
    .app-sidebar__group-button {
      align-items: center;
      border: 0;
      border-radius: var(--mat-sys-corner-full);
      color: var(--mat-sys-on-surface-variant);
      display: flex;
      gap: 0.75rem;
      min-block-size: 2.5rem;
      padding: 0.5rem 0.75rem;
      text-align: start;
      text-decoration: none;
      transition:
        background-color 160ms ease,
        color 160ms ease;
      width: 100%;
    }

    .app-sidebar__group-button {
      background: transparent;
      cursor: pointer;
      font: inherit;
    }

    .app-sidebar__link:hover,
    .app-sidebar__group-button:hover {
      background-color: var(--mat-sys-surface-container);
      color: var(--mat-sys-on-surface);
    }

    .app-sidebar__group-row {
      align-items: center;
      display: flex;
      gap: 0.25rem;
    }

    .app-sidebar__group--active > .app-sidebar__group-button,
    .app-sidebar__group--active > .app-sidebar__group-row .app-sidebar__link {
      background-color: var(--mat-sys-surface-container);
      color: var(--mat-sys-on-surface);
    }

    .app-sidebar__icon-button {
      align-items: center;
      background: transparent;
      border: 0;
      border-radius: var(--mat-sys-corner-full);
      color: var(--mat-sys-on-surface-variant);
      cursor: pointer;
      display: inline-flex;
      height: 2.5rem;
      justify-content: center;
      width: 2.5rem;
    }

    .app-sidebar__icon-button:hover {
      background-color: var(--mat-sys-surface-container);
      color: var(--mat-sys-on-surface);
    }

    .app-sidebar__link--active {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }

    .app-sidebar__link--active:hover {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }

    .app-sidebar__children {
      margin-block-start: 0.25rem;
    }

    .app-sidebar__link--nested {
      gap: 0.5rem;
      margin-inline-start: 0.5rem;
      padding-inline-start: 0.625rem;
    }

    .app-sidebar__link--nested mat-icon {
      block-size: 1.125rem;
      font-size: 1.125rem;
      inline-size: 1.125rem;
    }

    .app-sidebar__module-chevron,
    .app-sidebar__icon-button mat-icon {
      block-size: 1rem;
      font-size: 1rem;
      inline-size: 1rem;
    }
  `,
})
export class AppSidebarComponent {
  readonly primaryItem = input<AppNavNode | null>(null);
  readonly activePathKeys = input<readonly string[]>([]);

  readonly navigated = output<void>();

  protected readonly items = computed(() => this.primaryItem()?.children ?? []);
  private readonly expandedGroups = signal<readonly string[]>([]);

  hasChildren(item: AppNavNode): boolean {
    return Boolean(item.children?.length);
  }

  isGroupExpanded(item: AppNavNode): boolean {
    return this.expandedGroups().includes(item.key) || this.isNodeActive(item);
  }

  isNodeActive(item: AppNavNode): boolean {
    return this.activePathKeys().includes(item.key);
  }

  childrenId(item: AppNavNode): string {
    return `app-sidebar-${item.key}-children`;
  }

  toggleLabel(item: AppNavNode): string {
    return `${this.isGroupExpanded(item) ? 'Contraer' : 'Expandir'} ${item.label}`;
  }

  toggleGroup(key: string): void {
    this.expandedGroups.update((expandedGroups) =>
      expandedGroups.includes(key)
        ? expandedGroups.filter((groupKey) => groupKey !== key)
        : [...expandedGroups, key],
    );
  }
}
