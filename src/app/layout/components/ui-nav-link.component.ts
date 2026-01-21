import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ui-nav-link',
  standalone: true,
  imports: [RouterModule],
  template: `
    <a
      [routerLink]="to"
      [class]="classes"
    >
      <ng-content></ng-content>
    </a>
  `,
})
export class NavLinkComponent {
  @Input({ required: true }) to!: string;

  get classes(): string {
    return `
      rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600
      transition hover:bg-gray-100 hover:text-gray-900
      focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-300/40
      dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100
      dark:focus-visible:ring-gray-700/40
    `.trim();
  }
}
