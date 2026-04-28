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
  userId?: number | null;
  username: string;
  dataSource: BackendDataSource;
  roles?: string[];
  scopes?: string[];
  capabilities: AuthCapabilities;
}
