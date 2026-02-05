import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, from, isObservable, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../auth.service';
import { authGuard } from './auth.guard';

function toObservable<T>(value: T | Promise<T> | import('rxjs').Observable<T>) {
  if (isObservable(value)) return value;
  if (value instanceof Promise) return from(value);
  return of(value);
}

describe('authGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/users' } as RouterStateSnapshot;

  it('returns true when me() succeeds', async () => {
    const routerStub = { createUrlTree: vi.fn(() => ({}) as UrlTree) };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { me: () => of({ username: 'u', authorities: [] }) } },
        { provide: Router, useValue: routerStub },
      ],
    });

    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    const v = await firstValueFrom(toObservable(result));

    expect(v).toBe(true);
    expect(routerStub.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirects to /login when me() errors', async () => {
    const loginTree = { isLogin: true } as unknown as UrlTree;
    const routerStub = { createUrlTree: vi.fn(() => loginTree) };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { me: () => throwError(() => new Error('401')) } },
        { provide: Router, useValue: routerStub },
      ],
    });

    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    const v = await firstValueFrom(toObservable(result));

    expect(v).toBe(loginTree);
    expect(routerStub.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
