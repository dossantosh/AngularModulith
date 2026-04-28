import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay, switchMap, tap } from 'rxjs';

import { AuthApi } from '../data-access/auth.api';
import { CapabilityAction, can, hasAllScopes, hasAnyScope, hasScope } from '../domain/access.policy';
import { AuthenticatedUser } from '../domain/authenticated-user';
import { BackendDataSource } from '../domain/backend-data-source';
import { AuthSessionStore } from '../state/auth-session.store';

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

  readonly userId = this.sessionStore.userId;
  readonly username = this.sessionStore.username;
  readonly dataSource = this.sessionStore.dataSource;
  readonly roles = this.sessionStore.roles;
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
        this.sessionStore.setRoles(response.roles ?? []);
        this.sessionStore.setScopes(response.scopes ?? []);
        this.sessionStore.setCapabilities(response.capabilities);
      }),
      map((response) => ({
        userId: response.userId,
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
