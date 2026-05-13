import { Injectable, inject } from '@angular/core';
import { Observable, from, map, of, switchMap } from 'rxjs';

import {
  KeysetPageUserSummaryView,
  UpdateUserRequest,
  UserControllerService,
  UserDetailsView,
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

interface UserRoleDto {
  id: number;
  name: string;
}

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
    roles: (user.roles ?? []).map((role) => ({
      id: role.id ?? 0,
      name: role.name ?? '',
    })),
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
