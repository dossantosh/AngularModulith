import { Component, HostListener, computed, input, output, signal } from '@angular/core';

import {
  AppNavigationRailComponent,
  AppSectionNavComponent,
  AppSidebarComponent,
  type AppActiveNavigation,
  type AppNavNode,
} from '../../shared/ui';
import { HeaderComponent } from './header.component';

type ShellDataSource = 'prod' | 'historic';

const EMPTY_ACTIVE_NAVIGATION: AppActiveNavigation = {
  primary: null,
  secondary: null,
  tertiary: null,
  path: [],
};

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    AppNavigationRailComponent,
    AppSectionNavComponent,
    AppSidebarComponent,
    HeaderComponent,
  ],
  template: `
    <div class="flex h-dvh overflow-hidden app-bg-background app-text">
      <app-navigation-rail
        class="app-layout__desktop-rail shrink-0"
        [items]="navigationTree()"
        [activeItemKey]="activePrimary()?.key ?? null"
      />

      @if (!sidebarCollapsed() && hasContextSidebar()) {
        <aside class="app-layout__desktop-sidebar shrink-0">
          <app-sidebar [primaryItem]="activePrimary()" [activePathKeys]="activePathKeys()" />
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

          <aside
            class="app-layout__mobile-drawer relative flex h-full max-w-full"
            role="dialog"
            aria-modal="true"
            aria-label="Navegacion"
          >
            <app-navigation-rail
              class="shrink-0"
              [items]="navigationTree()"
              [activeItemKey]="activePrimary()?.key ?? null"
              (navigated)="closeSidebar()"
            />

            @if (hasContextSidebar()) {
              <app-sidebar
                [primaryItem]="activePrimary()"
                [activePathKeys]="activePathKeys()"
                (navigated)="closeSidebar()"
              />
            }
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

        <app-section-nav
          class="shrink-0"
          [items]="sectionItems()"
          [activeItemKey]="activeTertiary()?.key ?? null"
        />

        <main class="min-h-0 flex-1 overflow-y-auto app-bg-background">
          <ng-content></ng-content>
        </main>
      </div>
    </div>
  `,
  styles: `
    .app-layout__desktop-rail,
    .app-layout__desktop-sidebar {
      display: none;
    }

    .app-layout__mobile-overlay {
      display: block;
    }

    .app-layout__mobile-drawer {
      box-shadow: var(--mat-sys-level2);
    }

    @media (min-width: 1024px) {
      .app-layout__desktop-rail,
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
  readonly navigationTree = input<readonly AppNavNode[]>([]);
  readonly activeNavigation = input<AppActiveNavigation>(EMPTY_ACTIVE_NAVIGATION);

  readonly logout = output<void>();

  readonly sidebarOpen = signal(false);
  readonly sidebarCollapsed = signal(false);

  protected readonly activePrimary = computed(() => this.activeNavigation().primary);
  protected readonly activeTertiary = computed(() => this.activeNavigation().tertiary);
  protected readonly activePathKeys = computed(() =>
    this.activeNavigation().path.map((item) => item.key),
  );
  protected readonly sectionItems = computed(
    () => this.activeNavigation().secondary?.children ?? [],
  );
  protected readonly hasContextSidebar = computed(() =>
    Boolean(this.activePrimary()?.children?.length),
  );

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
  }

  @HostListener('document:keydown.escape')
  closeSidebarOnEscape(): void {
    if (this.sidebarOpen()) {
      this.closeSidebar();
    }
  }

  private isDesktopViewport(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(min-width: 1024px)').matches
    );
  }
}
