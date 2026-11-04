import { Component, inject } from '@angular/core';
import { SessionStore } from '../../core/services/session-store';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { spanishStatus } from '../../core/utils/spanish-ui';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [PageHeader],
  template: `
    <section class="space-y-5">
      <app-page-header title="Mi perfil" description="Consulta los datos de tu cuenta." />
      @if (session.user(); as user) {
        <dl class="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
          <div><dt class="text-sm text-slate-500">Usuario</dt><dd class="font-medium">{{ user.username }}</dd></div>
          <div><dt class="text-sm text-slate-500">Correo</dt><dd class="font-medium">{{ user.email || '—' }}</dd></div>
          <div><dt class="text-sm text-slate-500">Estado</dt><dd class="font-medium">{{ displayStatus(user.status) }}</dd></div>
          @if (session.isAdminAccount()) {
            <div><dt class="text-sm text-slate-500">ID del rol</dt><dd class="font-medium">{{ user.role_id }}</dd></div>
          }
        </dl>
      }
      @if (session.isAdminAccount()) {
        <section class="rounded-xl border border-slate-200 bg-white p-5">
          <h2 class="mb-3 text-lg font-semibold">Permisos efectivos ({{ session.permissions().length }})</h2>
          <ul class="list-disc space-y-1 pl-5">
            @for (permission of session.permissions(); track permission.resource_id) {
              <li>{{ permission.method }} {{ permission.path }}</li>
            }
          </ul>
        </section>
      }
    </section>
  `,
})
export class ProfilePage {
  readonly session = inject(SessionStore);

  displayStatus(value: string): string {
    return spanishStatus(value);
  }
}
