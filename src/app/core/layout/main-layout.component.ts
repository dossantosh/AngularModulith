import { Component, computed, input, output, signal } from '@angular/core';

import { AppSidebarComponent, AppSidebarItem } from '../../shared/ui';
import { HeaderComponent } from './header.component';

type ShellDataSource = 'prod' | 'historic';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [AppSidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-dvh overflow-hidden app-bg-background app-text">
      @if (!sidebarCollapsed()) {
        <aside class="app-layout__desktop-sidebar shrink-0">
          <app-sidebar [productName]="companyName()" [items]="navigationItems()" />
        </aside>
      }

      @if (sidebarOpen()) {
        <div class="app-layout__mobile-overlay fixed inset-0 z-50">
          <button
            type="button"
            class="absolute inset-0 app-overlay"
            aria-label="Cerrar navegacion"
            (click)="closeSidebar()"
          ></button>
          <aside class="relative h-full">
            <app-sidebar
              [productName]="companyName()"
              [items]="navigationItems()"
              (navigated)="closeSidebar()"
            />
          </aside>
        </div>
      }

      <div class="flex min-w-0 flex-1 flex-col">
        <app-header
          class="shrink-0"
          [companyName]="companyName()"
          [userName]="userName()"
          [dataSource]="dataSource()"
          (menuToggle)="toggleSidebar()"
          (logout)="logout.emit()"
        />

        <main class="min-h-0 flex-1 overflow-y-auto app-bg-background">
          <ng-content></ng-content>
        </main>
      </div>
    </div>
  `,
  styles: `
    .app-layout__desktop-sidebar {
      display: none;
    }

    .app-layout__mobile-overlay {
      display: block;
    }

    @media (min-width: 1024px) {
      .app-layout__desktop-sidebar {
        display: block;
      }

      .app-layout__mobile-overlay {
        display: none;
      }
    }
  `,
})
export class MainLayoutComponent {
  readonly companyName = input('My Company');
  readonly userName = input('User');
  readonly dataSource = input<ShellDataSource>('prod');
  readonly canReadUsers = input(false);

  readonly logout = output<void>();

  readonly sidebarOpen = signal(false);
  readonly sidebarCollapsed = signal(false);
  readonly navigationItems = computed<readonly AppSidebarItem[]>(() => [
    { label: 'Dashboard', icon: 'dashboard', routerLink: '/', exact: true },
    ...(this.canReadUsers()
      ? [{ label: 'Usuarios', icon: 'group', routerLink: '/users/search' }]
      : []),
    {
      label: 'Perfumes',
      icon: 'local_florist',
      disabled: true,
      hint: 'Modulo previsto para proximas fases',
    },
  ]);

  toggleSidebar(): void {
    if (this.isDesktopViewport()) {
      this.sidebarCollapsed.update((collapsed) => !collapsed);
      this.sidebarOpen.set(false);
      return;
    }

    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
    this.sidebarCollapsed.set(false);
  }

  private isDesktopViewport(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(min-width: 1024px)').matches
    );
  }
}
