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
