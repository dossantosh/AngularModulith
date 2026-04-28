import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly _isDark = signal(false);

  readonly isDark = this._isDark.asReadonly();

  set(isDark: boolean): void {
    this._isDark.set(isDark);
  }
}
