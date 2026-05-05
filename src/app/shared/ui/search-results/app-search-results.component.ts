import { booleanAttribute, Component, input, output } from '@angular/core';

import { AppCardComponent } from '../card/app-card.component';
import { AppEmptyStateComponent } from '../empty-state/app-empty-state.component';
import { AppErrorStateComponent } from '../error-state/app-error-state.component';
import { AppLoadingStateComponent } from '../loading-state/app-loading-state.component';
import { AppPaginationBarComponent } from '../pagination-bar/app-pagination-bar.component';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    AppCardComponent,
    AppEmptyStateComponent,
    AppErrorStateComponent,
    AppLoadingStateComponent,
    AppPaginationBarComponent,
  ],
  template: `
    <app-card
      [title]="title()"
      [subtitle]="subtitle()"
      [padded]="false"
      [overflowHidden]="true"
    >
      <span card-actions>
        @if (loading()) {
          <span role="status" aria-live="polite" class="text-sm app-text-muted">
            {{ loadingMessage() }}
          </span>
        }

        <ng-content select="[result-actions]" />
      </span>

      @if (error()) {
        <div class="p-4">
          <app-error-state
            [title]="errorTitle()"
            [message]="error()!"
            [actionLabel]="retryLabel()"
            (retry)="retry.emit()"
          />
        </div>
      } @else if (loading() && empty()) {
        <app-loading-state [message]="loadingMessage()" />
      } @else if (empty()) {
        <app-empty-state
          [icon]="emptyIcon()"
          [title]="emptyTitle()"
          [message]="emptyMessage()"
        >
          <ng-content select="[empty-actions]" />
        </app-empty-state>
      } @else {
        <ng-content />
      }

      @if (showPagination()) {
        <app-pagination-bar
          [ariaLabel]="paginationAriaLabel()"
          [previousAriaLabel]="previousAriaLabel()"
          [nextAriaLabel]="nextAriaLabel()"
          [previousDisabled]="previousDisabled()"
          [nextDisabled]="nextDisabled()"
          (previous)="previous.emit()"
          (next)="next.emit()"
        />
      }
    </app-card>
  `,
})
export class AppSearchResultsComponent {
  readonly title = input('Resultados');
  readonly subtitle = input('');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly empty = input(false, { transform: booleanAttribute });
  readonly error = input<string | null>(null);

  readonly loadingMessage = input('Cargando resultados...');
  readonly errorTitle = input('No se pudieron cargar los resultados');
  readonly retryLabel = input('Reintentar');
  readonly emptyIcon = input('inbox');
  readonly emptyTitle = input('Sin resultados');
  readonly emptyMessage = input('No hay resultados para mostrar.');

  readonly showPagination = input(true, { transform: booleanAttribute });
  readonly paginationAriaLabel = input('Paginacion de resultados');
  readonly previousAriaLabel = input('Cargar pagina anterior');
  readonly nextAriaLabel = input('Cargar pagina siguiente');
  readonly previousDisabled = input(false, { transform: booleanAttribute });
  readonly nextDisabled = input(false, { transform: booleanAttribute });

  readonly retry = output<void>();
  readonly previous = output<void>();
  readonly next = output<void>();
}
