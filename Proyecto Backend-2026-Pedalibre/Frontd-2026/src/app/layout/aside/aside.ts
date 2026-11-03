import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
}
