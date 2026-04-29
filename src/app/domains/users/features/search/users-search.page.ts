import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import {
  AppButtonComponent,
  AppCardComponent,
  AppEmptyStateComponent,
  AppErrorStateComponent,
  AppLoadingStateComponent,
  AppPageComponent,
  AppTextFieldComponent,
} from '../../../../shared/ui';
import { UsersFacade } from '../../application/users.facade';

@Component({
  standalone: true,
  selector: 'app-users-search-page',
  imports: [
    AppButtonComponent,
    AppCardComponent,
    AppEmptyStateComponent,
    AppErrorStateComponent,
    AppLoadingStateComponent,
    AppPageComponent,
    AppTextFieldComponent,
    CommonModule,
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

  ngOnInit(): void {
    this.filtersForm.patchValue(this.facade.filters(), { emitEvent: false });

    this.filtersForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.facade.setFilters({
          id: value.id ?? null,
          username: value.username ?? '',
          email: value.email ?? '',
        });
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
