import { AuthCapabilities } from './auth-capabilities';

type CapabilityAction = 'access' | 'read' | 'write' | 'create' | 'update' | 'delete';

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

export function canAccessUsers(capabilities: AuthCapabilities): boolean {
  return capabilities.users.canAccess;
}

export function canReadUsers(capabilities: AuthCapabilities): boolean {
  return capabilities.users.canRead;
}

export function canWriteUsers(capabilities: AuthCapabilities): boolean {
  return (
    capabilities.users.canCreate || capabilities.users.canUpdate || capabilities.users.canDelete
  );
}

export function canAccessPerfumes(capabilities: AuthCapabilities): boolean {
  return capabilities.perfumes.canAccess;
}
