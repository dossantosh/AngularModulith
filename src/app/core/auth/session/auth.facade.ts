import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay, switchMap, tap } from 'rxjs';

import { AuthApi } from '../api/auth.api';
import { CapabilityAction, can, hasAllScopes, hasAnyScope, hasScope } from '../permissions/permissions';
import { AuthSessionStore } from './auth-session.store';
import { AuthenticatedUser, BackendDataSource } from './session.model';

export interface LoginCommand {
  username: string;
  password: string;
  dataSource: BackendDataSource;
}

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly api = inject(AuthApi);
  private readonly sessionStore = inject(AuthSessionStore);

  private sessionOnce$?: Observable<AuthenticatedUser>;

  readonly username = this.sessionStore.username;
  readonly dataSource = this.sessionStore.dataSource;
  readonly scopes = this.sessionStore.scopes;
  readonly capabilities = this.sessionStore.capabilities;

  hasScope(scope: string): boolean {
    return hasScope(this.scopes(), scope);
  }

  hasAnyScope(scopes: readonly string[]): boolean {
    return hasAnyScope(this.scopes(), scopes);
  }

  hasAllScopes(scopes: readonly string[]): boolean {
    return hasAllScopes(this.scopes(), scopes);
  }

  can(resource: string, action: CapabilityAction): boolean {
    return can(this.capabilities(), resource, action);
  }

  loadSession(): Observable<AuthenticatedUser> {
    this.sessionOnce$ ??= this.api.me().pipe(
      tap((response) => {
        this.sessionStore.setDataSource(response.dataSource ?? 'prod');
        this.sessionStore.setScopes(response.scopes ?? []);
        this.sessionStore.setCapabilities(response.capabilities);
      }),
      map((response) => ({
        username: response.username,
      })),
      tap((user) => this.sessionStore.setAuthenticatedUser(user)),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    return this.sessionOnce$;
  }

  login(command: LoginCommand) {
    return this.api.login(command).pipe(
      tap(() => this.resetSessionCache()),
      switchMap(() => this.loadSession()),
      map((user) => user.username)
    );
  }

  logout() {
    return this.api.logout().pipe(
      tap(() => {
        this.sessionStore.clear();
        this.resetSessionCache();
      })
    );
  }

  private resetSessionCache(): void {
    this.sessionOnce$ = undefined;
  }
}
