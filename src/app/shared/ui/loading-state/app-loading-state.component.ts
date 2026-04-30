import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div role="status" aria-live="polite" class="flex items-center justify-center gap-3 px-4 py-10 text-sm app-text-muted">
      <mat-progress-spinner mode="indeterminate" diameter="24" aria-hidden="true" />
      <span>{{ message() }}</span>
    </div>
  `,
})
export class AppLoadingStateComponent {
  readonly message = input('Cargando...');
}
