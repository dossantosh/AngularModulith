import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { vi } from 'vitest';

import { authInterceptor } from '../../../core/auth/http/auth.interceptor';
import { provideNgOpenapi } from '../../../generated/openapi/providers';
import { UserControllerService } from '../../../generated/openapi/services/userController.service';
import { UsersApi } from './users.api';

function setup(client: { getUsers: (...args: unknown[]) => unknown }) {
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
        })
      ),
    };
    const api = setup(client);

    await firstValueFrom(
      api.search({
        limit: 10,
        direction: 'NEXT',
        lastId: 99,
        filters: { id: 1, username: '  john  ', email: '  a@b.com  ' },
      })
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
      })
    );

    expect(client.getUsers).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
      undefined,
      10,
      'NEXT'
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
        })
      ),
    };
    const api = setup(client);

    const page = await firstValueFrom(
      api.search({
        limit: 10,
        direction: 'NEXT',
        lastId: null,
        filters: { id: null, username: '', email: '' },
      })
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
      })
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
      })
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
});
