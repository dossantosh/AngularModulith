/**
 * Data Transfer Object (DTO) representing a searched user as returned by the backend API.
 * Contains essential user information for display in user search results.
 */

export interface SearchUsersDTO {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  isAdmin: boolean;
}