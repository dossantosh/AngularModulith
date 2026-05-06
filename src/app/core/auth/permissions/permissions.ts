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

export function hasScope(scopes: readonly string[], scope: string): boolean {
  return scopes.includes(scope);
}

export function hasAnyScope(scopes: readonly string[], requiredScopes: readonly string[]): boolean {
  return requiredScopes.some((scope) => hasScope(scopes, scope));
}

export function hasAllScopes(scopes: readonly string[], requiredScopes: readonly string[]): boolean {
  return requiredScopes.every((scope) => hasScope(scopes, scope));
}

