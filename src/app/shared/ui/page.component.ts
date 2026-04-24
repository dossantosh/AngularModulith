import { Component } from '@angular/core';

@Component({
  selector: 'ui-page',
  standalone: true,
  template: `
    <div class="flex min-h-screen flex-col bg-gray-100 dark:bg-gray-800">
      <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <ng-content></ng-content>
      </main>
    </div>
  `,
})
export class PageComponent {}
