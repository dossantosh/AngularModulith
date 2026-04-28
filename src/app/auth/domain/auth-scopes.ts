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
