import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SessionApi } from '../../core/services/session-api';
import { defaultAuthenticatedRoute, safeReturnUrl } from '../../core/guards/session-guards';
import { SessionStore } from '../../core/services/session-store';
import { toApiMessage } from '../../core/utils/to-api-message';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule, MessageModule, RouterLink],
  template: `
    <main class="auth-screen">
      <section class="auth-card" aria-label="Acceso a PedalLibre">
        <aside class="auth-aside">
          <a routerLink="/" class="auth-brand">
            <img src="/pedalibre-icon.png" alt="Icono de PedalLibre" />
            <span>PedalLibre</span>
          </a>
          <div class="auth-message">
            <span class="auth-eyebrow"><i class="pi pi-compass" aria-hidden="true"></i> Movilidad compartida</span>
            <h2>La ciudad se disfruta mejor en bicicleta.</h2>
            <p>Administra tus recorridos y descubre una forma más simple de moverte.</p>
          </div>
          <p class="auth-footnote">Pedalea a tu ritmo. Nosotros te acompañamos.</p>
        </aside>
        <div class="auth-content">
          <div class="auth-form">
            <span class="auth-eyebrow text-emerald-700">Bienvenido de nuevo</span>
            <h1 class="mt-3">Iniciar sesión</h1>
            <p class="mt-2">Usa tu usuario o correo registrado para continuar.</p>
            <form class="mt-7 space-y-5" (ngSubmit)="submit()">
              <label class="flex flex-col gap-1.5">
                Usuario o correo
                <input pInputText name="identifier" autocomplete="username" required
                  [(ngModel)]="identifier" placeholder="tu usuario o correo" />
              </label>
              <label class="flex flex-col gap-1.5">
                Contraseña
                <input pInputText type="password" name="password" autocomplete="current-password"
                  required [(ngModel)]="password" placeholder="Ingresa tu contraseña" />
              </label>
              @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
              <button pButton type="submit" class="w-full" [disabled]="loading()">
                <i class="pi pi-sign-in mr-2" aria-hidden="true"></i>
                {{ loading() ? 'Ingresando…' : 'Ingresar' }}
              </button>
            </form>
            <p class="auth-switch mt-6">
              ¿Aún no tienes cuenta?
              <a routerLink="/register">Regístrate</a>
            </p>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class LoginPage {
  private readonly api = inject(SessionApi);
  private readonly session = inject(SessionStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  identifier = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  submit(): void {
    if (this.loading() || !this.identifier.trim() || !this.password) return;
    this.loading.set(true);
    this.error.set(null);
    this.api.login(this.identifier.trim(), this.password).subscribe({
      next: () => {
        this.password = '';
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const destination = returnUrl
          ? safeReturnUrl(returnUrl)
          : defaultAuthenticatedRoute(this.session);
        void this.router.navigateByUrl(destination);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(toApiMessage(error));
      },
    });
  }
}
