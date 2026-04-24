import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, from, isObservable, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AuthFacade } from '../application/auth.facade';
import { canAccessUsersGuard } from './users-access.guard';

describe('canAccessUsersGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  const createUrlTree = vi.fn(() => ({ redirected: true } as unknown as UrlTree));

  beforeEach(() => {
    createUrlTree.mockReset();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthFacade,
          useValue: {
            loadSession: vi.fn(),
            canAccessUsers: vi.fn(),
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

  async function runGuard() {
    const result = TestBed.runInInjectionContext(() => canAccessUsersGuard(route, state));
    return isObservable(result) ? firstValueFrom(result) : from(Promise.resolve(result));
  }

  it('should allow navigation when the user can access users', async () => {
    const auth = TestBed.inject(AuthFacade) as unknown as {
      loadSession: ReturnType<typeof vi.fn>;
      canAccessUsers: ReturnType<typeof vi.fn>;
    };

    auth.loadSession.mockReturnValue(of({ username: 'john' }));
    auth.canAccessUsers.mockReturnValue(true);

    await expect(runGuard()).resolves.toBe(true);
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to forbidden when the user cannot access users', async () => {
    const auth = TestBed.inject(AuthFacade) as unknown as {
      loadSession: ReturnType<typeof vi.fn>;
      canAccessUsers: ReturnType<typeof vi.fn>;
    };
    const forbiddenTree = { redirected: true } as unknown as UrlTree;

    createUrlTree.mockReturnValue(forbiddenTree);
    auth.loadSession.mockReturnValue(of({ username: 'john' }));
    auth.canAccessUsers.mockReturnValue(false);

    await expect(runGuard()).resolves.toBe(forbiddenTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/forbidden']);
  });

  it('should redirect to login when the session cannot be loaded', async () => {
    const auth = TestBed.inject(AuthFacade) as unknown as {
      loadSession: ReturnType<typeof vi.fn>;
      canAccessUsers: ReturnType<typeof vi.fn>;
    };
    const loginTree = { redirected: true } as unknown as UrlTree;

    createUrlTree.mockReturnValue(loginTree);
    auth.loadSession.mockReturnValue(throwError(() => new Error('unauthorized')));

    await expect(runGuard()).resolves.toBe(loginTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
