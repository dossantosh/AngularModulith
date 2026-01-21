import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-card',
  standalone: true,
  template: `
    <section
      class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200
             dark:bg-gray-800 dark:ring-gray-700"
      [class.p-6]="padded"
      [class.overflow-hidden]="overflowHidden"
    >
      <ng-content></ng-content>
    </section>
  `,
})
export class CardComponent {
  @Input() padded = true;
  @Input() overflowHidden = false;
}
