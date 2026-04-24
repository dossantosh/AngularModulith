import { UserListItem } from './user-list-item.model';
import { UsersPage } from './users-page.model';
import { UserPageDto, UserSummaryDto } from './users.dto';

function mapUserSummaryDto(dto: UserSummaryDto): UserListItem {
  return {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    enabled: dto.enabled,
    isAdmin: dto.isAdmin,
  };
}

export function mapUserPageDto(dto: UserPageDto): UsersPage<UserListItem> {
  return {
    ...dto,
    content: dto.content.map((user) => mapUserSummaryDto(user)),
  };
}
