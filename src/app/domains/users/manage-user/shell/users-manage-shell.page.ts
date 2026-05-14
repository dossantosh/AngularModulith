import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { catchError, filter, map, of, switchMap, tap } from 'rxjs';

import {
  AppPageComponent,
  AppSectionNavComponent,
  type AppBreadcrumbItem,
  type AppNavNode,
} from '../../../../shared/ui';
import {
  type UserPersonalDataDto,
  UserProfileFacade,
} from '../profile/application/user-profile.facade';

@Component({
  standalone: true,
  selector: 'app-users-manage-shell-page',
  imports: [AppPageComponent, AppSectionNavComponent, RouterOutlet],
  template: `
    <app-page
      [title]="pageTitle()"
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
export class UsersManageShellPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(UserProfileFacade);
  private readonly destroyRef = inject(DestroyRef);

  readonly userId = signal<number | null>(null);
  readonly userDisplayName = signal<string | null>(null);
  private readonly currentUrl = signal(this.router.url);

  readonly pageTitle = computed(() => this.userDisplayName() ?? 'Usuario');
  readonly breadcrumbs = computed<readonly AppBreadcrumbItem[]>(() => [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Sistemas' },
    { label: 'Usuarios', routerLink: '/users/search' },
    { label: this.userDisplayName() ?? 'Usuario' },
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
    this.route.paramMap
      .pipe(
        map((params) => {
          const userId = Number(params.get('id'));

          return Number.isInteger(userId) && userId > 0 ? userId : null;
        }),
        tap((userId) => {
          this.userId.set(userId);
          this.userDisplayName.set(null);
        }),
        switchMap((userId) =>
          userId == null
            ? of(null)
            : this.facade.loadPersonalData(userId).pipe(
                map(displayNameFor),
                catchError(() => of('Usuario')),
              ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((displayName) => this.userDisplayName.set(displayName));

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));
  }
}

function displayNameFor(personalData: UserPersonalDataDto): string {
  const fullName = [personalData.firstName, personalData.lastName].filter(Boolean).join(' ').trim();

  return fullName || personalData.username || 'Usuario';
}
