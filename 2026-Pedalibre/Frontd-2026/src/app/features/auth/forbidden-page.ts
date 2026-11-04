import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="mx-auto max-w-xl rounded-xl border border-amber-300 bg-amber-50 p-6">
      <h1 class="text-2xl font-semibold">Acceso no autorizado</h1>
      <p class="mt-2">Tu sesión no tiene el permiso necesario. La API sigue siendo la autoridad de acceso.</p>
      <a routerLink="/" class="mt-4 inline-block text-emerald-800 underline">Volver al inicio</a>
    </section>
  `,
})
export class ForbiddenPage {}
