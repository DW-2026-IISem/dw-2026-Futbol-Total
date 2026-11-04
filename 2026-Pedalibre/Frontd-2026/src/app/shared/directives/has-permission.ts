import { Directive, effect, inject, input } from '@angular/core';
import { TemplateRef, ViewContainerRef } from '@angular/core';
import { SessionStore } from '../../core/services/session-store';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermission {
  readonly appHasPermission = input.required<string>();
  private readonly session = inject(SessionStore);
  private readonly template = inject(TemplateRef<unknown>);
  private readonly view = inject(ViewContainerRef);
  private rendered = false;

  constructor() {
    effect(() => {
      const allowed = this.session.canPermission(this.appHasPermission());
      if (allowed && !this.rendered) {
        this.view.createEmbeddedView(this.template);
        this.rendered = true;
      } else if (!allowed && this.rendered) {
        this.view.clear();
        this.rendered = false;
      }
    });
  }
}
