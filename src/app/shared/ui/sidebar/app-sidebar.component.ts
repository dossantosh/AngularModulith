import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface AppSidebarItem {
  label: string;
  icon: string;
  routerLink?: string;
  exact?: boolean;
  disabled?: boolean;
  hint?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule, RouterLink, RouterLinkActive],
  template: `
    <nav
      aria-label="Modulos principales"
      class="flex h-full w-60 flex-col border-r border-border bg-sidebar text-sidebar-foreground"
    >
      <div class="flex h-16 items-center gap-3 border-b border-border px-4">
        <img src="/favicon.ico" alt="" class="h-8 w-8 rounded-md" />
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold">{{ productName }}</p>
          <p class="text-xs text-sidebar-muted">ERP workspace</p>
        </div>
      </div>

      <div class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        @for (item of items; track item.label) {
          @if (item.disabled) {
            <span
              class="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-muted opacity-60"
              [attr.title]="item.hint || null"
            >
              <mat-icon aria-hidden="true">{{ item.icon }}</mat-icon>
              <span>{{ item.label }}</span>
            </span>
          } @else {
            <a
              [routerLink]="item.routerLink"
              routerLinkActive="bg-sidebar-active text-on-primary"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-muted transition hover:bg-sidebar-hover hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              (click)="navigated.emit()"
            >
              <mat-icon aria-hidden="true">{{ item.icon }}</mat-icon>
              <span>{{ item.label }}</span>
            </a>
          }
        }
      </div>
    </nav>
  `,
})
export class AppSidebarComponent {
  @Input() productName = 'Workspace';
  @Input() items: readonly AppSidebarItem[] = [];

  @Output() navigated = new EventEmitter<void>();
}
