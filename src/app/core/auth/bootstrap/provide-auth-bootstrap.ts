import { inject, provideAppInitializer } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AuthApi } from '../api/auth.api';

export function provideAuthBootstrap() {
  return provideAppInitializer(() => firstValueFrom(inject(AuthApi).initCsrf()));
}
