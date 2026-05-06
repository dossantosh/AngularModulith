export interface FeatureCapability {
  canRead: boolean;
  canWrite: boolean;
}

export interface AuthCapabilities extends Record<string, FeatureCapability> {
  systems: FeatureCapability;
  perfumes: FeatureCapability;
}

export const EMPTY_AUTH_CAPABILITIES: AuthCapabilities = {
  systems: {
    canRead: false,
    canWrite: false,
  },
  perfumes: {
    canRead: false,
    canWrite: false,
  },
};

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
export type CapabilityAction = 'read' | 'write';

export function hasScope(scopes: readonly string[], scope: string): boolean {
  return scopes.includes(scope);
}

export function hasAnyScope(scopes: readonly string[], requiredScopes: readonly string[]): boolean {
  return requiredScopes.some((scope) => hasScope(scopes, scope));
}

export function hasAllScopes(scopes: readonly string[], requiredScopes: readonly string[]): boolean {
  return requiredScopes.every((scope) => hasScope(scopes, scope));
}

export function can(
  capabilities: AuthCapabilities,
  resource: string,
  action: CapabilityAction
): boolean {
  const resourceCapabilities = capabilities[resource];

  if (!resourceCapabilities) {
    return false;
  }

  if (action === 'read') {
    return resourceCapabilities.canRead;
  }

  if (action === 'write') {
    return resourceCapabilities.canWrite;
  }

  return false;
}

