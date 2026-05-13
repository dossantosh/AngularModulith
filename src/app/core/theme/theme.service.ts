import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'theme';
  private readonly themeSignal = signal<ThemeMode>(this.getInitialTheme());

  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    this.applyTheme(this.themeSignal());
  }

  toggleTheme(): void {
    this.setTheme(this.themeSignal() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: ThemeMode): void {
    this.themeSignal.set(theme);
    this.writeStoredTheme(theme);
    this.applyTheme(theme);
  }

  private getInitialTheme(): ThemeMode {
    const stored = this.readStoredTheme();
    if (stored) return stored;

    return globalThis.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
  }

  private readStoredTheme(): ThemeMode | null {
    try {
      const stored = globalThis.localStorage?.getItem(this.storageKey);
      return isThemeMode(stored) ? stored : null;
    } catch {
      return null;
    }
  }

  private writeStoredTheme(theme: ThemeMode): void {
    try {
      globalThis.localStorage?.setItem(this.storageKey, theme);
    } catch {
      // Storage may be unavailable in restricted browser/test contexts.
    }
  }

  private applyTheme(theme: ThemeMode): void {
    const root = globalThis.document?.documentElement;
    if (!root) return;

    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
  }
}

function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value === 'light' || value === 'dark';
}
