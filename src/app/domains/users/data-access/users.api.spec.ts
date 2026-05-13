import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { vi } from 'vitest';

import { authInterceptor } from '../../../core/auth/http/auth.interceptor';
import { provideNgOpenapi, UserControllerService } from '../../../generated/openapi';
import { UsersApi } from './users.api';

type UsersClientStub = Partial<
  Record<
    | 'getUsers'
    | 'getUserDetails'
    | 'updateUser'
    | 'getUserPersonalData'
    | 'updateUserPersonalData'
    | 'getUserRoles'
    | 'updateUserRoles',
    (...args: unknown[]) => unknown
  >
>;

function setup(client: UsersClientStub) {
  TestBed.configureTestingModule({
    providers: [UsersApi, { provide: UserControllerService, useValue: client }],
  });

  return TestBed.inject(UsersApi);
}

describe('UsersApi', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('delegates to the generated users client and trims username/email', async () => {
    const client = {
      getUsers: vi.fn(() =>
        of({
          content: [],
          hasNext: false,
          hasPrevious: false,
          nextId: null,
          previousId: null,
        }),
      ),
    };
    const api = setup(client);

    await firstValueFrom(
      api.search({
        limit: 10,
        direction: 'NEXT',
        lastId: 99,
        filters: { id: 1, username: '  john  ', email: '  a@b.com  ' },
      }),
    );

    expect(client.getUsers).toHaveBeenCalledOnce();
    expect(client.getUsers).toHaveBeenCalledWith(1, 'john', 'a@b.com', 99, 10, 'NEXT');
  });

  it('omits empty optional params when calling the generated client', async () => {
    const client = {
      getUsers: vi.fn(() => of({ content: [], hasNext: false, hasPrevious: false })),
    };
    const api = setup(client);

    await firstValueFrom(
      api.search({
        limit: 10,
        direction: 'NEXT',
        lastId: null,
        filters: { id: null, username: '   ', email: '' },
      }),
    );

    expect(client.getUsers).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
      undefined,
      10,
      'NEXT',
    );
  });

  it('maps generated user pages to the current UserPageDto contract', async () => {
    const client = {
      getUsers: vi.fn(() =>
        of({
          content: [{ id: 1, username: 'john', email: 'a@b.com', enabled: true, isAdmin: false }],
          hasNext: true,
          hasPrevious: false,
          nextId: 25,
          previousId: null,
        }),
      ),
    };
    const api = setup(client);

    const page = await firstValueFrom(
      api.search({
        limit: 10,
        direction: 'NEXT',
        lastId: null,
        filters: { id: null, username: '', email: '' },
      }),
    );

    expect(page).toEqual({
      content: [{ id: 1, username: 'john', email: 'a@b.com', enabled: true, isAdmin: false }],
      hasNext: true,
      hasPrevious: false,
      nextId: 25,
      previousId: null,
      empty: false,
    });
  });

  it('calculates empty when the generated response does not include it', async () => {
    const client = {
      getUsers: vi.fn(() => of({ content: [], hasNext: false, hasPrevious: false })),
    };
    const api = setup(client);

    const page = await firstValueFrom(
      api.search({
        limit: 10,
        direction: 'NEXT',
        lastId: null,
        filters: { id: null, username: '', email: '' },
      }),
    );

    expect(page.empty).toBe(true);
  });

  it('preserves empty if the backend contract adds it later', async () => {
    const client = {
      getUsers: vi.fn(() => of({ content: [], hasNext: false, hasPrevious: false, empty: false })),
    };
    const api = setup(client);

    const page = await firstValueFrom(
      api.search({
        limit: 10,
        direction: 'NEXT',
        lastId: null,
        filters: { id: null, username: '', email: '' },
      }),
    );

    expect(page.empty).toBe(false);
  });

  it('keeps the generated users URL at /api/users and applies the auth interceptor', () => {
    TestBed.configureTestingModule({
      providers: [
        provideNgOpenapi({ basePath: '' }),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    const client = TestBed.inject(UserControllerService);
    const http = TestBed.inject(HttpTestingController);

    client.getUsers(undefined, undefined, undefined, undefined, 10, 'NEXT').subscribe();

    const request = http.expectOne((req) => req.url === '/api/users');

    expect(request.request.url).toBe('/api/users');
    expect(request.request.url).not.toBe('/api/api/users');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.params.get('limit')).toBe('10');
    expect(request.request.params.get('direction')).toBe('NEXT');

    request.flush({ content: [], hasNext: false, hasPrevious: false });
    http.verify();
  });

  it('loads user details through the generated client', async () => {
    const client = {
      getUserDetails: vi.fn(() =>
        of({
          id: 7,
          username: 'ana',
          email: 'ana@example.com',
          enabled: true,
          isAdmin: false,
          roles: [{ id: 1, name: 'Reader' }],
        }),
      ),
    };
    const api = setup(client);

    const user = await firstValueFrom(api.getById(7));

    expect(client.getUserDetails).toHaveBeenCalledWith(7);
    expect(user).toEqual({
      id: 7,
      username: 'ana',
      email: 'ana@example.com',
      enabled: true,
      isAdmin: false,
      roles: [{ id: 1, name: 'Reader' }],
    });
  });

  it('updates users with trimmed editable values', async () => {
    const client = {
      updateUser: vi.fn(() =>
        of({
          id: 7,
          username: 'ana',
          email: 'ana@example.com',
          enabled: false,
          isAdmin: true,
          roles: [],
        }),
      ),
    };
    const api = setup(client);

    await firstValueFrom(
      api.update(7, {
        username: '  ana  ',
        email: '  ana@example.com  ',
        enabled: false,
        isAdmin: true,
      }),
    );

    expect(client.updateUser).toHaveBeenCalledWith(7, {
      username: 'ana',
      email: 'ana@example.com',
      enabled: false,
      isAdmin: true,
    });
  });

  it('parses generated blob responses for user details endpoints', async () => {
    const client = {
      getUserDetails: vi.fn(() =>
        of(
          new Blob([
            JSON.stringify({
              id: 9,
              username: 'blob-user',
              email: 'blob@example.com',
              enabled: true,
              isAdmin: false,
            }),
          ]),
        ),
      ),
    };
    const api = setup(client);

    await expect(firstValueFrom(api.getById(9))).resolves.toEqual({
      id: 9,
      username: 'blob-user',
      email: 'blob@example.com',
      enabled: true,
      isAdmin: false,
      roles: [],
    });
  });

  it('loads and maps personal data through the generated client', async () => {
    const client = {
      getUserPersonalData: vi.fn(() =>
        of({
          userId: 7,
          username: 'ana',
          employeeCode: 'EMP-7',
          firstName: 'Ana',
          lastName: 'Lopez',
          corporateEmail: 'ana.lopez@company.local',
          status: 'ACTIVE',
          contractType: 'FULL_TIME',
        }),
      ),
    };
    const api = setup(client);

    const data = await firstValueFrom(api.getPersonalData(7));

    expect(client.getUserPersonalData).toHaveBeenCalledWith(7);
    expect(data).toEqual(
      expect.objectContaining({
        userId: 7,
        employeeCode: 'EMP-7',
        firstName: 'Ana',
        status: 'ACTIVE',
        contractType: 'FULL_TIME',
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
      api.updatePersonalData(7, {
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

    await expect(firstValueFrom(api.getRoles(7))).resolves.toEqual({
      userId: 7,
      username: 'ana',
      roles: [{ id: 1, name: 'SYSTEMS' }],
      availableRoles: [
        { id: 1, name: 'SYSTEMS' },
        { id: 2, name: 'PERFUMES' },
      ],
    });
    await firstValueFrom(api.updateRoles(7, [2]));

    expect(client.updateUserRoles).toHaveBeenCalledWith(7, { roleIds: [2] });
  });
});
