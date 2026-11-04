import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { BusinessField, BusinessRecord, BusinessResource } from '../../core/models/business-resource.model';
import { Client } from '../../core/models/client.model';
import { BusinessApi } from '../../core/services/business-api';
import { SessionStore } from '../../core/services/session-store';
import { toApiMessage } from '../../core/utils/to-api-message';
import { isDateColumn, spanishStatus, spanishValue } from '../../core/utils/spanish-ui';
import { ClientApi } from '../clients/client-api';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { businessResources } from './business-resources';

interface ReservationOption {
  id: number;
  label: string;
}

@Component({
  selector: 'app-business-resource-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule, MessageModule, TableModule, PageHeader],
  templateUrl: './business-resource-page.html',
})
export class BusinessResourcePage implements OnInit {
  private readonly api = inject(BusinessApi);
  private readonly clientApi = inject(ClientApi);
  private readonly session = inject(SessionStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly config: BusinessResource;
  readonly fields: BusinessField[];
  readonly rows = signal<BusinessRecord[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly catalogError = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly query = signal('');
  readonly relatedFilter = signal<{ key: string; id: number } | null>(null);
  readonly selected = signal<BusinessRecord | null>(null);
  readonly editing = computed(() => this.selected() !== null);
  readonly visibleRows = computed(() => {
    const query = this.query().trim().toLowerCase();
    const relatedFilter = this.relatedFilter();
    return this.rows().filter((row) => {
      if (relatedFilter && !this.matchesRelatedFilter(row, relatedFilter)) return false;
      return !query || Object.values(row).some((value) =>
        String(value ?? '').toLowerCase().includes(query),
      );
    });
  });
  readonly draft = signal<Record<string, string | boolean>>({});
  readonly clients = signal<Client[]>([]);
  readonly availableBicycles = signal<BusinessRecord[]>([]);
  readonly stations = signal<BusinessRecord[]>([]);
  readonly dockingPoints = signal<BusinessRecord[]>([]);
  readonly paymentReservations = signal<BusinessRecord[]>([]);
  readonly paymentRates = signal<BusinessRecord[]>([]);
  readonly expandedStations = signal<Set<number>>(new Set());
  readonly clientRentals = signal<BusinessRecord[]>([]);
  readonly clientPenalties = signal<BusinessRecord[]>([]);
  readonly clientActivityError = signal<string | null>(null);
  readonly isClientAccount = computed(() => this.session.isClientAccount());
  readonly isAdminAccount = computed(() => this.session.isAdminAccount());
  readonly isClientReservations = computed(
    () => this.config.endpoint === 'reservations' && this.isClientAccount(),
  );
  readonly isPayments = computed(() => this.config.endpoint === 'payments');
  readonly paymentDraft = signal({
    reservation_id: '',
    rate_id: '',
    method: 'cash',
    transaction_code: '',
    status: 'pending',
  });
  readonly eligiblePaymentReservations = computed(() => {
    const alreadyRecorded = new Set(
      this.rows()
        .filter((payment) =>
          ['pending', 'successful', 'paid', 'completed'].includes(String(payment['status']).toLowerCase()),
        )
        .map((payment) => Number(payment['reservation_id'])),
    );
    return this.paymentReservations().filter((reservation) =>
      String(reservation['status']).toLowerCase() === 'pending' &&
      !alreadyRecorded.has(reservation.id),
    );
  });
  readonly selectedPaymentReservation = computed(() =>
    this.eligiblePaymentReservations().find(
      (reservation) => reservation.id === Number(this.paymentDraft().reservation_id),
    ) ?? null,
  );
  readonly paymentRatesForReservation = computed(() => {
    const reservation = this.selectedPaymentReservation();
    if (!reservation || !this.isBusinessRecord(reservation['bicycle'])) return this.paymentRates();
    const electric = String(reservation['bicycle']['bicycle_type']).toLowerCase() === 'electric';
    return this.paymentRates().filter((rate) => {
      const electricRate = /electric|eléctric/i.test(String(rate['name'] ?? ''));
      return electric === electricRate;
    });
  });
  readonly selectedPaymentRate = computed(() =>
    this.paymentRatesForReservation().find((rate) => rate.id === Number(this.paymentDraft().rate_id)) ?? null,
  );
  readonly paymentEstimate = computed(() => {
    const reservation = this.selectedPaymentReservation();
    const rate = this.selectedPaymentRate();
    if (!reservation || !rate) return null;
    const start = Date.parse(String(reservation['start_at'] ?? ''));
    const end = Date.parse(String(reservation['end_at'] ?? ''));
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
    const duration = end - start;
    const base = Number(rate['base_value']);
    if (!Number.isFinite(base) || base < 0) return null;
    const rule = String(rate['calculation_rule'] ?? '').toLowerCase();
    const amount = ['hourly', 'por_hora'].includes(rule)
      ? Math.max(1, Math.ceil(duration / 3_600_000)) * base
      : ['daily', 'por_dia'].includes(rule)
        ? Math.max(1, Math.ceil(duration / 86_400_000)) * base
        : ['fixed', 'fijo'].includes(rule)
          ? base
          : null;
    if (amount === null) return null;
    return Math.round(amount * 100) / 100;
  });
  readonly pendingReservations = computed(
    () => this.rows().filter((row) => String(row['status']).toLowerCase() === 'pending').length,
  );
  readonly pendingPenaltyTotal = computed(() =>
    this.clientPenalties()
      .filter((penalty) => String(penalty['status']).toLowerCase() === 'pending')
      .reduce((total, penalty) => total + Number(penalty['amount'] ?? 0), 0),
  );
  readonly canCreate = computed(
    () => this.config.canCreate !== false && this.session.canPermission(`POST /api/${this.config.endpoint}`),
  );
  readonly canUpdate = computed(
    () => this.config.canUpdate !== false && this.session.canPermission(`PATCH /api/${this.config.endpoint}/:id`),
  );
  readonly canDelete = computed(
    () => this.config.canDelete !== false && this.session.canPermission(`DELETE /api/${this.config.endpoint}/:id`),
  );

  constructor() {
    const key = this.route.snapshot.data['resource'] as string;
    const config = businessResources[key];
    if (!config) throw new Error(`Unknown business resource "${key}"`);
    this.config = config;
    this.fields = config.fields;
    const queryParams = this.route.snapshot.queryParamMap;
    const relatedFilter = config.endpoint === 'reservations'
      ? this.queryId(queryParams?.get('reservation_id'), 'id')
      : config.endpoint === 'payments'
        ? this.queryId(queryParams?.get('reservation_id'), 'reservation_id') ??
          this.queryId(queryParams?.get('rental_id'), 'rental_id')
        : config.endpoint === 'penalties'
          ? this.queryId(queryParams?.get('reference_id'), 'reference_id')
          : null;
    this.relatedFilter.set(relatedFilter);
    if (config.endpoint === 'payments' && relatedFilter?.key === 'reservation_id') {
      this.paymentDraft.update((draft) => ({ ...draft, reservation_id: String(relatedFilter.id) }));
    }
    this.resetDraft();
  }

  ngOnInit(): void {
    this.load();
    this.loadReservationCatalogs();
    this.loadStationCatalog();
    this.loadStationDockingPoints();
    this.loadClientActivity();
    this.loadPaymentReservations();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.list(this.config.endpoint, this.config.listEnvelope).subscribe({
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

  setQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  setValue(field: BusinessField, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.draft.update((draft) => ({
      ...draft,
      [field.key]: field.type === 'boolean' ? target.checked : target.value,
    }));
  }

  fieldVisible(field: BusinessField): boolean {
    if (
      this.config.endpoint === 'reservations' &&
      field.key === 'client_id' &&
      this.session.isClientAccount()
    ) return false;
    const catalogPermission = this.reservationCatalogPermission(field);
    return !catalogPermission || this.session.canPermission(catalogPermission);
  }

  fieldOptions(field: BusinessField): ReservationOption[] {
    if (this.config.endpoint === 'docking-points' && field.key === 'station_id') {
      return this.stations().map((station) => ({
        id: station.id,
        label: String(station['name'] ?? ''),
      }));
    }
    if (this.config.endpoint !== 'reservations') return [];
    if (field.key === 'client_id') {
      return this.clients().map((client) => ({
        id: client.id,
        label: `${client.first_name} ${client.last_name}${client.document_number ? ` (${client.document_number})` : ''}`,
      }));
    }
    if (field.key === 'bicycle_id') {
      return this.availableBicycles().map((bicycle) => ({
        id: bicycle.id,
        label: `${String(bicycle['serial_number'] ?? bicycle['name'] ?? '')} · ${this.bicycleTypeLabel(bicycle['bicycle_type'])}`,
      }));
    }
    if (field.key === 'station_id') {
      return this.stations().map((station) => ({
        id: station.id,
        label: String(station['name'] ?? ''),
      }));
    }
    return [];
  }

  displayField(row: BusinessRecord, field: BusinessField): string {
    if (this.config.endpoint === 'reservations' && field.key === 'observations') {
      return this.reservationObservation(row);
    }
    if (field.type === 'date') return this.formatDateOnly(row[field.key]);
    if (field.type === 'datetime' || isDateColumn(field.key)) {
      return this.formatDate(row[field.key]);
    }
    if (field.key === 'status' || field.key === 'bicycle_type' || field.key === 'calculation_rule' || field.key === 'method') {
      return spanishStatus(row[field.key]);
    }
    if (field.type === 'boolean' || field.key === 'is_active') {
      return spanishValue(row[field.key], field.key);
    }
    if (this.config.endpoint === 'docking-points' && field.key === 'station_id') {
      const station = this.stations().find((item) => item.id === Number(row[field.key]));
      return station ? String(station['name'] ?? '—') : this.display(row[field.key]);
    }
    if (this.config.endpoint === 'rates' && field.key === 'base_value') {
      const amount = Number(row[field.key]);
      return Number.isFinite(amount)
        ? new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
          }).format(amount)
        : this.display(row[field.key]);
    }
    if (['amount', 'cost', 'total', 'base_value'].includes(field.key)) {
      return this.formatCurrency(row[field.key]);
    }
    if (this.config.endpoint === 'reservations') {
      const fieldValue = row[field.key];
      if (field.key === 'bicycle_id' && this.isBusinessRecord(row['bicycle'])) {
        const bicycle = row['bicycle'];
        return `${String(bicycle['serial_number'] ?? bicycle['name'] ?? 'Bicicleta')} · ${this.bicycleTypeLabel(bicycle['bicycle_type'])}`;
      }
      if (field.key === 'station_id' && this.isBusinessRecord(row['station'])) {
        return String(row['station']['name'] ?? '—');
      }
      if (field.key === 'client_id' && this.isBusinessRecord(row['client'])) {
        return `${String(row['client']['first_name'] ?? '')} ${String(row['client']['last_name'] ?? '')}`.trim();
      }
      if (field.key === 'client_id' || field.key === 'bicycle_id' || field.key === 'station_id') {
        const option = this.fieldOptions(field).find((item) => item.id === Number(fieldValue));
        return option?.label || '—';
      }
    }
    return spanishValue(row[field.key], field.key);
  }

  private reservationObservation(reservation: BusinessRecord): string {
    const status = String(reservation['status'] ?? '').toLowerCase();
    let lifecycle: string | null = null;
    if (status === 'completed') {
      lifecycle = 'Finalizado';
    } else if (status === 'in_progress' || status === 'active') {
      lifecycle = 'En curso';
    } else if (status === 'pending') {
      const payments = reservation['reservation_payments'];
      const paid = Array.isArray(payments) && payments.some((payment: unknown) =>
        typeof payment === 'object' &&
        payment !== null &&
        'status' in payment &&
        ['successful', 'paid', 'completed'].includes(String(payment['status']).toLowerCase()),
      );
      lifecycle = paid ? 'Pago exitoso' : 'Pendiente de pago';
    }

    const note = String(reservation['observations'] ?? '').trim();
    if (!lifecycle) return note || '—';
    return note ? `${lifecycle} · ${note}` : lifecycle;
  }

  private queryId(value: string | null | undefined, key: string): { key: string; id: number } | null {
    if (!value || !/^[1-9]\d*$/.test(value)) return null;
    const id = Number(value);
    return Number.isSafeInteger(id) ? { key, id } : null;
  }

  private matchesRelatedFilter(
    row: BusinessRecord,
    filter: { key: string; id: number },
  ): boolean {
    if (this.config.endpoint === 'reservations') return row.id === filter.id;
    if (this.config.endpoint === 'payments') {
      return filter.key === 'reservation_id'
        ? Number(row['reservation_id']) === filter.id
        : Number(row['reference_id']) === filter.id;
    }
    return Number(row[filter.key]) === filter.id;
  }

  displayStatus(value: unknown): string {
    return spanishStatus(value);
  }

  showRelationshipActions(): boolean {
    return this.isAdminAccount() && ['reservations', 'payments', 'penalties'].includes(this.config.endpoint);
  }

  hasRelatedActions(row: BusinessRecord): boolean {
    if (!this.showRelationshipActions()) return false;
    if (this.config.endpoint === 'reservations') return true;
    if (this.config.endpoint === 'payments') {
      return Boolean(row['reservation_id'] || row['reference_id']);
    }
    return Boolean(row['reference_id']);
  }

  openRelatedPage(path: string, queryParams: Record<string, number>): void {
    void this.router.navigate([`/${path}`], { queryParams });
  }

  relatedFilterLabel(): string {
    const filter = this.relatedFilter();
    if (!filter) return '';
    const linkedRecord = filter.key === 'reservation_id' ? 'Reserva' : 'Alquiler';
    return `${linkedRecord} #${filter.id}`;
  }

  clearRelatedFilter(): void {
    this.relatedFilter.set(null);
    void this.router.navigate([`/${this.config.endpoint}`]);
  }

  stationDockingPoints(stationId: number): BusinessRecord[] {
    return this.dockingPoints().filter((point) => Number(point['station_id']) === stationId);
  }

  isStationExpanded(stationId: number): boolean {
    return this.expandedStations().has(stationId);
  }

  toggleStation(stationId: number): void {
    this.expandedStations.update((expanded) => {
      const next = new Set(expanded);
      if (next.has(stationId)) next.delete(stationId);
      else next.add(stationId);
      return next;
    });
  }

  reservationBicycle(row: BusinessRecord): string {
    if (this.isBusinessRecord(row['bicycle'])) {
      const bicycle = row['bicycle'];
      return `${String(bicycle['serial_number'] ?? bicycle['name'] ?? 'Bicicleta')} · ${this.bicycleTypeLabel(bicycle['bicycle_type'])}`;
    }
    return 'Bicicleta pendiente de asignación';
  }

  rentalBicycle(row: BusinessRecord): string {
    return this.isBusinessRecord(row['bicycle'])
      ? this.reservationBicycle({ id: row.id, bicycle: row['bicycle'] })
      : `Alquiler #${row.id}`;
  }

  bicycleTypeLabel(value: unknown): string {
    const type = String(value ?? '').toLowerCase();
    if (type === 'electric' || type === 'electric_bicycle' || type === 'eléctrica') return 'Eléctrica';
    if (type === 'standard' || type === 'mechanical' || type === 'normal') return 'Estándar';
    return 'Tipo no especificado';
  }

  reservationStatus(value: unknown): string {
    const status = String(value ?? '').toLowerCase();
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      in_progress: 'En curso',
      active: 'En curso',
      completed: 'Completada',
      cancelled: 'Cancelada',
      expired: 'Vencida',
      paid: 'Pagada',
    };
    return labels[status] ?? this.display(value);
  }

  formatDate(value: unknown): string {
    if (value === null || value === undefined || value === '') return 'Por definir';
    const date = new Date(String(value));
    return Number.isNaN(date.getTime())
      ? this.display(value)
      : new Intl.DateTimeFormat('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(date);
  }

  private formatDateOnly(value: unknown): string {
    if (!value) return '—';
    const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
    if (!year || !month || !day) return this.display(value);
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(
      new Date(year, month - 1, day),
    );
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

  startCreate(): void {
    this.selected.set(null);
    this.formError.set(null);
    this.resetDraft();
  }

  startEdit(row: BusinessRecord): void {
    this.selected.set(row);
    this.formError.set(null);
    this.draft.set(
      Object.fromEntries(
        this.fields.map((field) => [field.key, this.inputValue(field, row[field.key])]),
      ),
    );
  }

  cancelEdit(): void {
    this.selected.set(null);
    this.formError.set(null);
    this.resetDraft();
  }

  save(): void {
    if (this.saving()) return;
    if (this.selected() ? !this.canUpdate() : !this.canCreate()) return;
    const payload = this.buildPayload();
    if (!payload) return;
    const current = this.selected();
    this.saving.set(true);
    this.formError.set(null);
    const request = current
      ? this.api.update(
          this.config.endpoint,
          current.id,
          payload,
          this.config.updateMethod,
          this.config.updateEnvelope,
        )
      : this.api.create(this.config.endpoint, payload, this.config.createEnvelope);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.cancelEdit();
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.formError.set(toApiMessage(error));
      },
    });
  }

  setPaymentValue(key: 'reservation_id' | 'rate_id' | 'method' | 'transaction_code' | 'status', event: Event): void {
    this.paymentDraft.update((draft) => ({
      ...draft,
      [key]: (event.target as HTMLInputElement).value,
    }));
    if (key === 'reservation_id') this.paymentDraft.update((draft) => ({ ...draft, rate_id: '' }));
  }

  paymentReservationLabel(reservation: BusinessRecord): string {
    const client = this.isBusinessRecord(reservation['client'])
      ? `${String(reservation['client']['first_name'] ?? '')} ${String(reservation['client']['last_name'] ?? '')}`.trim()
      : `Cliente #${reservation['client_id']}`;
    const bicycle = this.isBusinessRecord(reservation['bicycle'])
      ? `${String(reservation['bicycle']['serial_number'] ?? reservation['bicycle']['name'] ?? 'Bicicleta')} · ${this.bicycleTypeLabel(reservation['bicycle']['bicycle_type'])}`
      : `Bicicleta #${reservation['bicycle_id']}`;
    return `Reserva #${reservation.id} · ${client} · ${bicycle}`;
  }

  registerPayment(): void {
    if (this.saving() || !this.canCreate()) return;
    const draft = this.paymentDraft();
    const reservation = this.selectedPaymentReservation();
    const rate = this.selectedPaymentRate();
    if (!reservation || !rate || this.paymentEstimate() === null) {
      this.formError.set('Selecciona una reserva y su tarifa para calcular el prepago.');
      return;
    }
    if (draft.method === 'transfer' && !draft.transaction_code.trim()) {
      this.formError.set('El código de transacción es obligatorio para transferencias.');
      return;
    }
    this.saving.set(true);
    this.formError.set(null);
    this.api.create('payments', {
      reservation_id: reservation.id,
      rate_id: rate.id,
      method: draft.method,
      ...(draft.method === 'transfer' ? { transaction_code: draft.transaction_code.trim() } : {}),
      status: draft.status,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.paymentDraft.set({ reservation_id: '', rate_id: '', method: 'cash', transaction_code: '', status: 'pending' });
        this.load();
        this.loadPaymentReservations();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.formError.set(toApiMessage(error));
      },
    });
  }

