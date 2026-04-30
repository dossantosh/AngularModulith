import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
      @if (icon()) {
        <mat-icon class="app-text-muted" aria-hidden="true">{{ icon() }}</mat-icon>
      }

      <div>
        <h3 class="text-sm font-medium app-text">
          {{ title() }}
        </h3>
        <p class="mt-1 max-w-md text-sm app-text-muted">
          {{ message() }}
        </p>
      </div>

      <div class="flex flex-wrap justify-center gap-2">
        <ng-content />
      </div>
    </div>
  `,
})
export class AppEmptyStateComponent {
  readonly icon = input('inbox');
  readonly title = input('Sin datos');
  readonly message = input('No hay informacion disponible.');
}
