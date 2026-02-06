import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HasAuthorityDirective } from './has-authority.directive';
import { AuthService } from '../auth.service';

@Component({
  standalone: true,
  imports: [HasAuthorityDirective],
  template: `
    <div id="secret" *hasAuthority="'MODULE_USERS'">SECRET</div>
  `,
})
class HostComponent {}

describe('HasAuthorityDirective', () => {
  it('shows template when authority exists', () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: AuthService, useValue: { hasAuthority: () => true } }],
    });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#secret')?.textContent).toContain('SECRET');
  });

  it('hides template when authority missing', () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: AuthService, useValue: { hasAuthority: () => false } }],
    });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#secret')).toBeNull();
  });
});
