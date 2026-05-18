import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, switchMap, tap } from 'rxjs';

import {
  type PageDirection,
  type UserPageDto,
  type UserSearchFilters,
  UsersSearchApi,
} from '../services/users-search.api';

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

export type { UserSearchFilters } from '../services/users-search.api';

const DEFAULT_USER_SEARCH_FILTERS: UserSearchFilters = {
  id: null,
  username: '',
  email: '',
};

interface UsersSearchState {
  filters: UserSearchFilters;
  limit: number;
  direction: PageDirection;
  lastId: number | null;
  status: LoadStatus;
  error: string | null;
  page: UserPageDto | null;
}

interface UsersSearchRequest {
  limit: number;
  direction: PageDirection;
  lastId: number | null;
  filters: UserSearchFilters;
}

function createInitialState(): UsersSearchState {
  return {
    filters: { ...DEFAULT_USER_SEARCH_FILTERS },
    limit: 10,
    direction: 'NEXT',
    lastId: null,
    status: 'idle',
    error: null,
    page: null,
  };
}

@Injectable({ providedIn: 'root' })
export class UsersSearchFacade {
  private readonly api = inject(UsersSearchApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchRequests$ = new Subject<UsersSearchRequest>();

  private readonly state = signal<UsersSearchState>(createInitialState());

  readonly filters = computed(() => this.state().filters);
  readonly error = computed(() => this.state().error);
  readonly loading = computed(() => this.state().status === 'loading');
  readonly users = computed(() => this.state().page?.content ?? []);
  readonly hasNext = computed(() => this.state().page?.hasNext ?? false);
  readonly hasPrevious = computed(() => this.state().page?.hasPrevious ?? false);
  private readonly nextId = computed(() => this.state().page?.nextId ?? null);
  private readonly previousId = computed(() => this.state().page?.previousId ?? null);

  constructor() {
    this.searchRequests$
      .pipe(
        tap(() => this.startLoading()),
        switchMap((request) =>
          this.api.searchUsers(request).pipe(
            tap((page) => this.setPage(page)),
            catchError(() => {
              this.setError('Failed to load users');
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  setFilters(partial: Partial<UserSearchFilters>): void {
    this.patchState((state) => ({
      filters: { ...state.filters, ...partial },
      direction: 'NEXT',
      lastId: null,
    }));
  }

  search(): void {
    const { limit, direction, lastId, filters } = this.state();

    this.searchRequests$.next({
      limit,
      direction,
      lastId,
      filters,
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
    this.patchState({ filters: { ...DEFAULT_USER_SEARCH_FILTERS } });
  }

  private resetPagination(): void {
    this.patchState({
      direction: 'NEXT',
      lastId: null,
    });
  }

  private setPagination(direction: PageDirection, lastId: number | null): void {
    this.patchState({ direction, lastId });
  }

  private startLoading(): void {
    this.patchState({
      status: 'loading',
      error: null,
    });
  }

  private setPage(page: UserPageDto): void {
    this.patchState({
      page,
      status: 'success',
      error: null,
    });
  }

  private setError(message: string): void {
    this.patchState({
      page: null,
      status: 'error',
      error: message,
    });
  }

  private patchState(patch: Partial<UsersSearchState>): void;
  private patchState(project: (state: UsersSearchState) => Partial<UsersSearchState>): void;
  private patchState(
    patchOrProject:
      | Partial<UsersSearchState>
      | ((state: UsersSearchState) => Partial<UsersSearchState>),
  ): void {
    this.state.update((state) => ({
      ...state,
      ...(typeof patchOrProject === 'function' ? patchOrProject(state) : patchOrProject),
    }));
  }
}
