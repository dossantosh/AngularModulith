import { BackendDataSource } from './backend-data-source';

export interface LoginRequest {
  username: string;
  password: string;
  dataSource: BackendDataSource;
}
