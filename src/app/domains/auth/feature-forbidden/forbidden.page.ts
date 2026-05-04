import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { AuthFacade } from '../../../core/auth/session/auth.facade';
import {
  AppButtonComponent,
  AppCardComponent,
  AppErrorStateComponent,
  AppPageComponent,
} from '../../../shared/ui';

@Component({
  selector: 'app-forbidden-page',
  standalone: true,
  imports: [AppButtonComponent, AppCardComponent, AppErrorStateComponent, AppPageComponent],
  template: `
    <app-page
      title="Acceso denegado"
      subtitle="Tu sesion esta activa, pero faltan permisos para entrar en esta zona."
      eyebrow="Seguridad"
      [breadcrumbs]="breadcrumbs"
    >
      <div class="flex min-h-[60vh] items-center justify-center">
        <app-card class="w-full max-w-xl" [spacious]="true">
          <div class="space-y-4 text-center">
            <app-error-state
              title="No tienes acceso a este modulo"
              message="La sesion es valida, pero tus capabilities no permiten abrir esta pantalla."
            />

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
  private readonly destroyRef = inject(DestroyRef);
  readonly breadcrumbs = [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Seguridad' },
    { label: '403' },
  ];

  changeUser(): void {
    this.auth
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigateByUrl('/login'),
        error: () => void this.router.navigateByUrl('/login'),
      });
  }
}
