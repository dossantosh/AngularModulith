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
