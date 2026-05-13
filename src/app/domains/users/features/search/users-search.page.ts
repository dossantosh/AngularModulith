import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import {
  AppButtonComponent,
  AppPageComponent,
  AppSearchFiltersComponent,
  AppSearchResultsComponent,
  AppStatusBadgeComponent,
  AppTextFieldComponent,
} from '../../../../shared/ui';
import { UsersFacade } from '../../application/users.facade';

type UserSearchFormValue = Partial<{
  id: number | null;
  username: string | null;
  email: string | null;
}>;

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
  readonly facade = inject(UsersFacade);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

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

  ngOnInit(): void {
    this.filtersForm.patchValue(this.facade.filters(), { emitEvent: false });

    this.filtersForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(sameUserSearchFilters),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.facade.setFilters({
          id: value.id ?? null,
          username: value.username ?? '',
          email: value.email ?? '',
        });
        this.facade.search();
      });

    this.facade.search();
  }

  searchUsers(): void {
    this.facade.search();
  }

  clearFilters(): void {
    this.filtersForm.reset({ id: null, username: '', email: '' }, { emitEvent: false });
    this.facade.clearFiltersAndSearch();
  }

  loadNext(): void {
    this.facade.loadNext();
  }

  loadPrevious(): void {
    this.facade.loadPrevious();
  }

  userDetailsLink(userId: number): readonly unknown[] {
    return ['/users', userId, 'personal-data'];
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
