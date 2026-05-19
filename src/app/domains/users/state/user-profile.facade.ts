import { Injectable, computed, inject, signal } from '@angular/core';

import {
  UserProfileApi,
  type UpdateUserPersonalDataCommand,
  type UserPersonalDataDto,
} from '../api/user-profile.api';

export type {
  ContractTypeDto,
  EmployeeStatusDto,
  UpdateUserPersonalDataCommand,
  UserPersonalDataDto,
} from '../api/user-profile.api';

interface UserProfileState {
  userId: number | null;
  profile: UserPersonalDataDto | null;
  loading: boolean;
  saving: boolean;
  loadError: string | null;
  saveError: string | null;
  saveSuccess: boolean;
}

const INITIAL_STATE: UserProfileState = {
  userId: null,
  profile: null,
  loading: false,
  saving: false,
  loadError: null,
  saveError: null,
  saveSuccess: false,
};

@Injectable()
export class UserProfileFacade {
  private readonly api = inject(UserProfileApi);
  private readonly state = signal<UserProfileState>(INITIAL_STATE);

  readonly profile = computed(() => this.state().profile);
  readonly loading = computed(() => this.state().loading);
  readonly saving = computed(() => this.state().saving);
  readonly loadError = computed(() => this.state().loadError);
  readonly saveError = computed(() => this.state().saveError);
  readonly saveSuccess = computed(() => this.state().saveSuccess);
  readonly displayName = computed(() => {
    const profile = this.profile();
    const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();

    return fullName || profile?.username || 'Usuario';
  });

  loadProfile(userId: number): void {
    const state = this.state();
    if (state.userId === userId && (state.loading || state.profile)) {
      return;
    }

    this.fetchProfile(userId);
  }

  reloadProfile(userId: number): void {
    this.fetchProfile(userId);
  }

  updateProfile(userId: number, command: UpdateUserPersonalDataCommand): void {
    this.patchState({
      userId,
      saving: true,
      saveError: null,
      saveSuccess: false,
    });

    this.api.updateUserPersonalData(userId, command).subscribe({
      next: (profile) => {
        this.patchState({
          userId,
          profile,
          saving: false,
          saveError: null,
          saveSuccess: true,
        });
      },
      error: () => {
        this.patchState({
          saving: false,
          saveError: 'No se pudieron guardar los datos personales del usuario.',
          saveSuccess: false,
        });
      },
    });
  }

  clearSaveState(): void {
    this.patchState({
      saveError: null,
      saveSuccess: false,
    });
  }

  setLoadError(message: string): void {
    this.patchState({
      userId: null,
      profile: null,
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

  private fetchProfile(userId: number): void {
    this.patchState({
      userId,
      profile: null,
      loading: true,
      loadError: null,
      saveError: null,
      saveSuccess: false,
    });

    this.api.getUserPersonalData(userId).subscribe({
      next: (profile) => {
        this.patchState({
          userId,
          profile,
          loading: false,
          loadError: null,
        });
      },
      error: () => {
        this.patchState({
          userId,
          profile: null,
          loading: false,
          loadError: 'No se pudieron cargar los datos personales del usuario.',
        });
      },
    });
  }

  private patchState(patch: Partial<UserProfileState>): void {
    this.state.update((state) => ({ ...state, ...patch }));
  }
}
