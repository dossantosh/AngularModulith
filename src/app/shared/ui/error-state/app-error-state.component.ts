import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { AppButtonComponent } from '../button/app-button.component';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [AppButtonComponent, MatIconModule],
  template: `
    <section
      role="alert"
      aria-live="assertive"
      class="rounded-lg border border-danger bg-danger-container px-4 py-4 text-on-danger-container"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex gap-3">
          <mat-icon aria-hidden="true">error</mat-icon>
          <div>
            <h3 class="text-sm font-semibold">{{ title }}</h3>
            <p class="mt-1 text-sm">{{ message }}</p>
          </div>
        </div>

        @if (actionLabel) {
          <app-button variant="secondary" type="button" (clicked)="retry.emit()">
            {{ actionLabel }}
          </app-button>
        }
      </div>
    </section>
  `,
})
export class AppErrorStateComponent {
  @Input() title = 'No se pudo completar la accion';
  @Input() message = 'Intentalo de nuevo.';
  @Input() actionLabel = '';

  @Output() retry = new EventEmitter<void>();
}
