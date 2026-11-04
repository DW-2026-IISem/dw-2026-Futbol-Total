# Fase I: Frontend — ISS-06: Tarifas y reservas

**Estado:** implementado en la página CRUD compartida de negocio, con validación de campos y payloads, selectores legibles para relaciones de reserva y pruebas unitarias de catálogos/errores. La verificación E2E de negocio contra API real permanece pendiente.  
**Proyecto:** PedalLibre, `Frontd-2026`  
**Depende de:** ISS-05 — Bicicletas y movimientos de anclaje  
**Habilita:** ISS-07 — Ciclo transaccional de alquileres y cierre de negocio  
**Revisión del contrato:** 3-nov-2026

## Objetivo

Construir las pantallas de tarifas y reservas usando los contratos PedalLibre. No existe una venta de productos, impuestos ni descuento. La tarifa define cómo calcular un alquiler y la reserva se convierte en alquiler mediante el flujo transaccional de ISS-07.

Ambos recursos usan las rutas de negocio protegidas por `authenticate` y `authorize`. La implementación unitaria debe simular HTTP; el frontend aún no tiene sesión ni interceptor.

## Tarifas

| Operación | Ruta | Respuesta |
|---|---|---|
| Listar | `GET /api/rates` | `{ items }` |
| Consultar | `GET /api/rates/:id` | `{ item }` |
| Crear | `POST /api/rates` | `201 { item }` |
| Editar parcialmente | `PATCH /api/rates/:id` | `200 { item }` |
| Eliminar físicamente | `DELETE /api/rates/:id` | `204` |

Campos: `name` (requerido), `calculation_rule` (requerido), `base_value` (requerido), `valid_from`, `valid_until` e `is_active`. `base_value` es `DECIMAL` y puede llegar como string: normalízalo con el helper monetario compartido antes de hacer cálculos o formatearlo.

El backend admite reglas `fixed`/`fijo`, `hourly`/`por_hora` y `daily`/`por_dia`. Al iniciar un alquiler, la tarifa debe estar activa y vigente para la fecha actual. No inventes cobros por minuto, impuestos ni políticas distintas a esas reglas.

## Reservas

| Operación | Ruta | Respuesta |
|---|---|---|
| Listar | `GET /api/reservations` | `{ items }` |
| Consultar | `GET /api/reservations/:id` | `{ item }` |
| Crear | `POST /api/reservations` | `201 { item }` |
| Actualizar | `PATCH /api/reservations/:id` | `200 { item }` |

No existe `DELETE` para reservas. Campos de creación aceptados: `client_id`, `bicycle_id`, `station_id`, `start_at`, `end_at`, `expires_at` y `observations`. Para una actualización el backend solo admite `bicycle_id`, `station_id`, `start_at`, `end_at`, `expires_at` y `observations`: `client_id` no se cambia.

Reglas que afectan a la UX:

- `client_id` debe referenciar un cliente activo. Para una cuenta cuyo rol es `CLIENTE`, el backend determina el perfil asociado a la sesión e ignora el ID suministrado; si la cuenta no está vinculada a un cliente activo, responde `403`.
- `bicycle_id` y `station_id` son opcionales, pero si se envían deben identificar recursos activos. La bicicleta debe estar `available` y sin alquiler activo.
- Si existen inicio y fin, fin debe ser posterior al inicio. Reservas de una misma bicicleta no pueden superponerse en estados `pending` o `in_progress`.
- La reserva inicia en `pending`; no marques una reserva como alquilada desde el frontend.

## Construcción

```bash
ng generate component features/rates/rate-list --standalone
ng generate component features/rates/rate-form --standalone
ng generate component features/reservations/reservation-list --standalone
ng generate component features/reservations/reservation-form --standalone
```

Carga los catálogos requeridos en paralelo (`clients`, `stations`, bicicletas disponibles) solo en la pantalla que los necesita. En los `p-select` usa `optionValue="id"` para guardar números y `optionLabel` para mostrar texto. Maneja Signals para carga, guardado, filtro, error y diálogo; el filtro es local y no llama de nuevo al API.

Los servicios deben respetar `{ items }`/`{ item }`, mapear `base_value` de forma segura y usar los métodos HTTP permitidos. En el formulario de reserva, envía fechas ISO y no presentes campos que no acepte el endpoint.

### 6.1 Crear modelos y servicios

Ejecuta desde `Frontd-2026`; estos son los campos permitidos por el servicio PedalLibre:

