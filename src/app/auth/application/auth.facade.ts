import { Injectable, inject } from '@angular/core';

import {
  canAccessPerfumes,
  canAccessUsers,
  can,
  canReadUsers,
  canWriteUsers,
  hasAllScopes,
  hasAnyScope,
  hasScope,
} from '../domain/access.policy';
import { AuthSessionStore } from '../state/auth-session.store';
import { LoadSessionUseCase } from './load-session.use-case';
import { LoginCommand } from './login.command';
import { LoginUseCase } from './login.use-case';
import { LogoutUseCase } from './logout.use-case';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly sessionStore = inject(AuthSessionStore);
  private readonly loadSessionUseCase = inject(LoadSessionUseCase);
  private readonly loginUseCase = inject(LoginUseCase);
  private readonly logoutUseCase = inject(LogoutUseCase);

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

  can(resource: string, action: 'access' | 'read' | 'write' | 'create' | 'update' | 'delete'): boolean {
    return can(this.capabilities(), resource, action);
  }

  canAccessUsers(): boolean {
    return canAccessUsers(this.capabilities());
  }

  canReadUsers(): boolean {
    return canReadUsers(this.capabilities());
  }

  canWriteUsers(): boolean {
    return canWriteUsers(this.capabilities());
  }

  canAccessPerfumes(): boolean {
    return canAccessPerfumes(this.capabilities());
  }

  loadSession() {
    return this.loadSessionUseCase.execute();
  }

  login(command: LoginCommand) {
    return this.loginUseCase.execute(command);
  }

  logout() {
    return this.logoutUseCase.execute();
  }
}
