import { Injectable, signal } from '@angular/core';

import {
  DEFAULT_USER_SEARCH_FILTERS,
  PageDirection,
  UserSearchFilters,
} from '../domain/user-search-filters';

@Injectable({ providedIn: 'root' })
export class UsersSearchFlowStore {
  private readonly _filters = signal<UserSearchFilters>({ ...DEFAULT_USER_SEARCH_FILTERS });
  private readonly _limit = signal<number>(10);
  private readonly _direction = signal<PageDirection>('NEXT');
  private readonly _lastId = signal<number | null>(null);

  readonly filters = this._filters.asReadonly();
  readonly limit = this._limit.asReadonly();
  readonly direction = this._direction.asReadonly();
  readonly lastId = this._lastId.asReadonly();

  setFilters(partial: Partial<UserSearchFilters>): void {
    this._filters.set({ ...this._filters(), ...partial });
  }

  resetFilters(): void {
    this._filters.set({ ...DEFAULT_USER_SEARCH_FILTERS });
  }

  setLimit(limit: number): void {
    this._limit.set(limit);
  }

  resetPagination(): void {
    this._lastId.set(null);
    this._direction.set('NEXT');
  }

  setPagination(direction: PageDirection, lastId: number | null): void {
    this._direction.set(direction);
    this._lastId.set(lastId);
  }
}
