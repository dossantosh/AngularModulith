import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {
  AppButtonComponent,
  AppCommandBarComponent,
  AppErrorStateComponent,
  AppLoadingStateComponent,
  AppTextFieldComponent,
} from '../../../../../shared/ui';
import {
  type UpdateUserPersonalDataCommand,
  type UserPersonalDataDto,
  UserProfileFacade,
} from '../application/user-profile.facade';
import { userIdFromRoute } from '../../shell/users-detail-route';

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

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly saveSuccess = signal(false);
  readonly currentPersonalData = signal<UserPersonalDataDto | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(UserProfileFacade);
  private readonly destroyRef = inject(DestroyRef);

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

  ngOnInit(): void {
    this.loadPersonalData();
  }

  reload(): void {
    this.loadPersonalData();
  }

  savePersonalData(): void {
    this.submitted = true;
    this.saveError.set(null);
    this.saveSuccess.set(false);

    if (this.personalDataForm.invalid) {
      this.personalDataForm.markAllAsTouched();
      return;
    }

    const userId = userIdFromRoute(this.route);
    if (userId == null) {
      this.saveError.set('No se pudo identificar el usuario a modificar.');
      return;
    }

    const currentPersonalData = this.currentPersonalData();
    if (!currentPersonalData) {
      this.saveError.set('No se pudieron cargar los datos originales del usuario.');
      return;
    }

    const command = this.buildUpdateCommand(currentPersonalData);

    this.saving.set(true);
    this.personalDataForm.disable({ emitEvent: false });

    this.facade
      .updatePersonalData(userId, command)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (personalData) => {
          this.patchPersonalData(personalData);
          this.saving.set(false);
          this.personalDataForm.enable({ emitEvent: false });
          this.saveSuccess.set(true);
        },
        error: () => {
          this.saving.set(false);
          this.personalDataForm.enable({ emitEvent: false });
          this.saveError.set('No se pudieron guardar los datos personales del usuario.');
        },
      });
  }

  cancelLink(): string {
    const userId = userIdFromRoute(this.route);

    return userId == null ? '/users/search' : `/users/${userId}/personal-data`;
  }

  private loadPersonalData(): void {
    const userId = userIdFromRoute(this.route);
    if (userId == null) {
      this.loading.set(false);
      this.loadError.set('La ruta no contiene un identificador de usuario valido.');
      return;
    }

    this.loading.set(true);
    this.currentPersonalData.set(null);
    this.loadError.set(null);
    this.saveError.set(null);
    this.saveSuccess.set(false);
    this.personalDataForm.disable({ emitEvent: false });

    this.facade
      .loadPersonalData(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (personalData) => {
          this.patchPersonalData(personalData);
          this.personalDataForm.enable({ emitEvent: false });
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.loadError.set('No se pudieron cargar los datos personales del usuario.');
        },
      });
  }

  private patchPersonalData(personalData: UserPersonalDataDto): void {
    this.currentPersonalData.set(personalData);
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
