import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionStore } from '../../core/services/session-store';
import { navigationItems } from './nav.config';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './aside.html',
  styleUrl: './aside.css',
})
export class Aside {
  readonly collapsed = input(false);
  readonly mobileOpen = input(false);
  readonly navigate = output<void>();
  readonly session = inject(SessionStore);
  readonly items = computed(() =>
    navigationItems.filter(
      (item) => !item.permission || this.session.canPermission(item.permission),
    ),
  );
}
