export interface FeatureCapability {
  access: boolean;
  read: boolean;
  write: boolean;
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
    access: false,
    read: false,
    write: false,
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  },
  perfumes: {
    access: false,
    read: false,
    write: false,
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  },
};
