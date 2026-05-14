import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { vi } from 'vitest';

import { UsersFacade } from '../../application/users.facade';
import { UsersUserShellPage } from './users-user-shell.page';

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

describe('UsersUserShellPage', () => {
  let fixture: ComponentFixture<UsersUserShellPage>;
  const facade = {
    loadPersonalData: vi.fn(() => of(personalData)),
  };

  beforeEach(() => {
    facade.loadPersonalData.mockClear();

    TestBed.configureTestingModule({
      providers: [
        { provide: UsersFacade, useValue: facade },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '7' })),
          },
        },
        {
          provide: Router,
          useValue: {
            url: '/users/7/personal-data',
            events: EMPTY,
          },
        },
      ],
    });

    TestBed.overrideComponent(UsersUserShellPage, {
      set: { template: '' },
    });

    fixture = TestBed.createComponent(UsersUserShellPage);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('uses the user full name in breadcrumbs instead of the technical route id', () => {
    expect(facade.loadPersonalData).toHaveBeenCalledWith(7);
    expect(fixture.componentInstance.breadcrumbs()).toEqual([
      { label: 'Inicio', routerLink: '/' },
      { label: 'Sistemas' },
      { label: 'Usuarios', routerLink: '/users/search' },
      { label: 'Ana Lopez' },
    ]);
  });
});
