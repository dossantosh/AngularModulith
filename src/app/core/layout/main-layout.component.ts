import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

import { AppSidebarComponent, AppSidebarItem } from '../../shared/ui';
import { HeaderComponent } from './header.component';

type ShellDataSource = 'prod' | 'historic';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [AppSidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-dvh overflow-hidden app-bg-background app-text">
      <aside class="hidden shrink-0 lg:block">
        <app-sidebar [productName]="companyName" [items]="navigationItems" />
      </aside>

      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            class="absolute inset-0 app-overlay"
            aria-label="Cerrar navegacion"
            (click)="closeSidebar()"
          ></button>
          <aside class="relative h-full">
            <app-sidebar
              [productName]="companyName"
              [items]="navigationItems"
              (navigated)="closeSidebar()"
            />
          </aside>
        </div>
      }

      <div class="flex min-w-0 flex-1 flex-col">
        <app-header
          class="shrink-0"
          [companyName]="companyName"
          [userName]="userName"
          [dataSource]="dataSource"
          (menuToggle)="toggleSidebar()"
          (logout)="logout.emit()"
        />

        <main class="min-h-0 flex-1 overflow-y-auto app-bg-background">
          <ng-content></ng-content>
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  @Input() companyName = 'My Company';
  @Input() userName = 'User';
  @Input() dataSource: ShellDataSource = 'prod';
  @Input() canReadUsers = false;

  @Output() logout = new EventEmitter<void>();

  readonly sidebarOpen = signal(false);

  get navigationItems(): readonly AppSidebarItem[] {
    return [
      { label: 'Dashboard', icon: 'dashboard', routerLink: '/', exact: true },
      ...(this.canReadUsers
        ? [{ label: 'Usuarios', icon: 'group', routerLink: '/users/search' }]
        : []),
      {
        label: 'Perfumes',
        icon: 'local_florist',
        disabled: true,
        hint: 'Modulo previsto para proximas fases',
      },
    ];
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
