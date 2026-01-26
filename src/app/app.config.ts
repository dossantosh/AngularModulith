import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';

import { routes } from './app.routes';

import { authInterceptor } from './core/auth/interceptors/auth.interceptor';

/**
 * Root application configuration for the shell.
 *
 * This configuration sets up:
 * - Global error handling
 * - Optimized change detection
 * - Routing
 * - HTTP client with authentication interceptor
 * - Animations for Angular Material
 * - Shared error handling (notifications + error interceptor)
 * - Environment configuration for backend services
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * Configures Angular change detection to coalesce events,
     * reducing the number of change detection cycles triggered
     * during high-frequency DOM events.
     */
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(routes),

    /**
     * Configures the HTTP client and attaches the authentication interceptor
     * for adding auth headers to outgoing requests.
     */
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
      withInterceptors([authInterceptor])
    ),

    /**
     * Registers global error listeners for unhandled errors and promise rejections.
     * Useful for logging, monitoring, and displaying fallback UIs.
     */
    provideBrowserGlobalErrorListeners(),
  ],
};
