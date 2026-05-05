import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import {
  AppButtonComponent,
  AppCommandBarComponent,
  AppPageComponent,
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
    AppCommandBarComponent,
    AppPageComponent,
    AppSearchResultsComponent,
    AppStatusBadgeComponent,
    AppTextFieldComponent,
    MatTableModule,
    ReactiveFormsModule,
  ],
  templateUrl: './users-search.page.html',
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
    { label: 'Administracion' },
    { label: 'Usuarios' },
  ];
  readonly displayedColumns = ['id', 'username', 'email', 'enabled', 'admin'];

  ngOnInit(): void {
    this.filtersForm.patchValue(this.facade.filters(), { emitEvent: false });

    this.filtersForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(sameUserSearchFilters),
        takeUntilDestroyed(this.destroyRef)
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
}

function sameUserSearchFilters(
  previous: UserSearchFormValue,
  current: UserSearchFormValue
): boolean {
  return (
    (previous.id ?? null) === (current.id ?? null) &&
    (previous.username ?? '') === (current.username ?? '') &&
    (previous.email ?? '') === (current.email ?? '')
  );
}
