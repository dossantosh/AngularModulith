import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthFacade } from '../../../core/auth/session/auth.facade';
import { AppButtonComponent, AppCardComponent, AppPageComponent } from '../../../shared/ui';

@Component({
  selector: 'app-forbidden-page',
  standalone: true,
  imports: [AppButtonComponent, AppCardComponent, AppPageComponent],
  template: `
    <app-page
      title="Acceso denegado"
      subtitle="Tu sesion esta activa, pero faltan permisos para entrar en esta zona."
      eyebrow="Seguridad"
    >
      <div class="flex min-h-[60vh] items-center justify-center">
        <app-card class="w-full max-w-xl" [spacious]="true">
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
              <app-button variant="primary" routerLink="/">
                Volver al inicio
              </app-button>

              <app-button
                variant="secondary"
                type="button"
                (clicked)="changeUser()"
              >
                Cambiar de usuario
              </app-button>
            </div>
          </div>
        </app-card>
      </div>
    </app-page>
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
