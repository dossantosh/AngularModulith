import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AuthControllerService } from '../../../generated/openapi';
import { AuthApi } from './auth.api';

describe('AuthApi', () => {
  let api: AuthApi;
  let authClient: {
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    me: ReturnType<typeof vi.fn>;
    csrf: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authClient = {
      login: vi.fn(() => of({ username: 'john' })),
      logout: vi.fn(() => of(null)),
      me: vi.fn(() =>
        of({
          username: 'john',
          dataSource: 'prod',
          scopes: ['systems:read'],
          navigation: [],
        }),
      ),
      csrf: vi.fn(() => of({ token: 'csrf-token' })),
    };

    TestBed.configureTestingModule({
      providers: [AuthApi, { provide: AuthControllerService, useValue: authClient }],
    });

    api = TestBed.inject(AuthApi);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('delegates auth calls to the generated auth controller', async () => {
    await firstValueFrom(api.login({ username: 'john', password: 'pw', dataSource: 'prod' }));
    await firstValueFrom(api.logout());
    await firstValueFrom(api.me());

    expect(authClient.login).toHaveBeenCalledWith({
      username: 'john',
      password: 'pw',
      dataSource: 'prod',
    });
    expect(authClient.logout).toHaveBeenCalledWith();
    expect(authClient.me).toHaveBeenCalled();
  });

  it('initCsrf() swallows errors and completes', async () => {
    authClient.csrf.mockReturnValueOnce(throwError(() => new Error('csrf unavailable')));

    await expect(firstValueFrom(api.initCsrf())).resolves.toBeUndefined();
    expect(authClient.csrf).toHaveBeenCalledWith();
  });
});
