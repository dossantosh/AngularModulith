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

  if (action === 'access' || action === 'read' || action === 'write') {
    return resourceCapabilities[action];
  }

  const capabilityName = `can${action.charAt(0).toUpperCase()}${action.slice(1)}`;
  return Boolean(resourceCapabilities[capabilityName as keyof typeof resourceCapabilities]);
}

export function canAccessUsers(capabilities: AuthCapabilities): boolean {
  return capabilities.users.access;
}

export function canReadUsers(capabilities: AuthCapabilities): boolean {
  return capabilities.users.read;
}

export function canWriteUsers(capabilities: AuthCapabilities): boolean {
  return capabilities.users.write;
}

export function canAccessPerfumes(capabilities: AuthCapabilities): boolean {
  return capabilities.perfumes.access;
}
