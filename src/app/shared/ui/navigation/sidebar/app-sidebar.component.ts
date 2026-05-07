import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

export interface AppSidebarItem {
  key: string;
  kind: 'link' | 'group';
  label: string;
  icon: string;
  routerLink?: string;
  exact?: boolean;
  disabled?: boolean;
  hint?: string;
  items?: readonly AppSidebarItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule, NgTemplateOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav
      aria-label="Módulos principales"
      class="flex h-full w-60 flex-col border-r app-border app-sidebar"
    >
      <div class="flex h-16 items-center gap-3 border-b app-border px-4">
        <img src="/favicon.ico" alt="" class="h-8 w-8 app-rounded-md" />
        <div class="min-w-0">
          <p class="truncate text-sm">{{ productName() }}</p>
          <p class="text-xs app-sidebar-muted">ERP workspace</p>
        </div>
      </div>

      <div class="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        @for (item of items(); track item.key) {
          @if (item.kind === 'group') {
            <section class="app-sidebar__group" [class.app-sidebar__group--active]="isGroupActive(item)">
              <button
                type="button"
                class="app-sidebar__module-button flex w-full items-center gap-3 app-rounded-md px-3 py-2 text-left text-sm font-medium app-sidebar-link transition"
                [attr.aria-expanded]="isGroupExpanded(item)"
                (click)="toggleGroup(item.key)"
              >
                <mat-icon aria-hidden="true">{{ item.icon }}</mat-icon>
                <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
                <mat-icon class="app-sidebar__module-chevron" aria-hidden="true">
                  {{ isGroupExpanded(item) ? 'expand_less' : 'expand_more' }}
                </mat-icon>
              </button>

              <div
                class="app-sidebar__children space-y-1"
                [class.hidden]="!isGroupExpanded(item)"
                [attr.aria-hidden]="!isGroupExpanded(item)"
              >
                @for (child of item.items ?? []; track child.key) {
                  <ng-container
                    [ngTemplateOutlet]="sidebarLink"
                    [ngTemplateOutletContext]="{ $implicit: child, level: 'child' }"
                  />
                }
              </div>
            </section>
          } @else {
            <ng-container
              [ngTemplateOutlet]="sidebarLink"
              [ngTemplateOutletContext]="{ $implicit: item, level: 'root' }"
            />
          }
        }
      </div>
    </nav>

    <ng-template #sidebarLink let-item let-level="level">
      @if (item.disabled) {
        <span
          class="flex cursor-not-allowed items-center gap-3 app-rounded-md px-3 py-2 text-sm font-medium app-sidebar-muted opacity-60"
          [class.app-sidebar__child-link]="level === 'child'"
          [attr.title]="item.hint || null"
        >
          <mat-icon aria-hidden="true">{{ item.icon }}</mat-icon>
          <span>{{ item.label }}</span>
        </span>
      } @else {
        <a
          [routerLink]="item.routerLink"
          routerLinkActive="app-sidebar-active"
          [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
          class="flex items-center gap-3 app-rounded-md px-3 py-2 text-sm font-medium app-sidebar-link transition"
          [class.app-sidebar__child-link]="level === 'child'"
          (click)="navigated.emit()"
        >
          <mat-icon aria-hidden="true">{{ item.icon }}</mat-icon>
          <span>{{ item.label }}</span>
        </a>
      }
    </ng-template>
  `,
  styles: `
    .app-sidebar__module-button:hover {
      background-color: var(--color-sidebar-hover);
      color: var(--color-sidebar-foreground);
    }

    .app-sidebar__group--active > .app-sidebar__module-button {
      background-color: var(--color-sidebar-hover);
      color: var(--color-sidebar-foreground);
    }

    .app-sidebar__children {
      margin-block-start: 0.25rem;
    }

    .app-sidebar__child-link {
      gap: 0.5rem;
      margin-inline-start: 0.5rem;
      padding-inline-start: 0.625rem;
    }

    .app-sidebar__child-link mat-icon {
      block-size: 1.125rem;
      font-size: 1.125rem;
      inline-size: 1.125rem;
    }

    .app-sidebar__module-chevron {
      block-size: 1rem;
      font-size: 1rem;
      inline-size: 1rem;
    }
  `,
})
export class AppSidebarComponent {
  private readonly router = inject(Router);

  readonly productName = input('Workspace');
  readonly items = input<readonly AppSidebarItem[]>([]);

  readonly navigated = output<void>();

  private readonly expandedGroups = signal<readonly string[]>([]);

  isGroupExpanded(item: AppSidebarItem): boolean {
    return this.expandedGroups().includes(item.key);
  }

  isGroupActive(item: AppSidebarItem): boolean {
    return (item.items ?? []).some(
      (child) => child.routerLink && this.router.isActive(child.routerLink, child.exact ?? false)
    );
  }

  toggleGroup(key: string): void {
    this.expandedGroups.update((expandedGroups) =>
      expandedGroups.includes(key)
        ? expandedGroups.filter((groupKey) => groupKey !== key)
        : [...expandedGroups, key]
    );
  }
}

