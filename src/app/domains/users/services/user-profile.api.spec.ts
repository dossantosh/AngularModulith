import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { vi } from 'vitest';

import { UserControllerService } from '../../../generated/openapi';
import { UserProfileApi } from './user-profile.api';

function setup(client: unknown) {
  TestBed.configureTestingModule({
    providers: [UserProfileApi, { provide: UserControllerService, useValue: client }],
  });

  return TestBed.inject(UserProfileApi);
}

describe('UserProfileApi', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads personal data for the edit form', async () => {
    const client = {
      getUserPersonalData: vi.fn(() =>
        of({
          userId: 7,
          username: 'ana',
          firstName: 'Ana',
          status: 'ACTIVE',
        }),
      ),
    };
    const api = setup(client);

    await expect(firstValueFrom(api.getUserPersonalData(7))).resolves.toEqual(
      expect.objectContaining({
        userId: 7,
        username: 'ana',
        firstName: 'Ana',
        status: 'ACTIVE',
      }),
    );
  });

  it('updates personal data with trimmed optional values', async () => {
    const client = {
      updateUserPersonalData: vi.fn(() =>
        of({
          userId: 7,
          username: 'ana',
          firstName: 'Ana',
          status: 'ACTIVE',
        }),
      ),
    };
    const api = setup(client);

    await firstValueFrom(
      api.updateUserPersonalData(7, {
        employeeCode: ' EMP-7 ',
        firstName: ' Ana ',
        lastName: '',
        corporateEmail: ' ana.lopez@company.local ',
        phone: '',
        identityDocument: '',
        birthDate: '',
        address: '',
        city: '',
        stateProvince: '',
        postalCode: '',
        country: '',
        jobTitle: '',
        department: '',
        hireDate: '',
        status: 'ACTIVE',
        contractType: null,
        internalNotes: '',
      }),
    );

    expect(client.updateUserPersonalData).toHaveBeenCalledWith(7, {
      employeeCode: 'EMP-7',
      firstName: 'Ana',
      lastName: undefined,
      corporateEmail: 'ana.lopez@company.local',
      phone: undefined,
      identityDocument: undefined,
      birthDate: undefined,
      address: undefined,
      city: undefined,
      stateProvince: undefined,
      postalCode: undefined,
      country: undefined,
      jobTitle: undefined,
      department: undefined,
      hireDate: undefined,
      status: 'ACTIVE',
      contractType: undefined,
      internalNotes: undefined,
    });
  });
});
