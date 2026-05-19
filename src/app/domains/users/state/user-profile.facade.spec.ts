import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import {
  UserProfileApi,
  type UpdateUserPersonalDataCommand,
  type UserPersonalDataDto,
} from '../api/user-profile.api';
import { UserProfileFacade } from './user-profile.facade';

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
  status: 'ACTIVE',
  contractType: 'FULL_TIME',
  internalNotes: 'Notas',
};

const updateCommand: UpdateUserPersonalDataCommand = {
  employeeCode: 'EMP-7',
  firstName: 'Ana Maria',
  lastName: 'Lopez',
  corporateEmail: 'ana.maria@company.local',
  phone: '+34 611 111 111',
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
  status: 'ACTIVE',
  contractType: 'FULL_TIME',
  internalNotes: 'Notas',
};

function setup(api: Pick<UserProfileApi, 'getUserPersonalData' | 'updateUserPersonalData'>) {
  TestBed.configureTestingModule({
    providers: [UserProfileFacade, { provide: UserProfileApi, useValue: api }],
  });

  return TestBed.inject(UserProfileFacade);
}

describe('UserProfileFacade', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loadProfile() exposes loading state and stores the loaded profile', () => {
    const subject = new Subject<UserPersonalDataDto>();
    const api = {
      getUserPersonalData: vi.fn(() => subject.asObservable()),
      updateUserPersonalData: vi.fn(),
    };
    const facade = setup(api);

    facade.loadProfile(7);

    expect(facade.loading()).toBe(true);
    expect(facade.loadError()).toBeNull();

    subject.next(personalData);
    subject.complete();

    expect(facade.loading()).toBe(false);
    expect(facade.profile()).toEqual(personalData);
    expect(facade.displayName()).toBe('Ana Lopez');
  });

  it('loadProfile() reuses the current profile for the same user', () => {
    const api = {
      getUserPersonalData: vi.fn(() => of(personalData)),
      updateUserPersonalData: vi.fn(),
    };
    const facade = setup(api);

    facade.loadProfile(7);
    facade.loadProfile(7);

    expect(api.getUserPersonalData).toHaveBeenCalledOnce();
  });

  it('reloadProfile() forces a new request for the same user', () => {
    const api = {
      getUserPersonalData: vi.fn(() => of(personalData)),
      updateUserPersonalData: vi.fn(),
    };
    const facade = setup(api);

    facade.loadProfile(7);
    facade.reloadProfile(7);

    expect(api.getUserPersonalData).toHaveBeenCalledTimes(2);
  });

  it('updateProfile() stores the updated profile and save success state', () => {
    const updatedProfile = { ...personalData, firstName: 'Ana Maria' };
    const api = {
      getUserPersonalData: vi.fn(() => of(personalData)),
      updateUserPersonalData: vi.fn(() => of(updatedProfile)),
    };
    const facade = setup(api);

    facade.updateProfile(7, updateCommand);

    expect(api.updateUserPersonalData).toHaveBeenCalledWith(7, updateCommand);
    expect(facade.saving()).toBe(false);
    expect(facade.saveSuccess()).toBe(true);
    expect(facade.profile()).toEqual(updatedProfile);
  });

  it('sets the expected error states when requests fail', () => {
    const api = {
      getUserPersonalData: vi.fn(() => throwError(() => new Error('load failed'))),
      updateUserPersonalData: vi.fn(() => throwError(() => new Error('save failed'))),
    };
    const facade = setup(api);

    facade.loadProfile(7);
    facade.updateProfile(7, updateCommand);

    expect(facade.loadError()).toBe('No se pudieron cargar los datos personales del usuario.');
    expect(facade.saveError()).toBe('No se pudieron guardar los datos personales del usuario.');
    expect(facade.loading()).toBe(false);
    expect(facade.saving()).toBe(false);
  });
});
