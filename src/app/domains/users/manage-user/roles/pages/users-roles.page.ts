import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute } from '@angular/router';

import {
  AppButtonComponent,
  AppCommandBarComponent,
  AppErrorStateComponent,
  AppLoadingStateComponent,
  AppStatusBadgeComponent,
} from '../../../../../shared/ui';
import {
  type UserRoleDto,
  type UserRolesDto,
  UserRolesApi,
} from '../data-access/user-roles.api';
import { userIdFromRoute } from '../../shell/users-detail-route';

@Component({
  standalone: true,
  selector: 'app-users-roles-page',
  imports: [
    AppButtonComponent,
    AppCommandBarComponent,
    AppErrorStateComponent,
    AppLoadingStateComponent,
    AppStatusBadgeComponent,
    MatCheckboxModule,
  ],
  template: `
    @if (loading()) {
      <app-loading-state message="Cargando roles..." />
    } @else if (loadError()) {
      <app-error-state
        title="No se pudieron cargar los roles"
        [message]="loadError() ?? 'Intentalo de nuevo.'"
        actionLabel="Reintentar"
        (retry)="reload()"
      />
    } @else if (userRoles()) {
      @if (saveSuccess()) {
        <p role="status" class="users-roles-success">Roles actualizados.</p>
      }

      @if (saveError()) {
        <app-error-state
          title="No se pudieron guardar los roles"
          [message]="saveError() ?? 'Intentalo de nuevo.'"
        />
      }

      <app-command-bar title="Roles" subtitle="Selecciona los roles asignados al usuario.">
        <div command-actions class="flex flex-wrap items-center gap-2">
          <app-status-badge
            [label]="selectedRoleIds().length + ' seleccionados'"
            icon="shield_person"
            variant="info"
          />

          <app-button
            variant="primary"
            type="button"
            icon="save"
            [disabled]="saving() || selectedRoleIds().length === 0"
            [loading]="saving()"
            (clicked)="saveRoles()"
          >
            Guardar roles
          </app-button>
        </div>

        <div class="users-roles-list" role="group" aria-label="Roles disponibles">
          @for (role of availableRoles(); track role.id) {
            <div class="users-roles-list__item">
              <mat-checkbox
                [checked]="isSelected(role.id)"
                [disabled]="saving()"
                (change)="toggleRole(role.id, $event)"
              >
                {{ role.name }}
              </mat-checkbox>
            </div>
          }
        </div>

        @if (selectedRoleIds().length === 0) {
          <p class="mt-3 text-sm app-text-muted">Selecciona al menos un rol para poder guardar.</p>
        }
      </app-command-bar>
    }
  `,
  styles: `
    .users-roles-success {
      background: var(--color-success-container);
      border: 1px solid color-mix(in srgb, var(--color-success) 35%, var(--color-border));
      border-radius: var(--radius-lg);
      color: var(--color-success);
      margin-bottom: 1rem;
      padding: 0.75rem 1rem;
    }

    .users-roles-list {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: 1fr;
    }

    .users-roles-list__item {
      background: var(--color-surface-muted);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      display: block;
      min-block-size: 3.5rem;
      padding: 0.5rem 0.75rem;
    }

    @media (min-width: 768px) {
      .users-roles-list {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `,
})
export class UsersRolesPage implements OnInit {
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly saveSuccess = signal(false);
  readonly userRoles = signal<UserRolesDto | null>(null);
  readonly selectedRoleIds = signal<readonly number[]>([]);
  readonly availableRoles = computed<readonly UserRoleDto[]>(
    () => this.userRoles()?.availableRoles ?? [],
  );

  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(UserRolesApi);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadRoles();
  }

  reload(): void {
    this.loadRoles();
  }

  isSelected(roleId: number): boolean {
    return this.selectedRoleIds().includes(roleId);
  }

  toggleRole(roleId: number, event: MatCheckboxChange): void {
    this.saveSuccess.set(false);

    if (event.checked) {
      this.selectedRoleIds.update((roleIds) => [...new Set([...roleIds, roleId])]);
      return;
    }

    this.selectedRoleIds.update((roleIds) => roleIds.filter((id) => id !== roleId));
  }

  saveRoles(): void {
    const userId = userIdFromRoute(this.route);
    if (userId == null) {
      this.saveError.set('No se pudo identificar el usuario a modificar.');
      return;
    }

    const roleIds = this.selectedRoleIds();
    if (!roleIds.length) {
      this.saveError.set('Selecciona al menos un rol.');
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);
    this.saveSuccess.set(false);

    this.api
      .updateUserRoles(userId, roleIds)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (userRoles) => {
          this.applyRoles(userRoles);
          this.saving.set(false);
          this.saveSuccess.set(true);
        },
        error: () => {
          this.saving.set(false);
          this.saveError.set('No se pudieron guardar los roles del usuario.');
        },
      });
  }

  private loadRoles(): void {
    const userId = userIdFromRoute(this.route);
    if (userId == null) {
      this.loading.set(false);
      this.loadError.set('La ruta no contiene un identificador de usuario valido.');
      return;
    }

    this.loading.set(true);
    this.loadError.set(null);
    this.saveError.set(null);
    this.saveSuccess.set(false);

    this.api
      .getUserRoles(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (userRoles) => {
          this.applyRoles(userRoles);
          this.loading.set(false);
        },
        error: () => {
          this.userRoles.set(null);
          this.loading.set(false);
          this.loadError.set('No se pudieron cargar los roles del usuario.');
        },
      });
  }

  private applyRoles(userRoles: UserRolesDto): void {
    this.userRoles.set(userRoles);
    this.selectedRoleIds.set(userRoles.roles.map((role) => role.id));
  }
}