  markPaymentSuccessful(payment: BusinessRecord): void {
    if (this.saving() || String(payment['status']).toLowerCase() !== 'pending' || !this.canUpdate()) return;
    this.saving.set(true);
    this.error.set(null);
    this.api.update('payments', payment.id, { status: 'successful' }).subscribe({
      next: () => {
        this.saving.set(false);
        this.load();
        this.loadPaymentReservations();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.error.set(toApiMessage(error));
      },
    });
  }

  paymentStatusLabel(value: unknown): string {
    return ['successful', 'paid', 'completed'].includes(String(value ?? '').toLowerCase())
      ? 'Pago exitoso'
      : 'Pendiente';
  }

  paymentMethodLabel(value: unknown): string {
    return String(value ?? '').toLowerCase() === 'transfer' ? 'Transferencia' : 'Efectivo';
  }

  remove(row: BusinessRecord): void {
    if (!this.canDelete()) return;
    if (!window.confirm(`¿Eliminar permanentemente el registro ${row.id}? Esta acción no se puede deshacer.`)) return;
    this.api.remove(this.config.endpoint, row.id).subscribe({
      next: () => this.load(),
      error: (error: unknown) => this.error.set(toApiMessage(error)),
    });
  }

  display(value: unknown): string {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  private buildPayload(): Record<string, unknown> | null {
    const current = this.selected();
    const payload: Record<string, unknown> = {};
    for (const field of this.fields) {
      if (!this.fieldVisible(field)) continue;
      if (current && field.update === false) continue;
      if (!current && field.create === false) continue;
      const value = this.draft()[field.key];
      if (field.type === 'boolean') {
        if (value !== undefined) payload[field.key] = value;
        continue;
      }
      const text = String(value ?? '').trim();
      if (!text) {
        if (field.required) {
          this.formError.set(`${field.label} es obligatorio.`);
          return null;
        }
        continue;
      }
      if (field.type === 'number') {
        const number = Number(text);
        if (
          !Number.isFinite(number) ||
          (field.minimum !== undefined && number < field.minimum) ||
          (field.key.endsWith('_id') && number < 1)
        ) {
          this.formError.set(`${field.label} debe ser un valor numérico válido.`);
          return null;
        }
        payload[field.key] = number;
      } else {
        if (field.type === 'datetime') {
          const date = new Date(text);
          if (!Number.isFinite(date.getTime())) {
            this.formError.set(`${field.label} debe ser una fecha válida.`);
            return null;
          }
          payload[field.key] = date.toISOString();
        } else {
          payload[field.key] = text;
        }
      }
    }
    if (this.config.endpoint === 'rates') {
      const rule = String(payload['calculation_rule'] ?? '').toLowerCase();
      if (!['fixed', 'fijo', 'hourly', 'por_hora', 'daily', 'por_dia'].includes(rule)) {
        this.formError.set('El tipo de tarifa debe ser fija, por hora o por día.');
        return null;
      }
      const from = payload['valid_from'] ? Date.parse(String(payload['valid_from'])) : null;
      const until = payload['valid_until'] ? Date.parse(String(payload['valid_until'])) : null;
      if (from !== null && until !== null && until < from) {
        this.formError.set('La fecha final de vigencia no puede ser anterior a la fecha inicial.');
        return null;
      }
    }
    if (this.config.endpoint === 'reservations') {
      const start = payload['start_at'] ? Date.parse(String(payload['start_at'])) : null;
      const end = payload['end_at'] ? Date.parse(String(payload['end_at'])) : null;
      if (start !== null && end !== null && end <= start) {
        this.formError.set('La fecha de fin debe ser posterior a la fecha de inicio.');
        return null;
      }
    }
    return payload;
  }

  private inputValue(field: BusinessField, value: unknown): string | boolean {
    if (field.type === 'boolean') return Boolean(value);
    if (field.type === 'datetime' && typeof value === 'string') {
      return value.slice(0, 16);
    }
    return value === null || value === undefined ? '' : String(value);
  }

  private resetDraft(): void {
    this.draft.set(
      Object.fromEntries(
        this.fields.map((field) => [
          field.key,
          field.type === 'boolean' ? Boolean(field.defaultValue ?? false) : String(field.defaultValue ?? ''),
        ]),
      ),
    );
  }

  private loadReservationCatalogs(): void {
    if (this.config.endpoint !== 'reservations') return;
    this.catalogError.set(null);
    if (this.session.canPermission('GET /api/clientes')) {
      this.clientApi.list().subscribe({
        next: (clients) => this.clients.set(clients),
        error: (error: unknown) => this.setCatalogError('clientes', error),
      });
    }
    if (this.session.canPermission('GET /api/bicycles/available')) {
      this.api.availableBicycles().subscribe({
        next: (bicycles) => this.availableBicycles.set(bicycles),
        error: (error: unknown) => this.setCatalogError('bicicletas disponibles', error),
      });
    }
    if (this.session.canPermission('GET /api/stations')) {
      this.api.list('stations').subscribe({
        next: (stations) => this.stations.set(stations),
        error: (error: unknown) => this.setCatalogError('estaciones', error),
      });
    }
  }

  private loadClientActivity(): void {
    if (!this.isClientReservations()) return;
    this.clientActivityError.set(null);
    if (this.session.canPermission('GET /api/rentals')) {
      this.api.list('rentals').subscribe({
        next: (rentals) => this.clientRentals.set(rentals),
        error: (error: unknown) => this.setClientActivityError('recorridos', error),
      });
    } else {
      this.setClientActivityError(
        'recorridos',
        new Error('Tu rol aún no tiene permiso para consultar sus alquileres.'),
      );
    }

    if (this.session.canPermission('GET /api/penalties')) {
      this.api.list('penalties').subscribe({
        next: (penalties) => this.clientPenalties.set(penalties),
        error: (error: unknown) => this.setClientActivityError('penalidades', error),
      });
    } else {
      this.setClientActivityError(
        'penalidades',
        new Error('Tu rol aún no tiene permiso para consultar sus penalidades.'),
      );
    }
  }

  private loadPaymentReservations(): void {
    if (!this.isPayments() || !this.session.canPermission('GET /api/reservations')) return;
    this.api.list('reservations').subscribe({
      next: (reservations) => this.paymentReservations.set(reservations),
      error: (error: unknown) => this.setCatalogError('reservas pendientes de pago', error),
    });
    if (this.session.canPermission('GET /api/rates')) {
      this.api.list('rates').subscribe({
        next: (rates) => this.paymentRates.set(rates.filter((rate) => rate['is_active'] !== false)),
        error: (error: unknown) => this.setCatalogError('tarifas para el prepago', error),
      });
    } else {
      this.setCatalogError('tarifas para el prepago', new Error('Tu rol no tiene permiso GET /api/rates.'));
    }
  }

  private setClientActivityError(section: string, error: unknown): void {
    const message = `No se pudieron cargar ${section}: ${toApiMessage(error)}`;
    this.clientActivityError.update((current) => current ? `${current} ${message}` : message);
  }

  isBusinessRecord(value: unknown): value is BusinessRecord {
    return typeof value === 'object' && value !== null && 'id' in value;
  }

  private loadStationCatalog(): void {
    const needsStations = this.config.endpoint === 'docking-points';
    if (!needsStations || !this.session.canPermission('GET /api/stations')) return;
    this.api.list('stations').subscribe({
      next: (stations) => this.stations.set(stations),
      error: (error: unknown) => this.setCatalogError('estaciones', error),
    });
  }

  private loadStationDockingPoints(): void {
    if (this.config.endpoint !== 'stations') return;
    if (!this.session.canPermission('GET /api/docking-points')) {
      this.setCatalogError(
        'puntos de anclaje',
        new Error('Tu rol no tiene permiso GET /api/docking-points.'),
      );
      return;
    }
    this.api.list('docking-points').subscribe({
      next: (points) => this.dockingPoints.set(points),
      error: (error: unknown) => this.setCatalogError('puntos de anclaje', error),
    });
  }

  private setCatalogError(catalog: string, error: unknown): void {
    const message = `No se pudo cargar el catálogo de ${catalog}: ${toApiMessage(error)}`;
    this.catalogError.update((current) => current ? `${current} ${message}` : message);
  }

  private reservationCatalogPermission(field: BusinessField): string | null {
    if (this.config.endpoint !== 'reservations') return null;
    if (field.key === 'client_id') return 'GET /api/clientes';
    if (field.key === 'bicycle_id') return 'GET /api/bicycles/available';
    if (field.key === 'station_id') return 'GET /api/stations';
    return null;
  }
}
