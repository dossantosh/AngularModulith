export const AUTHORITY = {
  roleAdmin: 'ROLE_ADMIN',
  roleUser: 'ROLE_USER',
  moduleUsers: 'MODULE_USERS',
  modulePerfumes: 'MODULE_PERFUMES',
  submoduleReadUsers: 'SUBMODULE_READUSERS',
  submoduleWriteUsers: 'SUBMODULE_WRITEUSERS',
  submoduleReadPerfumes: 'SUBMODULE_READPERFUMES',
  submoduleWritePerfumes: 'SUBMODULE_WRITEPERFUMES',
} as const;

export type KnownAuthority = (typeof AUTHORITY)[keyof typeof AUTHORITY];
export type Authority = KnownAuthority | (string & {});
