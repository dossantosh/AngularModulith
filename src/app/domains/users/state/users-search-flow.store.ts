import { Injectable, computed, signal } from '@angular/core';

export type PageDirection = 'NEXT' | 'PREVIOUS';

export interface UserSearchFilters {
  id: number | null;
  username: string;
  email: string;
}

export interface UserListItem {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  isAdmin: boolean;
}

export interface UsersPage {
  content: UserListItem[];
  hasNext: boolean;
  hasPrevious: boolean;
  nextId: number | null;
  previousId: number | null;
  empty: boolean;
}

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

const DEFAULT_USER_SEARCH_FILTERS: UserSearchFilters = {
  id: null,
  username: '',
  email: '',
};

@Injectable({ providedIn: 'root' })
export class UsersSearchFlowStore {
  private readonly _filters = signal<UserSearchFilters>({ ...DEFAULT_USER_SEARCH_FILTERS });
  private readonly _limit = signal<number>(10);
  private readonly _direction = signal<PageDirection>('NEXT');
  private readonly _lastId = signal<number | null>(null);
  private readonly _status = signal<LoadStatus>('idle');
  private readonly _error = signal<string | null>(null);
  private readonly _page = signal<UsersPage | null>(null);

  readonly filters = this._filters.asReadonly();
  readonly limit = this._limit.asReadonly();
  readonly direction = this._direction.asReadonly();
  readonly lastId = this._lastId.asReadonly();
  readonly status = this._status.asReadonly();
  readonly error = this._error.asReadonly();
  readonly loading = computed(() => this._status() === 'loading');
  readonly users = computed(() => this._page()?.content ?? []);
  readonly hasNext = computed(() => this._page()?.hasNext ?? false);
  readonly hasPrevious = computed(() => this._page()?.hasPrevious ?? false);
  readonly nextId = computed(() => this._page()?.nextId ?? null);
  readonly previousId = computed(() => this._page()?.previousId ?? null);

  setFilters(partial: Partial<UserSearchFilters>): void {
    this._filters.set({ ...this._filters(), ...partial });
  }

  resetFilters(): void {
    this._filters.set({ ...DEFAULT_USER_SEARCH_FILTERS });
  }

  resetPagination(): void {
    this._lastId.set(null);
    this._direction.set('NEXT');
  }

  setPagination(direction: PageDirection, lastId: number | null): void {
    this._direction.set(direction);
    this._lastId.set(lastId);
  }

  startLoading(): void {
    this._status.set('loading');
    this._error.set(null);
  }

  setPage(page: UsersPage): void {
    this._page.set(page);
    this._status.set('success');
    this._error.set(null);
  }

  setError(message: string): void {
    this._page.set(null);
    this._status.set('error');
    this._error.set(message);
  }
}
