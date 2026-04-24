import { Component, EventEmitter, Input, Output } from '@angular/core';

import { FooterComponent } from './footer.component';
import { HeaderComponent } from './header.component';

type ShellDataSource = 'prod' | 'historic';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [FooterComponent, HeaderComponent],
  template: `
    <div class="flex h-dvh flex-col overflow-hidden">
      <app-header
        class="shrink-0"
        [companyName]="companyName"
        [userName]="userName"
        [dataSource]="dataSource"
        [canReadUsers]="canReadUsers"
        [isDark]="isDark"
        (logout)="logout.emit()"
        (toggleTheme)="toggleTheme.emit()"
      />

      <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950">
        <ng-content></ng-content>
      </main>

      <div class="sticky bottom-0 z-20 shrink-0">
        <app-footer [companyName]="companyName" [year]="year"></app-footer>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  @Input() companyName = 'My Company';
  @Input() userName = 'User';
  @Input() dataSource: ShellDataSource = 'prod';
  @Input() canReadUsers = false;
  @Input() isDark = false;

  @Output() logout = new EventEmitter<void>();
  @Output() toggleTheme = new EventEmitter<void>();

  readonly year = new Date().getFullYear();
}
