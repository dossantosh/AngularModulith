import { Component, Input } from '@angular/core';

import { NavLinkComponent } from '@angular-modulith/shared/ui';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NavLinkComponent],
  template: `
    <footer class="bg-white ring-1 ring-gray-200 shadow-sm dark:bg-gray-900 dark:ring-gray-800">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 text-center sm:flex-row sm:text-left">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          &copy; {{ year }} {{ companyName }} - Todos los derechos reservados
        </p>

        <nav class="flex gap-1">
          <ui-nav-link to="/about">Acerca de</ui-nav-link>
          <ui-nav-link to="/contact">Contacto</ui-nav-link>
          <ui-nav-link to="/help">Ayuda</ui-nav-link>
        </nav>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  @Input() companyName = 'My Company';
  @Input() year = new Date().getFullYear();
}
