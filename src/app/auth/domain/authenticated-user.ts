import { Authority } from './authority';
import { DataView } from './data-view';

export interface AuthenticatedUser {
  username: string;
  authorities: Authority[];
  view: DataView;
}
