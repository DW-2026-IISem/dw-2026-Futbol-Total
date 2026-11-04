# Fase I: Frontend — ISS-07: Alquileres, operación y cierre de negocio

**Estado:** preparado para iniciar; no hay pantallas de negocio implementadas más allá del esqueleto y el núcleo de ISS-02.  
**Proyecto:** PedalLibre, `Frontd-2026`  
**Depende de:** ISS-06 — Tarifas y reservas  
**Cierra:** Fase I de negocio  
**Habilita:** ISS-08 — Sesión y autenticación  
**Revisión del contrato:** 3-nov-2026

> Este ISS reemplaza por completo el ejemplo de ventas: PedalLibre registra alquileres de bicicletas. El precio y el total son responsabilidad del backend, no de la pantalla.

## Objetivo y reglas críticas

Implementa el inicio/cierre de alquiler, consulta de eventos e información operativa complementaria. Las operaciones de inicio y finalización son transaccionales en Express; el frontend manda referencias y no envía importes calculados por el cliente.

### Ciclo del alquiler

| Operación | Ruta | Respuesta |
|---|---|---|
| Listar | `GET /api/rentals` | `200 { items }` |
| Consultar | `GET /api/rentals/:id` | `200 { item }` |
| Iniciar | `POST /api/rentals/start` | `201 { rental }` |
| Finalizar | `POST /api/rentals/finish` | `200 { rental }` |
| Ver eventos | `GET /api/rental-events` | `200 { items }` |
| Ver evento | `GET /api/rental-events/:id` | `200 { item }` |

No hay `POST/PATCH/DELETE /api/rentals/:id` para editar manualmente un alquiler ni operaciones de escritura CRUD para eventos. La ruta `/start` espera `reservation_id`, `rate_id` y opcionalmente `start_station_id`. La ruta `/finish` espera `rental_id` y permite `end_station_id` y `docking_point_id` opcionales.

El servidor valida en transacción: reserva `pending`, ventana temporal vigente, bicicleta asignada y disponible, tarifa activa y válida; al iniciar cambia reserva y bicicleta y registra evento. Al finalizar valida alquiler `active`, calcula el total con la tarifa del servidor, registra el evento y devuelve la bicicleta a disponible cuando no hay mantenimiento abierto. Si se proporciona punto de anclaje, también valida disponibilidad y registra el movimiento.

Nunca mandes `total`, `status`, `start_at` ni `end_at` como sustituto del flujo. Muestra los importes `DECIMAL` normalizados y los mensajes de conflicto `409`.

## Cierre de operaciones de negocio

El backend incluye, además:

- **Mantenimientos:** `GET/POST /api/maintenances`, `GET/PATCH /api/maintenances/:id`. No hay eliminación física. Crear mantenimiento abierto retira la bicicleta del estado disponible; cerrarlo puede devolverla a `available`. `resource_id` identifica la bicicleta y no puede cambiarse después de crear.
- **Penalidades:** CRUD genérico bajo `/api/penalties`; lista/detalle `{ items }`/`{ item }`, crear `{ item }`, actualizar `{ item }`, eliminar `204`. Creación requiere `reference_id` y `amount`.
- **Pagos:** CRUD genérico bajo `/api/payments`; requiere `reference_id`, `method` y `amount` al crear.
- **Eventos de alquiler:** historial de solo lectura, generado por las operaciones de negocio.

Estas pantallas complementarias muestran registros y permiten solo las operaciones realmente expuestas. En penalidades, `reference_id` corresponde al alquiler según el modelo PedalLibre; no inventes otra clase de referencia ni una política automática de penalidad. En pagos, no presentes el registro como conciliado con un proveedor externo: esa integración no forma parte del contrato inspeccionado.

## Dashboard operativo

No existe `GET /api/dashboard`. Construye indicadores como datos derivados de listas permitidas, con Signals y `computed()`: bicicletas disponibles, alquileres activos, reservas pendientes, mantenimientos abiertos y pagos/penalidades según el alcance elegido. No dupliques peticiones por cada tarjeta; comparte una única carga por feature o usa un servicio de fachada. Presenta carga/error/vacío y reconoce los límites de listas del backend.

## Pasos de implementación

