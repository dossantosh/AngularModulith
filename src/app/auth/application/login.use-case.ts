import { Injectable, inject } from '@angular/core';
import { map, tap } from 'rxjs';

import { AuthApi } from '../data-access/auth.api';
import { LoginRequest } from '../domain/login-request';
import { AuthSessionStore } from '../state/auth-session.store';
import { LoadSessionUseCase } from './load-session.use-case';

@Injectable({ providedIn: 'root' })
export class LoginUseCase {
  private readonly api = inject(AuthApi);
  private readonly sessionStore = inject(AuthSessionStore);
  private readonly loadSessionUseCase = inject(LoadSessionUseCase);

  execute(command: LoginRequest) {
    return this.api.login(command).pipe(
      tap((response) => {
        this.sessionStore.setSession({
          username: response.username,
          authorities: [],
          view: command.view,
        });
        this.loadSessionUseCase.resetCache();
      }),
      map((response) => response.username)
    );
  }
}
