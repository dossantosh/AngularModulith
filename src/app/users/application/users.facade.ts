import { Injectable, inject } from '@angular/core';

import { UsersApi } from '../data-access/users.api';
import { UserSearchFilters, UsersSearchFlowStore } from '../state/users-search-flow.store';

@Injectable({ providedIn: 'root' })
export class UsersFacade {
  private readonly api = inject(UsersApi);
  private readonly store = inject(UsersSearchFlowStore);

  readonly filters = this.store.filters;
  readonly error = this.store.error;
  readonly loading = this.store.loading;
  readonly users = this.store.users;
  readonly hasNext = this.store.hasNext;
  readonly hasPrevious = this.store.hasPrevious;

  setFilters(partial: Partial<UserSearchFilters>): void {
    this.store.setFilters(partial);
  }

  search(): void {
    this.store.startLoading();

    this.api.search({
      limit: this.store.limit(),
      direction: this.store.direction(),
      lastId: this.store.lastId(),
      filters: this.store.filters(),
    }).subscribe({
      next: (page) => this.store.setPage(page),
      error: () => this.store.setError('Failed to load users'),
    });
  }

  clearFiltersAndSearch(): void {
    this.store.resetFilters();
    this.store.resetPagination();
    this.search();
  }

  loadNext(): void {
    const nextId = this.store.nextId();
    if (!this.store.hasNext() || nextId == null) return;

    this.store.setPagination('NEXT', nextId);
    this.search();
  }

  loadPrevious(): void {
    const previousId = this.store.previousId();
    if (!this.store.hasPrevious() || previousId == null) return;

    this.store.setPagination('PREVIOUS', previousId);
    this.search();
  }
}
