import { Authority } from './authority';

export interface AuthenticatedUser {
  username: string;
  authorities: Authority[];
}
