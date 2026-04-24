import { AuthCapabilities } from './auth-capabilities';

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
