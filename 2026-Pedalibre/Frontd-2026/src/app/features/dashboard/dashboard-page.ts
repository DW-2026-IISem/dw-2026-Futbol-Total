import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { MessageModule } from 'primeng/message';
import { BusinessApi } from '../../core/services/business-api';
import { SessionStore } from '../../core/services/session-store';
import { toApiMessage } from '../../core/utils/to-api-message';
import { PageHeader } from '../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [MessageModule, PageHeader],
  template: `
    <section class="space-y-5">
      <app-page-header title="Resumen operativo" description="Indicadores derivados de las listas disponibles; no existe un endpoint de dashboard." />
      @if (loading()) { <p role="status">Cargando indicadores…</p> }
      @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
      @if (!loading() && !error()) {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          @for (card of cards(); track card.label) {
            <article class="rounded-xl border border-slate-200 bg-white p-5">
              <h2 class="text-sm font-medium text-slate-600">{{ card.label }}</h2>
              <p class="mt-2 text-3xl font-semibold">{{ card.value }}</p>
            </article>
          }
        </div>
      }
      <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-white"
        [disabled]="loading()" (click)="load()">Actualizar</button>
    </section>
  `,
})
export class DashboardPage implements OnInit {
  private readonly api = inject(BusinessApi);
  private readonly session = inject(SessionStore);
  private readonly data = signal({
    bicycles: [] as Record<string, unknown>[],
    rentals: [] as Record<string, unknown>[],
    reservations: [] as Record<string, unknown>[],
    maintenances: [] as Record<string, unknown>[],
    availableLoaded: false,
    rentalsLoaded: false,
    reservationsLoaded: false,
    maintenancesLoaded: false,
  });
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly cards = computed(() => {
    const data = this.data();
    return [
      ...(data.availableLoaded
        ? [{ label: 'Bicicletas disponibles', value: data.bicycles.length }]
        : []),
      ...(data.rentalsLoaded
        ? [{ label: 'Alquileres activos', value: data.rentals.filter((row) => row['status'] === 'active').length }]
        : []),
      ...(data.reservationsLoaded
        ? [{ label: 'Reservas pendientes', value: data.reservations.filter((row) => row['status'] === 'pending').length }]
        : []),
      ...(data.maintenancesLoaded
        ? [{ label: 'Mantenimientos abiertos', value: data.maintenances.filter((row) => !row['closed_at']).length }]
        : []),
    ];
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const availableLoaded = this.session.canPermission('GET /api/bicycles/available');
    const rentalsLoaded = this.session.canPermission('GET /api/rentals');
    const reservationsLoaded = this.session.canPermission('GET /api/reservations');
    const maintenancesLoaded = this.session.canPermission('GET /api/maintenances');
    forkJoin({
      bicycles: availableLoaded ? this.api.availableBicycles() : of([]),
      rentals: rentalsLoaded ? this.api.list('rentals') : of([]),
      reservations: reservationsLoaded ? this.api.list('reservations') : of([]),
      maintenances: maintenancesLoaded ? this.api.list('maintenances') : of([]),
    }).subscribe({
      next: (data) => {
        this.data.set({ ...data, availableLoaded, rentalsLoaded, reservationsLoaded, maintenancesLoaded });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }
}
