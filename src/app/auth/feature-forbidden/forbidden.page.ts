import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CardComponent, PageComponent } from '@angular-modulith/shared/ui';
import { AuthFacade } from '../application/auth.facade';

@Component({
  selector: 'app-forbidden-page',
  standalone: true,
  imports: [CardComponent, PageComponent, RouterLink],
  template: `
    <ui-page>
      <div class="flex min-h-[60vh] items-center justify-center">
        <ui-card class="w-full max-w-xl">
          <div class="space-y-4 text-center">
            <span
              class="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
            >
              403
            </span>

            <div class="space-y-2">
              <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Acceso denegado
              </h1>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                Tu sesion esta activa, pero no tienes permisos para entrar en este modulo.
              </p>
            </div>

            <div class="flex flex-col justify-center gap-3 sm:flex-row">
              <a
                routerLink="/"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800"
              >
                Volver al inicio
              </a>

              <button
                type="button"
                (click)="changeUser()"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Cambiar de usuario
              </button>
            </div>
          </div>
        </ui-card>
      </div>
    </ui-page>
  `,
})
export class ForbiddenPage {
  private readonly auth = inject(AuthFacade);
  private readonly router = inject(Router);

  changeUser(): void {
    this.auth.logout().subscribe({
      next: () => void this.router.navigateByUrl('/login'),
      error: () => void this.router.navigateByUrl('/login'),
    });
  }
}
