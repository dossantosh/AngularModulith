import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { UsersSearchParams } from '../models/users-search-params';
import { KeysetPage } from '../../../shared/keyset-page.dto';
import { SearchUsersDTO } from '../models/searchUser.dto';

/**
 * Low-level API client for the Users backend endpoint.
 *
 * <p>This class is responsible only for:
 * <ul>
 *   <li>Constructing HTTP query parameters</li>
 *   <li>Calling the backend using {@link HttpClient}</li>
 *   <li>Returning raw DTO responses</li>
 * </ul>
 *
 * <p>It is intentionally "thin". Business rules, caching, and UI state belong
 * in a store or repository layer.</p>
 */
@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly baseUrl = `/api/auth`;

  constructor(private readonly http: HttpClient) {}

  search(paramsObj: UsersSearchParams) {
    let params = new HttpParams()
      .set('limit', String(paramsObj.limit))
      .set('direction', paramsObj.direction);

    const { filters, lastId } = paramsObj;

    if (filters.id != null) params = params.set('id', String(filters.id));
    if (filters.username.trim()) params = params.set('username', filters.username.trim());
    if (filters.email.trim()) params = params.set('email', filters.email.trim());
    if (lastId != null) params = params.set('lastId', String(lastId));

    return this.http.get<KeysetPage<SearchUsersDTO>>(this.baseUrl, { params });
  }
}
