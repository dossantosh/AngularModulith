/**
 * Direction for keyset pagination.
 *
 * <ul>
 *   <li>{@code NEXT}: page forward using {@code nextId}</li>
 *   <li>{@code PREVIOUS}: page backward using {@code previousId}</li>
 * </ul>
 */
export type PageDirection = 'NEXT' | 'PREVIOUS';

/**
 * Filter fields for the user search endpoint.
 *
 * <p>These correspond to query string parameters accepted by the backend.</p>
 */
export interface UsersFilters {
  id: number | null;
  username: string;
  email: string;
}

/**
 * Parameters used to execute a search request against the users endpoint.
 *
 * <p>This object is assembled by the store and passed to the API layer.</p>
 */
export interface UsersSearchParams {
  limit: number;
  direction: PageDirection;
  lastId: number | null;
  filters: UsersFilters;
}