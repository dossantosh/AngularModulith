import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthFacade } from '../application/auth.facade';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  submitted = false;

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthFacade);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      view: ['prod', Validators.required],
    });
  }

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
