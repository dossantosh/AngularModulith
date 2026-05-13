import { Injectable, inject } from '@angular/core';
import { Observable, from, map, of, switchMap } from 'rxjs';

import {
  KeysetPageUserSummaryView,
  UpdateUserPersonalDataRequest,
  UpdateUserRequest,
  UserControllerService,
  UserDetailsView,
  UserPersonalDataView,
  UserRolesView,
  UserSummaryView,
} from '../../../generated/openapi';

interface UsersSearchRequest {
  limit: number;
  direction: 'NEXT' | 'PREVIOUS';
  lastId: number | null;
  filters: {
    id: number | null;
    username: string;
    email: string;
  };
}

export interface UserRoleDto {
  id: number;
  name: string;
}

export type EmployeeStatusDto = NonNullable<UserPersonalDataView['status']>;
export type ContractTypeDto = NonNullable<UserPersonalDataView['contractType']>;

export interface UserDetailsDto {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  isAdmin: boolean;
  roles: UserRoleDto[];
}

export interface UpdateUserCommand {
  username: string;
  email: string;
  enabled: boolean;
  isAdmin: boolean;
}

export interface UserPersonalDataDto {
  userId: number;
  username: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  corporateEmail: string;
  phone: string;
  identityDocument: string;
  birthDate: string;
  address: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  jobTitle: string;
  department: string;
  hireDate: string;
  status: EmployeeStatusDto;
  contractType: ContractTypeDto | null;
  internalNotes: string;
}

export interface UpdateUserPersonalDataCommand {
  employeeCode: string;
  firstName: string;
  lastName: string;
  corporateEmail: string;
  phone: string;
  identityDocument: string;
  birthDate: string;
  address: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  jobTitle: string;
  department: string;
  hireDate: string;
  status: EmployeeStatusDto;
  contractType: ContractTypeDto | null;
  internalNotes: string;
}

export interface UserRolesDto {
  userId: number;
  username: string;
  roles: UserRoleDto[];
  availableRoles: UserRoleDto[];
}

export interface UserSummaryDto {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  isAdmin: boolean;
}

export interface UserPageDto {
  content: UserSummaryDto[];
  hasNext: boolean;
  hasPrevious: boolean;
  nextId: number | null;
  previousId: number | null;
  empty: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly usersClient = inject(UserControllerService);

  search(query: UsersSearchRequest): Observable<UserPageDto> {
    const { filters, lastId } = query;
    const username = filters.username.trim() || undefined;
    const email = filters.email.trim() || undefined;

    return this.usersClient
      .getUsers(
        filters.id ?? undefined,
        username,
        email,
        lastId ?? undefined,
        query.limit,
        query.direction,
      )
      .pipe(map(mapUserPage));
  }

  getById(id: number): Observable<UserDetailsDto> {
    return this.usersClient
      .getUserDetails(id)
      .pipe(switchMap(readGeneratedJson<UserDetailsView>), map(mapUserDetails));
  }

  update(id: number, command: UpdateUserCommand): Observable<UserDetailsDto> {
    return this.usersClient
      .updateUser(id, toUpdateUserRequest(command))
      .pipe(switchMap(readGeneratedJson<UserDetailsView>), map(mapUserDetails));
  }

  getPersonalData(id: number): Observable<UserPersonalDataDto> {
    return this.usersClient.getUserPersonalData(id).pipe(map(mapUserPersonalData));
  }

  updatePersonalData(
    id: number,
    command: UpdateUserPersonalDataCommand,
  ): Observable<UserPersonalDataDto> {
    return this.usersClient
      .updateUserPersonalData(id, toUpdateUserPersonalDataRequest(command))
      .pipe(map(mapUserPersonalData));
  }

  getRoles(id: number): Observable<UserRolesDto> {
    return this.usersClient.getUserRoles(id).pipe(map(mapUserRoles));
  }

  updateRoles(id: number, roleIds: readonly number[]): Observable<UserRolesDto> {
    return this.usersClient.updateUserRoles(id, { roleIds: [...roleIds] }).pipe(map(mapUserRoles));
  }
}

