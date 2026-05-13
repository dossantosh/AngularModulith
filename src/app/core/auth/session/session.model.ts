export type BackendDataSource = 'prod' | 'historic';

export interface AuthenticatedUser {
  username: string;
}

export interface AuthNavigationItem {
  key: string;
  label: string;
  icon: string;
  route: string;
  disabled?: boolean;
  hint?: string | null;
}

export interface AuthNavigationModule {
  key: string;
  label: string;
  icon: string;
  items: readonly AuthNavigationItem[];
}
