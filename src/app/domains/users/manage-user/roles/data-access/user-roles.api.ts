import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { UserControllerService, UserRolesView } from '../../../../../generated/openapi';

export interface UserRoleDto {
  id: number;
  name: string;
}

export interface UserRolesDto {
  userId: number;
  username: string;
  roles: UserRoleDto[];
  availableRoles: UserRoleDto[];
}

@Injectable({ providedIn: 'root' })
export class UserRolesApi {
  private readonly usersClient = inject(UserControllerService);

  getUserRoles(id: number): Observable<UserRolesDto> {
    return this.usersClient.getUserRoles(id).pipe(map(mapUserRoles));
  }

  updateUserRoles(id: number, roleIds: readonly number[]): Observable<UserRolesDto> {
    return this.usersClient.updateUserRoles(id, { roleIds: [...roleIds] }).pipe(map(mapUserRoles));
  }
}

function mapUserRoles(user: UserRolesView): UserRolesDto {
  return {
    userId: user.userId ?? 0,
    username: user.username ?? '',
    roles: (user.roles ?? []).map(mapRole),
    availableRoles: (user.availableRoles ?? []).map(mapRole),
  };
}

function mapRole(role: { id?: number; name?: string }): UserRoleDto {
  return {
    id: role.id ?? 0,
    name: role.name ?? '',
  };
}
