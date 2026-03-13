import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
  view: 'prod' | 'historic';
}
export interface MeResponse {
  username: string;
  authorities: string[];
}
export type DataView = 'prod' | 'historic';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `/api/`;

  private readonly _username = signal<string | null>(null);
  readonly username = this._username.asReadonly();

  private readonly _authorities = signal<Set<string>>(new Set());
  readonly authorities = this._authorities.asReadonly();

  private readonly _view = signal<DataView>('prod');
  readonly view = this._view.asReadonly();

  readonly isLoggedIn = computed(() => this._username() !== null);

  private meOnce$?: Observable<MeResponse>;

  constructor(private readonly http: HttpClient) {}

  get currentView(): DataView {
    return this._view();
  }

  hasAuthority(a: string): boolean {
    return this._authorities().has(a);
  }

  hasAnyAuthority(...auths: string[]): boolean {
    const set = this._authorities();
    return auths.some((a) => set.has(a));
  }

  login(body: LoginRequest): Observable<string> {
    return this.http.post<{ username: string }>(`${this.baseUrl}auth/login`, body).pipe(
      tap((res) => {
        this._username.set(res.username);
        this._view.set(body.view);
        this.meOnce$ = undefined;
      }),
      map((res) => res.username),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}auth/logout`, {}).pipe(
      tap(() => {
        this._username.set(null);
        this._authorities.set(new Set());
        this._view.set('prod');
        this.meOnce$ = undefined;
      }),
    );
  }

  me(): Observable<MeResponse> {
    this.meOnce$ ??= this.http.get<MeResponse>(`${this.baseUrl}auth/me`).pipe(
      tap((me) => {
        this._username.set(me.username);
        this._authorities.set(new Set(me.authorities ?? []));
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
    return this.meOnce$;
  }

  initCsrf(): Observable<void> {
    return this.http.get(`${this.baseUrl}auth/csrf`).pipe(
      map(() => void 0),
      catchError(() => of(void 0)),
    );
  }
}
