import { Injectable, inject } from '@angular/core';

import { ThemeStore } from '../state/theme.store';

type ThemePreference = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeFacade {
  private readonly themeStore = inject(ThemeStore);

  readonly isDark = this.themeStore.isDark;

  initialize(): void {
    const saved = globalThis.localStorage?.getItem('theme') as ThemePreference | null;
    const prefersDark = globalThis.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
    const isDark = saved ? saved === 'dark' : prefersDark;

    this.themeStore.set(isDark);
    this.applyTheme(isDark);
  }

  toggle(): void {
    const next = !this.themeStore.isDark();
    const preference: ThemePreference = next ? 'dark' : 'light';

    this.themeStore.set(next);
    this.applyTheme(next);
    globalThis.localStorage?.setItem('theme', preference);
  }

  private applyTheme(isDark: boolean): void {
    document.documentElement.classList.toggle('dark', isDark);
  }
}
