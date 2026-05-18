export interface AppNavNode {
  key: string;
  label: string;
  icon?: string;
  route?: string;
  matchRoute?: string;
  exact?: boolean;
  disabled?: boolean;
  hint?: string;
  children?: readonly AppNavNode[];
}

export interface AppActiveNavigation {
  primary: AppNavNode | null;
  secondary: AppNavNode | null;
  tertiary: AppNavNode | null;
  path: readonly AppNavNode[];
}
