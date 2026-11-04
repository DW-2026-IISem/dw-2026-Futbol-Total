import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { BusinessRecord } from '../../core/models/business-resource.model';
import { BusinessApi } from '../../core/services/business-api';
import { SessionStore } from '../../core/services/session-store';
import { toApiMessage } from '../../core/utils/to-api-message';
import { isDateColumn, spanishColumn, spanishIdentifier, spanishStatus, spanishValue } from '../../core/utils/spanish-ui';
import { PageHeader } from '../../shared/ui/page-header/page-header';

type Workflow = 'dockings' | 'rentals' | 'events';

@Component({
  selector: 'app-operations-page',
  standalone: true,
  imports: [ButtonModule, InputTextModule, MessageModule, TableModule, PageHeader],
  templateUrl: './operations-page.html',
})
export class OperationsPage implements OnInit {
  private readonly api = inject(BusinessApi);
  private readonly session = inject(SessionStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly workflow: Workflow;
  readonly rows = signal<BusinessRecord[]>([]);
  readonly reservations = signal<BusinessRecord[]>([]);
  readonly loading = signal(true);
  readonly catalogError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly activeAction = signal<'dock' | 'start' | 'finish' | null>(null);
  readonly selectedRental = signal<BusinessRecord | null>(null);
  readonly draft = signal<Record<string, string>>({});
  readonly title: string;
  readonly description: string;
  readonly relatedFilter = signal<{ key: 'rental_id' | 'reservation_id'; id: number } | null>(null);
  readonly visibleRows = computed(() => {
    const filter = this.relatedFilter();
    return filter
      ? this.rows().filter((row) =>
          filter.key === 'rental_id'
            ? row.id === filter.id
            : Number(row['reservation_id']) === filter.id,
        )
      : this.rows();
  });
  readonly activeDockings = computed(() =>
    this.rows().filter((row) => row['undocked_at'] === null || row['undocked_at'] === undefined),
  );
  readonly activeRentals = computed(() =>
    this.rows().filter((row) => String(row['status']).toLowerCase() === 'active' && !row['end_at']),
  );
  readonly columns = computed(() => {
    const first = this.rows()[0];
    return first ? Object.keys(first) : [];
  });
  readonly canDock = computed(() => this.session.canPermission('POST /api/bicycle-dockings/dock'));
  readonly canUndock = computed(() => this.session.canPermission('PATCH /api/bicycle-dockings/:id/undock'));
  readonly canStart = computed(() => this.session.canPermission('POST /api/rentals/start'));
  readonly canFinish = computed(() => this.session.canPermission('POST /api/rentals/finish'));
  readonly isAdminAccount = computed(() => this.session.isAdminAccount());

  constructor() {
    this.workflow = this.route.snapshot.data['workflow'] as Workflow;
    if (this.workflow === 'rentals') {
      const params = this.route.snapshot.queryParamMap;
      const rentalId = this.queryId(params?.get('rental_id'));
      const reservationId = this.queryId(params?.get('reservation_id'));
      this.relatedFilter.set(
        rentalId ? { key: 'rental_id', id: rentalId } :
          reservationId ? { key: 'reservation_id', id: reservationId } : null,
      );
    }
    const copy = {
      dockings: ['Movimientos de anclaje', 'Registra el anclaje y desanclaje de bicicletas en las estaciones.'],
      rentals: ['Alquileres', 'Consulta los recorridos activos y finalizados de todos los clientes.'],
      events: ['Eventos de alquiler', 'Historial de auditoría de solo lectura.'],
    } satisfies Record<Workflow, [string, string]>;
    [this.title, this.description] = copy[this.workflow];
  }

  ngOnInit(): void {
    this.load();
    this.loadRentalCatalogs();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const endpoint = this.workflow === 'dockings'
      ? 'bicycle-dockings'
      : this.workflow === 'rentals'
        ? 'rentals'
        : 'rental-events';
    this.api.list(endpoint).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  openDock(): void {
    this.selectedRental.set(null);
    this.formError.set(null);
    this.draft.set({ bicycle_id: '', docking_point_id: '' });
    this.activeAction.set('dock');
  }

  openStart(): void {
    this.selectedRental.set(null);
    this.formError.set(null);
    this.draft.set({ reservation_id: '' });
    this.activeAction.set('start');
  }

  openStartForReservation(reservation: BusinessRecord): void {
    this.openStart();
    this.draft.update((draft) => ({ ...draft, reservation_id: String(reservation.id) }));
  }

  pendingReservations(): BusinessRecord[] {
    return this.reservations().filter((reservation) =>
      String(reservation['status']).toLowerCase() === 'pending' &&
      this.reservationHasSuccessfulPayment(reservation),
    );
  }

  reservationLabel(reservation: BusinessRecord): string {
    const client = this.relatedRecord(reservation['client']);
    const bicycle = this.relatedRecord(reservation['bicycle']);
    const clientName = client
      ? `${String(client['first_name'] ?? '')} ${String(client['last_name'] ?? '')}`.trim()
      : `Cliente #${reservation['client_id']}`;
    const bicycleName = bicycle
      ? `${String(bicycle['serial_number'] ?? bicycle['name'] ?? 'Bicicleta')} · ${this.bicycleTypeLabel(bicycle['bicycle_type'])}`
      : 'Bicicleta pendiente';
    return `Reserva #${reservation.id} · ${clientName} · ${bicycleName}`;
  }

  displayColumn(row: BusinessRecord, column: string): string {
    if (column === 'status') {
      const status = String(row[column] ?? '').toLowerCase();
      if (this.workflow === 'rentals' && status === 'active') return 'En curso';
      return spanishStatus(row[column]);
    }
    if (isDateColumn(column)) return this.formatDate(row[column]);
    if (['total', 'amount', 'cost', 'base_value'].includes(column)) return this.formatCurrency(row[column]);
    const related = this.relatedRecord(row[column]);
    if (related) {
      if (column === 'bicycle') {
        return `${String(related['serial_number'] ?? related['name'] ?? 'Bicicleta')} · ${this.bicycleTypeLabel(related['bicycle_type'])}`;
      }
      if (column === 'client') {
        return `${String(related['first_name'] ?? '')} ${String(related['last_name'] ?? '')}`.trim();
      }
      if (column === 'rate') {
        return `${String(related['name'] ?? 'Tarifa')} · ${this.formatCurrency(related['base_value'])}/h`;
      }
      if (column === 'rental') return `Alquiler #${related.id}`;
    }
    return spanishValue(row[column], column);
  }

  columnLabel(column: string): string {
    return spanishColumn(column);
  }

  openRentalRelatedPage(
    path: 'reservations' | 'payments' | 'penalties',
    rental: BusinessRecord,
  ): void {
    if (!this.isAdminAccount()) return;
    const queryParams = path === 'reservations'
      ? { reservation_id: Number(rental['reservation_id']) }
      : path === 'payments'
        ? rental['reservation_id']
          ? { reservation_id: Number(rental['reservation_id']) }
          : { rental_id: rental.id }
        : { reference_id: rental.id };
    if (path === 'reservations' && !rental['reservation_id']) return;
    void this.router.navigate([`/${path}`], { queryParams });
  }

  clearRelatedFilter(): void {
    this.relatedFilter.set(null);
    void this.router.navigate(['/rentals']);
  }

  openFinish(rental: BusinessRecord): void {
    this.selectedRental.set(rental);
    this.formError.set(null);
    this.draft.set({ end_station_id: '', docking_point_id: '' });
    this.activeAction.set('finish');
  }

  setValue(key: string, event: Event): void {
    this.draft.update((draft) => ({
      ...draft,
      [key]: (event.target as HTMLInputElement).value,
    }));
  }

  cancelAction(): void {
    this.activeAction.set(null);
    this.selectedRental.set(null);
    this.formError.set(null);
  }

  execute(): void {
    const action = this.activeAction();
    if (!action || this.saving()) return;
    const draft = this.draft();
    const body: Record<string, unknown> = {};
    const required = action === 'dock'
      ? ['bicycle_id', 'docking_point_id']
      : action === 'start'
        ? ['reservation_id']
        : [];
    for (const key of required) {
      const value = Number(draft[key]);
      if (!Number.isSafeInteger(value) || value < 1) {
        this.formError.set(`${spanishIdentifier(key)} debe ser un identificador numérico positivo.`);
        return;
      }
      body[key] = value;
    }

    if (action === 'finish') {
      const rental = this.selectedRental();
      if (!rental) {
        this.formError.set('Selecciona un alquiler activo antes de finalizarlo.');
        return;
      }
      body['rental_id'] = rental.id;
    }
    const optionalKeys = action === 'finish'
        ? ['end_station_id', 'docking_point_id']
        : [];
    for (const key of optionalKeys) {
      if (!draft[key]?.trim()) continue;
      const value = Number(draft[key]);
      if (!Number.isSafeInteger(value) || value < 1) {
        this.formError.set(`${spanishIdentifier(key)} debe ser un identificador numérico positivo.`);
        return;
      }
      body[key] = value;
    }

    const request = action === 'dock'
      ? this.api.create('bicycle-dockings/dock', body, 'docking')
      : this.api.create(`rentals/${action}`, body, 'rental');
    this.saving.set(true);
    this.formError.set(null);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.cancelAction();
        this.load();
        this.loadRentalCatalogs();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.formError.set(toApiMessage(error));
      },
    });
  }

  undock(row: BusinessRecord): void {
    if (this.saving() || (row['undocked_at'] !== null && row['undocked_at'] !== undefined)) return;
    if (!this.canUndock()) return;
    this.saving.set(true);
    this.api.patchItemAction(
      'bicycle-dockings',
      row.id,
      'undock',
      {},
      'docking',
    ).subscribe({
      next: () => {
        this.saving.set(false);
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.error.set(toApiMessage(error));
      },
    });
  }

  display(value: unknown): string {
    if (value === null || value === undefined || value === '') return '—';
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }

  formatCurrency(value: unknown): string {
    const amount = Number(value);
    return Number.isFinite(amount)
      ? new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          maximumFractionDigits: 0,
        }).format(amount)
      : this.display(value);
  }

  formatDate(value: unknown): string {
    if (!value) return 'No definida';
    const date = new Date(String(value));
    return Number.isNaN(date.getTime())
      ? this.display(value)
      : new Intl.DateTimeFormat('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(date);
  }

  bicycleTypeLabel(value: unknown): string {
    return String(value ?? '').toLowerCase() === 'electric' ? 'Eléctrica' : 'Estándar';
  }

  private loadRentalCatalogs(): void {
    if (this.workflow !== 'rentals' || !this.canStart()) return;
    this.catalogError.set(null);
    this.api.list('reservations').subscribe({
      next: (reservations) => this.reservations.set(
        reservations.filter((reservation) => String(reservation['status']).toLowerCase() === 'pending'),
      ),
      error: (error: unknown) => this.catalogError.set(toApiMessage(error)),
    });
  }

  private reservationHasSuccessfulPayment(reservation: BusinessRecord): boolean {
    const payments = reservation['reservation_payments'];
    return Array.isArray(payments) && payments.some((payment: unknown) =>
      typeof payment === 'object' && payment !== null &&
      'status' in payment && String(payment['status']).toLowerCase() === 'successful',
    );
  }

  private relatedRecord(value: unknown): BusinessRecord | null {
    return typeof value === 'object' && value !== null && 'id' in value
      ? value as BusinessRecord
      : null;
  }

  private queryId(value: string | null | undefined): number | null {
    if (!value || !/^[1-9]\d*$/.test(value)) return null;
    const id = Number(value);
    return Number.isSafeInteger(id) ? id : null;
  }
}
