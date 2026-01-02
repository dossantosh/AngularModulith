/**
 * Generic keyset-pagination response wrapper returned by the backend.
 *
 * <p>Keyset pagination uses a cursor-like identifier (e.g. lastId) rather than
 * an offset to page through results efficiently.</p>
 *
 * @typeParam T the content item type contained in the page.
 */
export interface KeysetPage<T> {
  content: T[];
  hasNext: boolean;
  hasPrevious: boolean;
  nextId: number | null;
  previousId: number | null;
  empty: boolean;
}