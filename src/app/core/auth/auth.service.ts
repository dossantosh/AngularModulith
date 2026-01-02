import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, shareReplay, tap } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface MeResponse {
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `/api-auth/api/auth`;

  private readonly _username$ = new BehaviorSubject<string | null>(null);
  readonly username$ = this._username$.asObservable();

  private meOnce$?: Observable<MeResponse>;

  constructor(private readonly http: HttpClient) {}

  /**
   * GET first so Spring gives us XSRF-TOKEN cookie.
   * If not logged in, it returns 401
   */
  initCsrf(): Observable<void> {
    return this.http.get(`${this.baseUrl}/csrf`, {  }).pipe(
      map(() => void 0),
      catchError(() => of(void 0))
    );
  }

  login(body: LoginRequest): Observable<string> {
    return this.http
      .post<{ username: string }>(`${this.baseUrl}/login`, body, {  })
      .pipe(
        tap((res) => {
          this._username$.next(res.username);
          this.meOnce$ = undefined;
        }),
        map((res) => res.username)
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {}, {  }).pipe(
      tap(() => {
        this._username$.next(null);
        this.meOnce$ = undefined;
      })
    );
  }

  // me(): Observable<MeResponse> {
  //   if (!this.meOnce$) {
  //     this.meOnce$ = this.http
  //       .get<MeResponse>(`${this.baseUrl}/me`, {  })
  //       .pipe(
  //         tap((me) => this._username$.next(me.username)),
  //         shareReplay(1)
  //       );
  //   }
  //   return this.meOnce$;
  // }
  me(): Observable<MeResponse> {
    this.meOnce$ ??= this.http
      .get<MeResponse>(`${this.baseUrl}/me`, {  })
      .pipe(
        tap((me) => this._username$.next(me.username)),
        shareReplay(1)
      );

    return this.meOnce$;
  }
}
