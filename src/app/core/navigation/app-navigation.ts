import { AUTH_SCOPES } from '../auth/permissions/permissions';
import { type AuthNavigationModule } from '../auth/session/session.model';
import { type AppSidebarItem } from '../../shared/ui';

interface AppNavigationLink {
  key: string;
  label: string;
  icon: string;
  routerLink: string;
  exact?: boolean;
  disabled?: boolean;
  hint?: string;
  requiredScopes?: readonly string[];
}

interface AppNavigationModule {
  key: string;
  label: string;
  icon: string;
  items: readonly AppNavigationLink[];
}

const APP_NAVIGATION: readonly AppNavigationModule[] = [
  {
    key: 'systems',
    label: 'Sistemas',
    icon: 'settings',
    items: [
      {
        key: 'users_search',
        label: 'Usuarios',
        icon: 'group',
        routerLink: '/users/search',
        requiredScopes: [AUTH_SCOPES.users.read],
      },
    ],
  },
  {
    key: 'perfumes',
    label: 'Perfumes',
    icon: 'local_florist',
    items: [
      {
        key: 'perfumes_catalog',
        label: 'Catalogo',
        icon: 'local_florist',
        routerLink: '/perfumes/catalog',
        disabled: true,
        hint: 'Modulo previsto para proximas fases',
        requiredScopes: [AUTH_SCOPES.perfumes.read],
      },
    ],
  },
];

export function buildSidebarNavigation(
  scopes: readonly string[],
  backendNavigation: readonly AuthNavigationModule[] = []
): readonly AppSidebarItem[] {
  if (backendNavigation.length > 0) {
    return [dashboardLink(), ...backendNavigation.map(toSidebarModuleFromBackend)];
  }

  return buildFallbackSidebarNavigation(scopes);
}

function buildFallbackSidebarNavigation(scopes: readonly string[]): readonly AppSidebarItem[] {
  return [
    dashboardLink(),
    ...APP_NAVIGATION.map((module) => toSidebarModule(module, scopes)).filter(
      (module): module is AppSidebarItem => Boolean(module)
    ),
  ];
}

function dashboardLink(): AppSidebarItem {
  return {
    key: 'dashboard',
    kind: 'link',
    label: 'Dashboard',
    icon: 'dashboard',
    routerLink: '/',
    exact: true,
  };
}

function toSidebarModuleFromBackend(module: AuthNavigationModule): AppSidebarItem {
  return {
    key: module.key,
    kind: 'group',
    label: module.label,
    icon: module.icon,
    items: module.items.map((item) => ({
      key: item.key,
      kind: 'link',
      label: item.label,
      icon: item.icon,
      routerLink: item.route,
      disabled: item.disabled ?? false,
      hint: item.hint ?? undefined,
    })),
  };
}

function toSidebarModule(
  module: AppNavigationModule,
  scopes: readonly string[]
): AppSidebarItem | null {
  const items = module.items.filter((item) => canShowLink(item, scopes)).map(toSidebarLink);

  if (items.length === 0) {
    return null;
  }

  return {
    key: module.key,
    kind: 'group',
    label: module.label,
    icon: module.icon,
    items,
  };
}

function toSidebarLink(item: AppNavigationLink): AppSidebarItem {
  return {
    key: item.key,
    kind: 'link',
    label: item.label,
    icon: item.icon,
    routerLink: item.routerLink,
    exact: item.exact,
    disabled: item.disabled,
    hint: item.hint,
  };
}

function canShowLink(item: AppNavigationLink, scopes: readonly string[]): boolean {
  if (!item.requiredScopes?.length) {
    return true;
  }

  return item.requiredScopes.some((scope) => scopes.includes(scope));
}
