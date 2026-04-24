export interface UsersSearchRequest {
  limit: number;
  direction: 'NEXT' | 'PREVIOUS';
  lastId: number | null;
  filters: {
    id: number | null;
    username: string;
    email: string;
  };
}
