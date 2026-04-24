import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay, tap } from 'rxjs';

import { AuthApi } from '../data-access/auth.api';
import { AuthenticatedUser } from '../domain/authenticated-user';
import { AuthSessionStore } from '../state/auth-session.store';

@Injectable({ providedIn: 'root' })
export class LoadSessionUseCase {
  private readonly api = inject(AuthApi);
  private readonly sessionStore = inject(AuthSessionStore);

  private sessionOnce$?: Observable<AuthenticatedUser>;

  execute(): Observable<AuthenticatedUser> {
    this.sessionOnce$ ??= this.api.me().pipe(
      tap((response) => {
        this.sessionStore.setDataSource(response.dataSource ?? 'prod');
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

  resetCache(): void {
    this.sessionOnce$ = undefined;
  }
}
