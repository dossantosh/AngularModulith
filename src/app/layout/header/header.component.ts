// libs/.../header/header.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Header component that displays company and user information,
 * and emits a logout event when the user requests to log out.
 * 
 * Inputs:
 * - companyName: The name of the company to display in the header.
 * - userName: The name of the currently logged-in user.
 * 
 * Outputs:
 * - logout: Event emitted when the user triggers a logout action.
 */
@Component({
  selector: 'lib-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [RouterLink, RouterLinkActive],
})
export class HeaderComponent {
  /** The company name to display in the header */
  @Input() companyName = 'My Company';

  /** The logged-in user's name to display in the header */
  @Input() userName = 'User';

  /** Event emitted when the logout action is triggered */
  @Output() logout = new EventEmitter<void>();
}
