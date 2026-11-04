import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { SessionApi } from '../../core/services/session-api';
import { NotificationService } from '../../core/services/notification';
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
  private readonly sessionApi = inject(SessionApi);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  readonly menuExpanded = signal(false);

  toggleMenu(): void {
    this.menuExpanded.update((expanded) => !expanded);
  }

  closeMenu(): void {
    this.menuExpanded.set(false);
  }

  logout(): void {
    this.sessionApi.logout().pipe(
      catchError((error: unknown) => {
        this.notifications.error(error, 'No se pudo cerrar la sesión en el servidor');
        return of(undefined);
      }),
    ).subscribe(() => {
      void this.router.navigate(['/login']);
    });
  }
}
