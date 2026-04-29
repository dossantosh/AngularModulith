import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="border-t border-border bg-surface-muted shadow-sm">
      <div class="mx-auto flex max-w-7xl items-center justify-center px-4 py-4 text-center">
        <p class="text-sm text-muted">
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
