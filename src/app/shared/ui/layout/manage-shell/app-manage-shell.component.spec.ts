import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppManageShellComponent } from './app-manage-shell.component';

@Component({
  standalone: true,
  imports: [AppManageShellComponent],
  template: `
    <app-manage-shell
      title="Ana Lopez"
      subtitle="Gestion operativa"
      eyebrow="Sistemas"
      [breadcrumbs]="breadcrumbs"
      [sectionItems]="sectionItems"
      activeSectionKey="roles"
    >
      <section id="projected-child">Contenido del dominio</section>
    </app-manage-shell>
  `,
})
class ManageShellHostComponent {
  readonly breadcrumbs = [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Usuarios', routerLink: '/users/search' },
    { label: 'Ana Lopez' },
  ];
  readonly sectionItems = [
    {
      key: 'profile',
      label: 'Datos personales',
      route: '/users/7/personal-data',
      exact: true,
    },
    {
      key: 'roles',
      label: 'Roles',
      route: '/users/7/roles',
      exact: true,
    },
  ];
}

describe('AppManageShellComponent', () => {
  let fixture: ComponentFixture<ManageShellHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ManageShellHostComponent],
      providers: [provideRouter([])],
    });

    fixture = TestBed.createComponent(ManageShellHostComponent);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders page metadata, section navigation and projected content', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Ana Lopez');
    expect(text).toContain('Gestion operativa');
    expect(text).toContain('Sistemas');
    expect(text).toContain('Usuarios');
    expect(text).toContain('Datos personales');
    expect(text).toContain('Roles');
    expect(text).toContain('Contenido del dominio');
  });
});
