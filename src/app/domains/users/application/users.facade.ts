import { Injectable, computed, inject, signal } from '@angular/core';
import type { Subscription } from 'rxjs';

import { UsersApi } from '../data-access/users.api';
import { UserPageDto } from '../data-access/users.dto';

type PageDirection = 'NEXT' | 'PREVIOUS';
type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UserSearchFilters {
  id: number | null;
  username: string;
  email: string;
}

const DEFAULT_USER_SEARCH_FILTERS: UserSearchFilters = {
  id: null,
  username: '',
  email: '',
};

@Injectable({ providedIn: 'root' })
export class UsersFacade {
  private readonly api = inject(UsersApi);

  private readonly _filters = signal<UserSearchFilters>({ ...DEFAULT_USER_SEARCH_FILTERS });
  private readonly _limit = signal<number>(10);
  private readonly _direction = signal<PageDirection>('NEXT');
  private readonly _lastId = signal<number | null>(null);
  private readonly _status = signal<LoadStatus>('idle');
  private readonly _error = signal<string | null>(null);
  private readonly _page = signal<UserPageDto | null>(null);
  private searchSubscription?: Subscription;

  readonly filters = this._filters.asReadonly();
  readonly error = this._error.asReadonly();
  readonly loading = computed(() => this._status() === 'loading');
  readonly users = computed(() => this._page()?.content ?? []);
  readonly hasNext = computed(() => this._page()?.hasNext ?? false);
  readonly hasPrevious = computed(() => this._page()?.hasPrevious ?? false);
  private readonly nextId = computed(() => this._page()?.nextId ?? null);
  private readonly previousId = computed(() => this._page()?.previousId ?? null);

  setFilters(partial: Partial<UserSearchFilters>): void {
    this._filters.set({ ...this._filters(), ...partial });
  }

  search(): void {
    this.startLoading();
    this.searchSubscription?.unsubscribe();

    this.searchSubscription = this.api
      .search({
        limit: this._limit(),
        direction: this._direction(),
        lastId: this._lastId(),
        filters: this._filters(),
      })
      .subscribe({
        next: (page) => this.setPage(page),
        error: () => this.setError('Failed to load users'),
      });
  }

  clearFiltersAndSearch(): void {
    this.resetFilters();
    this.resetPagination();
    this.search();
  }

  loadNext(): void {
    const nextId = this.nextId();
    if (!this.hasNext() || nextId == null) return;

    this.setPagination('NEXT', nextId);
    this.search();
  }

  loadPrevious(): void {
    const previousId = this.previousId();
    if (!this.hasPrevious() || previousId == null) return;

    this.setPagination('PREVIOUS', previousId);
    this.search();
  }

  private resetFilters(): void {
    this._filters.set({ ...DEFAULT_USER_SEARCH_FILTERS });
  }

  private resetPagination(): void {
    this._lastId.set(null);
    this._direction.set('NEXT');
  }

  private setPagination(direction: PageDirection, lastId: number | null): void {
    this._direction.set(direction);
    this._lastId.set(lastId);
  }

  private startLoading(): void {
    this._status.set('loading');
    this._error.set(null);
  }

  private setPage(page: UserPageDto): void {
    this._page.set(page);
    this._status.set('success');
    this._error.set(null);
  }

  private setError(message: string): void {
    this._page.set(null);
    this._status.set('error');
    this._error.set(message);
  }
}