```bash
ng generate component features/rentals/rental-list --standalone
ng generate component features/rentals/rental-start --standalone
ng generate component features/rentals/rental-detail --standalone
ng generate component features/rental-events/rental-event-list --standalone
ng generate component features/maintenances/maintenance-list --standalone
ng generate component features/maintenances/maintenance-form --standalone
ng generate component features/penalties/penalty-list --standalone
ng generate component features/penalties/penalty-form --standalone
ng generate component features/payments/payment-list --standalone
ng generate component features/payments/payment-form --standalone
ng generate component features/dashboard --standalone
```

### 7.1 Escribir modelos y cliente HTTP de alquiler

```bash
cat > src/app/core/models/rental.model.ts <<'EOF'
import { Money } from './api.model';

export interface Rental {
  id: number;
  reservation_id: number | null;
  client_id: number;
  bicycle_id: number;
  rate_id: number;
  start_station_id: number | null;
  end_station_id: number | null;
  start_at: string;
  end_at: string | null;
  total: Money;
  status: string;
  observations: string;
}

export interface RentalEvent {
  id: number;
  rental_id: number;
  type: string;
  event_date: string;
  quantity: number | null;
  observations: string | null;
  status: string;
}

export interface RentalStartPayload {
  reservation_id: number;
  rate_id: number;
  start_station_id?: number;
}

export interface RentalFinishPayload {
  rental_id: number;
  end_station_id?: number;
  docking_point_id?: number;
}
EOF

cat > src/app/features/rentals/rental-api.ts <<'EOF'
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Rental,
  RentalFinishPayload,
  RentalStartPayload,
} from '../../core/models/rental.model';

@Injectable({ providedIn: 'root' })
export class RentalApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/rentals`;
  list(): Observable<Rental[]> {
    return this.http.get<{ items: Rental[] }>(this.base).pipe(map(({ items }) => items));
  }
  get(id: number): Observable<Rental> {
    return this.http.get<{ item: Rental }>(`${this.base}/${id}`).pipe(map(({ item }) => item));
  }
  start(payload: RentalStartPayload): Observable<Rental> {
    return this.http.post<{ rental: Rental }>(`${this.base}/start`, payload)
      .pipe(map(({ rental }) => rental));
  }
  finish(payload: RentalFinishPayload): Observable<Rental> {
    return this.http.post<{ rental: Rental }>(`${this.base}/finish`, payload)
      .pipe(map(({ rental }) => rental));
  }
}
EOF

cat > src/app/features/rental-events/rental-event-api.ts <<'EOF'
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RentalEvent } from '../../core/models/rental.model';

@Injectable({ providedIn: 'root' })
export class RentalEventApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/rental-events`;
  list(): Observable<RentalEvent[]> {
    return this.http.get<{ items: RentalEvent[] }>(this.base).pipe(map(({ items }) => items));
  }
  get(id: number): Observable<RentalEvent> {
    return this.http.get<{ item: RentalEvent }>(`${this.base}/${id}`).pipe(map(({ item }) => item));
  }
}
EOF

cat > src/app/core/models/operations.model.ts <<'EOF'
import { Money } from './api.model';

export interface Maintenance {
  id: number;
  resource_id: number;
  type: string;
  scheduled_at: string;
  closed_at: string | null;
  cost: Money;
  status: string;
  observations: string;
}

export interface MaintenanceCreate {
  resource_id: number;
  type: string;
  scheduled_at: string;
  cost?: number;
  observations?: string;
}

export type MaintenancePatch = Partial<Omit<MaintenanceCreate, 'resource_id'>> & {
  closed_at?: string | null;
  status?: string;
};

export interface Penalty {
  id: number;
  reference_id: number;
  penalty_date: string;
  amount: Money;
  status: string;
  observations: string;
}

export interface PenaltyCreate {
  reference_id: number;
  amount: number;
  penalty_date?: string;
  status?: string;
  observations?: string;
}

export type PenaltyPatch = Partial<Omit<PenaltyCreate, 'reference_id' | 'penalty_date'>>;

export interface Payment {
  id: number;
  reference_type: string;
  reference_id: number;
  method: string;
  amount: Money;
  payment_date: string;
  status: string;
}

export interface PaymentCreate {
  reference_id: number;
  method: string;
  amount: number;
  payment_date?: string;
  status?: string;
}

export type PaymentPatch = Partial<Omit<PaymentCreate, 'reference_id'>>;
EOF

cat > src/app/features/maintenances/maintenance-api.ts <<'EOF'
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Maintenance, MaintenanceCreate, MaintenancePatch } from '../../core/models/operations.model';

@Injectable({ providedIn: 'root' })
export class MaintenanceApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/maintenances`;
  list(): Observable<Maintenance[]> {
    return this.http.get<{ items: Maintenance[] }>(this.base).pipe(map(({ items }) => items));
  }
  create(payload: MaintenanceCreate): Observable<Maintenance> {
    return this.http.post<{ item: Maintenance }>(this.base, payload).pipe(map(({ item }) => item));
  }
  update(id: number, payload: MaintenancePatch): Observable<Maintenance> {
    return this.http.patch<{ item: Maintenance }>(`${this.base}/${id}`, payload)
      .pipe(map(({ item }) => item));
  }
}
EOF

