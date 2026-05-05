import { Injectable, signal } from '@angular/core';

import { AuthCapabilities, EMPTY_AUTH_CAPABILITIES } from '../permissions/permissions';
import { AuthenticatedUser, AuthNavigationModule, BackendDataSource } from './session.model';

@Injectable({ providedIn: 'root' })
export class AuthSessionStore {
  private readonly _username = signal<string | null>(null);
  private readonly _dataSource = signal<BackendDataSource>('prod');
  private readonly _scopes = signal<readonly string[]>([]);
  private readonly _capabilities = signal<AuthCapabilities>(EMPTY_AUTH_CAPABILITIES);
  private readonly _navigation = signal<readonly AuthNavigationModule[]>([]);

  readonly username = this._username.asReadonly();
  readonly dataSource = this._dataSource.asReadonly();
  readonly scopes = this._scopes.asReadonly();
  readonly capabilities = this._capabilities.asReadonly();
  readonly navigation = this._navigation.asReadonly();

  setAuthenticatedUser(user: AuthenticatedUser): void {
    this._username.set(user.username);
  }

  setDataSource(dataSource: BackendDataSource): void {
    this._dataSource.set(dataSource);
  }

  setCapabilities(capabilities: AuthCapabilities): void {
    this._capabilities.set(capabilities);
  }

  setScopes(scopes: readonly string[]): void {
    this._scopes.set([...scopes]);
  }

  setNavigation(navigation: readonly AuthNavigationModule[]): void {
    this._navigation.set(navigation.map(copyNavigationModule));
  }

  clear(): void {
    this._username.set(null);
    this._dataSource.set('prod');
    this._scopes.set([]);
    this._capabilities.set(EMPTY_AUTH_CAPABILITIES);
    this._navigation.set([]);
  }
}

function copyNavigationModule(module: AuthNavigationModule): AuthNavigationModule {
  return {
    ...module,
    items: module.items.map((item) => ({ ...item })),
  };
}
