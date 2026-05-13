import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import {
  AppPageComponent,
  AppSectionNavComponent,
  type AppBreadcrumbItem,
  type AppNavNode,
} from '../../../../shared/ui';

@Component({
  standalone: true,
  selector: 'app-users-user-shell-page',
  imports: [AppPageComponent, AppSectionNavComponent, RouterOutlet],
  template: `
    <app-page
      title="Usuario"
      subtitle="Consulta datos personales, modifica informacion de empleado y gestiona roles."
      eyebrow="Sistemas"
      layout="full"
      [breadcrumbs]="breadcrumbs()"
    >
      <app-section-nav
        class="mb-4 block"
        [items]="sectionItems()"
        [activeItemKey]="activeSectionKey()"
      />

      <router-outlet></router-outlet>
    </app-page>
  `,
})
export class UsersUserShellPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly userId = signal<number | null>(null);
  private readonly currentUrl = signal(this.router.url);

  readonly breadcrumbs = computed<readonly AppBreadcrumbItem[]>(() => [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Sistemas' },
    { label: 'Usuarios', routerLink: '/users/search' },
    { label: this.userId() == null ? 'Usuario' : `Usuario ${this.userId()}` },
  ]);

  readonly sectionItems = computed<readonly AppNavNode[]>(() => {
    const userId = this.userId();
    if (userId == null) {
      return [];
    }

    return [
      {
        key: 'personal-data',
        label: 'Datos personales',
        route: `/users/${userId}/personal-data`,
        exact: true,
      },
      {
        key: 'personal-data-edit',
        label: 'Modificar datos personales',
        route: `/users/${userId}/personal-data/edit`,
        exact: true,
      },
      {
        key: 'roles',
        label: 'Roles',
        route: `/users/${userId}/roles`,
        exact: true,
      },
    ];
  });

  readonly activeSectionKey = computed(() => {
    const url = this.currentUrl();

    if (url.includes('/roles')) {
      return 'roles';
    }

    if (url.includes('/personal-data/edit') || url.endsWith('/edit')) {
      return 'personal-data-edit';
    }

    return 'personal-data';
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const userId = Number(params.get('id'));
      this.userId.set(Number.isInteger(userId) && userId > 0 ? userId : null);
    });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));
  }
}
