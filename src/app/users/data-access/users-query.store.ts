import { Injectable, computed, signal } from '@angular/core';

import { UserListItem } from './user-list-item.model';
import { UsersPage } from './users-page.model';

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

@Injectable({ providedIn: 'root' })
export class UsersQueryStore {
  private readonly _status = signal<LoadStatus>('idle');
  private readonly _error = signal<string | null>(null);
  private readonly _page = signal<UsersPage<UserListItem> | null>(null);

  readonly status = this._status.asReadonly();
  readonly error = this._error.asReadonly();
  readonly loading = computed(() => this._status() === 'loading');

  readonly users = computed(() => this._page()?.content ?? []);
  readonly hasNext = computed(() => this._page()?.hasNext ?? false);
  readonly hasPrevious = computed(() => this._page()?.hasPrevious ?? false);
  readonly nextId = computed(() => this._page()?.nextId ?? null);
  readonly previousId = computed(() => this._page()?.previousId ?? null);

  startLoading(): void {
    this._status.set('loading');
    this._error.set(null);
  }

  setPage(page: UsersPage<UserListItem>): void {
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
