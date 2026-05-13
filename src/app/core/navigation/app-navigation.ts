import { type AppActiveNavigation, type AppNavNode } from '../../shared/ui/navigation/app-nav-node';
import { type AuthNavigationModule } from '../auth/session/session.model';

export function buildNavigationTree(
  navigation: readonly AuthNavigationModule[] = [],
): readonly AppNavNode[] {
  return [dashboardLink(), ...navigation.map(toNavigationPrimaryFromBackend)];
}

export function resolveActiveNavigation(
  tree: readonly AppNavNode[],
  currentUrl: string,
): AppActiveNavigation {
  const path = findActivePath(tree, normalizeUrl(currentUrl));

  return {
    primary: path[0] ?? null,
    secondary: path[1] ?? null,
    tertiary: path[2] ?? null,
    path,
  };
}

export function isNavigationNodeActive(node: AppNavNode, currentUrl: string): boolean {
  const normalizedUrl = normalizeUrl(currentUrl);

  if (isNodeRouteActive(node, normalizedUrl)) {
    return true;
  }

  return (node.children ?? []).some((child) => isNavigationNodeActive(child, normalizedUrl));
}

export function getNavigationTarget(node: AppNavNode): string | undefined {
  if (!node.disabled && node.route) {
    return node.route;
  }

  for (const child of node.children ?? []) {
    const target = getNavigationTarget(child);

    if (target) {
      return target;
    }
  }

  return undefined;
}

function dashboardLink(): AppNavNode {
  return {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/',
    exact: true,
  };
}

function toNavigationPrimaryFromBackend(module: AuthNavigationModule): AppNavNode {
  const children = module.items.map((item) => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    route: item.route,
    matchRoute: getSectionRoute(item.route),
    disabled: item.disabled ?? false,
    hint: item.hint ?? undefined,
  }));

  return {
    key: module.key,
    label: module.label,
    icon: module.icon,
    route: children.find((child) => !child.disabled)?.route,
    children,
  };
}

function findActivePath(
  nodes: readonly AppNavNode[],
  normalizedUrl: string,
): readonly AppNavNode[] {
  let bestPath: readonly AppNavNode[] = [];
  let bestScore = -1;

  for (const node of nodes) {
    const candidatePath = findActivePathFromNode(node, normalizedUrl);
    const candidateScore = scorePath(candidatePath, normalizedUrl);

    if (candidateScore > bestScore) {
      bestPath = candidatePath;
      bestScore = candidateScore;
    }
  }

  return bestPath;
}

function findActivePathFromNode(node: AppNavNode, normalizedUrl: string): readonly AppNavNode[] {
  const ownPath = isNodeRouteActive(node, normalizedUrl) ? [node] : [];

  let bestChildPath: readonly AppNavNode[] = [];
  let bestChildScore = -1;

  for (const child of node.children ?? []) {
    const childPath = findActivePathFromNode(child, normalizedUrl);
    const childScore = scorePath(childPath, normalizedUrl);

    if (childScore > bestChildScore) {
      bestChildPath = childPath;
      bestChildScore = childScore;
    }
  }

  if (!bestChildPath.length) {
    return ownPath;
  }

  return [node, ...bestChildPath];
}

function scorePath(path: readonly AppNavNode[], normalizedUrl: string): number {
  const routeLength = path.reduce((score, node) => {
    const route = node.matchRoute ?? node.route;
    const normalizedRoute = route ? normalizeUrl(route) : '';

    return normalizedRoute && isRouteActive(normalizedRoute, normalizedUrl, node.exact ?? false)
      ? score + normalizedRoute.length
      : score;
  }, 0);

  return path.length ? routeLength + path.length : -1;
}

function isNodeRouteActive(node: AppNavNode, normalizedUrl: string): boolean {
  const route = node.matchRoute ?? node.route;

  return route ? isRouteActive(route, normalizedUrl, node.exact ?? false) : false;
}

function isRouteActive(route: string, normalizedUrl: string, exact: boolean): boolean {
  const normalizedRoute = normalizeUrl(route);

  if (normalizedRoute === '/') {
    return exact ? normalizedUrl === '/' : true;
  }

  return exact
    ? normalizedUrl === normalizedRoute
    : normalizedUrl === normalizedRoute || normalizedUrl.startsWith(`${normalizedRoute}/`);
}

function normalizeUrl(url: string): string {
  const [path = '/'] = url.split(/[?#]/);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const withoutTrailingSlash = normalizedPath.replace(/\/+$/, '');

  return withoutTrailingSlash || '/';
}

function getSectionRoute(route: string): string {
  const normalizedRoute = normalizeUrl(route);

  if (normalizedRoute === '/') {
    return normalizedRoute;
  }

  const [, primarySegment] = normalizedRoute.split('/');

  return primarySegment ? `/${primarySegment}` : normalizedRoute;
}
