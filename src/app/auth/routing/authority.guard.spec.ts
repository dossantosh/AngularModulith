import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, from, isObservable, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AUTHORITY } from '../domain/authority';
import { AuthFacade } from '../application/auth.facade';
import { authorityGuard } from './authority.guard';

describe('authorityGuard', () => {
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
            hasAnyAuthority: vi.fn(),
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

  async function runGuard(required: string[]) {
    const result = TestBed.runInInjectionContext(() => authorityGuard(...required)(route, state));
    return isObservable(result) ? firstValueFrom(result) : from(Promise.resolve(result));
  }

  it('should allow navigation when the user has the required authority', async () => {
    const auth = TestBed.inject(AuthFacade) as unknown as {
      loadSession: ReturnType<typeof vi.fn>;
      hasAnyAuthority: ReturnType<typeof vi.fn>;
    };

    auth.loadSession.mockReturnValue(of({ username: 'john' }));
    auth.hasAnyAuthority.mockReturnValue(true);

    await expect(runGuard([AUTHORITY.moduleUsers])).resolves.toBe(true);
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to forbidden when the user lacks the required authority', async () => {
    const auth = TestBed.inject(AuthFacade) as unknown as {
      loadSession: ReturnType<typeof vi.fn>;
      hasAnyAuthority: ReturnType<typeof vi.fn>;
    };
    const forbiddenTree = { redirected: true } as unknown as UrlTree;

    createUrlTree.mockReturnValue(forbiddenTree);
    auth.loadSession.mockReturnValue(of({ username: 'john' }));
    auth.hasAnyAuthority.mockReturnValue(false);

    await expect(runGuard([AUTHORITY.moduleUsers])).resolves.toBe(forbiddenTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/forbidden']);
  });

  it('should redirect to login when the session cannot be loaded', async () => {
    const auth = TestBed.inject(AuthFacade) as unknown as {
      loadSession: ReturnType<typeof vi.fn>;
      hasAnyAuthority: ReturnType<typeof vi.fn>;
    };
    const loginTree = { redirected: true } as unknown as UrlTree;

    createUrlTree.mockReturnValue(loginTree);
    auth.loadSession.mockReturnValue(throwError(() => new Error('unauthorized')));

    await expect(runGuard([AUTHORITY.moduleUsers])).resolves.toBe(loginTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
