import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { UsersFacade } from '../../application/users.facade';
import { UsersEditPage } from './users-edit.page';

const personalData = {
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
  return {
    loadPersonalData: vi.fn(() => of(personalData)),
    updatePersonalData: vi.fn(() => of(personalData)),
  };
}

describe('UsersEditPage', () => {
  let fixture: ComponentFixture<UsersEditPage>;
  let facade: ReturnType<typeof createFacadeStub>;

  beforeEach(() => {
    facade = createFacadeStub();

    TestBed.configureTestingModule({
      providers: [
        { provide: UsersFacade, useValue: facade },
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
    expect(facade.loadPersonalData).toHaveBeenCalledWith(7);
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

    expect(facade.updatePersonalData).toHaveBeenCalledWith(
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

    expect(facade.updatePersonalData).not.toHaveBeenCalled();
    expect(fixture.componentInstance.submitted).toBe(true);
  });

  it('shows a save error and re-enables the form when update fails', () => {
    facade.updatePersonalData.mockReturnValueOnce(throwError(() => new Error('boom')));

    fixture.componentInstance.savePersonalData();

    expect(fixture.componentInstance.saveError()).toBe(
      'No se pudieron guardar los datos personales del usuario.',
    );
    expect(fixture.componentInstance.saving()).toBe(false);
    expect(fixture.componentInstance.personalDataForm.enabled).toBe(true);
  });
});
