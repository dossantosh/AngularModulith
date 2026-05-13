import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router } from '@angular/router';

import {
  AppButtonComponent,
  AppCommandBarComponent,
  AppErrorStateComponent,
  AppLoadingStateComponent,
  AppPageComponent,
  AppStatusBadgeComponent,
  AppTextFieldComponent,
} from '../../../../shared/ui';
import { type UserDetailsDto, UsersFacade } from '../../application/users.facade';

@Component({
  standalone: true,
  selector: 'app-users-edit-page',
  imports: [
    AppButtonComponent,
    AppCommandBarComponent,
    AppErrorStateComponent,
    AppLoadingStateComponent,
    AppPageComponent,
    AppStatusBadgeComponent,
    AppTextFieldComponent,
    MatCheckboxModule,
    ReactiveFormsModule,
  ],
  templateUrl: './users-edit.page.html',
  styles: `
    .users-edit-form-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: 1fr;
    }

    .users-edit-options {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: 1fr;
    }

    .users-edit-option {
      align-items: center;
      background-color: var(--color-surface-muted);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      display: flex;
      min-block-size: 3.5rem;
      padding: 0.5rem 0.75rem;
    }

    @media (min-width: 768px) {
      .users-edit-form-grid,
      .users-edit-options {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `,
})
export class UsersEditPage implements OnInit {
  submitted = false;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly user = signal<UserDetailsDto | null>(null);
  readonly userId = signal<number | null>(null);
  readonly rolesLabel = computed(() => {
    const roles = this.user()?.roles ?? [];

    return roles.length ? roles.map((role) => role.name).join(', ') : 'Sin roles asignados';
  });

  readonly breadcrumbs = [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Sistemas' },
    { label: 'Usuarios', routerLink: '/users/search' },
    { label: 'Modificar' },
  ];

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(UsersFacade);
  private readonly destroyRef = inject(DestroyRef);

  readonly userForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(40)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    enabled: true,
    isAdmin: false,
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const userId = Number(params.get('id'));

      if (!Number.isInteger(userId) || userId <= 0) {
        this.userId.set(null);
        this.loading.set(false);
        this.loadError.set('La ruta no contiene un identificador de usuario valido.');
        return;
      }

      this.userId.set(userId);
      this.loadUser(userId);
    });
  }

  reloadUser(): void {
    const userId = this.userId();

    if (userId != null) {
      this.loadUser(userId);
    }
  }

  saveUser(): void {
    this.submitted = true;
    this.saveError.set(null);

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const userId = this.userId();
    if (userId == null) {
      this.saveError.set('No se pudo identificar el usuario a modificar.');
      return;
    }

    this.saving.set(true);
    this.userForm.disable({ emitEvent: false });

    this.facade
      .updateUser(userId, this.userForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigateByUrl('/users/search'),
        error: () => {
          this.saving.set(false);
          this.userForm.enable({ emitEvent: false });
          this.saveError.set('No se pudieron guardar los cambios del usuario.');
        },
      });
  }

  cancel(): void {
    void this.router.navigateByUrl('/users/search');
  }

  private loadUser(userId: number): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.saveError.set(null);
    this.userForm.disable({ emitEvent: false });

    this.facade
      .loadUser(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.user.set(user);
          this.userForm.reset(
            {
              username: user.username,
              email: user.email,
              enabled: user.enabled,
              isAdmin: user.isAdmin,
            },
            { emitEvent: false },
          );
          this.userForm.enable({ emitEvent: false });
          this.loading.set(false);
        },
        error: () => {
          this.user.set(null);
          this.loading.set(false);
          this.loadError.set('No se pudo cargar el usuario seleccionado.');
        },
      });
  }
}
