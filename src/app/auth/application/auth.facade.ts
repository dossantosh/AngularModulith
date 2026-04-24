import { Injectable, inject } from '@angular/core';

import {
  canAccessPerfumes,
  canAccessUsers,
  canReadUsers,
  canWriteUsers,
} from '../domain/access.policy';
import { Authority } from '../domain/authority';
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

  readonly username = this.sessionStore.username;
  readonly authorities = this.sessionStore.authorities;
  readonly dataSource = this.sessionStore.dataSource;
  readonly capabilities = this.sessionStore.capabilities;

  hasAuthority(authority: Authority): boolean {
    return this.sessionStore.hasAuthority(authority);
  }

  hasAnyAuthority(...authorities: Authority[]): boolean {
    return this.sessionStore.hasAnyAuthority(...authorities);
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
