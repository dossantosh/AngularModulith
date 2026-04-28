import { inject, provideAppInitializer } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AuthApi } from '../data-access/auth.api';

export function provideAuthBootstrap() {
  return provideAppInitializer(() => firstValueFrom(inject(AuthApi).initCsrf()));
}
