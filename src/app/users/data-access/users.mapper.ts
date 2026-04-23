import { UserPage } from '../domain/user-page';
import { UserSummary } from '../domain/user-summary';
import { UserPageDto, UserSummaryDto } from './users.dto';

function mapUserSummaryDto(dto: UserSummaryDto): UserSummary {
  return {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    enabled: dto.enabled,
    isAdmin: dto.isAdmin,
  };
}

export function mapUserPageDto(dto: UserPageDto): UserPage<UserSummary> {
  return {
    ...dto,
    content: dto.content.map((user) => mapUserSummaryDto(user)),
  };
}
