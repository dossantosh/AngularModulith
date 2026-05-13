import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';

import {
  AppButtonComponent,
  AppCommandBarComponent,
  AppErrorStateComponent,
  AppLoadingStateComponent,
  AppTextFieldComponent,
} from '../../../../shared/ui';
import {
  type ContractTypeDto,
  type EmployeeStatusDto,
  type UserPersonalDataDto,
  UsersFacade,
} from '../../application/users.facade';
import { userIdFromRoute } from '../detail/users-detail-route';

interface SelectOption<T> {
  value: T;
  label: string;
}

@Component({
  standalone: true,
  selector: 'app-users-edit-page',
  imports: [
    AppButtonComponent,
    AppCommandBarComponent,
    AppErrorStateComponent,
    AppLoadingStateComponent,
    AppTextFieldComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './users-edit.page.html',
  styles: `
    .users-edit-form-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: 1fr;
    }

    .users-edit-form-grid__wide {
      grid-column: 1 / -1;
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

  readonly statusOptions: readonly SelectOption<EmployeeStatusDto>[] = [
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'INACTIVE', label: 'Inactivo' },
    { value: 'TERMINATED', label: 'Baja' },
    { value: 'ON_LEAVE', label: 'Ausencia' },
  ];
  readonly contractTypeOptions: readonly SelectOption<ContractTypeDto>[] = [
    { value: 'FULL_TIME', label: 'Jornada completa' },
    { value: 'PART_TIME', label: 'Jornada parcial' },
    { value: 'TEMPORARY', label: 'Temporal' },
    { value: 'CONTRACTOR', label: 'Contratista' },
    { value: 'INTERN', label: 'Practicas' },
    { value: 'OTHER', label: 'Otro' },
  ];

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(UsersFacade);
  private readonly destroyRef = inject(DestroyRef);

  readonly personalDataForm = this.fb.group({
    employeeCode: this.fb.nonNullable.control('', [Validators.maxLength(30)]),
    firstName: this.fb.nonNullable.control('', [Validators.maxLength(80)]),
    lastName: this.fb.nonNullable.control('', [Validators.maxLength(120)]),
    corporateEmail: this.fb.nonNullable.control('', [Validators.email, Validators.maxLength(120)]),
    phone: this.fb.nonNullable.control('', [Validators.maxLength(30)]),
    identityDocument: this.fb.nonNullable.control('', [Validators.maxLength(40)]),
    birthDate: this.fb.nonNullable.control(''),
    address: this.fb.nonNullable.control('', [Validators.maxLength(160)]),
    city: this.fb.nonNullable.control('', [Validators.maxLength(80)]),
    stateProvince: this.fb.nonNullable.control('', [Validators.maxLength(80)]),
    postalCode: this.fb.nonNullable.control('', [Validators.maxLength(20)]),
    country: this.fb.nonNullable.control('', [Validators.maxLength(80)]),
    jobTitle: this.fb.nonNullable.control('', [Validators.maxLength(100)]),
    department: this.fb.nonNullable.control('', [Validators.maxLength(100)]),
    hireDate: this.fb.nonNullable.control(''),
    status: this.fb.nonNullable.control<EmployeeStatusDto>('ACTIVE', [Validators.required]),
    contractType: this.fb.control<ContractTypeDto | null>(null),
    internalNotes: this.fb.nonNullable.control('', [Validators.maxLength(1000)]),
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

    this.saving.set(true);
    this.personalDataForm.disable({ emitEvent: false });

    this.facade
      .updatePersonalData(userId, this.personalDataForm.getRawValue())
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
    this.personalDataForm.reset(
      {
        employeeCode: personalData.employeeCode,
        firstName: personalData.firstName,
        lastName: personalData.lastName,
        corporateEmail: personalData.corporateEmail,
        phone: personalData.phone,
        identityDocument: personalData.identityDocument,
        birthDate: personalData.birthDate,
        address: personalData.address,
        city: personalData.city,
        stateProvince: personalData.stateProvince,
        postalCode: personalData.postalCode,
        country: personalData.country,
        jobTitle: personalData.jobTitle,
        department: personalData.department,
        hireDate: personalData.hireDate,
        status: personalData.status,
        contractType: personalData.contractType,
        internalNotes: personalData.internalNotes,
      },
      { emitEvent: false },
    );
  }
}
