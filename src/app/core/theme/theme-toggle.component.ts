import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ThemeService } from './theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button
      mat-icon-button
      type="button"
      aria-label="Cambiar tema"
      (click)="themeService.toggleTheme()"
    >
      <mat-icon>
        {{ themeService.theme() === 'dark' ? 'light_mode' : 'dark_mode' }}
      </mat-icon>
    </button>
  `,
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);
}
