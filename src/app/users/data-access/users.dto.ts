export interface UserSummaryDto {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  isAdmin: boolean;
}

export interface UserPageDto {
  content: UserSummaryDto[];
  hasNext: boolean;
  hasPrevious: boolean;
  nextId: number | null;
  previousId: number | null;
  empty: boolean;
}
