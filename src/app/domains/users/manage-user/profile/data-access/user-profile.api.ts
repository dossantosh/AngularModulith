import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  UpdateUserPersonalDataRequest,
  UserControllerService,
  UserPersonalDataView,
} from '../../../../../generated/openapi';

export type EmployeeStatusDto = NonNullable<UserPersonalDataView['status']>;
export type ContractTypeDto = NonNullable<UserPersonalDataView['contractType']>;

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

@Injectable({ providedIn: 'root' })
export class UserProfileApi {
  private readonly usersClient = inject(UserControllerService);

  getUserPersonalData(id: number): Observable<UserPersonalDataDto> {
    return this.usersClient.getUserPersonalData(id).pipe(map(mapUserPersonalData));
  }

  updateUserPersonalData(
    id: number,
    command: UpdateUserPersonalDataCommand,
  ): Observable<UserPersonalDataDto> {
    return this.usersClient
      .updateUserPersonalData(id, toUpdateUserPersonalDataRequest(command))
      .pipe(map(mapUserPersonalData));
  }
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
