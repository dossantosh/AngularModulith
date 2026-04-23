import { Injectable, signal } from '@angular/core';

import { AuthenticatedUser } from '../domain/authenticated-user';
import { Authority } from '../domain/authority';
import { BackendDataSource } from '../domain/backend-data-source';

@Injectable({ providedIn: 'root' })
export class AuthSessionStore {
  private readonly _username = signal<string | null>(null);
  private readonly _authorities = signal<Authority[]>([]);
  private readonly _dataSource = signal<BackendDataSource>('prod');

  readonly username = this._username.asReadonly();
  readonly authorities = this._authorities.asReadonly();
  readonly dataSource = this._dataSource.asReadonly();

  setAuthenticatedUser(user: AuthenticatedUser): void {
    this._username.set(user.username);
    this._authorities.set(user.authorities);
  }

  setDataSource(dataSource: BackendDataSource): void {
    this._dataSource.set(dataSource);
  }

  clear(): void {
    this._username.set(null);
    this._authorities.set([]);
    this._dataSource.set('prod');
  }

  hasAuthority(authority: Authority): boolean {
    return this._authorities().includes(authority);
  }

  hasAnyAuthority(...authorities: Authority[]): boolean {
    const current = this._authorities();
    return authorities.some((authority) => current.includes(authority));
  }
}
