import { type AppSidebarItem } from '../../shared/ui';
import { type AuthNavigationModule } from '../auth/session/session.model';

export function buildSidebarNavigation(
  navigation: readonly AuthNavigationModule[] = [],
): readonly AppSidebarItem[] {
  return [dashboardLink(), ...navigation.map(toSidebarModuleFromBackend)];
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
