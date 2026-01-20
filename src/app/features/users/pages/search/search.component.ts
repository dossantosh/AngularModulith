import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UsersStore } from '../../data-access/users.store';

import { PageComponent } from '../../../../layout/components/page.component';
import { CardComponent } from '../../../../layout/components/card.component';
import { InputComponent } from '../../../../layout/components/input.component';
import { ButtonComponent } from '../../../../layout/components/button.component';

@Component({
  standalone: true,
  selector: 'app-users-search',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PageComponent, CardComponent, InputComponent, ButtonComponent],
  templateUrl: './search.component.html',
})
export class UsersSearchPage implements OnInit {
  readonly store = inject(UsersStore);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  // UI-only
  readonly year = new Date().getFullYear();

  // Form is just UI binding (store remains source of truth)
  readonly filtersForm = this.fb.nonNullable.group({
    id: this.fb.control<number | null>(null),
    username: this.fb.control<string>(''),
    email: this.fb.control<string>(''),
  });

  ngOnInit(): void {
    // sync initial store -> form
    this.filtersForm.patchValue(this.store.filters(), { emitEvent: false });

    // sync form -> store (no business logic here)
    this.filtersForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => {
        this.store.setFilters({
          id: v.id ?? null,
          username: v.username ?? '',
          email: v.email ?? '',
        });
      });

    // initial load
    this.store.search();
  }

  searchUsers(): void {
    // just command
    this.store.search();
  }

  clearFilters(): void {
    this.filtersForm.reset({ id: null, username: '', email: '' }, { emitEvent: false });
    this.store.clearFiltersAndSearch();
  }

  loadNext(): void {
    this.store.loadNext();
  }

  loadPrevious(): void {
    this.store.loadPrevious();
  }
}
