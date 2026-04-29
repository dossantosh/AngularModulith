import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { vi } from 'vitest';

import { AuthFacade } from '../../../core/auth/session/auth.facade';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let authFacade: { login: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authFacade = {
      login: vi.fn(() => throwError(() => new Error('Invalid credentials'))),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthFacade, useValue: authFacade },
        { provide: Router, useValue: { navigateByUrl: vi.fn() } },
      ],
    });

    TestBed.overrideComponent(LoginPage, {
      set: {
        template: `
          @if (loginError) {
            <p role="alert">{{ loginError }}</p>
          }
        `,
      },
    });

    fixture = TestBed.createComponent(LoginPage);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('does not try to login when the form is invalid', () => {
    fixture.componentInstance.onSubmit();

    expect(authFacade.login).not.toHaveBeenCalled();
  });

  it('shows an accessible error when authentication fails', () => {
    fixture.componentInstance.loginForm.setValue({
      username: 'bad-user',
      password: 'bad-password',
      dataSource: 'prod',
    });

    fixture.componentInstance.onSubmit();
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement | null;

    expect(alert?.textContent).toContain('No se pudo iniciar sesion');
  });
});
