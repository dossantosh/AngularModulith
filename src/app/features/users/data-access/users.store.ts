import { Injectable, computed, inject, signal } from '@angular/core';

import { KeysetPage } from '../../../shared/keyset-page.dto';
import { SearchUsersDTO } from '../models/searchUser.dto';
import { UsersApi } from './searchUsers.api';
import { PageDirection, UsersFilters } from '../models/users-search-params';

/**
 * Load status for store-managed requests.
 */
type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Store managing users search state (filters, pagination) and results.
 */
@Injectable({ providedIn: 'root' })
export class UsersStore {
  private readonly api = inject(UsersApi);

  // ---- UI/query state
  private readonly _filters = signal<UsersFilters>({ id: null, username: '', email: '' });
  private readonly _limit = signal<number>(50);
  private readonly _direction = signal<PageDirection>('NEXT');
  private readonly _lastId = signal<number | null>(null);

  // ---- request/result state
  private readonly _status = signal<LoadStatus>('idle');
  private readonly _error = signal<string | null>(null);
  private readonly _page = signal<KeysetPage<SearchUsersDTO> | null>(null);

  // ---- read-only signals (what component uses)
  filters = this._filters.asReadonly();
  limit = this._limit.asReadonly();
  direction = this._direction.asReadonly();
  lastId = this._lastId.asReadonly();

  status = this._status.asReadonly();
  error = this._error.asReadonly();
  loading = computed(() => this._status() === 'loading');

  users = computed(() => this._page()?.content ?? []);
  hasNext = computed(() => this._page()?.hasNext ?? false);
  hasPrevious = computed(() => this._page()?.hasPrevious ?? false);
  nextId = computed(() => this._page()?.nextId ?? null);
  previousId = computed(() => this._page()?.previousId ?? null);
  empty = computed(() => this._status() === 'success' && this.users().length === 0);

  // ---- commands (component calls these)
  setFilters(partial: Partial<UsersFilters>) {
    const next = { ...this._filters(), ...partial };
    this._filters.set(next);
  }

  setLimit(limit: number) {
    this._limit.set(limit);
  }

  search() {
    this._status.set('loading');
    this._error.set(null);

    this.api.search({
      limit: this._limit(),
      direction: this._direction(),
      lastId: this._lastId(),
      filters: this._filters(),
    }).subscribe({
      next: (page) => {
        this._page.set(page);
        this._status.set('success');
      },
      error: () => {
        this._page.set(null);
        this._status.set('error');
        this._error.set('Failed to load users');
      },
    });
  }

  clearFiltersAndSearch() {
    this._filters.set({ id: null, username: '', email: '' });
    this._lastId.set(null);
    this._direction.set('NEXT');
    this.search();
  }

  loadNext() {
    const nextId = this.nextId();
    if (this.hasNext() && nextId != null) {
      this._lastId.set(nextId);
      this._direction.set('NEXT');
      this.search();
    }
  }

  loadPrevious() {
    const prevId = this.previousId();
    if (this.hasPrevious() && prevId != null) {
      this._lastId.set(prevId);
      this._direction.set('PREVIOUS');
      this.search();
    }
  }
}
