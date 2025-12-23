import { Component, Input } from '@angular/core';

/**
 * Footer component that displays company information and the current year.
 * 
 * Inputs:
 * - companyName: The name of the company to display.
 * - year: The current year to display.
 */
@Component({
  selector: 'lib-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  @Input() companyName = 'My Company';

  @Input() year = new Date().getFullYear();
}
