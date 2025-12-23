import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * Root application component.
 * Serves as the host for routed views via <router-outlet>.
 */
@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
})
export class App {
  protected title = 'Modulith Application';
}
