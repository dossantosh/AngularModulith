import { Component, input } from '@angular/core';

import { AppCommandBarComponent } from '../command-bar/app-command-bar.component';

@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [AppCommandBarComponent],
  template: `
    <app-command-bar [title]="title()" [subtitle]="subtitle()">
      <span command-actions>
        <ng-content select="[search-filter-actions]" />
      </span>

      <div class="grid grid-cols-1 items-center gap-3 sm:grid-cols-2 lg:grid-cols-[180px_1fr_1fr]">
        <ng-content />
      </div>
    </app-command-bar>
  `,
})
export class AppSearchFiltersComponent {
  readonly title = input('Filtros');
  readonly subtitle = input('');
}