cat > src/app/features/penalties/penalty-api.ts <<'EOF'
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Penalty, PenaltyCreate, PenaltyPatch } from '../../core/models/operations.model';

@Injectable({ providedIn: 'root' })
export class PenaltyApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/penalties`;
  list(): Observable<Penalty[]> {
    return this.http.get<{ items: Penalty[] }>(this.base).pipe(map(({ items }) => items));
  }
  create(payload: PenaltyCreate): Observable<Penalty> {
    return this.http.post<{ item: Penalty }>(this.base, payload).pipe(map(({ item }) => item));
  }
  update(id: number, payload: PenaltyPatch): Observable<Penalty> {
    return this.http.patch<{ item: Penalty }>(`${this.base}/${id}`, payload).pipe(map(({ item }) => item));
  }
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
EOF

cat > src/app/features/payments/payment-api.ts <<'EOF'
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment, PaymentCreate, PaymentPatch } from '../../core/models/operations.model';

@Injectable({ providedIn: 'root' })
export class PaymentApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/payments`;
  list(): Observable<Payment[]> {
    return this.http.get<{ items: Payment[] }>(this.base).pipe(map(({ items }) => items));
  }
  create(payload: PaymentCreate): Observable<Payment> {
    return this.http.post<{ item: Payment }>(this.base, payload).pipe(map(({ item }) => item));
  }
  update(id: number, payload: PaymentPatch): Observable<Payment> {
    return this.http.patch<{ item: Payment }>(`${this.base}/${id}`, payload).pipe(map(({ item }) => item));
  }
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
EOF
```

`MaintenanceApi` no ofrece `DELETE`. Penalidades permiten actualizar `amount/status/observations` y pagos `method/amount/payment_date/status`; en ambos casos `reference_id` no se modifica después de crear. Confirma los DTO locales si el contrato evoluciona.

### 7.2 Escribir plantillas para flujos transaccionales

El formulario de inicio es una selección de reserva pendiente, tarifa vigente y estación opcional; usa `FormsModule` o Reactive Forms, pero manda solo IDs:

```bash
cat > src/app/features/rentals/rental-start/rental-start.html <<'EOF'
<form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
  <div>
    <label for="rental-reservation">Reserva pendiente *</label>
    <p-select inputId="rental-reservation" [fluid]="true" formControlName="reservation_id"
      [options]="reservations()" optionLabel="label" optionValue="id" [filter]="true" />
  </div>
  <div>
    <label for="rental-rate">Tarifa vigente *</label>
    <p-select inputId="rental-rate" [fluid]="true" formControlName="rate_id"
      [options]="rates()" optionLabel="name" optionValue="id" />
  </div>
  <div>
    <label for="rental-start-station">Estación de inicio (opcional)</label>
    <p-select inputId="rental-start-station" [fluid]="true" formControlName="start_station_id"
      [options]="stations()" optionLabel="name" optionValue="id" [showClear]="true" />
  </div>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <button pButton type="submit" [loading]="saving()"><span pButtonLabel>Iniciar alquiler</span></button>
</form>
EOF

