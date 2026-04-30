import { booleanAttribute, Component, input, output } from '@angular/core';

import { AppButtonComponent } from '../button/app-button.component';

@Component({
  selector: 'app-pagination-bar',
  standalone: true,
  imports: [AppButtonComponent],
  template: `
    <nav
      [attr.aria-label]="ariaLabel()"
      class="flex items-center justify-between gap-3 border-t app-border px-4 py-3"
    >
      <app-button
        variant="secondary"
        type="button"
        [ariaLabel]="previousAriaLabel()"
        [disabled]="previousDisabled()"
        (clicked)="previous.emit()"
      >
        {{ previousLabel() }}
      </app-button>

      <app-button
        variant="secondary"
        type="button"
        [ariaLabel]="nextAriaLabel()"
        [disabled]="nextDisabled()"
        (clicked)="next.emit()"
      >
        {{ nextLabel() }}
      </app-button>
    </nav>
  `,
})
export class AppPaginationBarComponent {
  readonly ariaLabel = input('Paginacion');
  readonly previousLabel = input('Anterior');
  readonly nextLabel = input('Siguiente');
  readonly previousAriaLabel = input('Cargar pagina anterior');
  readonly nextAriaLabel = input('Cargar pagina siguiente');
  readonly previousDisabled = input(false, { transform: booleanAttribute });
  readonly nextDisabled = input(false, { transform: booleanAttribute });

  readonly previous = output<void>();
  readonly next = output<void>();
}