function mapUserPage(page: KeysetPageUserSummaryView & { empty?: boolean }): UserPageDto {
  const content = (page.content ?? []).map(mapUserSummary);

  return {
    content,
    hasNext: page.hasNext ?? false,
    hasPrevious: page.hasPrevious ?? false,
    nextId: page.nextId ?? null,
    previousId: page.previousId ?? null,
    empty: page.empty ?? content.length === 0,
  };
}

function mapUserSummary(user: UserSummaryView): UserSummaryDto {
  return {
    id: user.id ?? 0,
    username: user.username ?? '',
    email: user.email ?? '',
    enabled: user.enabled ?? false,
    isAdmin: user.isAdmin ?? false,
  };
}

function mapUserDetails(user: UserDetailsView): UserDetailsDto {
  return {
    id: user.id ?? 0,
    username: user.username ?? '',
    email: user.email ?? '',
    enabled: user.enabled ?? false,
    isAdmin: user.isAdmin ?? false,
    roles: (user.roles ?? []).map(mapRole),
  };
}

function mapUserPersonalData(user: UserPersonalDataView): UserPersonalDataDto {
  return {
    userId: user.userId ?? 0,
    username: user.username ?? '',
    employeeCode: user.employeeCode ?? '',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    corporateEmail: user.corporateEmail ?? '',
    phone: user.phone ?? '',
    identityDocument: user.identityDocument ?? '',
    birthDate: user.birthDate ?? '',
    address: user.address ?? '',
    city: user.city ?? '',
    stateProvince: user.stateProvince ?? '',
    postalCode: user.postalCode ?? '',
    country: user.country ?? '',
    jobTitle: user.jobTitle ?? '',
    department: user.department ?? '',
    hireDate: user.hireDate ?? '',
    status: user.status ?? 'ACTIVE',
    contractType: user.contractType ?? null,
    internalNotes: user.internalNotes ?? '',
  };
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

function toUpdateUserRequest(command: UpdateUserCommand): UpdateUserRequest {
  return {
    username: command.username.trim(),
    email: command.email.trim(),
    enabled: command.enabled,
    isAdmin: command.isAdmin,
  };
}

function toUpdateUserPersonalDataRequest(
  command: UpdateUserPersonalDataCommand,
): UpdateUserPersonalDataRequest {
  return {
    employeeCode: optionalText(command.employeeCode),
    firstName: optionalText(command.firstName),
    lastName: optionalText(command.lastName),
    corporateEmail: optionalText(command.corporateEmail),
    phone: optionalText(command.phone),
    identityDocument: optionalText(command.identityDocument),
    birthDate: optionalText(command.birthDate),
    address: optionalText(command.address),
    city: optionalText(command.city),
    stateProvince: optionalText(command.stateProvince),
    postalCode: optionalText(command.postalCode),
    country: optionalText(command.country),
    jobTitle: optionalText(command.jobTitle),
    department: optionalText(command.department),
    hireDate: optionalText(command.hireDate),
    status: command.status,
    contractType: command.contractType ?? undefined,
    internalNotes: optionalText(command.internalNotes),
  };
}

function optionalText(value: string): string | undefined {
  const normalized = value.trim();
  return normalized || undefined;
}

function readGeneratedJson<T>(value: T | Blob): Observable<T> {
  if (isBlob(value)) {
    return readBlobText(value).pipe(map((text) => (text ? (JSON.parse(text) as T) : ({} as T))));
  }

  return of(value);
}

function isBlob(value: unknown): value is Blob {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}

function readBlobText(blob: Blob): Observable<string> {
  if (typeof blob.text === 'function') {
    return from(blob.text());
  }

  if (typeof FileReader !== 'undefined') {
    return new Observable((subscriber) => {
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        subscriber.next(String(reader.result ?? ''));
        subscriber.complete();
      });
      reader.addEventListener('error', () => subscriber.error(reader.error));
      reader.readAsText(blob);
    });
  }

  return from(new Response(blob).text());
}
