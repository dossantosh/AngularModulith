import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { AppTextFieldComponent } from './app-text-field.component';

@Component({
  standalone: true,
  imports: [AppTextFieldComponent, ReactiveFormsModule],
  template: `
    <app-text-field
      label="Usuario"
      autocomplete="username"
      [control]="control"
      [showErrors]="showErrors"
      [errorMessages]="{ required: 'Usuario obligatorio.' }"
    />
  `,
})
class TextFieldHostComponent {
  control = new FormControl('', { nonNullable: true, validators: Validators.required });
  showErrors = false;
}

describe('AppTextFieldComponent', () => {
  let fixture: ComponentFixture<TextFieldHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TextFieldHostComponent],
    });

    fixture = TestBed.createComponent(TextFieldHostComponent);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders a visible Material label', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Usuario');
  });

  it('shows normalized validation messages when requested', () => {
    fixture.componentInstance.showErrors = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Usuario obligatorio.');
  });

  it('writes user input into the form control', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = 'ana';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('ana');
  });
});
