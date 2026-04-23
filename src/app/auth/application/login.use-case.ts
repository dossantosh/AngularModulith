import { Injectable, inject } from '@angular/core';
import { map, switchMap, tap } from 'rxjs';

import { AuthApi } from '../data-access/auth.api';
import { LoginRequest } from '../domain/login-request';
import { LoadSessionUseCase } from './load-session.use-case';

@Injectable({ providedIn: 'root' })
export class LoginUseCase {
  private readonly api = inject(AuthApi);
  private readonly loadSessionUseCase = inject(LoadSessionUseCase);

  execute(command: LoginRequest) {
    return this.api.login(command).pipe(
      tap(() => {
        this.loadSessionUseCase.resetCache();
      }),
      switchMap(() => this.loadSessionUseCase.execute()),
      map((user) => user.username)
    );
  }
}
