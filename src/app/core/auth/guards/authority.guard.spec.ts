import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, from, isObservable, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../auth.service';
import { authorityGuard } from './authority.guard';

function toObservable<T>(value: T | Promise<T> | import('rxjs').Observable<T>) {
  if (isObservable(value)) return value;
  if (value instanceof Promise) return from(value);
  return of(value);
}

describe('authorityGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/users' } as RouterStateSnapshot;

  it('returns true when user has any required authority', async () => {
    const routerStub = { createUrlTree: vi.fn(() => ({}) as UrlTree) };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            me: () => of({ username: 'u', authorities: ['MODULE_USERS'] }),
            hasAnyAuthority: (a: string) => a === 'MODULE_USERS',
          },
        },
        { provide: Router, useValue: routerStub },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      authorityGuard('MODULE_USERS')(route, state),
    );

    const v = await firstValueFrom(toObservable(result));
    expect(v).toBe(true);
    expect(routerStub.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirects to /forbidden when missing authority', async () => {
    const forbiddenTree = { forbidden: true } as unknown as UrlTree;
    const routerStub = { createUrlTree: vi.fn(() => forbiddenTree) };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            me: () => of({ username: 'u', authorities: [] }),
            hasAnyAuthority: () => false,
          },
        },
        { provide: Router, useValue: routerStub },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      authorityGuard('MODULE_USERS')(route, state),
    );

    const v = await firstValueFrom(toObservable(result));
    expect(v).toBe(forbiddenTree);
    expect(routerStub.createUrlTree).toHaveBeenCalledWith(['/forbidden']);
  });

  it('redirects to /login when me() errors', async () => {
    const loginTree = { login: true } as unknown as UrlTree;
    const routerStub = { createUrlTree: vi.fn(() => loginTree) };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            me: () => throwError(() => new Error('401')),
            hasAnyAuthority: () => false,
          },
        },
        { provide: Router, useValue: routerStub },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      authorityGuard('MODULE_USERS')(route, state),
    );

    const v = await firstValueFrom(toObservable(result));
    expect(v).toBe(loginTree);
    expect(routerStub.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
