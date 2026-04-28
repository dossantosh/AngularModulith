import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { UserPageDto } from './users.dto';

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
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/';

  search(query: UsersSearchRequest) {
    let params = new HttpParams()
      .set('limit', String(query.limit))
      .set('direction', query.direction);

    const { filters, lastId } = query;

    if (filters.id != null) params = params.set('id', String(filters.id));
    if (filters.username.trim()) params = params.set('username', filters.username.trim());
    if (filters.email.trim()) params = params.set('email', filters.email.trim());
    if (lastId != null) params = params.set('lastId', String(lastId));

    return this.http.get<UserPageDto>(`${this.baseUrl}users`, { params });
  }
}
