import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';

import { AuthFacade } from '../../../core/auth/session/auth.facade';
import { BackendDataSource } from '../../../core/auth/session/session.model';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, ReactiveFormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  submitted = false;
  loginError: string | null = null;

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthFacade);
  private readonly router = inject(Router);

  readonly loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    dataSource: this.fb.nonNullable.control<BackendDataSource>('prod', Validators.required),
  });

  onSubmit(): void {
    this.submitted = true;
    this.loginError = null;
    if (this.loginForm.invalid) return;

    this.auth.login(this.loginForm.getRawValue()).subscribe({
      next: () => void this.router.navigateByUrl('/'),
      error: () => {
        this.loginError = 'No se pudo iniciar sesion. Revisa tus credenciales e intentalo de nuevo.';
      },
    });
  }

  get formControls() {
    return this.loginForm.controls;
  }
}
