import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';

import { AuthFacade } from '../../../core/auth/session/auth.facade';
import { BackendDataSource } from '../../../core/auth/session/session.model';
import { AppButtonComponent, AppTextFieldComponent } from '../../../shared/ui';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    AppButtonComponent,
    AppTextFieldComponent,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.page.html',
})
export class LoginPage {
  submitted = false;
  loginError: string | null = null;
  readonly isSubmitting = signal(false);

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
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.loginForm.disable({ emitEvent: false });

    this.auth.login(this.loginForm.getRawValue()).subscribe({
      next: () => void this.router.navigateByUrl('/'),
      error: () => {
        this.isSubmitting.set(false);
        this.loginForm.enable({ emitEvent: false });
        this.loginError = 'No se pudo iniciar sesion. Revisa tus credenciales e intentalo de nuevo.';
      },
    });
  }
}
