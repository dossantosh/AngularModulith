import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  KeysetPageUserSummaryView,
  UserControllerService,
  UserSummaryView,
} from '../../../generated/openapi';

export type PageDirection = 'NEXT' | 'PREVIOUS';

export interface UserSearchFilters {
  id: number | null;
  username: string;
  email: string;
}

export interface UsersSearchRequest {
  limit: number;
  direction: PageDirection;
  lastId: number | null;
  filters: UserSearchFilters;
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
export class UsersSearchApi {
  private readonly usersClient = inject(UserControllerService);

  searchUsers(query: UsersSearchRequest): Observable<UserPageDto> {
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
