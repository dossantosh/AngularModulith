import { Injectable, inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';

import { AuthControllerService, type AuthSessionResponse } from '../../../generated/openapi';
import { LoginRequestDto, LoginResponseDto, MeResponseDto } from './auth.dto';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly authClient = inject(AuthControllerService);

  login(body: LoginRequestDto) {
    return this.authClient.login(body).pipe(map((response): LoginResponseDto => response));
  }

  logout() {
    return this.authClient.logout().pipe(map(() => void 0));
  }

  me() {
    return this.authClient.me().pipe(map((response) => mapMeResponse(response)));
  }

  initCsrf() {
    return this.authClient.csrf().pipe(
      map(() => void 0),
      catchError(() => of(void 0)),
    );
  }
}

function mapMeResponse(response: AuthSessionResponse): MeResponseDto {
  return {
    username: response.username ?? '',
    dataSource: (response.dataSource as MeResponseDto['dataSource'] | undefined) ?? 'prod',
    scopes: response.scopes as MeResponseDto['scopes'],
    navigation: response.navigation as MeResponseDto['navigation'],
  };
}
