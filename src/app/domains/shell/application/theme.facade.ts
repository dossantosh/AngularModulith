import { Injectable, signal } from '@angular/core';

type ThemePreference = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeFacade {
  private readonly _isDark = signal(false);

  readonly isDark = this._isDark.asReadonly();

  initialize(): void {
    const saved = globalThis.localStorage?.getItem('theme') as ThemePreference | null;
    const prefersDark = globalThis.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
    const isDark = saved ? saved === 'dark' : prefersDark;

    this._isDark.set(isDark);
    this.applyTheme(isDark);
  }

  toggle(): void {
    const next = !this._isDark();
    const preference: ThemePreference = next ? 'dark' : 'light';

    this._isDark.set(next);
    this.applyTheme(next);
    globalThis.localStorage?.setItem('theme', preference);
  }

  private applyTheme(isDark: boolean): void {
    document.documentElement.classList.toggle('dark', isDark);
  }
}
