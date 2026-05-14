import { Injectable, inject } from '@angular/core';

import { UserProfileApi, type UpdateUserPersonalDataCommand } from '../data-access/user-profile.api';

export type {
  ContractTypeDto,
  EmployeeStatusDto,
  UpdateUserPersonalDataCommand,
  UserPersonalDataDto,
} from '../data-access/user-profile.api';

@Injectable({ providedIn: 'root' })
export class UserProfileFacade {
  private readonly api = inject(UserProfileApi);

  loadPersonalData(userId: number) {
    return this.api.getUserPersonalData(userId);
  }

  updatePersonalData(userId: number, command: UpdateUserPersonalDataCommand) {
    return this.api.updateUserPersonalData(userId, command);
  }
}
