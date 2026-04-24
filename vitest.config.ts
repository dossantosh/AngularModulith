// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [resolve(__dirname, 'src/test-setup.ts')],

    deps: {
      optimizer: {
        client: {
          include: [
            '@angular/core',
            '@angular/common',
            '@angular/platform-browser',
            '@angular/platform-browser/testing',
            '@angular/router',
            '@angular/common/http',
            '@angular/common/http/testing',

            // runtime deps
            'rxjs',
            'zone.js',
          ],
        },
      },
    },
  },
});
