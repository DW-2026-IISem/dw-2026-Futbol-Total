import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Aside } from '../aside/aside';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [Aside, Footer, Header, RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  readonly menuExpanded = signal(false);

  toggleMenu(): void {
    this.menuExpanded.update((expanded) => !expanded);
  }

  closeMenu(): void {
    this.menuExpanded.set(false);
  }
}
