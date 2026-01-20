// index.component.ts
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { AuthService } from '../../core/auth/auth.service';

import { CardComponent } from '../../layout/components/card.component';
import { PageComponent } from '../../layout/components/page.component';
import { InputComponent } from '../../layout/components/input.component';
import { ButtonComponent } from '../../layout/components/button.component';

@Component({
  standalone: true,
  selector: 'app-index',
  imports: [CommonModule, RouterModule, CardComponent, PageComponent, InputComponent, ButtonComponent],
  templateUrl: './index.component.html',
})
export class IndexComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  year = new Date().getFullYear();

  // Observable -> Signal
  private readonly usernameSig = toSignal(this.auth.username$, { initialValue: null });

  userName = computed(() => this.usernameSig() ?? 'Guest');

  constructor() {

  }

  logout() {
    this.auth.logout().subscribe({
      next: () => void this.router.navigateByUrl('/login'),
      error: () => void this.router.navigateByUrl('/login'),
    });
  }
}
