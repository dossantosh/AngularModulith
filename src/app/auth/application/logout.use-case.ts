import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs';

import { AuthApi } from '../data-access/auth.api';
import { AuthSessionStore } from '../state/auth-session.store';
import { LoadSessionUseCase } from './load-session.use-case';

@Injectable({ providedIn: 'root' })
export class LogoutUseCase {
  private readonly api = inject(AuthApi);
  private readonly sessionStore = inject(AuthSessionStore);
  private readonly loadSessionUseCase = inject(LoadSessionUseCase);

  execute() {
    return this.api.logout().pipe(
      tap(() => {
        this.sessionStore.clear();
        this.loadSessionUseCase.resetCache();
      })
    );
  }
}
