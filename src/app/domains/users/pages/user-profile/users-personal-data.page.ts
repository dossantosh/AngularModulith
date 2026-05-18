import { Component, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  AppButtonComponent,
  AppCardComponent,
  AppErrorStateComponent,
  AppLoadingStateComponent,
  AppStatusBadgeComponent,
} from '../../../../shared/ui';
import { type UserPersonalDataDto, UserProfileFacade } from '../../state/user-profile.facade';
import { userIdFromRoute } from '../manage-user/users-detail-route';

interface PersonalDataItem {
  label: string;
  value: string;
}

const STATUS_LABELS: Record<UserPersonalDataDto['status'], string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  TERMINATED: 'Baja',
  ON_LEAVE: 'Ausencia',
};

const CONTRACT_LABELS: Record<NonNullable<UserPersonalDataDto['contractType']>, string> = {
  FULL_TIME: 'Jornada completa',
  PART_TIME: 'Jornada parcial',
  TEMPORARY: 'Temporal',
  CONTRACTOR: 'Contratista',
  INTERN: 'Practicas',
  OTHER: 'Otro',
};

@Component({
  standalone: true,
  selector: 'app-users-personal-data-page',
  imports: [
    AppButtonComponent,
    AppCardComponent,
    AppErrorStateComponent,
    AppLoadingStateComponent,
    AppStatusBadgeComponent,
  ],
  template: `
    @if (loading()) {
      <app-loading-state message="Cargando datos personales..." />
    } @else if (loadError()) {
      <app-error-state
        title="No se pudieron cargar los datos personales"
        [message]="loadError() ?? 'Intentalo de nuevo.'"
        actionLabel="Reintentar"
        (retry)="reload()"
      />
    } @else if (personalData()) {
      <app-card
        title="Datos personales"
        subtitle="Informacion de empleado asociada al usuario seleccionado."
      >
        <app-button card-actions variant="secondary" [routerLink]="editLink()" icon="edit">
          Modificar
        </app-button>

        <div class="users-personal-data__summary">
          <div>
            <p class="text-xs uppercase app-text-muted">Empleado</p>
            <p class="mt-1 text-lg font-medium app-text">{{ fullName() }}</p>
            <p class="mt-1 text-sm app-text-muted">
              {{ personalData()?.jobTitle || 'Sin puesto' }}
            </p>
          </div>

          <app-status-badge
            [label]="statusLabel()"
            [icon]="personalData()?.status === 'TERMINATED' ? 'cancel' : 'check_circle'"
            [variant]="personalData()?.status === 'ACTIVE' ? 'success' : 'warning'"
          />
        </div>

        <dl class="users-personal-data__grid">
          @for (item of personalDataItems(); track item.label) {
            <div class="users-personal-data__item">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value || '-' }}</dd>
            </div>
          }
        </dl>
      </app-card>
    }
  `,
  styles: `
    .users-personal-data__summary {
      align-items: flex-start;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      gap: 1rem;
      justify-content: space-between;
      padding-bottom: 1rem;
    }

    .users-personal-data__grid {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: 1fr;
      margin-top: 1rem;
    }

    .users-personal-data__item {
      background: var(--color-surface-muted);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      min-width: 0;
      padding: 0.75rem;
    }

    .users-personal-data__item dt {
      color: var(--color-text-muted);
      font: var(--mat-sys-label-medium);
    }

    .users-personal-data__item dd {
      color: var(--color-text);
      font: var(--mat-sys-body-medium);
      margin: 0.25rem 0 0;
      overflow-wrap: anywhere;
    }

    @media (min-width: 768px) {
      .users-personal-data__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1200px) {
      .users-personal-data__grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
  `,
})
export class UsersPersonalDataPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(UserProfileFacade);

  readonly loading = this.facade.loading;
  readonly loadError = this.facade.loadError;
  readonly personalData = this.facade.profile;
  readonly fullName = this.facade.displayName;
  readonly statusLabel = computed(() => {
    const status = this.personalData()?.status ?? 'ACTIVE';

    return STATUS_LABELS[status];
  });
  readonly personalDataItems = computed<readonly PersonalDataItem[]>(() => {
    const data = this.personalData();
    if (!data) {
      return [];
    }

    return [
      { label: 'Codigo interno', value: data.employeeCode },
      { label: 'Correo corporativo', value: data.corporateEmail },
      { label: 'Telefono', value: data.phone },
      { label: 'Documento de identidad', value: data.identityDocument },
      { label: 'Fecha de nacimiento', value: data.birthDate },
      { label: 'Direccion', value: data.address },
      { label: 'Ciudad', value: data.city },
      { label: 'Provincia / estado', value: data.stateProvince },
      { label: 'Codigo postal', value: data.postalCode },
      { label: 'Pais', value: data.country },
      { label: 'Puesto', value: data.jobTitle },
      { label: 'Departamento', value: data.department },
      { label: 'Fecha de alta', value: data.hireDate },
      {
        label: 'Tipo de contrato',
        value: data.contractType ? CONTRACT_LABELS[data.contractType] : '',
      },
      { label: 'Observaciones internas', value: data.internalNotes },
    ];
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  reload(): void {
    this.loadProfile({ force: true });
  }

  editLink(): string {
    const userId = userIdFromRoute(this.route);

    return userId == null ? '/users/search' : `/users/${userId}/personal-data/edit`;
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
}
