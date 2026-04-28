// src/test-setup.ts
import 'zone.js';
import 'zone.js/testing';
import '@angular/compiler';

import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

try {
  getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
    teardown: { destroyAfterEach: true },
  });
} catch (error) {
  const alreadyInitialized =
    error instanceof Error && error.message.includes('Cannot set base providers');

  if (!alreadyInitialized) {
    throw error;
  }
}
