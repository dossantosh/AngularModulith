import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject, signal } from '@angular/core';

import { AuthFacade } from '../session/auth.facade';

@Directive({
  selector: '[appHasScope]',
  standalone: true,
})
export class HasScopeDirective {
  private readonly auth = inject(AuthFacade);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly requiredScopes = signal<readonly string[]>([]);

  private hasView = false;

  constructor() {
    effect(() => {
      const requiredScopes = this.requiredScopes();
      const canShow = requiredScopes.length === 0 || this.auth.hasAllScopes(requiredScopes);

      if (canShow && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      }

      if (!canShow && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }

  @Input()
  set appHasScope(value: string | readonly string[] | null | undefined) {
    this.requiredScopes.set(normalizeScopes(value));
  }
}

function normalizeScopes(value: string | readonly string[] | null | undefined): readonly string[] {
  if (!value) {
    return [];
  }
  return typeof value === 'string' ? [value] : [...value];
}
