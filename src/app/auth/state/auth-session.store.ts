import { Injectable, signal } from '@angular/core';

import { AuthenticatedUser } from '../domain/authenticated-user';
import { AuthCapabilities, EMPTY_AUTH_CAPABILITIES } from '../domain/auth-capabilities';
import { BackendDataSource } from '../domain/backend-data-source';

@Injectable({ providedIn: 'root' })
export class AuthSessionStore {
  private readonly _userId = signal<number | null>(null);
  private readonly _username = signal<string | null>(null);
  private readonly _dataSource = signal<BackendDataSource>('prod');
  private readonly _roles = signal<readonly string[]>([]);
  private readonly _scopes = signal<readonly string[]>([]);
  private readonly _capabilities = signal<AuthCapabilities>(EMPTY_AUTH_CAPABILITIES);

  readonly userId = this._userId.asReadonly();
  readonly username = this._username.asReadonly();
  readonly dataSource = this._dataSource.asReadonly();
  readonly roles = this._roles.asReadonly();
  readonly scopes = this._scopes.asReadonly();
  readonly capabilities = this._capabilities.asReadonly();

  setAuthenticatedUser(user: AuthenticatedUser): void {
    this._userId.set(user.userId ?? null);
    this._username.set(user.username);
  }

  setDataSource(dataSource: BackendDataSource): void {
    this._dataSource.set(dataSource);
  }

  setCapabilities(capabilities: AuthCapabilities): void {
    this._capabilities.set(capabilities);
  }

  setRoles(roles: readonly string[]): void {
    this._roles.set([...roles]);
  }

  setScopes(scopes: readonly string[]): void {
    this._scopes.set([...scopes]);
  }

  clear(): void {
    this._userId.set(null);
    this._username.set(null);
    this._dataSource.set('prod');
    this._roles.set([]);
    this._scopes.set([]);
    this._capabilities.set(EMPTY_AUTH_CAPABILITIES);
  }
}
