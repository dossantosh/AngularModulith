import { Directive, TemplateRef, ViewContainerRef, computed, effect, inject, input } from '@angular/core';

import { AuthFacade } from '../session/auth.facade';

@Directive({
  selector: '[appHasScope]',
  standalone: true,
})
export class HasScopeDirective {
  private readonly auth = inject(AuthFacade);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  readonly appHasScope = input<string | readonly string[] | null | undefined>(undefined);
  private readonly requiredScopes = computed(() => normalizeScopes(this.appHasScope()));

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

}

function normalizeScopes(value: string | readonly string[] | null | undefined): readonly string[] {
  if (!value) {
    return [];
  }
  return typeof value === 'string' ? [value] : [...value];
}
