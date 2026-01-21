import { Component, EventEmitter, Input, Output } from '@angular/core';

type Variant = 'primary' | 'warning';

@Component({
  selector: 'ui-button',
  standalone: true,
  host: {
    class: 'inline-block', // neutral, no width opinion
  },
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [class]="classes"
      (click)="emitClick($event)"
      (keydown.enter)="emitClick($event)"
      (keydown.space)="emitClick($event)"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() variant: Variant = 'primary';

  @Output() clicked = new EventEmitter<Event>();

  emitClick(event: Event): void {
    if (this.disabled) return;
    this.clicked.emit(event);
  }

  get classes(): string {
    const base =
      `rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition
       disabled:cursor-not-allowed disabled:opacity-50`;

    const map: Record<Variant, string> = {
      primary: `bg-blue-600 hover:bg-blue-700 active:bg-blue-800`,
      warning: `bg-amber-500 hover:bg-amber-600 active:bg-amber-700`,
    };

    return `${base} ${map[this.variant]}`;
  }
}