cat > src/app/features/rentals/rental-list/rental-list.html <<'EOF'
<section class="space-y-4">
  <app-page-header title="Alquileres" subtitle="Consulta y finaliza alquileres activos." />
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <p-table [value]="rows()" [loading]="loading()" dataKey="id">
    <ng-template #header><tr><th>Alquiler</th><th>Cliente</th><th>Bicicleta</th><th>Inicio</th><th>Estado</th><th>Total</th><th></th></tr></ng-template>
    <ng-template #body let-row>
      <tr>
        <td>#{{ row.id }}</td><td>{{ clientName()(row.client_id) }}</td>
        <td>{{ bicycleName()(row.bicycle_id) }}</td><td>{{ row.start_at | date:'short' }}</td>
        <td>{{ row.status }}</td><td>{{ toNumber(row.total) | currency:'COP':'symbol':'1.0-2' }}</td>
        <td>
          @if (row.status === 'active') {
            <button pButton type="button" severity="primary" (click)="finish(row)">Finalizar</button>
          }
        </td>
      </tr>
    </ng-template>
    <ng-template #emptymessage><tr><td colspan="7">No hay alquileres.</td></tr></ng-template>
  </p-table>
</section>
EOF
```

`finish(row)` debe pedir confirmación y permitir elegir `end_station_id`/`docking_point_id` opcionales. Llama `RentalApi.finish({ rental_id: row.id, ... })`; nunca construyas ni envíes `total`. En éxito, muestra el total devuelto por la API, recarga alquileres/bicicletas/reservas y emite una notificación; en error, conserva el alquiler como activo en pantalla hasta una carga confirmada.

Los imports standalone de las plantillas incluyen `DatePipe`, `CurrencyPipe`, `TableModule`, `SelectModule`, `ButtonModule`, `MessageModule`, `PageHeader` y `FormsModule`/`ReactiveFormsModule` según el formulario.

### 7.3 Plantillas de los módulos operativos complementarios

Escribe las vistas de mantenimiento, auditoría, penalidades y pagos con sus campos del contrato:

```bash
cat > src/app/features/rental-events/rental-event-list/rental-event-list.html <<'EOF'
<section class="space-y-4">
  <app-page-header title="Eventos de alquiler" subtitle="Historial de solo lectura generado por el backend." />
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <p-table [value]="rows()" [loading]="loading()" dataKey="id">
    <ng-template #header><tr><th>Alquiler</th><th>Tipo</th><th>Fecha</th><th>Cantidad</th><th>Observaciones</th></tr></ng-template>
    <ng-template #body let-row><tr>
      <td>{{ row.rental_id }}</td><td>{{ row.type }}</td><td>{{ row.event_date | date:'short' }}</td>
      <td>{{ row.quantity ?? '—' }}</td><td>{{ row.observations || '—' }}</td>
    </tr></ng-template>
    <ng-template #emptymessage><tr><td colspan="5">No hay eventos.</td></tr></ng-template>
  </p-table>
</section>
EOF

cat > src/app/features/maintenances/maintenance-form/maintenance-form.html <<'EOF'
<form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
  @if (!maintenance()) {
    <div><label for="maintenance-bicycle">Bicicleta *</label>
      <p-select inputId="maintenance-bicycle" [options]="bicycles()" optionLabel="serial_number"
        optionValue="id" formControlName="resource_id" [filter]="true" [fluid]="true" /></div>
  }
  <div><label for="maintenance-type">Tipo *</label>
    <input id="maintenance-type" pInputText formControlName="type" class="w-full" /></div>
  <div><label for="maintenance-date">Programada *</label>
    <input id="maintenance-date" type="datetime-local" formControlName="scheduled_at" class="w-full" /></div>
  <div><label for="maintenance-cost">Costo</label>
    <p-inputnumber inputId="maintenance-cost" formControlName="cost" [min]="0" mode="currency" currency="COP" /></div>
  <div><label for="maintenance-notes">Observaciones</label>
    <textarea id="maintenance-notes" pTextarea formControlName="observations" rows="3" class="w-full"></textarea></div>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <button pButton type="submit" [loading]="saving()">Guardar mantenimiento</button>
</form>
EOF

