import { Injectable, inject } from '@angular/core';

import { UsersQueryStore } from '../data-access/users-query.store';
import { UserSearchFilters } from '../domain/user-search-filters';
import { UsersSearchFlowStore } from '../state/users-search-flow.store';
import { ClearUserFiltersUseCase } from './clear-user-filters.use-case';
import { PaginateUsersUseCase } from './paginate-users.use-case';
import { SearchUsersUseCase } from './search-users.use-case';

@Injectable({ providedIn: 'root' })
export class UsersFacade {
  private readonly flowStore = inject(UsersSearchFlowStore);
  private readonly queryStore = inject(UsersQueryStore);
  private readonly searchUsersUseCase = inject(SearchUsersUseCase);
  private readonly clearUserFiltersUseCase = inject(ClearUserFiltersUseCase);
  private readonly paginateUsersUseCase = inject(PaginateUsersUseCase);

  readonly filters = this.flowStore.filters;
  readonly error = this.queryStore.error;
  readonly loading = this.queryStore.loading;
  readonly users = this.queryStore.users;
  readonly hasNext = this.queryStore.hasNext;
  readonly hasPrevious = this.queryStore.hasPrevious;

  setFilters(partial: Partial<UserSearchFilters>): void {
    this.flowStore.setFilters(partial);
  }

  search(): void {
    this.searchUsersUseCase.execute();
  }

  clearFiltersAndSearch(): void {
    this.clearUserFiltersUseCase.execute();
  }

  loadNext(): void {
    this.paginateUsersUseCase.loadNext();
  }

  loadPrevious(): void {
    this.paginateUsersUseCase.loadPrevious();
  }
}
