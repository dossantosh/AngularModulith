import { Injectable, inject } from '@angular/core';

import { Authority } from '../domain/authority';
import { LoginRequest } from '../domain/login-request';
import { AuthSessionStore } from '../state/auth-session.store';
import { LoadSessionUseCase } from './load-session.use-case';
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

  hasAuthority(authority: Authority): boolean {
    return this.sessionStore.hasAuthority(authority);
  }

  hasAnyAuthority(...authorities: Authority[]): boolean {
    return this.sessionStore.hasAnyAuthority(...authorities);
  }

  loadSession() {
    return this.loadSessionUseCase.execute();
  }

  login(command: LoginRequest) {
    return this.loginUseCase.execute(command);
  }

  logout() {
    return this.logoutUseCase.execute();
  }
}
