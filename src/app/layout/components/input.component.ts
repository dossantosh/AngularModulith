import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type InputType = 'text' | 'number' | 'email' | 'password' | 'search';

@Component({
  selector: 'ui-input',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <input
      [attr.type]="type"
      [attr.placeholder]="placeholder"
      [disabled]="disabled"
      [value]="value"
      (input)="onInput($event)"
      (blur)="handleBlur()"
      [class]="classes"
    />
  `,
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: InputType = 'text';
  @Input() placeholder = '';
  @Input() class = '';

  disabled = false;
  value = '';

  // ---- CVA callbacks (KEEP PRIVATE)
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  // ---- ControlValueAccessor
  writeValue(value: unknown): void {
    this.value = value == null ? '' : String(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // ---- template-safe handlers
  handleBlur(): void {
    this.onTouched();
  }

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;

    if (this.type === 'number') {
      const next = raw === '' ? null : Number(raw);
      this.value = raw;
      this.onChange(Number.isNaN(next as number) ? null : next);
      return;
    }

    this.value = raw;
    this.onChange(raw);
  }

  get classes(): string {
    const base = `w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
    text-gray-900 placeholder:text-gray-400 outline-none
    focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15
    dark:border-gray-600 dark:bg-gray-900
    dark:text-gray-100 dark:placeholder:text-gray-500
    dark:focus:border-blue-500 dark:focus:ring-blue-500/20`;

    return `${base} ${this.class}`.trim();
  }
}