```bash
cat > src/app/core/models/rate.model.ts <<'EOF'
import { Money } from './api.model';

export type RateRule = 'fixed' | 'fijo' | 'hourly' | 'por_hora' | 'daily' | 'por_dia';

export interface Rate {
  id: number;
  name: string;
  calculation_rule: RateRule;
  base_value: Money;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}

export interface RatePayload {
  name: string;
  calculation_rule: RateRule;
  base_value: number;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active?: boolean;
}
EOF

cat > src/app/core/models/reservation.model.ts <<'EOF'
export interface Reservation {
  id: number;
  client_id: number;
  bicycle_id: number | null;
  station_id: number | null;
  start_at: string | null;
  end_at: string | null;
  reserved_at: string;
  expires_at: string | null;
  status: string;
  observations: string;
}

export interface ReservationCreatePayload {
  client_id: number;
  bicycle_id?: number | null;
  station_id?: number | null;
  start_at?: string | null;
  end_at?: string | null;
  expires_at?: string | null;
  observations?: string;
}

export type ReservationPatchPayload = Partial<
  Omit<ReservationCreatePayload, 'client_id'>
>;
EOF

cat > src/app/features/rates/rate-api.ts <<'EOF'
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Rate, RatePayload } from '../../core/models/rate.model';

@Injectable({ providedIn: 'root' })
export class RateApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/rates`;
  list(): Observable<Rate[]> {
    return this.http.get<{ items: Rate[] }>(this.base).pipe(map(({ items }) => items));
  }
  get(id: number): Observable<Rate> {
    return this.http.get<{ item: Rate }>(`${this.base}/${id}`).pipe(map(({ item }) => item));
  }
  create(payload: RatePayload): Observable<Rate> {
    return this.http.post<{ item: Rate }>(this.base, payload).pipe(map(({ item }) => item));
  }
  update(id: number, payload: Partial<RatePayload>): Observable<Rate> {
    return this.http.patch<{ item: Rate }>(`${this.base}/${id}`, payload).pipe(map(({ item }) => item));
  }
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
EOF

cat > src/app/features/reservations/reservation-api.ts <<'EOF'
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Reservation,
  ReservationCreatePayload,
  ReservationPatchPayload,
} from '../../core/models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reservations`;
  list(): Observable<Reservation[]> {
    return this.http.get<{ items: Reservation[] }>(this.base).pipe(map(({ items }) => items));
  }
  get(id: number): Observable<Reservation> {
    return this.http.get<{ item: Reservation }>(`${this.base}/${id}`).pipe(map(({ item }) => item));
  }
  create(payload: ReservationCreatePayload): Observable<Reservation> {
    return this.http.post<{ item: Reservation }>(this.base, payload).pipe(map(({ item }) => item));
  }
  update(id: number, payload: ReservationPatchPayload): Observable<Reservation> {
    return this.http.patch<{ item: Reservation }>(`${this.base}/${id}`, payload).pipe(map(({ item }) => item));
  }
}
EOF
```

### 6.2 Plantillas con `cat`

El generador crea los archivos HTML. Sustituye la plantilla de tarifa con un formulario que use Reactive Forms, no con una plantilla de ventas:

```bash
cat > src/app/features/rates/rate-form/rate-form.html <<'EOF'
<form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
  <div>
    <label for="rate-name" class="mb-1 block text-sm font-medium">Nombre *</label>
    <input id="rate-name" pInputText formControlName="name" class="w-full" />
  </div>
  <div>
    <label for="rate-rule" class="mb-1 block text-sm font-medium">Regla de cálculo *</label>
    <p-select inputId="rate-rule" [fluid]="true" formControlName="calculation_rule"
      [options]="ruleOptions" optionLabel="label" optionValue="value" />
  </div>
  <div>
    <label for="rate-value" class="mb-1 block text-sm font-medium">Valor base *</label>
    <p-inputnumber inputId="rate-value" [fluid]="true" formControlName="base_value"
      mode="currency" currency="COP" [min]="0" />
  </div>
  <div class="grid gap-4 sm:grid-cols-2">
    <div><label for="rate-from">Vigente desde</label><input id="rate-from" type="date" formControlName="valid_from" class="w-full" /></div>
    <div><label for="rate-until">Vigente hasta</label><input id="rate-until" type="date" formControlName="valid_until" class="w-full" /></div>
  </div>
  <div class="flex justify-end gap-2">
    <button pButton type="button" severity="secondary" (click)="cancelled.emit()"><span pButtonLabel>Cancelar</span></button>
    <button pButton type="submit" [loading]="saving()"><span pButtonLabel>Guardar tarifa</span></button>
  </div>
