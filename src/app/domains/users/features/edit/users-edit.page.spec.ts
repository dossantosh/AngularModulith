import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { UsersFacade } from '../../application/users.facade';
import { UsersEditPage } from './users-edit.page';

function createFacadeStub() {
  return {
    loadUser: vi.fn(() =>
      of({
        id: 7,
        username: 'ana',
        email: 'ana@example.com',
        enabled: true,
        isAdmin: false,
        roles: [{ id: 1, name: 'Reader' }],
      }),
    ),
    updateUser: vi.fn(() =>
      of({
        id: 7,
        username: 'ana',
        email: 'ana@example.com',
        enabled: true,
        isAdmin: false,
        roles: [],
      }),
    ),
  };
}

describe('UsersEditPage', () => {
  let fixture: ComponentFixture<UsersEditPage>;
  let facade: ReturnType<typeof createFacadeStub>;
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    facade = createFacadeStub();
    router = { navigateByUrl: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: UsersFacade, useValue: facade },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '7' })) },
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

  it('loads the selected user from the route id and patches the form', () => {
    expect(facade.loadUser).toHaveBeenCalledWith(7);
    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.componentInstance.userForm.getRawValue()).toEqual({
      username: 'ana',
      email: 'ana@example.com',
      enabled: true,
      isAdmin: false,
    });
    expect(fixture.componentInstance.rolesLabel()).toBe('Reader');
  });

  it('saves valid changes and returns to the search page', () => {
    fixture.componentInstance.userForm.patchValue({
      username: '  ana  ',
      email: 'ana@example.com',
      enabled: false,
      isAdmin: true,
    });

    fixture.componentInstance.saveUser();

    expect(facade.updateUser).toHaveBeenCalledWith(7, {
      username: '  ana  ',
      email: 'ana@example.com',
      enabled: false,
      isAdmin: true,
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/users/search');
  });

  it('does not save invalid forms', () => {
    fixture.componentInstance.userForm.patchValue({ email: 'invalid' });

    fixture.componentInstance.saveUser();

    expect(facade.updateUser).not.toHaveBeenCalled();
    expect(fixture.componentInstance.submitted).toBe(true);
  });

  it('shows a save error and re-enables the form when update fails', () => {
    facade.updateUser.mockReturnValueOnce(throwError(() => new Error('boom')));

    fixture.componentInstance.saveUser();

    expect(fixture.componentInstance.saveError()).toBe(
      'No se pudieron guardar los cambios del usuario.',
    );
    expect(fixture.componentInstance.saving()).toBe(false);
    expect(fixture.componentInstance.userForm.enabled).toBe(true);
  });
});
