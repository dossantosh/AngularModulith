import { AUTHORITY, Authority } from './authority';

export interface FeatureCapability {
  access: boolean;
  read: boolean;
  write: boolean;
}

export interface AuthCapabilities {
  users: FeatureCapability;
  perfumes: FeatureCapability;
}

export const EMPTY_AUTH_CAPABILITIES: AuthCapabilities = {
  users: { access: false, read: false, write: false },
  perfumes: { access: false, read: false, write: false },
};

export function capabilitiesFromAuthorities(authorities: readonly Authority[]): AuthCapabilities {
  return {
    users: {
      access: authorities.includes(AUTHORITY.moduleUsers),
      read: authorities.includes(AUTHORITY.submoduleReadUsers),
      write: authorities.includes(AUTHORITY.submoduleWriteUsers),
    },
    perfumes: {
      access: authorities.includes(AUTHORITY.modulePerfumes),
      read: authorities.includes(AUTHORITY.submoduleReadPerfumes),
      write: authorities.includes(AUTHORITY.submoduleWritePerfumes),
    },
  };
}
