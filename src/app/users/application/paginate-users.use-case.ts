import { Injectable, inject } from '@angular/core';

import { UsersQueryStore } from '../data-access/users-query.store';
import { UsersSearchFlowStore } from '../state/users-search-flow.store';
import { SearchUsersUseCase } from './search-users.use-case';

@Injectable({ providedIn: 'root' })
export class PaginateUsersUseCase {
  private readonly flowStore = inject(UsersSearchFlowStore);
  private readonly queryStore = inject(UsersQueryStore);
  private readonly searchUsersUseCase = inject(SearchUsersUseCase);

  loadNext(): void {
    const nextId = this.queryStore.nextId();
    if (!this.queryStore.hasNext() || nextId == null) return;

    this.flowStore.setPagination('NEXT', nextId);
    this.searchUsersUseCase.execute();
  }

  loadPrevious(): void {
    const previousId = this.queryStore.previousId();
    if (!this.queryStore.hasPrevious() || previousId == null) return;

    this.flowStore.setPagination('PREVIOUS', previousId);
    this.searchUsersUseCase.execute();
  }
}
