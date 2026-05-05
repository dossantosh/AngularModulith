import { AuthCapabilities } from '../permissions/permissions';
import { AuthNavigationModule, BackendDataSource } from '../session/session.model';

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
  dataSource: BackendDataSource;
  scopes?: string[];
  capabilities: AuthCapabilities;
  navigation?: AuthNavigationModule[];
}
