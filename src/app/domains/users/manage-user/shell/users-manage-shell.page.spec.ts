import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { vi } from 'vitest';

import { UserProfileFacade } from '../profile/application/user-profile.facade';
import { UsersManageShellPage } from './users-manage-shell.page';

const personalData = {
  userId: 7,
  username: 'ana',
  employeeCode: 'EMP-7',
  firstName: 'Ana',
  lastName: 'Lopez',
  corporateEmail: 'ana.lopez@company.local',
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
  status: 'ACTIVE' as const,
  contractType: null,
  internalNotes: '',
};

describe('UsersManageShellPage', () => {
  let fixture: ComponentFixture<UsersManageShellPage>;
  const facade = {
    loadPersonalData: vi.fn(() => of(personalData)),
  };

  beforeEach(() => {
    facade.loadPersonalData.mockClear();

    TestBed.configureTestingModule({
      providers: [
        { provide: UserProfileFacade, useValue: facade },
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

    TestBed.overrideComponent(UsersManageShellPage, {
      set: { template: '' },
    });

    fixture = TestBed.createComponent(UsersManageShellPage);
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
