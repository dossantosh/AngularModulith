import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, from, isObservable, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AuthFacade } from '../application/auth.facade';
import { AUTH_SCOPES } from '../domain/auth-scopes';
import { scopeGuard } from './scope.guard';

describe('scopeGuard', () => {
  const state = {} as RouterStateSnapshot;
  const createUrlTree = vi.fn(() => ({ redirected: true }) as unknown as UrlTree);

  beforeEach(() => {
    createUrlTree.mockReset();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthFacade,
          useValue: {
            loadSession: vi.fn(),
            hasAllScopes: vi.fn(),
          },
        },
        {
          provide: Router,
          useValue: {
            createUrlTree,
          },
        },
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  async function runGuard(route: ActivatedRouteSnapshot) {
    const result = TestBed.runInInjectionContext(() => scopeGuard(route, state));
    return isObservable(result) ? firstValueFrom(result) : from(Promise.resolve(result));
  }

  it('allows navigation when the user has every required scope', async () => {
    const auth = TestBed.inject(AuthFacade) as unknown as {
      loadSession: ReturnType<typeof vi.fn>;
      hasAllScopes: ReturnType<typeof vi.fn>;
    };
    const route = {
      data: { requiredScopes: [AUTH_SCOPES.users.read] },
    } as unknown as ActivatedRouteSnapshot;

    auth.loadSession.mockReturnValue(of({ username: 'john' }));
    auth.hasAllScopes.mockReturnValue(true);

    await expect(runGuard(route)).resolves.toBe(true);
    expect(auth.hasAllScopes).toHaveBeenCalledWith([AUTH_SCOPES.users.read]);
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('allows navigation when the route has no explicit scopes', async () => {
    const auth = TestBed.inject(AuthFacade) as unknown as {
      loadSession: ReturnType<typeof vi.fn>;
      hasAllScopes: ReturnType<typeof vi.fn>;
    };
    const route = { data: {} } as ActivatedRouteSnapshot;

    auth.loadSession.mockReturnValue(of({ username: 'john' }));

    await expect(runGuard(route)).resolves.toBe(true);
    expect(auth.hasAllScopes).not.toHaveBeenCalled();
  });

  it('redirects to forbidden when a required scope is missing', async () => {
    const auth = TestBed.inject(AuthFacade) as unknown as {
      loadSession: ReturnType<typeof vi.fn>;
      hasAllScopes: ReturnType<typeof vi.fn>;
    };
    const forbiddenTree = { redirected: true } as unknown as UrlTree;
    const route = {
      data: { requiredScopes: [AUTH_SCOPES.users.read] },
    } as unknown as ActivatedRouteSnapshot;

    createUrlTree.mockReturnValue(forbiddenTree);
    auth.loadSession.mockReturnValue(of({ username: 'john' }));
    auth.hasAllScopes.mockReturnValue(false);

    await expect(runGuard(route)).resolves.toBe(forbiddenTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/forbidden']);
  });

  it('redirects to login when the session cannot be loaded', async () => {
    const auth = TestBed.inject(AuthFacade) as unknown as {
      loadSession: ReturnType<typeof vi.fn>;
      hasAllScopes: ReturnType<typeof vi.fn>;
    };
    const loginTree = { redirected: true } as unknown as UrlTree;
    const route = {
      data: { requiredScopes: [AUTH_SCOPES.users.read] },
    } as unknown as ActivatedRouteSnapshot;

    createUrlTree.mockReturnValue(loginTree);
    auth.loadSession.mockReturnValue(throwError(() => new Error('unauthorized')));

    await expect(runGuard(route)).resolves.toBe(loginTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
