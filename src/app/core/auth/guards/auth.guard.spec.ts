import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, from, isObservable, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AuthFacade } from '../session/auth.facade';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
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
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    return isObservable(result) ? firstValueFrom(result) : from(Promise.resolve(result));
  }

  it('should allow navigation when the session loads', async () => {
    const auth = TestBed.inject(AuthFacade) as unknown as { loadSession: ReturnType<typeof vi.fn> };
    auth.loadSession.mockReturnValue(of({ username: 'john' }));

    await expect(runGuard()).resolves.toBe(true);
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to login when the session fails to load', async () => {
    const auth = TestBed.inject(AuthFacade) as unknown as { loadSession: ReturnType<typeof vi.fn> };
    const redirectTree = { redirected: true } as unknown as UrlTree;

    createUrlTree.mockReturnValue(redirectTree);
    auth.loadSession.mockReturnValue(throwError(() => new Error('unauthorized')));

    await expect(runGuard()).resolves.toBe(redirectTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
