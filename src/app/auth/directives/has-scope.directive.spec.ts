import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AuthFacade } from '../application/auth.facade';
import { HasScopeDirective } from './has-scope.directive';

@Component({
  standalone: true,
  imports: [HasScopeDirective],
  template: `<span *appHasScope="'users:create'">Create user</span>`,
})
class HostComponent {}

describe('HasScopeDirective', () => {
  it('renders content when the user has the required scope', () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        {
          provide: AuthFacade,
          useValue: {
            hasAllScopes: vi.fn(() => true),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Create user');
  });

  it('hides content when the user lacks the required scope', () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        {
          provide: AuthFacade,
          useValue: {
            hasAllScopes: vi.fn(() => false),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Create user');
  });
});
