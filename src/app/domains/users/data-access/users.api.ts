import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { KeysetPageUserSummaryView, UserSummaryView } from '../../../generated/openapi/models';
import { UserControllerService } from '../../../generated/openapi/services/userController.service';
import { UserPageDto, UserSummaryDto } from './users.dto';

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
        query.direction
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
