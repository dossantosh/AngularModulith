export interface UsersPage<T> {
  content: T[];
  hasNext: boolean;
  hasPrevious: boolean;
  nextId: number | null;
  previousId: number | null;
  empty: boolean;
}
