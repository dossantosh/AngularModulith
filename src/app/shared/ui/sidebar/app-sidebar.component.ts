import { NgTemplateOutlet } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
      aria-label="Modulos principales"
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
            <section>
              <button
                type="button"
                class="app-sidebar__module-button flex w-full items-center gap-2 app-rounded-md px-3 pb-1 pt-1 text-left text-xs app-sidebar-muted transition"
                [attr.aria-expanded]="isGroupExpanded(item)"
                (click)="toggleGroup(item.key)"
              >
                <mat-icon class="app-sidebar__module-icon" aria-hidden="true">{{ item.icon }}</mat-icon>
                <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
                <mat-icon class="app-sidebar__module-icon" aria-hidden="true">
                  {{ isGroupExpanded(item) ? 'expand_less' : 'expand_more' }}
                </mat-icon>
              </button>

              @if (isGroupExpanded(item)) {
                <div class="space-y-1">
                  @for (child of item.items ?? []; track child.key) {
                    <ng-container
                      [ngTemplateOutlet]="sidebarLink"
                      [ngTemplateOutletContext]="{ $implicit: child }"
                    />
                  }
                </div>
              }
            </section>
          } @else {
            <ng-container
              [ngTemplateOutlet]="sidebarLink"
              [ngTemplateOutletContext]="{ $implicit: item }"
            />
          }
        }
      </div>
    </nav>

    <ng-template #sidebarLink let-item>
      @if (item.disabled) {
        <span
          class="flex cursor-not-allowed items-center gap-3 app-rounded-md px-3 py-2 text-sm font-medium app-sidebar-muted opacity-60"
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

    .app-sidebar__module-icon {
      block-size: 1rem;
      font-size: 1rem;
      inline-size: 1rem;
    }
  `,
})
export class AppSidebarComponent {
  readonly productName = input('Workspace');
  readonly items = input<readonly AppSidebarItem[]>([]);

  readonly navigated = output<void>();

  private readonly collapsedGroups = signal<readonly string[]>([]);

  isGroupExpanded(item: AppSidebarItem): boolean {
    return !this.collapsedGroups().includes(item.key);
  }

  toggleGroup(key: string): void {
    this.collapsedGroups.update((collapsedGroups) =>
      collapsedGroups.includes(key)
        ? collapsedGroups.filter((groupKey) => groupKey !== key)
        : [...collapsedGroups, key]
    );
  }
}