</form>
EOF
```

En `rate-form.ts`, define `ruleOptions` con solo las reglas admitidas; inicializa `base_value` con `toNumber(rate.base_value)` al editar y emite solo el payload. La API debe seguir recibiendo `base_value` numérico.

```bash
cat > src/app/features/reservations/reservation-form/reservation-form.html <<'EOF'
<form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
  <div>
    <label for="reservation-client">Cliente *</label>
    <p-select inputId="reservation-client" [fluid]="true" formControlName="client_id"
      [options]="clients()" optionLabel="fullName" optionValue="id" [filter]="true" />
  </div>
  <div>
    <label for="reservation-bicycle">Bicicleta disponible</label>
    <p-select inputId="reservation-bicycle" [fluid]="true" formControlName="bicycle_id"
      [options]="bicycles()" optionLabel="serial_number" optionValue="id"
      placeholder="Sin asignar" [showClear]="true" />
  </div>
  <div>
    <label for="reservation-station">Estación</label>
    <p-select inputId="reservation-station" [fluid]="true" formControlName="station_id"
      [options]="stations()" optionLabel="name" optionValue="id"
      placeholder="Sin estación" [showClear]="true" />
  </div>
  <div class="grid gap-4 sm:grid-cols-2">
    <div><label for="reservation-start">Inicio</label><input id="reservation-start" type="datetime-local" formControlName="start_at" class="w-full" /></div>
    <div><label for="reservation-end">Fin</label><input id="reservation-end" type="datetime-local" formControlName="end_at" class="w-full" /></div>
  </div>
  <div><label for="reservation-observations">Observaciones</label><textarea id="reservation-observations" pTextarea formControlName="observations" rows="3" class="w-full"></textarea></div>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <div class="flex justify-end gap-2">
    <button pButton type="button" severity="secondary" (click)="cancelled.emit()"><span pButtonLabel>Cancelar</span></button>
    <button pButton type="submit" [loading]="saving()"><span pButtonLabel>Guardar reserva</span></button>
  </div>
