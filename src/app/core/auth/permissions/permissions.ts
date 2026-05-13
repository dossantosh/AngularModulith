export const AUTH_SCOPES = {
  systems: {
    read: 'systems:read',
    write: 'systems:write',
  },
  perfumes: {
    read: 'perfumes:read',
    write: 'perfumes:write',
  },
} as const;

type ScopeGroup = (typeof AUTH_SCOPES)[keyof typeof AUTH_SCOPES];

export type AuthScope = ScopeGroup[keyof ScopeGroup];

export interface RequiredScopesRouteData {
  readonly requiredScopes: readonly AuthScope[];
}

const AUTH_SCOPE_VALUES = Object.values(AUTH_SCOPES).flatMap((group) =>
  Object.values(group),
) as readonly AuthScope[];
const AUTH_SCOPE_SET = new Set<AuthScope>(AUTH_SCOPE_VALUES);

export function requireScopes(
  ...requiredScopes: readonly [AuthScope, ...AuthScope[]]
): RequiredScopesRouteData {
  return { requiredScopes };
}

export function isAuthScope(value: unknown): value is AuthScope {
  return typeof value === 'string' && AUTH_SCOPE_SET.has(value as AuthScope);
}

export function isRequiredScopesRouteData(value: unknown): value is RequiredScopesRouteData {
  if (typeof value !== 'object' || value == null || !('requiredScopes' in value)) {
    return false;
  }

  const requiredScopes = value.requiredScopes;
  return (
    Array.isArray(requiredScopes) && requiredScopes.length > 0 && requiredScopes.every(isAuthScope)
  );
}

export function hasScope(scopes: readonly AuthScope[], scope: AuthScope): boolean {
  return scopes.includes(scope);
}

export function hasAnyScope(
  scopes: readonly AuthScope[],
  requiredScopes: readonly AuthScope[],
): boolean {
  return requiredScopes.some((scope) => hasScope(scopes, scope));
}

export function hasAllScopes(
  scopes: readonly AuthScope[],
  requiredScopes: readonly AuthScope[],
): boolean {
  return requiredScopes.every((scope) => hasScope(scopes, scope));
}
