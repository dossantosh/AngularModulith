import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-white ring-1 ring-gray-200 shadow-sm dark:bg-gray-900 dark:ring-gray-800">
      <div class="mx-auto flex max-w-7xl items-center justify-center px-4 py-4 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          &copy; {{ year }} {{ companyName }} - Todos los derechos reservados
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  @Input() companyName = 'My Company';
  @Input() year = new Date().getFullYear();
}
