import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { vi } from 'vitest';

import { UserControllerService } from '../../../../../generated/openapi';
import { UserRolesApi } from './user-roles.api';

function setup(client: unknown) {
  TestBed.configureTestingModule({
    providers: [UserRolesApi, { provide: UserControllerService, useValue: client }],
  });

  return TestBed.inject(UserRolesApi);
}

describe('UserRolesApi', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads and updates user roles through the generated client', async () => {
    const client = {
      getUserRoles: vi.fn(() =>
        of({
          userId: 7,
          username: 'ana',
          roles: [{ id: 1, name: 'SYSTEMS' }],
          availableRoles: [
            { id: 1, name: 'SYSTEMS' },
            { id: 2, name: 'PERFUMES' },
          ],
        }),
      ),
      updateUserRoles: vi.fn(() =>
        of({
          userId: 7,
          username: 'ana',
          roles: [{ id: 2, name: 'PERFUMES' }],
          availableRoles: [{ id: 2, name: 'PERFUMES' }],
        }),
      ),
    };
    const api = setup(client);

    await expect(firstValueFrom(api.getUserRoles(7))).resolves.toEqual({
      userId: 7,
      username: 'ana',
      roles: [{ id: 1, name: 'SYSTEMS' }],
      availableRoles: [
        { id: 1, name: 'SYSTEMS' },
        { id: 2, name: 'PERFUMES' },
      ],
    });
    await firstValueFrom(api.updateUserRoles(7, [2]));

    expect(client.updateUserRoles).toHaveBeenCalledWith(7, { roleIds: [2] });
  });
});
