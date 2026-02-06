import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../auth.service';

@Directive({
  selector: '[hasAuthority]',
  standalone: true,
})
export class HasAuthorityDirective {
  private readonly auth = inject(AuthService);
  private readonly tpl = inject(TemplateRef<any>);
  private readonly vcr = inject(ViewContainerRef);

  @Input('hasAuthority') set required(authority: string) {
    this.vcr.clear();
    if (this.auth.hasAuthority(authority)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
