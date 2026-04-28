import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthFacade } from '../application/auth.facade';
import { BackendDataSource } from '../domain/backend-data-source';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  submitted = false;

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
    if (this.loginForm.invalid) return;

    this.auth.login(this.loginForm.getRawValue()).subscribe({
      next: () => void this.router.navigateByUrl('/'),
    });
  }

  get formControls() {
    return this.loginForm.controls;
  }
}
