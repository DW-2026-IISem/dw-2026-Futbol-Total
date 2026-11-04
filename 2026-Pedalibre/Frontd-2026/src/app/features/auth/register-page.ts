import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SessionApi } from '../../core/services/session-api';
import { ClientRegistrationPayload } from '../../core/models/session.model';
import { toApiMessage } from '../../core/utils/to-api-message';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule, MessageModule, RouterLink],
  template: `
    <main class="auth-screen">
      <section class="auth-card auth-card-register" aria-label="Registro de cliente PedalLibre">
        <aside class="auth-aside">
          <a routerLink="/" class="auth-brand">
            <img src="/pedalibre-icon.png" alt="Icono de PedalLibre" />
            <span>PedalLibre</span>
          </a>
          <div class="auth-message">
            <span class="auth-eyebrow"><i class="pi pi-sparkles" aria-hidden="true"></i> Tu próximo viaje empieza aquí</span>
            <h2>Muévete libre. Muévete mejor.</h2>
            <p>Crea tu cuenta para disfrutar una ciudad más cercana, activa y sostenible.</p>
          </div>
          <p class="auth-footnote">Registro fácil y seguro para nuevos clientes.</p>
        </aside>
        <div class="auth-content">
          <div class="auth-form">
            <span class="auth-eyebrow text-emerald-700">Únete a PedalLibre</span>
            <h1 class="mt-3">Crear cuenta</h1>
            <p class="mt-2">Completa tus datos para registrarte como cliente.</p>

            @if (success()) {
              <p-message severity="success" class="mt-5 block">
                Cuenta creada. Ya puedes iniciar sesión.
              </p-message>
              <a pButton routerLink="/login" class="mt-4">Ir a iniciar sesión</a>
            } @else {
              <form class="mt-6 grid gap-4 sm:grid-cols-2" (ngSubmit)="submit()">
                <label class="flex flex-col gap-1.5">
                  Nombres
                  <input pInputText name="first_name" autocomplete="given-name" required maxlength="100"
                    [(ngModel)]="first_name" placeholder="Tus nombres" />
                </label>
                <label class="flex flex-col gap-1.5">
                  Apellidos
                  <input pInputText name="last_name" autocomplete="family-name" required maxlength="100"
                    [(ngModel)]="last_name" placeholder="Tus apellidos" />
                </label>
                <label class="flex flex-col gap-1.5">
                  Tipo de documento
                  <input pInputText name="document_type" required maxlength="30" placeholder="CC"
                    [(ngModel)]="document_type" />
                </label>
                <label class="flex flex-col gap-1.5">
                  Número de documento
                  <input pInputText name="document_number" required maxlength="50"
                    [(ngModel)]="document_number" placeholder="Número de documento" />
                </label>
                <label class="flex flex-col gap-1.5">
                  Usuario
                  <input pInputText name="username" autocomplete="username" required minlength="3"
                    maxlength="100" [(ngModel)]="username" placeholder="Elige un usuario" />
                </label>
                <label class="flex flex-col gap-1.5">
                  Correo
                  <input pInputText type="email" name="email" autocomplete="email" required maxlength="150"
                    [(ngModel)]="email" placeholder="nombre@correo.com" />
                </label>
                <label class="flex flex-col gap-1.5">
                  Teléfono <span class="font-normal text-slate-500">(opcional)</span>
                  <input pInputText type="tel" name="phone" autocomplete="tel" maxlength="30"
                    [(ngModel)]="phone" placeholder="Tu teléfono" />
                </label>
                <label class="flex flex-col gap-1.5">
                  Contraseña <span class="font-normal text-slate-500">(mínimo 12 caracteres)</span>
                  <input pInputText type="password" name="password" autocomplete="new-password" required
                    minlength="12" maxlength="128" [(ngModel)]="password" placeholder="Crea una contraseña" />
                </label>
                <label class="flex flex-col gap-1.5 sm:col-span-2">
                  Confirmar contraseña
                  <input pInputText type="password" name="confirm_password" autocomplete="new-password"
                    required [(ngModel)]="confirm_password" placeholder="Escribe de nuevo tu contraseña" />
                </label>
                @if (error()) {
                  <p-message severity="error" class="sm:col-span-2">{{ error() }}</p-message>
                }
                <button pButton type="submit" class="w-full sm:col-span-2" [disabled]="loading()">
                  <i class="pi pi-user-plus mr-2" aria-hidden="true"></i>
                  {{ loading() ? 'Registrando…' : 'Crear mi cuenta' }}
                </button>
              </form>
              <p class="auth-switch mt-5">
                ¿Ya tienes cuenta?
                <a routerLink="/login">Inicia sesión</a>
              </p>
            }
          </div>
        </div>
      </section>
    </main>
  `,
})
export class RegisterPage {
  private readonly api = inject(SessionApi);
  username = '';
  email = '';
  password = '';
  confirm_password = '';
  first_name = '';
  last_name = '';
  document_type = '';
  document_number = '';
  phone = '';
  readonly loading = signal(false);
  readonly success = signal(false);
  readonly error = signal<string | null>(null);

  submit(): void {
    if (this.loading()) return;
    if (this.password !== this.confirm_password) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    const payload: ClientRegistrationPayload = {
      username: this.username.trim(),
      email: this.email.trim(),
      password: this.password,
      first_name: this.first_name.trim(),
      last_name: this.last_name.trim(),
      document_type: this.document_type.trim(),
      document_number: this.document_number.trim(),
      phone: this.phone.trim() || null,
    };
    this.loading.set(true);
    this.error.set(null);
    this.api.registerClient(payload).subscribe({
      next: () => {
        this.password = '';
        this.confirm_password = '';
        this.loading.set(false);
        this.success.set(true);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(toApiMessage(error));
      },
    });
  }
}
