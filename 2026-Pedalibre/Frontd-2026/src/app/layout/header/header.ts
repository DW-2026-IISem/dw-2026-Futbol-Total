import { Component, computed, input, output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionStore } from '../../core/services/session-store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly menuExpanded = input(false);
  readonly menuToggle = output<void>();
  readonly logoutRequest = output<void>();
  private readonly session = inject(SessionStore);
  readonly username = computed(() => this.session.user()?.username ?? '');
}
