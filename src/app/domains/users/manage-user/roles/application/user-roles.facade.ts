import { Injectable, computed, inject, signal } from '@angular/core';

import { UserRolesApi, type UserRolesDto } from '../data-access/user-roles.api';

export type { UserRoleDto, UserRolesDto } from '../data-access/user-roles.api';

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

@Injectable()
export class UserRolesFacade {
  private readonly api = inject(UserRolesApi);
  private readonly state = signal<UserRolesState>(INITIAL_STATE);

  readonly userRoles = computed(() => this.state().userRoles);
  readonly selectedRoleIds = computed(() => this.state().selectedRoleIds);
  readonly availableRoles = computed(() => this.userRoles()?.availableRoles ?? []);
  readonly loading = computed(() => this.state().loading);
  readonly saving = computed(() => this.state().saving);
  readonly loadError = computed(() => this.state().loadError);
  readonly saveError = computed(() => this.state().saveError);
  readonly saveSuccess = computed(() => this.state().saveSuccess);

  loadRoles(userId: number): void {
    const state = this.state();
    if (state.userId === userId && (state.loading || state.userRoles)) {
      return;
    }

    this.fetchRoles(userId);
  }

  reloadRoles(userId: number): void {
    this.fetchRoles(userId);
  }

  isSelected(roleId: number): boolean {
    return this.selectedRoleIds().includes(roleId);
  }

  setRoleSelected(roleId: number, selected: boolean): void {
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

  saveRoles(userId: number): void {
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

    this.api.updateUserRoles(userId, roleIds).subscribe({
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

  setLoadError(message: string): void {
    this.patchState({
      userId: null,
      userRoles: null,
      selectedRoleIds: [],
      loading: false,
      loadError: message,
    });
  }

  setSaveError(message: string): void {
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

    this.api.getUserRoles(userId).subscribe({
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
