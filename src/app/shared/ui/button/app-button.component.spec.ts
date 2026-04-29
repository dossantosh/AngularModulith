import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AppButtonComponent } from './app-button.component';

@Component({
  standalone: true,
  imports: [AppButtonComponent],
  template: `
    <app-button
      variant="primary"
      type="button"
      [loading]="loading"
      (clicked)="onClicked()"
    >
      Guardar
    </app-button>
  `,
})
class ButtonHostComponent {
  loading = false;
  onClicked = vi.fn();
}

describe('AppButtonComponent', () => {
  let fixture: ComponentFixture<ButtonHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ButtonHostComponent],
    });

    fixture = TestBed.createComponent(ButtonHostComponent);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('emits clicks when enabled', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    button.click();

    expect(fixture.componentInstance.onClicked).toHaveBeenCalledOnce();
  });

  it('disables the underlying button while loading', () => {
    fixture.componentInstance.loading = true;
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Guardar');
  });
});
