import { Injectable, computed, signal } from '@angular/core';

import { AuthenticatedUser } from '../domain/authenticated-user';
import { Authority } from '../domain/authority';

@Injectable({ providedIn: 'root' })
export class AuthSessionStore {
  private readonly _username = signal<string | null>(null);
  private readonly _authorities = signal<Authority[]>([]);
  private readonly _view = signal<AuthenticatedUser['view']>('prod');

  readonly username = this._username.asReadonly();
  readonly authorities = this._authorities.asReadonly();
  readonly view = this._view.asReadonly();
  readonly isLoggedIn = computed(() => this._username() !== null);

  setSession(session: AuthenticatedUser): void {
    this._username.set(session.username);
    this._authorities.set(session.authorities);
    this._view.set(session.view);
  }

  clear(): void {
    this._username.set(null);
    this._authorities.set([]);
    this._view.set('prod');
  }

  hasAuthority(authority: Authority): boolean {
    return this._authorities().includes(authority);
  }

  hasAnyAuthority(...authorities: Authority[]): boolean {
    const current = this._authorities();
    return authorities.some((authority) => current.includes(authority));
  }
}
