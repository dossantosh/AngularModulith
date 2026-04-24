import { Authority } from '../domain/authority';
import { AuthCapabilities } from '../domain/auth-capabilities';
import { BackendDataSource } from '../domain/backend-data-source';

export interface LoginRequestDto {
  username: string;
  password: string;
  dataSource: BackendDataSource;
}

export interface LoginResponseDto {
  username: string;
}

export interface MeResponseDto {
  username: string;
  authorities: Authority[];
  dataSource: BackendDataSource;
  capabilities?: AuthCapabilities;
}
