import { Component, input } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="border-t app-border app-surface-muted app-shadow-sm">
      <div class="mx-auto flex max-w-7xl items-center justify-center px-4 py-4 text-center">
        <p class="text-sm app-text-muted">
          &copy; {{ year() }} {{ companyName() }} - Todos los derechos reservados
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly companyName = input('My Company');
  readonly year = input(new Date().getFullYear());
}
