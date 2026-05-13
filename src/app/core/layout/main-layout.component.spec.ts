import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { type AppActiveNavigation, type AppNavNode } from '../../shared/ui';
import { MainLayoutComponent } from './main-layout.component';

const navigationTree: readonly AppNavNode[] = [
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
  primary: navigationTree[0],
  secondary: navigationTree[0].children?.[0] ?? null,
  tertiary: navigationTree[0].children?.[0]?.children?.[0] ?? null,
  path: [
    navigationTree[0],
    navigationTree[0].children?.[0],
    navigationTree[0].children?.[0]?.children?.[0],
  ].filter((item): item is AppNavNode => Boolean(item)),
};

@Component({
  standalone: true,
  imports: [MainLayoutComponent],
  template: `
    <app-main-layout
      companyName="Seb's Perfumes"
      userName="John"
      [navigationTree]="navigationTree"
      [activeNavigation]="activeNavigation"
    >
      <p>Page content</p>
    </app-main-layout>
  `,
})
class MainLayoutHostComponent {
  readonly navigationTree = navigationTree;
  readonly activeNavigation = activeNavigation;
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
    const currentLinks = Array.from(
      fixture.nativeElement.querySelectorAll('[aria-current="page"]'),
    ) as HTMLElement[];
    const currentLinkTexts = currentLinks.map((link) => link.textContent?.trim() ?? '');

    expect(currentLinkTexts.some((text) => text.includes('Styles'))).toBe(true);
    expect(currentLinkTexts.some((text) => text.includes('Elevation'))).toBe(true);
    expect(currentLinkTexts.some((text) => text.includes('Overview'))).toBe(true);
  });
});
