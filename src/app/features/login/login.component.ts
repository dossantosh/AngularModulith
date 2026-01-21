// login.component.ts
import { Component, OnInit, inject } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.auth.initCsrf().subscribe();
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) return;

    this.auth.login(this.loginForm.value).subscribe({
      next: () => void this.router.navigateByUrl('/'),
    });
  }

  get f() {
    return this.loginForm.controls;
  }
}
