import { AUTHORITY, Authority } from './authority';

export function canAccessUsers(authorities: readonly Authority[]): boolean {
  return authorities.includes(AUTHORITY.moduleUsers);
}

export function canReadUsers(authorities: readonly Authority[]): boolean {
  return authorities.includes(AUTHORITY.submoduleReadUsers);
}

export function canWriteUsers(authorities: readonly Authority[]): boolean {
  return authorities.includes(AUTHORITY.submoduleWriteUsers);
}

export function canAccessPerfumes(authorities: readonly Authority[]): boolean {
  return authorities.includes(AUTHORITY.modulePerfumes);
}
