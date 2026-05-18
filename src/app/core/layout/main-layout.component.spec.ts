import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { type AppActiveNavigation, type AppNavNode } from '../../shared/ui';
import { MainLayoutComponent } from './main-layout.component';

const dashboardNode: AppNavNode = {
  key: 'dashboard',
  label: 'Inicio',
  icon: 'dashboard',
  route: '/',
  exact: true,
};

const navigationTree: readonly AppNavNode[] = [
  dashboardNode,
  {
    key: 'styles',
    label: 'Styles',
    icon: 'palette',
    route: '/styles',
    children: [
      {
        key: 'elevation',
        label: 'Elevation',
        route: '/styles/elevation',
        children: [
          {
            key: 'overview',
            label: 'Overview',
            route: '/styles/elevation/overview',
            exact: true,
          },
        ],
      },
    ],
  },
];

const activeNavigation: AppActiveNavigation = {
  primary: navigationTree[1],
  secondary: navigationTree[1].children?.[0] ?? null,
  tertiary: navigationTree[1].children?.[0]?.children?.[0] ?? null,
  path: [
    navigationTree[1],
    navigationTree[1].children?.[0],
    navigationTree[1].children?.[0]?.children?.[0],
  ].filter((item): item is AppNavNode => Boolean(item)),
};

const dashboardActiveNavigation: AppActiveNavigation = {
  primary: dashboardNode,
  secondary: null,
  tertiary: null,
  path: [dashboardNode],
};

@Component({
  standalone: true,
  imports: [MainLayoutComponent],
  template: `
    <app-main-layout
      companyName="Seb's Perfumes"
      userName="John"
      [navigationTree]="navigationTree"
      [activeNavigation]="activeNavigation()"
    >
      <p>Page content</p>
    </app-main-layout>
  `,
})
class MainLayoutHostComponent {
  readonly navigationTree = navigationTree;
  readonly activeNavigation = signal(activeNavigation);
}

describe('MainLayoutComponent', () => {
  let fixture: ComponentFixture<MainLayoutHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MainLayoutHostComponent],
      providers: [provideRouter([])],
    });

    fixture = TestBed.createComponent(MainLayoutHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders primary, contextual, and section navigation from one active tree', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelector('nav[aria-label="Navegacion principal"]')).toBeTruthy();
    expect(nativeElement.querySelector('nav[aria-label="Navegacion contextual"]')).toBeTruthy();
    expect(nativeElement.querySelector('nav[aria-label="Navegacion de seccion"]')).toBeTruthy();
    expect(nativeElement.textContent).toContain('Styles');
    expect(nativeElement.textContent).toContain('Elevation');
    expect(nativeElement.textContent).toContain('Overview');
  });

  it('marks active navigation levels without local duplicate active state', () => {
    const activeRailItem = fixture.nativeElement.querySelector(
      '.app-navigation-rail__item--active',
    ) as HTMLElement;
    const currentLinks = Array.from(
      fixture.nativeElement.querySelectorAll('[aria-current="page"]'),
    ) as HTMLElement[];
    const currentLinkTexts = currentLinks.map((link) => link.textContent?.trim() ?? '');

    expect(activeRailItem.textContent).toContain('Styles');
    expect(currentLinkTexts.some((text) => text.includes('Elevation'))).toBe(true);
    expect(currentLinkTexts.some((text) => text.includes('Overview'))).toBe(true);
  });

  it('selects a primary section from the rail without changing the active route', () => {
    fixture.componentInstance.activeNavigation.set(dashboardActiveNavigation);
    fixture.detectChanges();

    const stylesRailButton = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button.app-navigation-rail__item'),
    ).find((button): button is HTMLButtonElement => (button.textContent ?? '').includes('Styles'));

    expect(stylesRailButton).toBeTruthy();

    stylesRailButton?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.activeNavigation().primary?.key).toBe('dashboard');
    expect(fixture.nativeElement.querySelector('aside.app-layout__desktop-sidebar')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Elevation');
  });

  it('collapses contextual navigation when selecting the open primary section again', () => {
    mockDesktopViewport();
    const layout = getMainLayout(fixture);
    const stylesRailButton = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button.app-navigation-rail__item'),
    ).find((button): button is HTMLButtonElement => (button.textContent ?? '').includes('Styles'));

    expect(stylesRailButton).toBeTruthy();
    expect(fixture.nativeElement.querySelector('aside.app-layout__desktop-sidebar')).toBeTruthy();

    stylesRailButton?.click();
    fixture.detectChanges();

    expect(layout.sidebarCollapsed()).toBe(true);
    expect(fixture.nativeElement.querySelector('aside.app-layout__desktop-sidebar')).toBeFalsy();

    stylesRailButton?.click();
    fixture.detectChanges();

    expect(layout.sidebarCollapsed()).toBe(false);
    expect(fixture.nativeElement.querySelector('aside.app-layout__desktop-sidebar')).toBeTruthy();
  });

  it('does not collapse contextual navigation from a primary item without secondary navigation', () => {
    mockDesktopViewport();
    fixture.componentInstance.activeNavigation.set(dashboardActiveNavigation);
    fixture.detectChanges();

    const layout = getMainLayout(fixture);

    layout.toggleSidebar();

    expect(layout.sidebarCollapsed()).toBe(false);
    expect(layout.sidebarOpen()).toBe(false);
  });

  it('opens contextual navigation again when entering a primary item with secondary navigation', () => {
    mockDesktopViewport();
    const layout = getMainLayout(fixture);

    layout.toggleSidebar();
    expect(layout.sidebarCollapsed()).toBe(true);

    fixture.componentInstance.activeNavigation.set(dashboardActiveNavigation);
    fixture.detectChanges();
    fixture.componentInstance.activeNavigation.set(activeNavigation);
    fixture.detectChanges();

    expect(layout.sidebarCollapsed()).toBe(false);
    expect(fixture.nativeElement.querySelector('aside.app-layout__desktop-sidebar')).toBeTruthy();
  });
});

function getMainLayout(fixture: ComponentFixture<MainLayoutHostComponent>): MainLayoutComponent {
  return fixture.debugElement.query(By.directive(MainLayoutComponent)).componentInstance;
}

function mockDesktopViewport(): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string): MediaQueryList => {
      const mediaQueryList = {
        matches: true,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(() => true),
      };

      return mediaQueryList as unknown as MediaQueryList;
    }),
  });
}
