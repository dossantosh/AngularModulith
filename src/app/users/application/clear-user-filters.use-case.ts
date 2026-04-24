import { Injectable, inject } from '@angular/core';

import { UsersSearchFlowStore } from '../state/users-search-flow.store';
import { SearchUsersUseCase } from './search-users.use-case';

@Injectable({ providedIn: 'root' })
export class ClearUserFiltersUseCase {
  private readonly flowStore = inject(UsersSearchFlowStore);
  private readonly searchUsersUseCase = inject(SearchUsersUseCase);

  execute(): void {
    this.flowStore.resetFilters();
    this.flowStore.resetPagination();
    this.searchUsersUseCase.execute();
  }
}
