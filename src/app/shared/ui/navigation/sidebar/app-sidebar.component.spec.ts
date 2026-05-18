import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { type AppNavNode } from '../app-nav-node';
import { AppSidebarComponent } from './app-sidebar.component';

const primaryItem: AppNavNode = {
  key: 'systems',
  label: 'Sistemas',
  icon: 'settings',
  children: [
    {
      key: 'users',
      label: 'Usuarios',
      icon: 'group',
      route: '/users/search',
      matchRoute: '/users',
    },
  ],
};

@Component({
  standalone: true,
  imports: [AppSidebarComponent],
  template: ` <app-sidebar [primaryItem]="primaryItem" [activePathKeys]="activePathKeys" /> `,
})
class SidebarHostComponent {
  readonly primaryItem = primaryItem;
  readonly activePathKeys = ['systems', 'users'];
}

describe('AppSidebarComponent', () => {
  let fixture: ComponentFixture<SidebarHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SidebarHostComponent],
      providers: [provideRouter([])],
    });

    fixture = TestBed.createComponent(SidebarHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('marks secondary links as active from the resolved navigation path', () => {
    const link = fixture.nativeElement.querySelector('a[aria-current="page"]') as HTMLElement;

    expect(link).toBeTruthy();
    expect(link.textContent).toContain('Usuarios');
    expect(link.classList.contains('app-sidebar__link--active')).toBe(true);
  });
});
