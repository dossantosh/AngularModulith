import { Component, OnInit, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {
  AppButtonComponent,
  AppCommandBarComponent,
  AppErrorStateComponent,
  AppLoadingStateComponent,
  AppTextFieldComponent,
} from '../../../../shared/ui';
import {
  type UpdateUserPersonalDataCommand,
  type UserPersonalDataDto,
  UserProfileFacade,
} from '../../state/user-profile.facade';
import { userIdFromRoute } from '../manage-user/users-detail-route';

@Component({
  standalone: true,
  selector: 'app-users-edit-page',
  imports: [
    AppButtonComponent,
    AppCommandBarComponent,
    AppErrorStateComponent,
    AppLoadingStateComponent,
    AppTextFieldComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './users-edit.page.html',
  styles: `
    .users-edit-form-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: 1fr;
    }

    .users-edit-success {
      background: var(--color-success-container);
      border: 1px solid color-mix(in srgb, var(--color-success) 35%, var(--color-border));
      border-radius: var(--radius-lg);
      color: var(--color-success);
      padding: 0.75rem 1rem;
    }

    @media (min-width: 768px) {
      .users-edit-form-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1200px) {
      .users-edit-form-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
  `,
})
export class UsersEditPage implements OnInit {
  submitted = false;

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(UserProfileFacade);

  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly loadError = this.facade.loadError;
  readonly saveError = this.facade.saveError;
  readonly saveSuccess = this.facade.saveSuccess;
  readonly currentPersonalData = this.facade.profile;

  readonly personalDataForm = this.fb.group({
    firstName: this.fb.nonNullable.control('', [Validators.maxLength(80)]),
    lastName: this.fb.nonNullable.control('', [Validators.maxLength(120)]),
    corporateEmail: this.fb.nonNullable.control('', [Validators.email, Validators.maxLength(120)]),
    phone: this.fb.nonNullable.control('', [Validators.maxLength(30)]),
    address: this.fb.nonNullable.control('', [Validators.maxLength(160)]),
    city: this.fb.nonNullable.control('', [Validators.maxLength(80)]),
    stateProvince: this.fb.nonNullable.control('', [Validators.maxLength(80)]),
    postalCode: this.fb.nonNullable.control('', [Validators.maxLength(20)]),
    country: this.fb.nonNullable.control('', [Validators.maxLength(80)]),
  });

  private readonly profileFormEffect = effect(() => {
    const personalData = this.facade.profile();
    if (!personalData) {
      return;
    }

    this.patchPersonalData(personalData);
  });

  private readonly formDisabledEffect = effect(() => {
    if (this.facade.loading() || this.facade.saving()) {
      this.personalDataForm.disable({ emitEvent: false });
      return;
    }

    if (!this.facade.loadError()) {
      this.personalDataForm.enable({ emitEvent: false });
    }
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  reload(): void {
    this.loadProfile({ force: true });
  }

  savePersonalData(): void {
    this.submitted = true;
    this.facade.clearSaveState();

    if (this.personalDataForm.invalid) {
      this.personalDataForm.markAllAsTouched();
      return;
    }

    const userId = userIdFromRoute(this.route);
    if (userId == null) {
      this.facade.setSaveError('No se pudo identificar el usuario a modificar.');
      return;
    }

    const currentPersonalData = this.currentPersonalData();
    if (!currentPersonalData) {
      this.facade.setSaveError('No se pudieron cargar los datos originales del usuario.');
      return;
    }

    const command = this.buildUpdateCommand(currentPersonalData);
    this.facade.updateProfile(userId, command);
  }

  cancelLink(): string {
    const userId = userIdFromRoute(this.route);

    return userId == null ? '/users/search' : `/users/${userId}/personal-data`;
  }

  private loadProfile(options: { force?: boolean } = {}): void {
    const userId = userIdFromRoute(this.route);
    if (userId == null) {
      this.facade.setLoadError('La ruta no contiene un identificador de usuario valido.');
      return;
    }

    if (options.force) {
      this.facade.reloadProfile(userId);
      return;
    }

    this.facade.loadProfile(userId);
  }

  private patchPersonalData(personalData: UserPersonalDataDto): void {
    this.personalDataForm.reset(
      {
        firstName: personalData.firstName,
        lastName: personalData.lastName,
        corporateEmail: personalData.corporateEmail,
        phone: personalData.phone,
        address: personalData.address,
        city: personalData.city,
        stateProvince: personalData.stateProvince,
        postalCode: personalData.postalCode,
        country: personalData.country,
      },
      { emitEvent: false },
    );
  }

  private buildUpdateCommand(personalData: UserPersonalDataDto): UpdateUserPersonalDataCommand {
    const editableData = this.personalDataForm.getRawValue();

    return {
      employeeCode: personalData.employeeCode,
      firstName: editableData.firstName,
      lastName: editableData.lastName,
      corporateEmail: editableData.corporateEmail,
      phone: editableData.phone,
      identityDocument: personalData.identityDocument,
      birthDate: personalData.birthDate,
      address: editableData.address,
      city: editableData.city,
      stateProvince: editableData.stateProvince,
      postalCode: editableData.postalCode,
      country: editableData.country,
      jobTitle: personalData.jobTitle,
      department: personalData.department,
      hireDate: personalData.hireDate,
      status: personalData.status,
      contractType: personalData.contractType,
      internalNotes: personalData.internalNotes,
    };
  }
}
