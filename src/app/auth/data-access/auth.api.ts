import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';

import { LoginRequest } from '../domain/login-request';
import { LoginResponseDto, MeResponseDto } from './auth.dto';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/';

  login(body: LoginRequest) {
    return this.http.post<LoginResponseDto>(`${this.baseUrl}auth/login`, body);
  }

  logout() {
    return this.http.post<void>(`${this.baseUrl}auth/logout`, {});
  }

  me() {
    return this.http.get<MeResponseDto>(`${this.baseUrl}auth/me`);
  }

  initCsrf() {
    return this.http.get(`${this.baseUrl}auth/csrf`).pipe(
      map(() => void 0),
      catchError(() => of(void 0))
    );
  }
}
