import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import {
  EMPTY,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs';

import {
  AppButtonComponent,
  AppPageComponent,
  AppSearchFiltersComponent,
  AppSearchResultsComponent,
  AppStatusBadgeComponent,
  AppTextFieldComponent,
} from '../../../../shared/ui';
import {
  type PageDirection,
  type UserPageDto,
  type UserSearchFilters,
  UsersSearchApi,
} from '../../api/users-search.api';

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

type UserSearchFormValue = Partial<{
  id: number | null;
  username: string | null;
  email: string | null;
}>;

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

@Component({
  standalone: true,
  selector: 'app-users-search-page',
  imports: [
    AppButtonComponent,
    AppPageComponent,
    AppSearchFiltersComponent,
    AppSearchResultsComponent,
    AppStatusBadgeComponent,
    AppTextFieldComponent,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './users-search.page.html',
  styles: `
    .users-results-table {
      table-layout: fixed;
      width: 100%;
    }

    .users-results-table__id {
      width: 7rem;
    }

    .users-results-table__username {
      width: 18rem;
    }

    .users-results-table__email {
      width: 38%;
    }

    .users-results-table__status,
    .users-results-table__admin {
      width: 10rem;
    }

    .users-results-table__actions {
      text-align: right;
      width: 5rem;
    }

    .users-results-table__action-link {
      color: var(--mat-sys-primary);
    }

    .users-results-table th,
    .users-results-table td {
      height: 3.25rem;
      vertical-align: middle;
    }

    .users-results-table td {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
})
export class UsersSearchPage implements OnInit {
  private readonly fb = inject(FormBuilder);
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

  readonly filtersForm = this.fb.nonNullable.group({
    id: this.fb.control<number | null>(null),
    username: this.fb.control<string>(''),
    email: this.fb.control<string>(''),
  });
  readonly breadcrumbs = [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Sistemas' },
    { label: 'Usuarios' },
  ];
  readonly displayedColumns = ['id', 'username', 'email', 'enabled', 'admin', 'actions'];

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

  ngOnInit(): void {
    this.filtersForm.patchValue(this.filters(), { emitEvent: false });

    this.filtersForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(sameUserSearchFilters),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.setFilters({
          id: value.id ?? null,
          username: value.username ?? '',
          email: value.email ?? '',
        });
        this.search();
      });

    this.search();
  }

  searchUsers(): void {
    this.search();
  }

  clearFilters(): void {
    this.filtersForm.reset({ id: null, username: '', email: '' }, { emitEvent: false });
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

  userDetailsLink(userId: number): readonly unknown[] {
    return ['/users', userId, 'personal-data'];
  }

  private setFilters(partial: Partial<UserSearchFilters>): void {
    this.patchState((state) => ({
      filters: { ...state.filters, ...partial },
      direction: 'NEXT',
      lastId: null,
    }));
  }

  private search(): void {
    const { limit, direction, lastId, filters } = this.state();

    this.searchRequests$.next({
      limit,
      direction,
      lastId,
      filters,
    });
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

function sameUserSearchFilters(
  previous: UserSearchFormValue,
  current: UserSearchFormValue,
): boolean {
  return (
    (previous.id ?? null) === (current.id ?? null) &&
    (previous.username ?? '') === (current.username ?? '') &&
    (previous.email ?? '') === (current.email ?? '')
  );
}
