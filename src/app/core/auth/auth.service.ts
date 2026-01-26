import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, shareReplay, tap } from 'rxjs';

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

  private readonly _username$ = new BehaviorSubject<string | null>(null);
  readonly username$ = this._username$.asObservable();

  private meOnce$?: Observable<MeResponse>;

  private readonly _authorities$ = new BehaviorSubject<Set<string>>(new Set());
  readonly authorities$ = this._authorities$.asObservable();

  // ---- Data view (prod/historic)
  private readonly _view$ = new BehaviorSubject<DataView>('prod');
  readonly view$ = this._view$.asObservable();

  get currentView(): DataView {
    return this._view$.value;
  }

  hasAuthority(authority: string): boolean {
    return this._authorities$.value.has(authority);
  }

  hasAnyAuthority(...authorities: string[]): boolean {
    const set = this._authorities$.value;
    return authorities.some((a) => set.has(a));
  }

  constructor(private readonly http: HttpClient) {}

  login(body: LoginRequest): Observable<string> {
    return this.http.post<{ username: string }>(`${this.baseUrl}auth/login`, body, {}).pipe(
      tap((res) => {
        this._username$.next(res.username);
        this._view$.next(body.view); // 👈 remember selected view
        this.meOnce$ = undefined;
      }),
      map((res) => res.username),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}auth/logout`, {}, {}).pipe(
      tap(() => {
        this._username$.next(null);
        this._authorities$.next(new Set());
        this._view$.next('prod'); // reset to default
        this.meOnce$ = undefined;
      }),
    );
  }

  me(): Observable<MeResponse> {
    this.meOnce$ ??= this.http.get<MeResponse>(`${this.baseUrl}auth/me`, {}).pipe(
      tap((me) => {
        this._username$.next(me.username);
        this._authorities$.next(new Set(me.authorities ?? []));
        // NOTE: view is chosen at login time, so we don't override it here.
      }),
      shareReplay(1),
    );

    return this.meOnce$;
  }

  /**
   * GET first so Spring gives us XSRF-TOKEN cookie.
   * If not logged in, it returns 401
   */
  initCsrf(): Observable<void> {
    return this.http.get(`${this.baseUrl}auth/csrf`, {}).pipe(
      map(() => void 0),
      catchError(() => of(void 0)),
    );
  }
}
