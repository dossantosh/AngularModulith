import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { vi } from 'vitest';

import { UserProfileFacade } from '../../state/user-profile.facade';
import { UsersManageShellPage } from './users-manage-shell.page';

describe('UsersManageShellPage', () => {
  let fixture: ComponentFixture<UsersManageShellPage>;
  const displayName = signal('Usuario');
  const facade = {
    displayName,
    loadProfile: vi.fn(() => displayName.set('Ana Lopez')),
    setLoadError: vi.fn(),
  };

  beforeEach(() => {
    displayName.set('Usuario');
    facade.loadProfile.mockClear();
    facade.setLoadError.mockClear();

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
    expect(facade.loadProfile).toHaveBeenCalledWith(7);
    expect(fixture.componentInstance.breadcrumbs()).toEqual([
      { label: 'Inicio', routerLink: '/' },
      { label: 'Sistemas' },
      { label: 'Usuarios', routerLink: '/users/search' },
      { label: 'Ana Lopez' },
    ]);
  });
});
