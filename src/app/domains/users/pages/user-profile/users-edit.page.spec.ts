import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { vi } from 'vitest';

import {
  UserProfileFacade,
  type UpdateUserPersonalDataCommand,
  type UserPersonalDataDto,
} from '../../state/user-profile.facade';
import { UsersEditPage } from './users-edit.page';

const personalData: UserPersonalDataDto = {
  userId: 7,
  username: 'ana',
  employeeCode: 'EMP-7',
  firstName: 'Ana',
  lastName: 'Lopez',
  corporateEmail: 'ana.lopez@company.local',
  phone: '+34 600 000 000',
  identityDocument: 'DNI-7',
  birthDate: '1990-01-01',
  address: 'Calle Mayor 1',
  city: 'Madrid',
  stateProvince: 'Madrid',
  postalCode: '28001',
  country: 'Espana',
  jobTitle: 'Analista',
  department: 'Sistemas',
  hireDate: '2024-01-01',
  status: 'ACTIVE' as const,
  contractType: 'FULL_TIME' as const,
  internalNotes: 'Notas',
};

function createFacadeStub() {
  const profile = signal<UserPersonalDataDto | null>(null);
  const loading = signal(false);
  const saving = signal(false);
  const loadError = signal<string | null>(null);
  const saveError = signal<string | null>(null);
  const saveSuccess = signal(false);

  return {
    profile,
    loading,
    saving,
    loadError,
    saveError,
    saveSuccess,
    loadProfile: vi.fn(() => profile.set(personalData)),
    reloadProfile: vi.fn(() => profile.set(personalData)),
    updateProfile: vi.fn((_: number, command: UpdateUserPersonalDataCommand) => {
      profile.set({ ...personalData, ...command });
      saveSuccess.set(true);
    }),
    clearSaveState: vi.fn(() => {
      saveError.set(null);
      saveSuccess.set(false);
    }),
    setLoadError: vi.fn((message: string) => {
      profile.set(null);
      loading.set(false);
      loadError.set(message);
    }),
    setSaveError: vi.fn((message: string) => {
      saving.set(false);
      saveError.set(message);
      saveSuccess.set(false);
    }),
  };
}

describe('UsersEditPage', () => {
  let fixture: ComponentFixture<UsersEditPage>;
  let facade: ReturnType<typeof createFacadeStub>;

  beforeEach(() => {
    facade = createFacadeStub();

    TestBed.configureTestingModule({
      providers: [
        { provide: UserProfileFacade, useValue: facade },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({}) },
            parent: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } },
          },
        },
      ],
    });

    TestBed.overrideComponent(UsersEditPage, {
      set: { template: '' },
    });

    fixture = TestBed.createComponent(UsersEditPage);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads personal data from the selected route user and patches the form', () => {
    expect(facade.loadProfile).toHaveBeenCalledWith(7);
    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.componentInstance.personalDataForm.getRawValue()).toEqual({
      firstName: 'Ana',
      lastName: 'Lopez',
      corporateEmail: 'ana.lopez@company.local',
      phone: '+34 600 000 000',
      address: 'Calle Mayor 1',
      city: 'Madrid',
      stateProvince: 'Madrid',
      postalCode: '28001',
      country: 'Espana',
    });
  });

  it('saves editable personal data while preserving administrative fields', () => {
    fixture.componentInstance.personalDataForm.patchValue({
      firstName: 'Ana Maria',
      phone: '+34 611 111 111',
    });

    fixture.componentInstance.savePersonalData();

    expect(facade.updateProfile).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        employeeCode: 'EMP-7',
        firstName: 'Ana Maria',
        phone: '+34 611 111 111',
        identityDocument: 'DNI-7',
        hireDate: '2024-01-01',
        status: 'ACTIVE',
        contractType: 'FULL_TIME',
        internalNotes: 'Notas',
      }),
    );
    expect(fixture.componentInstance.saveSuccess()).toBe(true);
  });

  it('does not save invalid forms', () => {
    fixture.componentInstance.personalDataForm.patchValue({ corporateEmail: 'invalid' });

    fixture.componentInstance.savePersonalData();

    expect(facade.updateProfile).not.toHaveBeenCalled();
    expect(fixture.componentInstance.submitted).toBe(true);
  });

  it('shows a save error and re-enables the form when update fails', () => {
    facade.updateProfile.mockImplementationOnce(() => {
      facade.saving.set(false);
      facade.saveError.set('No se pudieron guardar los datos personales del usuario.');
    });

    fixture.componentInstance.savePersonalData();

    expect(fixture.componentInstance.saveError()).toBe(
      'No se pudieron guardar los datos personales del usuario.',
    );
    expect(fixture.componentInstance.saving()).toBe(false);
    expect(fixture.componentInstance.personalDataForm.enabled).toBe(true);
  });
});
