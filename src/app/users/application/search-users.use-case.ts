import { Injectable, inject } from '@angular/core';

import { UsersApi } from '../data-access/users.api';
import { UsersQueryStore } from '../data-access/users-query.store';
import { UsersSearchFlowStore } from '../state/users-search-flow.store';

@Injectable({ providedIn: 'root' })
export class SearchUsersUseCase {
  private readonly api = inject(UsersApi);
  private readonly flowStore = inject(UsersSearchFlowStore);
  private readonly queryStore = inject(UsersQueryStore);

  execute(): void {
    this.queryStore.startLoading();

    this.api.search({
      limit: this.flowStore.limit(),
      direction: this.flowStore.direction(),
      lastId: this.flowStore.lastId(),
      filters: this.flowStore.filters(),
    }).subscribe({
      next: (page) => this.queryStore.setPage(page),
      error: () => this.queryStore.setError('Failed to load users'),
    });
  }
}
