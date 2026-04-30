import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';

import { provideAuthBootstrap } from './core/auth/bootstrap/provide-auth-bootstrap';
import { authInterceptor } from './core/auth/http/auth.interceptor';
import { ThemeService } from './core/theme/theme.service';
import { provideNgOpenapi } from './generated/openapi/providers';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAppInitializer(() => void inject(ThemeService)),
    provideAuthBootstrap(),
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
      withInterceptors([authInterceptor])
    ),
    provideNgOpenapi({ basePath: '' }),
    provideBrowserGlobalErrorListeners(),
  ],
};
