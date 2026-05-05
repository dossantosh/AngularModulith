import { Component, booleanAttribute, effect, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

type TextFieldType = 'text' | 'number' | 'email' | 'password' | 'search';

const DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  required: 'Este campo es obligatorio.',
  email: 'Introduce un email valido.',
};

@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  template: `
    <mat-form-field class="w-full" appearance="outline">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        [type]="type()"
        [formControl]="control()"
        [attr.autocomplete]="autocomplete() || null"
        [attr.inputmode]="inputMode() || null"
        [attr.aria-describedby]="ariaDescribedBy() || null"
      />

      @if (hint() && !errorMessage) {
        <mat-hint>{{ hint() }}</mat-hint>
      }

      @if (errorMessage) {
        <mat-error>{{ errorMessage }}</mat-error>
      }
    </mat-form-field>
  `,
})
export class AppTextFieldComponent {
  readonly label = input.required<string>();
  readonly control = input.required<FormControl>();
  readonly type = input<TextFieldType>('text');
  readonly autocomplete = input('');
  readonly inputMode = input('');
  readonly hint = input('');
  readonly ariaDescribedBy = input('');
  readonly errorMessages = input<Partial<Record<string, string>>>({});
  readonly showErrors = input(false, { transform: booleanAttribute });

  constructor() {
    effect(() => {
      const control = this.control();
      if (this.showErrors() && control.invalid) {
        control.markAsTouched({ onlySelf: true });
      }
    });
  }

  get errorMessage(): string | null {
    const control = this.control();
    if (!control.errors || !(this.showErrors() || control.touched || control.dirty)) {
      return null;
    }

    const firstError = Object.keys(control.errors)[0];
    return this.errorMessages()[firstError] ?? DEFAULT_ERROR_MESSAGES[firstError] ?? 'Valor no valido.';
  }
}
