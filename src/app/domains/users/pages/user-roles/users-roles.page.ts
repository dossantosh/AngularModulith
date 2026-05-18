import { Component, OnInit, inject } from '@angular/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute } from '@angular/router';

import {
  AppButtonComponent,
  AppCommandBarComponent,
  AppErrorStateComponent,
  AppLoadingStateComponent,
  AppStatusBadgeComponent,
} from '../../../../shared/ui';
import { UserRolesFacade } from '../../state/user-roles.facade';
import { userIdFromRoute } from '../manage-user/users-detail-route';

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
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(UserRolesFacade);

  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly loadError = this.facade.loadError;
  readonly saveError = this.facade.saveError;
  readonly saveSuccess = this.facade.saveSuccess;
  readonly userRoles = this.facade.userRoles;
  readonly selectedRoleIds = this.facade.selectedRoleIds;
  readonly availableRoles = this.facade.availableRoles;

  ngOnInit(): void {
    this.loadRoles();
  }

  reload(): void {
    this.loadRoles({ force: true });
  }

  isSelected(roleId: number): boolean {
    return this.facade.isSelected(roleId);
  }

  toggleRole(roleId: number, event: MatCheckboxChange): void {
    this.facade.setRoleSelected(roleId, event.checked);
  }

  saveRoles(): void {
    const userId = userIdFromRoute(this.route);
    if (userId == null) {
      this.facade.setSaveError('No se pudo identificar el usuario a modificar.');
      return;
    }

    this.facade.saveRoles(userId);
  }

  private loadRoles(options: { force?: boolean } = {}): void {
    const userId = userIdFromRoute(this.route);
    if (userId == null) {
      this.facade.setLoadError('La ruta no contiene un identificador de usuario valido.');
      return;
    }

    if (options.force) {
      this.facade.reloadRoles(userId);
      return;
    }

    this.facade.loadRoles(userId);
  }
}
