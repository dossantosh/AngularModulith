import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { UsersStore } from '../../data-access/users.store';

/**
 * Users search page (routeable component).
 *
 * <p>This component is intentionally thin:
 * <ul>
 *   <li>Holds only display-only UI properties</li>
 *   <li>Binds to store signals for data, loading, and pagination</li>
 *   <li>Delegates all business/state logic to {@link UsersStore}</li>
 * </ul>
 */
@Component({
  standalone: true,
  selector: 'app-users-search',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class UsersSearchPage implements OnInit {
  store = inject(UsersStore);

  // Display data (keep here; it's UI-only)
  userName = 'Temporal Name';
  companyName = 'Temporal Name';
  year = new Date().getFullYear();

  ngOnInit(): void {
    this.store.search();
  }

  // convenience for template/ngModel
  get filters() {
    return this.store.filters();
  }

  onIdChange(v: number | null) {
    this.store.setFilters({ id: v });
  }
  onUsernameChange(v: string) {
    this.store.setFilters({ username: v });
  }
  onEmailChange(v: string) {
    this.store.setFilters({ email: v });
  }

  searchUsers() {
    this.store.search();
  }
  clearFilters() {
    this.store.clearFiltersAndSearch();
  }
  loadNext() {
    this.store.loadNext();
  }
  loadPrevious() {
    this.store.loadPrevious();
  }
}
