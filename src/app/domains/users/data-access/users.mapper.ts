import { UserPageDto, UserSummaryDto } from './users.dto';

function mapUserSummaryDto(dto: UserSummaryDto) {
  return {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    enabled: dto.enabled,
    isAdmin: dto.isAdmin,
  };
}

export function mapUserPageDto(dto: UserPageDto) {
  return {
    ...dto,
    content: dto.content.map((user) => mapUserSummaryDto(user)),
  };
}
