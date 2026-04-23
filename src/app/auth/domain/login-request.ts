import { DataView } from './data-view';

export interface LoginRequest {
  username: string;
  password: string;
  view: DataView;
}
