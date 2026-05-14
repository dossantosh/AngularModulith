import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { UserRolesApi, type UserRolesDto } from '../data-access/user-roles.api';
import { UserRolesFacade } from './user-roles.facade';

const userRoles: UserRolesDto = {
  userId: 7,
  username: 'ana',
  roles: [{ id: 1, name: 'SYSTEMS' }],
  availableRoles: [
    { id: 1, name: 'SYSTEMS' },
    { id: 2, name: 'PERFUMES' },
  ],
};

function setup(api: Pick<UserRolesApi, 'getUserRoles' | 'updateUserRoles'>) {
  TestBed.configureTestingModule({
    providers: [UserRolesFacade, { provide: UserRolesApi, useValue: api }],
  });

  return TestBed.inject(UserRolesFacade);
}

describe('UserRolesFacade', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loadRoles() exposes loading state and stores selected roles', () => {
    const subject = new Subject<UserRolesDto>();
    const api = {
      getUserRoles: vi.fn(() => subject.asObservable()),
      updateUserRoles: vi.fn(),
    };
    const facade = setup(api);

    facade.loadRoles(7);

    expect(facade.loading()).toBe(true);
    expect(facade.loadError()).toBeNull();

    subject.next(userRoles);
    subject.complete();

    expect(facade.loading()).toBe(false);
    expect(facade.userRoles()).toEqual(userRoles);
    expect(facade.selectedRoleIds()).toEqual([1]);
    expect(facade.availableRoles()).toEqual(userRoles.availableRoles);
  });

  it('loadRoles() reuses the current roles for the same user', () => {
    const api = {
      getUserRoles: vi.fn(() => of(userRoles)),
      updateUserRoles: vi.fn(),
    };
    const facade = setup(api);

    facade.loadRoles(7);
    facade.loadRoles(7);

    expect(api.getUserRoles).toHaveBeenCalledOnce();
  });

  it('reloadRoles() forces a new request for the same user', () => {
    const api = {
      getUserRoles: vi.fn(() => of(userRoles)),
      updateUserRoles: vi.fn(),
    };
    const facade = setup(api);

    facade.loadRoles(7);
    facade.reloadRoles(7);

    expect(api.getUserRoles).toHaveBeenCalledTimes(2);
  });

  it('setRoleSelected() toggles role ids without duplicates', () => {
    const api = {
      getUserRoles: vi.fn(() => of(userRoles)),
      updateUserRoles: vi.fn(),
    };
    const facade = setup(api);

    facade.loadRoles(7);
    facade.setRoleSelected(2, true);
    facade.setRoleSelected(2, true);
    facade.setRoleSelected(1, false);

    expect(facade.selectedRoleIds()).toEqual([2]);
    expect(facade.isSelected(2)).toBe(true);
    expect(facade.isSelected(1)).toBe(false);
  });

  it('saveRoles() persists selected roles and stores save success state', () => {
    const updatedRoles = {
      ...userRoles,
      roles: [{ id: 2, name: 'PERFUMES' }],
    };
    const api = {
      getUserRoles: vi.fn(() => of(userRoles)),
      updateUserRoles: vi.fn(() => of(updatedRoles)),
    };
    const facade = setup(api);

    facade.loadRoles(7);
    facade.setRoleSelected(2, true);
    facade.setRoleSelected(1, false);
    facade.saveRoles(7);

    expect(api.updateUserRoles).toHaveBeenCalledWith(7, [2]);
    expect(facade.saving()).toBe(false);
    expect(facade.saveSuccess()).toBe(true);
    expect(facade.userRoles()).toEqual(updatedRoles);
  });

  it('saveRoles() validates that at least one role is selected', () => {
    const api = {
      getUserRoles: vi.fn(() => of(userRoles)),
      updateUserRoles: vi.fn(() => of(userRoles)),
    };
    const facade = setup(api);

    facade.saveRoles(7);

    expect(api.updateUserRoles).not.toHaveBeenCalled();
    expect(facade.saveError()).toBe('Selecciona al menos un rol.');
  });

  it('sets the expected error states when requests fail', () => {
    const api = {
      getUserRoles: vi.fn(() => throwError(() => new Error('load failed'))),
      updateUserRoles: vi.fn(() => throwError(() => new Error('save failed'))),
    };
    const facade = setup(api);

    facade.loadRoles(7);
    facade.setRoleSelected(1, true);
    facade.saveRoles(7);

    expect(facade.loadError()).toBe('No se pudieron cargar los roles del usuario.');
    expect(facade.saveError()).toBe('No se pudieron guardar los roles del usuario.');
    expect(facade.loading()).toBe(false);
    expect(facade.saving()).toBe(false);
  });
});
