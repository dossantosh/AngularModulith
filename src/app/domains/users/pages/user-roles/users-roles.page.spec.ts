import { ComponentFixture, TestBed } from '@angular/core/testing';
import { type MatCheckboxChange } from '@angular/material/checkbox';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { UserRolesApi, type UserRolesDto } from '../../services/user-roles.api';
import { UsersRolesPage } from './users-roles.page';

const userRoles: UserRolesDto = {
  userId: 7,
  username: 'ana',
  roles: [{ id: 1, name: 'SYSTEMS' }],
  availableRoles: [
    { id: 1, name: 'SYSTEMS' },
    { id: 2, name: 'PERFUMES' },
  ],
};

function setup(
  api: Pick<UserRolesApi, 'getUserRoles' | 'updateUserRoles'>,
): ComponentFixture<UsersRolesPage> {
  TestBed.configureTestingModule({
    providers: [
      { provide: UserRolesApi, useValue: api },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap: convertToParamMap({}) },
          parent: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } },
        },
      },
    ],
  });

  TestBed.overrideComponent(UsersRolesPage, {
    set: { template: '' },
  });

  const fixture = TestBed.createComponent(UsersRolesPage);
  fixture.detectChanges();

  return fixture;
}

function checkboxChange(checked: boolean): MatCheckboxChange {
  return { checked } as MatCheckboxChange;
}

describe('UsersRolesPage', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads roles from the route user and stores selected roles', () => {
    const subject = new Subject<UserRolesDto>();
    const api = {
      getUserRoles: vi.fn(() => subject.asObservable()),
      updateUserRoles: vi.fn(),
    };
    const fixture = setup(api);

    expect(fixture.componentInstance.loading()).toBe(true);
    expect(fixture.componentInstance.loadError()).toBeNull();

    subject.next(userRoles);
    subject.complete();

    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.componentInstance.userRoles()).toEqual(userRoles);
    expect(fixture.componentInstance.selectedRoleIds()).toEqual([1]);
    expect(fixture.componentInstance.availableRoles()).toEqual(userRoles.availableRoles);
  });

  it('reuses current roles for the same user unless reload is requested', () => {
    const api = {
      getUserRoles: vi.fn(() => of(userRoles)),
      updateUserRoles: vi.fn(),
    };
    const fixture = setup(api);

    fixture.componentInstance.ngOnInit();
    expect(api.getUserRoles).toHaveBeenCalledOnce();

    fixture.componentInstance.reload();
    expect(api.getUserRoles).toHaveBeenCalledTimes(2);
  });

  it('toggles role ids without duplicates', () => {
    const api = {
      getUserRoles: vi.fn(() => of(userRoles)),
      updateUserRoles: vi.fn(),
    };
    const fixture = setup(api);

    fixture.componentInstance.toggleRole(2, checkboxChange(true));
    fixture.componentInstance.toggleRole(2, checkboxChange(true));
    fixture.componentInstance.toggleRole(1, checkboxChange(false));

    expect(fixture.componentInstance.selectedRoleIds()).toEqual([2]);
    expect(fixture.componentInstance.isSelected(2)).toBe(true);
    expect(fixture.componentInstance.isSelected(1)).toBe(false);
  });

  it('persists selected roles and stores save success state', () => {
    const updatedRoles = {
      ...userRoles,
      roles: [{ id: 2, name: 'PERFUMES' }],
    };
    const api = {
      getUserRoles: vi.fn(() => of(userRoles)),
      updateUserRoles: vi.fn(() => of(updatedRoles)),
    };
    const fixture = setup(api);

    fixture.componentInstance.toggleRole(2, checkboxChange(true));
    fixture.componentInstance.toggleRole(1, checkboxChange(false));
    fixture.componentInstance.saveRoles();

    expect(api.updateUserRoles).toHaveBeenCalledWith(7, [2]);
    expect(fixture.componentInstance.saving()).toBe(false);
    expect(fixture.componentInstance.saveSuccess()).toBe(true);
    expect(fixture.componentInstance.userRoles()).toEqual(updatedRoles);
  });

  it('validates that at least one role is selected', () => {
    const api = {
      getUserRoles: vi.fn(() => of(userRoles)),
      updateUserRoles: vi.fn(() => of(userRoles)),
    };
    const fixture = setup(api);

    fixture.componentInstance.toggleRole(1, checkboxChange(false));
    fixture.componentInstance.saveRoles();

    expect(api.updateUserRoles).not.toHaveBeenCalled();
    expect(fixture.componentInstance.saveError()).toBe('Selecciona al menos un rol.');
  });

  it('sets the expected error states when requests fail', () => {
    const api = {
      getUserRoles: vi.fn(() => throwError(() => new Error('load failed'))),
      updateUserRoles: vi.fn(() => throwError(() => new Error('save failed'))),
    };
    const fixture = setup(api);

    fixture.componentInstance.toggleRole(1, checkboxChange(true));
    fixture.componentInstance.saveRoles();

    expect(fixture.componentInstance.loadError()).toBe(
      'No se pudieron cargar los roles del usuario.',
    );
    expect(fixture.componentInstance.saveError()).toBe(
      'No se pudieron guardar los roles del usuario.',
    );
    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.componentInstance.saving()).toBe(false);
  });
});