cat > src/app/features/maintenances/maintenance-list/maintenance-list.html <<'EOF'
<section class="space-y-4">
  <app-page-header title="Mantenimientos" subtitle="Programa y cierra mantenimientos de bicicletas.">
    <button pButton type="button" (click)="openCreate()">Nuevo mantenimiento</button>
  </app-page-header>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <p-table [value]="rows()" [loading]="loading()" dataKey="id">
    <ng-template #header><tr><th>Bicicleta</th><th>Tipo</th><th>Programada</th><th>Costo</th><th>Estado</th><th></th></tr></ng-template>
    <ng-template #body let-row><tr>
      <td>{{ bicycleName()(row.resource_id) }}</td><td>{{ row.type }}</td>
      <td>{{ row.scheduled_at | date:'short' }}</td><td>{{ toNumber(row.cost) | currency:'COP':'symbol':'1.0-2' }}</td>
      <td>{{ row.status }}</td><td>
        @if (!row.closed_at) {
          <button pButton type="button" (click)="complete(row)">Marcar completado</button>
        }
      </td>
    </tr></ng-template>
    <ng-template #emptymessage><tr><td colspan="6">No hay mantenimientos.</td></tr></ng-template>
  </p-table>
  <p-dialog [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
    header="Nuevo mantenimiento" [modal]="true">
    <app-maintenance-form [bicycles]="bicycles()" [saving]="saving()" [error]="formError()"
      (saved)="create($event)" (cancelled)="dialogVisible.set(false)" />
  </p-dialog>
</section>
EOF

cat > src/app/features/penalties/penalty-form/penalty-form.html <<'EOF'
<form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
  <div><label for="penalty-rental">Alquiler relacionado *</label>
    <p-select inputId="penalty-rental" [options]="rentals()" optionLabel="label" optionValue="id"
      formControlName="reference_id" [filter]="true" [fluid]="true" /></div>
  <div><label for="penalty-amount">Importe *</label>
    <p-inputnumber inputId="penalty-amount" formControlName="amount" [min]="0" mode="currency" currency="COP" /></div>
  <div><label for="penalty-notes">Observaciones</label>
    <textarea id="penalty-notes" pTextarea formControlName="observations" rows="3" class="w-full"></textarea></div>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <button pButton type="submit" [loading]="saving()">Guardar penalidad</button>
</form>
EOF

cat > src/app/features/penalties/penalty-list/penalty-list.html <<'EOF'
<section class="space-y-4">
  <app-page-header title="Penalidades" subtitle="Registra importes aprobados asociados a alquileres.">
    <button pButton type="button" (click)="openCreate()">Nueva penalidad</button>
  </app-page-header>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <p-table [value]="rows()" [loading]="loading()" dataKey="id">
    <ng-template #header><tr><th>Alquiler</th><th>Fecha</th><th>Importe</th><th>Estado</th><th>Observaciones</th></tr></ng-template>
    <ng-template #body let-row><tr>
      <td>{{ row.reference_id }}</td><td>{{ row.penalty_date | date:'short' }}</td>
      <td>{{ toNumber(row.amount) | currency:'COP':'symbol':'1.0-2' }}</td>
      <td>{{ row.status }}</td><td>{{ row.observations || '—' }}</td>
    </tr></ng-template>
    <ng-template #emptymessage><tr><td colspan="5">No hay penalidades.</td></tr></ng-template>
  </p-table>
  <p-dialog [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)" header="Nueva penalidad" [modal]="true">
    <app-penalty-form [rentals]="rentals()" [saving]="saving()" [error]="formError()"
      (saved)="create($event)" (cancelled)="dialogVisible.set(false)" />
  </p-dialog>
</section>
EOF

cat > src/app/features/payments/payment-form/payment-form.html <<'EOF'
<form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
  <div><label for="payment-rental">Alquiler relacionado *</label>
    <p-select inputId="payment-rental" [options]="rentals()" optionLabel="label" optionValue="id"
      formControlName="reference_id" [filter]="true" [fluid]="true" /></div>
  <div><label for="payment-method">Método *</label>
    <input id="payment-method" pInputText formControlName="method" class="w-full" /></div>
  <div><label for="payment-amount">Importe *</label>
    <p-inputnumber inputId="payment-amount" formControlName="amount" [min]="0" mode="currency" currency="COP" /></div>
  <div><label for="payment-date">Fecha</label>
    <input id="payment-date" type="datetime-local" formControlName="payment_date" class="w-full" /></div>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <button pButton type="submit" [loading]="saving()">Registrar pago</button>
</form>
EOF

cat > src/app/features/payments/payment-list/payment-list.html <<'EOF'
<section class="space-y-4">
  <app-page-header title="Pagos" subtitle="Consulta y registra pagos asociados a alquileres.">
    <button pButton type="button" (click)="openCreate()">Nuevo pago</button>
  </app-page-header>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <p-table [value]="rows()" [loading]="loading()" dataKey="id">
    <ng-template #header><tr><th>Alquiler</th><th>Método</th><th>Fecha</th><th>Importe</th><th>Estado</th></tr></ng-template>
    <ng-template #body let-row><tr>
      <td>{{ row.reference_id }}</td><td>{{ row.method }}</td><td>{{ row.payment_date | date:'short' }}</td>
      <td>{{ toNumber(row.amount) | currency:'COP':'symbol':'1.0-2' }}</td><td>{{ row.status }}</td>
    </tr></ng-template>
    <ng-template #emptymessage><tr><td colspan="5">No hay pagos.</td></tr></ng-template>
  </p-table>
  <p-dialog [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)" header="Nuevo pago" [modal]="true">
    <app-payment-form [rentals]="rentals()" [saving]="saving()" [error]="formError()"
      (saved)="create($event)" (cancelled)="dialogVisible.set(false)" />
  </p-dialog>
</section>
EOF
```

Los `rentals()` de pagos/penalidades son opciones de presentación y deben mapear `label` y `id`; no se manda `reference_type` porque el servicio no lo acepta en escritura. `complete(row)` actualiza mantenimiento con `{ status: 'completed', closed_at: new Date().toISOString() }` y recarga bicicletas después de respuesta 200. Las pantallas standalone importan los Pipes, Reactive Forms, controles PrimeNG y componentes standalone que usan; en creación, los errores dejan abierto el diálogo y no cambian el estado de la lista.

### 7.4 Integrar las rutas y navegación

Añade objetos dentro de `children` en `src/app/app.routes.ts`:

```ts
{
  path: 'rentals',
  title: 'Alquileres · PedalLibre',
  loadComponent: () =>
    import('./features/rentals/rental-list/rental-list').then((module) => module.RentalList),
},
{
  path: 'rental-events',
  title: 'Eventos de alquiler · PedalLibre',
  loadComponent: () =>
    import('./features/rental-events/rental-event-list/rental-event-list')
      .then((module) => module.RentalEventList),
},
{
  path: 'dashboard',
  title: 'Panel · PedalLibre',
  loadComponent: () =>
    import('./features/dashboard/dashboard').then((module) => module.Dashboard),
},
{
  path: 'maintenances',
  title: 'Mantenimientos · PedalLibre',
  loadComponent: () =>
    import('./features/maintenances/maintenance-list/maintenance-list')
      .then((module) => module.MaintenanceList),
},
{
  path: 'penalties',
  title: 'Penalidades · PedalLibre',
  loadComponent: () =>
    import('./features/penalties/penalty-list/penalty-list')
      .then((module) => module.PenaltyList),
},
{
  path: 'payments',
  title: 'Pagos · PedalLibre',
  loadComponent: () =>
    import('./features/payments/payment-list/payment-list')
      .then((module) => module.PaymentList),
},
```

En `src/app/layout/aside/aside.html`, añade dentro del `<nav>` existente los enlaces correspondientes, conservando el patrón del Shell:

```html
<a routerLink="/rentals" routerLinkActive="bg-emerald-50 text-emerald-800"
   class="flex min-h-11 items-center gap-3 rounded-lg px-3 text-slate-700 hover:bg-slate-100"
   (click)="navigate.emit()"><i class="pi pi-refresh" aria-hidden="true"></i><span>Alquileres</span></a>
<a routerLink="/rental-events" routerLinkActive="bg-emerald-50 text-emerald-800"
   class="flex min-h-11 items-center gap-3 rounded-lg px-3 text-slate-700 hover:bg-slate-100"
   (click)="navigate.emit()"><i class="pi pi-history" aria-hidden="true"></i><span>Eventos</span></a>
<a routerLink="/maintenances" routerLinkActive="bg-emerald-50 text-emerald-800"
   class="flex min-h-11 items-center gap-3 rounded-lg px-3 text-slate-700 hover:bg-slate-100"
   (click)="navigate.emit()"><i class="pi pi-wrench" aria-hidden="true"></i><span>Mantenimientos</span></a>
<a routerLink="/penalties" routerLinkActive="bg-emerald-50 text-emerald-800"
   class="flex min-h-11 items-center gap-3 rounded-lg px-3 text-slate-700 hover:bg-slate-100"
   (click)="navigate.emit()"><i class="pi pi-exclamation-triangle" aria-hidden="true"></i><span>Penalidades</span></a>
<a routerLink="/payments" routerLinkActive="bg-emerald-50 text-emerald-800"
   class="flex min-h-11 items-center gap-3 rounded-lg px-3 text-slate-700 hover:bg-slate-100"
   (click)="navigate.emit()"><i class="pi pi-credit-card" aria-hidden="true"></i><span>Pagos</span></a>
```

Conecta cada enlace a permisos efectivos en ISS-09. En cada diálogo la lista es dueña de cargar y guardar; el formulario emite un payload y no inyecta el API.

Para armar tarjetas del dashboard, crea una única carga con `forkJoin` para las listas necesarias y mantén Signals:

```ts
readonly rentals = signal<Rental[]>([]);
readonly bicycles = signal<Bicycle[]>([]);
readonly activeRentals = computed(() => this.rentals().filter((rental) => rental.status === 'active'));
readonly availableBicycles = computed(() => this.bicycles().filter((bicycle) =>
  bicycle.is_active && bicycle.status === 'available',
));
readonly revenue = computed(() => this.rentals()
  .filter((rental) => rental.status === 'completed')
  .reduce((sum, rental) => sum + toNumber(rental.total), 0));
```

`availableBicycles` del dashboard es un indicador aproximado de los registros descargados; para ofrecer una bicicleta en un flujo operativo, usa siempre `GET /api/bicycles/available`.

### 7.5 Pruebas y comandos

Genera pruebas junto a cada API y componente (sin `--skip-tests`). `RentalApi` debe afirmar las rutas `/start` y `/finish`, cuerpos exactos y respuesta `{ rental }`. Los tests del formulario impiden guardar sin reserva/tarifa. Una prueba de `409` confirma que `saving` vuelve a falso, se muestra el error y no se cambia localmente el estado a completado.

```bash
npm run ng -- test --watch=false --include='src/app/features/rentals/**/*.spec.ts'
npm run ng -- test --watch=false --include='src/app/features/rental-events/**/*.spec.ts'
npm run ng -- test --watch=false --include='src/app/features/maintenances/**/*.spec.ts'
npm run ng -- test --watch=false --include='src/app/features/penalties/**/*.spec.ts'
npm run ng -- test --watch=false --include='src/app/features/payments/**/*.spec.ts'
npm test -- --watch=false
npm run build
npm start
```

Recorre en `http://localhost:4200`: `/dashboard`, `/rentals`, `/rental-events`, `/maintenances`, `/penalties` y `/payments`, incluidas recargas directas. Escribe la salida observada de pruebas/build en el informe; no copies métricas de otra copia.

Implementa por etapas y vuelve a correr las pruebas relacionadas después de cada una:

1. Lista de reservas elegibles e inicio transaccional.
2. Lista de alquileres y finalización transaccional.
3. Historial de eventos como recurso de solo lectura.
4. Mantenimientos, penalidades y pagos limitados al contrato.
5. Dashboard y recarga de datos derivados.

## Criterios de aceptación y evidencia

- [ ] La UI inicia alquiler solo desde reserva y tarifa elegibles; no crea alquiler enviando un objeto completo.
- [ ] El UI de finalización no calcula el total ni cambia el estado antes de recibir respuesta exitosa.
- [ ] Las pruebas demuestran que los payloads de inicio/cierre contienen IDs permitidos y que `409` deja la operación visible como fallida.
- [ ] Se muestran eventos de alquiler como registros de auditoría de solo lectura.
- [ ] Mantenimiento bloquea las expectativas erróneas sobre disponibilidad; estados y fechas se refrescan desde la respuesta/lista.
- [ ] Penalidades y pagos no inventan reglas comerciales no definidas por PedalLibre.
- [ ] Dashboard deriva los contadores de datos cargados; no presenta un endpoint de dashboard inexistente.
- [ ] El menú y rutas mantienen el Shell y no duplican llamadas; errores API, carga y ausencia de datos son estados diferentes.
- [ ] Build y pruebas pasan; evidencia visual se captura en navegador PedalLibre.

```bash
npm test -- --watch=false
npm run build
```

Las pruebas con `HttpTestingController` no prueban una transacción MySQL. Para la evidencia integrada, verifica antes/después en la API que la bicicleta, reserva, tarifa, alquiler, movimiento y eventos quedaron consistentes. Hazlo después de integrar sesión; no abras endpoints protegidos para tomar capturas.

**Siguiente:** ISS-08 incorpora login, tokens y permisos efectivos.  
**Ruta de lectura:** ← ISS-06 · ↑ [índice de guías](./README.md) · → ISS-08