</form>
EOF
```

`fullName` debe construirse como propiedad de presentación en TypeScript a partir del `Client.first_name/last_name`; no asumas que la API de clientes devuelve `name`. Para `CLIENTE`, el servidor determina el `client_id` asociado a su sesión; no expongas selector de otros clientes a ese usuario. Convierte el valor `datetime-local` a ISO antes de emitir. Si solo se envía una de las dos fechas, no intentes validar una pareja incompleta en el navegador; si se envían ambas, exige fin posterior al inicio.

Completa los componentes lista con sus tablas y diálogos:

```bash
cat > src/app/features/rates/rate-list/rate-list.html <<'EOF'
<section class="space-y-4">
  <app-page-header title="Tarifas" subtitle="Administra las reglas y vigencias de cobro.">
    <button pButton type="button" (click)="openCreate()">
      <i pButtonIcon class="pi pi-plus"></i><span pButtonLabel>Nueva tarifa</span>
    </button>
  </app-page-header>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <p-table [value]="rows()" [loading]="loading()" dataKey="id">
    <ng-template #header><tr><th>Nombre</th><th>Regla</th><th>Valor base</th><th>Vigencia</th><th>Activa</th><th></th></tr></ng-template>
    <ng-template #body let-row>
      <tr>
        <td>{{ row.name }}</td><td>{{ row.calculation_rule }}</td>
        <td>{{ toNumber(row.base_value) | currency:'COP':'symbol':'1.0-2' }}</td>
        <td>{{ row.valid_from || '—' }} — {{ row.valid_until || '—' }}</td><td>{{ row.is_active ? 'Sí' : 'No' }}</td>
        <td>
          <button pButton type="button" text (click)="openEdit(row)" [attr.aria-label]="'Editar tarifa ' + row.name">
            <i pButtonIcon class="pi pi-pencil"></i>
          </button>
          <button pButton type="button" text severity="danger" (click)="remove(row)"
            [attr.aria-label]="'Eliminar tarifa ' + row.name"><i pButtonIcon class="pi pi-trash"></i></button>
        </td>
      </tr>
    </ng-template>
    <ng-template #emptymessage><tr><td colspan="6">No hay tarifas.</td></tr></ng-template>
  </p-table>
  <p-dialog [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
    [header]="editing() ? 'Editar tarifa' : 'Nueva tarifa'" [modal]="true">
    <app-rate-form [rate]="editing()" [saving]="saving()" (saved)="save($event)"
      (cancelled)="dialogVisible.set(false)" />
  </p-dialog>
</section>
EOF

cat > src/app/features/reservations/reservation-list/reservation-list.html <<'EOF'
<section class="space-y-4">
  <app-page-header title="Reservas" subtitle="Consulta y gestiona las reservas de bicicletas.">
    <button pButton type="button" (click)="openCreate()">
      <i pButtonIcon class="pi pi-plus"></i><span pButtonLabel>Nueva reserva</span>
    </button>
  </app-page-header>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <p-table [value]="rows()" [loading]="loading()" dataKey="id">
    <ng-template #header><tr><th>Cliente</th><th>Bicicleta</th><th>Estación</th><th>Inicio</th><th>Fin</th><th>Estado</th><th></th></tr></ng-template>
    <ng-template #body let-row>
      <tr>
        <td>{{ clientName()(row.client_id) }}</td><td>{{ bicycleName()(row.bicycle_id) }}</td>
        <td>{{ stationName()(row.station_id) }}</td><td>{{ row.start_at | date:'short' }}</td>
        <td>{{ row.end_at | date:'short' }}</td><td>{{ row.status }}</td>
        <td><button pButton type="button" text (click)="openEdit(row)"
          [attr.aria-label]="'Editar reserva ' + row.id"><i pButtonIcon class="pi pi-pencil"></i></button></td>
      </tr>
    </ng-template>
    <ng-template #emptymessage><tr><td colspan="7">No hay reservas.</td></tr></ng-template>
  </p-table>
  <p-dialog [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
    [header]="editing() ? 'Editar reserva' : 'Nueva reserva'" [modal]="true">
    <app-reservation-form [reservation]="editing()" [saving]="saving()" [error]="formError()"
      [clients]="clients()" [bicycles]="availableBicycles()" [stations]="stations()"
      (saved)="save($event)" (cancelled)="dialogVisible.set(false)" />
  </p-dialog>
</section>
EOF
```

En las listas importa `TableModule`, `DialogModule`, `ButtonModule`, `MessageModule`, `PageHeader` y los componentes formulario; añade `CurrencyPipe`/`DatePipe` donde se usan. El listado de CLIENTE debe filtrar en backend por sesión; no confíes en el filtro local como control de acceso. `remove(row)` en tarifas pide confirmación y recarga únicamente tras el `204`; reservas no tienen acción de borrado.

### 6.3 Integrar rutas y menú

Añade dentro de `children` en `src/app/app.routes.ts`:

```ts
{
  path: 'rates',
  title: 'Tarifas · PedalLibre',
  loadComponent: () =>
    import('./features/rates/rate-list/rate-list').then((module) => module.RateList),
},
{
  path: 'reservations',
  title: 'Reservas · PedalLibre',
  loadComponent: () =>
    import('./features/reservations/reservation-list/reservation-list')
      .then((module) => module.ReservationList),
},
```

En `src/app/layout/aside/aside.html`, añade enlaces directos `/rates` y `/reservations` dentro del `<nav>` existente. Usa el evento `(click)="navigate.emit()"` para cerrar el menú móvil; no crees otro `RouterOutlet` ni otro Shell. Los `p-dialog` de lista deben conectar el formulario así: `[rate]="editing()"`, `(saved)="save($event)"`, `(cancelled)="dialogVisible.set(false)"`; el padre llama `RateApi.create/update`, notifica éxito/error y recarga.

### 6.4 Pruebas y recorrido reproducible

Pruebas de `RateApi` y `ReservationApi`: usa `HttpTestingController` y verifica URL, verbo, payload y envoltura. Pruebas del formulario: reglas de tarifa permitidas, valor numérico, fin después de inicio e IDs numéricos; la reserva no debe exponer acción DELETE.

```bash
npm run ng -- test --watch=false --include='src/app/features/rates/**/*.spec.ts'
npm run ng -- test --watch=false --include='src/app/features/reservations/**/*.spec.ts'
npm test -- --watch=false
npm run build
npm start
```

Con `npm start`, prueba `http://localhost:4200/rates` y `http://localhost:4200/reservations`, también tras recarga directa. La integración HTTP de verdad requiere ISS-08 para autenticación; hasta entonces las pruebas son simuladas y un `401` del backend protegido es esperado.

## Criterios de aceptación

- [ ] Tarifas: CRUD acorde con `PATCH` parcial y `DELETE` físico confirmados.
- [ ] Las validaciones del cliente cubren nombre, regla permitida, valor numérico no negativo y coherencia de fechas de vigencia.
- [ ] El total mostrado por cualquier resumen normaliza `DECIMAL`; una cadena monetaria no se concatena como texto.
- [ ] Reservas: list/create/get/patch usan envolturas reales; no se ofrece eliminar.
- [x] Los selectores guardan IDs numéricos y muestran cliente/bicicleta/estación legibles; la selección de catálogos se filtra por permisos y los fallos se notifican.
- [ ] Errores `400`, `403`, `404` y `409` se conservan y explican; un choque de horario no se presenta como creación exitosa.
- [ ] Las pruebas verifican campos y métodos permitidos, validación de fechas, alcance de usuario `CLIENTE` y manejo de errores simulados.
- [ ] Rutas directas dentro del Shell, build y pruebas pasan.

```bash
npm test -- --watch=false
npm run build
```

La prueba real de alcance por rol y de disponibilidad depende de ISS-08/09 y de una API PedalLibre con datos y permisos configurados. No pegues un token ni cambies la autorización del backend para completar la evidencia.

**Siguiente:** ISS-07 inicia y finaliza alquileres mediante operaciones transaccionales.  
**Ruta de lectura:** ← ISS-05 · ↑ [índice de guías](./README.md) · → ISS-07
