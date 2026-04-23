export type PageDirection = 'NEXT' | 'PREVIOUS';

export interface UserSearchFilters {
  id: number | null;
  username: string;
  email: string;
}

export interface UserSearchQuery {
  limit: number;
  direction: PageDirection;
  lastId: number | null;
  filters: UserSearchFilters;
}

export const DEFAULT_USER_SEARCH_FILTERS: UserSearchFilters = {
  id: null,
  username: '',
  email: '',
};
