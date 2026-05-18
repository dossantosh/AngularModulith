import { Component, input } from '@angular/core';

import { type AppNavNode } from '../../navigation/app-nav-node';
import { type AppBreadcrumbItem } from '../../navigation/breadcrumb/app-breadcrumb.component';
import { AppSectionNavComponent } from '../../navigation/section-nav/app-section-nav.component';
import { AppPageComponent } from '../page/app-page.component';

@Component({
  selector: 'app-manage-shell',
  standalone: true,
  imports: [AppPageComponent, AppSectionNavComponent],
  template: `
    <app-page
      [title]="title()"
      [subtitle]="subtitle()"
      [eyebrow]="eyebrow()"
      [layout]="layout()"
      [breadcrumbs]="breadcrumbs()"
    >
      <app-section-nav
        class="mb-4 block"
        [items]="sectionItems()"
        [activeItemKey]="activeSectionKey()"
      />

      <ng-content />
    </app-page>
  `,
})
export class AppManageShellComponent {
  readonly title = input('');
  readonly subtitle = input('');
  readonly eyebrow = input('');
  readonly layout = input<'default' | 'wide' | 'full'>('full');
  readonly breadcrumbs = input<readonly AppBreadcrumbItem[]>([]);
  readonly sectionItems = input<readonly AppNavNode[]>([]);
  readonly activeSectionKey = input<string | null>(null);
}
