export interface FeatureCapability {
  canAccess: boolean;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface AuthCapabilities extends Record<string, FeatureCapability> {
  users: FeatureCapability;
  perfumes: FeatureCapability;
}

export const EMPTY_AUTH_CAPABILITIES: AuthCapabilities = {
  users: {
    canAccess: false,
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  },
  perfumes: {
    canAccess: false,
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  },
};

export const AUTH_SCOPES = {
  users: {
    read: 'users:read',
    create: 'users:create',
    update: 'users:update',
    delete: 'users:delete',
  },
  perfumes: {
    read: 'perfumes:read',
    create: 'perfumes:create',
    update: 'perfumes:update',
    delete: 'perfumes:delete',
  },
  roles: {
    read: 'role:read',
    assign: 'role:assign',
  },
  scopes: {
    read: 'scope:read',
    assign: 'scope:assign',
  },
} as const;

type ScopeGroup = (typeof AUTH_SCOPES)[keyof typeof AUTH_SCOPES];

export type AuthScope = ScopeGroup[keyof ScopeGroup];
export type CapabilityAction = 'access' | 'read' | 'write' | 'create' | 'update' | 'delete';

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

  if (action === 'access') {
    return resourceCapabilities.canAccess;
  }

  if (action === 'read') {
    return resourceCapabilities.canRead;
  }

  if (action === 'write') {
    return (
      resourceCapabilities.canCreate ||
      resourceCapabilities.canUpdate ||
      resourceCapabilities.canDelete
    );
  }

  const capabilityName = `can${action.charAt(0).toUpperCase()}${action.slice(1)}`;
  return Boolean(resourceCapabilities[capabilityName as keyof typeof resourceCapabilities]);
}
