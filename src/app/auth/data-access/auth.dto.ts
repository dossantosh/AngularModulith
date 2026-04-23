import { Authority } from '../domain/authority';

export interface LoginResponseDto {
  username: string;
}

export interface MeResponseDto {
  username: string;
  authorities: Authority[];
}
