import { Injectable, signal } from '@angular/core';

import { AuthenticatedUser } from '../domain/authenticated-user';
import { AuthCapabilities, EMPTY_AUTH_CAPABILITIES } from '../domain/auth-capabilities';
import { BackendDataSource } from '../domain/backend-data-source';

@Injectable({ providedIn: 'root' })
export class AuthSessionStore {
  private readonly _username = signal<string | null>(null);
  private readonly _dataSource = signal<BackendDataSource>('prod');
  private readonly _capabilities = signal<AuthCapabilities>(EMPTY_AUTH_CAPABILITIES);

  readonly username = this._username.asReadonly();
  readonly dataSource = this._dataSource.asReadonly();
  readonly capabilities = this._capabilities.asReadonly();

  setAuthenticatedUser(user: AuthenticatedUser): void {
    this._username.set(user.username);
  }

  setDataSource(dataSource: BackendDataSource): void {
    this._dataSource.set(dataSource);
  }

  setCapabilities(capabilities: AuthCapabilities): void {
    this._capabilities.set(capabilities);
  }

  clear(): void {
    this._username.set(null);
    this._dataSource.set('prod');
    this._capabilities.set(EMPTY_AUTH_CAPABILITIES);
  }
}
