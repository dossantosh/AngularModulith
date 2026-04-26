export const AUTH_SCOPES = {
  users: {
    read: 'user:read',
    create: 'user:create',
    update: 'user:update',
    delete: 'user:delete',
  },
  perfumes: {
    read: 'perfume:read',
    create: 'perfume:create',
    update: 'perfume:update',
    delete: 'perfume:delete',
  },
} as const;

type ScopeGroup = (typeof AUTH_SCOPES)[keyof typeof AUTH_SCOPES];

export type AuthScope = ScopeGroup[keyof ScopeGroup];
