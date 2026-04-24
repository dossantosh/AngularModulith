import { BackendDataSource } from '../domain/backend-data-source';

export interface LoginCommand {
  username: string;
  password: string;
  dataSource: BackendDataSource;
}
