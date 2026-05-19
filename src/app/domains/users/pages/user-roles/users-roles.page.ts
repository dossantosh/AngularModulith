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
} from '../../../../shared/ui';
import { UserRolesApi, type UserRolesDto } from '../../api/user-roles.api';
import { userIdFromRoute } from '../manage-user/users-detail-route';

interface UserRolesState {
  userId: number | null;
  userRoles: UserRolesDto | null;
  selectedRoleIds: readonly number[];
  loading: boolean;
  saving: boolean;
  loadError: string | null;
  saveError: string | null;
  saveSuccess: boolean;
}

const INITIAL_STATE: UserRolesState = {
  userId: null,
  userRoles: null,
  selectedRoleIds: [],
  loading: false,
  saving: false,
  loadError: null,
  saveError: null,
  saveSuccess: false,
};

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

      <app-command-bar
        title="Modificar Roles"
        subtitle="Selecciona los roles asignados al usuario."
      >
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
  private readonly api = inject(UserRolesApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly state = signal<UserRolesState>(INITIAL_STATE);

  readonly userRoles = computed(() => this.state().userRoles);
  readonly selectedRoleIds = computed(() => this.state().selectedRoleIds);
  readonly availableRoles = computed(() => this.userRoles()?.availableRoles ?? []);
  readonly loading = computed(() => this.state().loading);
  readonly saving = computed(() => this.state().saving);
  readonly loadError = computed(() => this.state().loadError);
  readonly saveError = computed(() => this.state().saveError);
  readonly saveSuccess = computed(() => this.state().saveSuccess);

  ngOnInit(): void {
    this.loadRoles();
  }

  reload(): void {
    this.loadRoles({ force: true });
  }

  isSelected(roleId: number): boolean {
    return this.selectedRoleIds().includes(roleId);
  }

  toggleRole(roleId: number, event: MatCheckboxChange): void {
    this.setRoleSelected(roleId, event.checked);
  }

  saveRoles(): void {
    const userId = userIdFromRoute(this.route);
    if (userId == null) {
      this.setSaveError('No se pudo identificar el usuario a modificar.');
      return;
    }

    const roleIds = this.selectedRoleIds();
    if (!roleIds.length) {
      this.setSaveError('Selecciona al menos un rol.');
      return;
    }

    this.patchState({
      userId,
      saving: true,
      saveError: null,
      saveSuccess: false,
    });

    this.api
      .updateUserRoles(userId, roleIds)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (userRoles) => {
          this.applyRoles(userId, userRoles);
          this.patchState({
            saving: false,
            saveError: null,
            saveSuccess: true,
          });
        },
        error: () => {
          this.patchState({
            saving: false,
            saveError: 'No se pudieron guardar los roles del usuario.',
            saveSuccess: false,
          });
        },
      });
  }

  private loadRoles(options: { force?: boolean } = {}): void {
    const userId = userIdFromRoute(this.route);
    if (userId == null) {
      this.setLoadError('La ruta no contiene un identificador de usuario valido.');
      return;
    }

    const state = this.state();
    if (!options.force && state.userId === userId && (state.loading || state.userRoles)) {
      return;
    }

    this.fetchRoles(userId);
  }

  private setRoleSelected(roleId: number, selected: boolean): void {
    this.patchState({ saveSuccess: false });

    if (selected) {
      this.patchState({
        selectedRoleIds: [...new Set([...this.selectedRoleIds(), roleId])],
      });
      return;
    }

    this.patchState({
      selectedRoleIds: this.selectedRoleIds().filter((id) => id !== roleId),
    });
  }

  private setLoadError(message: string): void {
    this.patchState({
      userId: null,
      userRoles: null,
      selectedRoleIds: [],
      loading: false,
      loadError: message,
    });
  }

  private setSaveError(message: string): void {
    this.patchState({
      saving: false,
      saveError: message,
      saveSuccess: false,
    });
  }

  private fetchRoles(userId: number): void {
    this.patchState({
      userId,
      userRoles: null,
      selectedRoleIds: [],
      loading: true,
      loadError: null,
      saveError: null,
      saveSuccess: false,
    });

    this.api
      .getUserRoles(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (userRoles) => {
          this.applyRoles(userId, userRoles);
          this.patchState({
            loading: false,
            loadError: null,
          });
        },
        error: () => {
          this.patchState({
            userId,
            userRoles: null,
            selectedRoleIds: [],
            loading: false,
            loadError: 'No se pudieron cargar los roles del usuario.',
          });
        },
      });
  }

  private applyRoles(userId: number, userRoles: UserRolesDto): void {
    this.patchState({
      userId,
      userRoles,
      selectedRoleIds: userRoles.roles.map((role) => role.id),
    });
  }

  private patchState(patch: Partial<UserRolesState>): void {
    this.state.update((state) => ({ ...state, ...patch }));
  }
}
