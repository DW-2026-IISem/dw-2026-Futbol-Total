# Fase I: Frontend — ISS-05: Bicicletas y movimientos de anclaje

**Estado:** preparado para iniciar; el feature no existe aún en el frontend inspeccionado.  
**Proyecto:** PedalLibre, `Frontd-2026`  
**Depende de:** ISS-04 — Estaciones y puntos de anclaje  
**Habilita:** ISS-06 — Tarifas y reservas  
**Revisión del contrato:** 3-nov-2026

> Este ISS no construye una tienda, productos ni inventario de ventas. El recurso del dominio es una bicicleta, y su ubicación se obtiene del historial de `bicycle_dockings`.

## Objetivo y límites del dominio

Implementa el catálogo de bicicletas y las acciones transaccionales para anclar/desanclar. El servidor es quien determina la disponibilidad; no actualices a mano `status` para simular una operación de alquiler o un movimiento.

Campos editables del CRUD de bicicletas: `serial_number` (requerido), `name`, `description`, `bicycle_type`, `is_active`. Aunque la respuesta incluye `status`, el servicio genérico no permite modificarlo. Los flujos de alquiler y mantenimiento controlan ese estado.

## Contrato HTTP

| Operación | Ruta | Respuesta |
|---|---|---|
| Listar bicicletas | `GET /api/bicycles` | `200 { items }` |
| Consultar bicicleta | `GET /api/bicycles/:id` | `200 { item }` |
| Crear bicicleta | `POST /api/bicycles` | `201 { item }` |
| Editar bicicleta | `PATCH /api/bicycles/:id` | `200 { item }` |
| Eliminar bicicleta | `DELETE /api/bicycles/:id` | `204` |
| Consultar disponibles | `GET /api/bicycles/available` | `200 { bicycles }` |
| Listar movimientos | `GET /api/bicycle-dockings` | `200 { items }` |
| Consultar movimiento | `GET /api/bicycle-dockings/:id` | `200 { item }` |
| Anclar | `POST /api/bicycle-dockings/dock` | `201 { docking }` |
| Desanclar | `PATCH /api/bicycle-dockings/:id/undock` | `200 { docking }` |

Todas estas operaciones requieren autenticación y autorización. `dock` recibe `{ "bicycle_id": 1, "docking_point_id": 2 }`. `undock` recibe el ID del movimiento activo en la URL y no necesita inventar un cuerpo de edición.

El backend hace transacción al anclar: valida bicicleta y punto activos/disponibles, impide dos anclajes activos de la misma bicicleta o punto, crea el movimiento y actualiza el estado del punto. El movimiento activo se reconoce por `undocked_at === null`. En errores de conflicto (por ejemplo, `409`), conserva la UI y explica el mensaje.

## Construcción

```bash
ng generate component features/bicycles/bicycle-list --standalone
ng generate component features/bicycles/bicycle-form --standalone
ng generate component features/bicycle-dockings/bicycle-docking-list --standalone
```

Reutiliza la lista de estaciones y anclajes de ISS-04. Resuelve nombres con mapas `id → nombre` en `computed()`; conserva los IDs numéricos en los payloads.

### 5.1 Crear los modelos y servicios

```bash
mkdir -p src/app/core/models
cat > src/app/core/models/bicycle.model.ts <<'EOF'
export interface Bicycle {
  id: number;
  serial_number: string;
  name: string;
  description: string;
  bicycle_type: string;
  status: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BicyclePayload {
  serial_number: string;
  name?: string;
  description?: string;
  bicycle_type?: string;
  is_active?: boolean;
}

export interface BicycleDocking {
  id: number;
  bicycle_id: number;
  docking_point_id: number;
  docked_at: string;
  undocked_at: string | null;
}
EOF

cat > src/app/features/bicycles/bicycle-api.ts <<'EOF'
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Bicycle, BicyclePayload } from '../../core/models/bicycle.model';

@Injectable({ providedIn: 'root' })
export class BicycleApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/bicycles`;

  list(): Observable<Bicycle[]> {
    return this.http.get<{ items: Bicycle[] }>(this.base).pipe(map(({ items }) => items));
  }
  available(): Observable<Bicycle[]> {
    return this.http.get<{ bicycles: Bicycle[] }>(`${this.base}/available`).pipe(map(({ bicycles }) => bicycles));
  }
  get(id: number): Observable<Bicycle> {
    return this.http.get<{ item: Bicycle }>(`${this.base}/${id}`).pipe(map(({ item }) => item));
  }
  create(payload: BicyclePayload): Observable<Bicycle> {
    return this.http.post<{ item: Bicycle }>(this.base, payload).pipe(map(({ item }) => item));
  }
  update(id: number, payload: Partial<BicyclePayload>): Observable<Bicycle> {
    return this.http.patch<{ item: Bicycle }>(`${this.base}/${id}`, payload).pipe(map(({ item }) => item));
  }
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
EOF

cat > src/app/features/bicycle-dockings/bicycle-docking-api.ts <<'EOF'
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BicycleDocking } from '../../core/models/bicycle.model';

@Injectable({ providedIn: 'root' })
export class BicycleDockingApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/bicycle-dockings`;

  list(): Observable<BicycleDocking[]> {
    return this.http.get<{ items: BicycleDocking[] }>(this.base).pipe(map(({ items }) => items));
  }
  dock(bicycle_id: number, docking_point_id: number): Observable<BicycleDocking> {
    return this.http.post<{ docking: BicycleDocking }>(`${this.base}/dock`, {
      bicycle_id,
      docking_point_id,
    }).pipe(map(({ docking }) => docking));
  }
  undock(id: number): Observable<BicycleDocking> {
    return this.http.patch<{ docking: BicycleDocking }>(`${this.base}/${id}/undock`, {})
      .pipe(map(({ docking }) => docking));
  }
}
EOF
```

### 5.2 Escribir la plantilla de alta/edición y enlazar acciones

Usa `cat` para sustituir la plantilla del formulario generado; el componente debe exponer `form`, `saving`, `bicycle`, `saved` y `cancelled` mediante Reactive Forms e `input()/output()`:

```bash
cat > src/app/features/bicycles/bicycle-form/bicycle-form.html <<'EOF'
<form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
  <div>
    <label for="bicycle-serial" class="mb-1 block text-sm font-medium">Número de serie *</label>
    <input id="bicycle-serial" pInputText formControlName="serial_number" class="w-full" />
    @if (form.controls.serial_number.touched && form.controls.serial_number.invalid) {
      <p-message severity="error" size="small" variant="simple">El número de serie es obligatorio.</p-message>
    }
  </div>
  <div>
    <label for="bicycle-name" class="mb-1 block text-sm font-medium">Nombre</label>
    <input id="bicycle-name" pInputText formControlName="name" class="w-full" />
  </div>
  <div>
    <label for="bicycle-type" class="mb-1 block text-sm font-medium">Tipo</label>
    <input id="bicycle-type" pInputText formControlName="bicycle_type" class="w-full" />
  </div>
  <div>
    <label for="bicycle-description" class="mb-1 block text-sm font-medium">Descripción</label>
    <textarea id="bicycle-description" pTextarea formControlName="description" rows="3" class="w-full"></textarea>
  </div>
  <div class="flex justify-end gap-2">
    <button pButton type="button" severity="secondary" (click)="cancelled.emit()"><span pButtonLabel>Cancelar</span></button>
    <button pButton type="submit" [loading]="saving()"><span pButtonLabel>Guardar</span></button>
  </div>
</form>
EOF
```

No agregues un selector de `status`: el servicio genérico rechaza ese campo en escritura. En el listado, usa el servicio de confirmación de ISS-03 para `remove(row)` y recarga únicamente después de recibir `204`.

Escribe la plantilla de listado y conecta el formulario por outputs:

```bash
cat > src/app/features/bicycles/bicycle-list/bicycle-list.html <<'EOF'
<section class="space-y-4">
  <app-page-header title="Bicicletas" subtitle="Administra el catálogo de la flota.">
    <button pButton type="button" (click)="openCreate()">
      <i pButtonIcon class="pi pi-plus"></i><span pButtonLabel>Nueva bicicleta</span>
    </button>
  </app-page-header>
  <label for="bicycle-filter" class="sr-only">Buscar bicicleta</label>
  <input id="bicycle-filter" pInputText [value]="filter()" (input)="setFilter($event)"
    placeholder="Serie, nombre o tipo" class="w-full sm:max-w-md" />
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <p-table [value]="visibleRows()" [loading]="loading()" dataKey="id">
    <ng-template #header><tr><th>Serie</th><th>Nombre</th><th>Tipo</th><th>Estado operativo</th><th>Activa</th><th></th></tr></ng-template>
    <ng-template #body let-row>
      <tr>
        <td>{{ row.serial_number }}</td><td>{{ row.name || '—' }}</td><td>{{ row.bicycle_type || '—' }}</td>
        <td>{{ row.status }}</td><td>{{ row.is_active ? 'Sí' : 'No' }}</td>
        <td class="flex gap-2">
          <button pButton type="button" text (click)="openEdit(row)" [attr.aria-label]="'Editar ' + row.serial_number">
            <i pButtonIcon class="pi pi-pencil"></i>
          </button>
          <button pButton type="button" text severity="danger" (click)="remove(row)"
            [attr.aria-label]="'Eliminar ' + row.serial_number"><i pButtonIcon class="pi pi-trash"></i></button>
        </td>
      </tr>
    </ng-template>
    <ng-template #emptymessage><tr><td colspan="6">No hay bicicletas para mostrar.</td></tr></ng-template>
  </p-table>
  <p-dialog [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
    [header]="editing() ? 'Editar bicicleta' : 'Nueva bicicleta'" [modal]="true"
    [style]="{ width: 'min(38rem, 95vw)' }">
    <app-bicycle-form [bicycle]="editing()" [saving]="saving()"
      (saved)="save($event)" (cancelled)="dialogVisible.set(false)" />
  </p-dialog>
</section>
EOF
```

En `BicycleList`, importa `TableModule`, `DialogModule`, `ButtonModule`, `InputTextModule`, `MessageModule`, `PageHeader` y `BicycleForm`. El filtro opera sobre filas ya cargadas; no ocultes los datos completos ante un error de filtro.

### 5.3 Integrar rutas y menú

Añade objetos dentro de `children` en `src/app/app.routes.ts`; son rutas de lista, no declares componentes contenedores duplicados:

```ts
{
  path: 'bicycles',
  title: 'Bicicletas · PedalLibre',
  loadComponent: () =>
    import('./features/bicycles/bicycle-list/bicycle-list').then((module) => module.BicycleList),
},
{
  path: 'bicycle-dockings',
  title: 'Movimientos de anclaje · PedalLibre',
  loadComponent: () =>
    import('./features/bicycle-dockings/bicycle-docking-list/bicycle-docking-list')
      .then((module) => module.BicycleDockingList),
},
```

En `src/app/layout/aside/aside.html`, agrega dentro del `<nav>` enlaces a `/bicycles` y `/bicycle-dockings`, con `routerLinkActive`, `(click)="navigate.emit()"` y el mismo patrón Tailwind de Inicio. El flujo de anclaje debe abrir un diálogo/lista con selectores de bicicleta disponible y punto disponible; el submit debe llamar `BicycleDockingApi.dock(bicycleId, pointId)`. El botón de desanclar solo se renderiza si `row.undocked_at === null` y llama `undock(row.id)`. Esas dos peticiones son la integración real del flujo; no llames `PATCH /bicycles/:id` para simularlas.

Para una tabla de movimientos, sustituye la plantilla generada mediante:

```bash
cat > src/app/features/bicycle-dockings/bicycle-docking-list/bicycle-docking-list.html <<'EOF'
<section class="space-y-4">
  <app-page-header title="Movimientos de anclaje" subtitle="Historial de anclaje y desanclaje de bicicletas.">
    <button pButton type="button" (click)="openDock()">
      <i pButtonIcon class="pi pi-link"></i><span pButtonLabel>Anclar bicicleta</span>
    </button>
  </app-page-header>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <p-table [value]="rows()" [loading]="loading()" dataKey="id">
    <ng-template #header><tr><th>Bicicleta</th><th>Punto</th><th>Anclada</th><th>Desanclada</th><th>Acción</th></tr></ng-template>
    <ng-template #body let-row>
      <tr>
        <td>{{ bicycleName()(row.bicycle_id) }}</td><td>{{ pointName()(row.docking_point_id) }}</td>
        <td>{{ row.docked_at | date:'short' }}</td><td>{{ row.undocked_at ? (row.undocked_at | date:'short') : 'Activa' }}</td>
        <td>
          @if (row.undocked_at === null) {
            <button pButton type="button" severity="secondary" (click)="undock(row)">Desanclar</button>
          }
        </td>
      </tr>
    </ng-template>
    <ng-template #emptymessage><tr><td colspan="5">No hay movimientos.</td></tr></ng-template>
  </p-table>
  <p-dialog [visible]="dockDialogVisible()" (visibleChange)="dockDialogVisible.set($event)"
    header="Anclar bicicleta" [modal]="true" [style]="{ width: 'min(38rem, 95vw)' }">
    <form [formGroup]="dockForm" (ngSubmit)="saveDock()" class="space-y-4">
      <div><label for="dock-bicycle">Bicicleta disponible *</label>
        <p-select inputId="dock-bicycle" [options]="availableBicycles()" optionLabel="serial_number"
          optionValue="id" formControlName="bicycle_id" [filter]="true" [fluid]="true" /></div>
      <div><label for="dock-point">Punto disponible *</label>
        <p-select inputId="dock-point" [options]="availablePoints()" optionLabel="label"
          optionValue="id" formControlName="docking_point_id" [filter]="true" [fluid]="true" /></div>
      @if (dockError()) { <p-message severity="error">{{ dockError() }}</p-message> }
      <div class="flex justify-end gap-2">
        <button pButton type="button" severity="secondary" (click)="dockDialogVisible.set(false)">Cancelar</button>
        <button pButton type="submit" [loading]="savingDock()">Confirmar anclaje</button>
      </div>
    </form>
  </p-dialog>
</section>
EOF
```

En `BicycleDockingList`, `availableBicycles()` procede de `BicycleApi.available()` (`{ bicycles }`); `availablePoints()` se filtra de los puntos activos/disponibles cargados por `DockingPointApi.list()` según el contrato comprobado. Construye `label` solo para presentación; conserva IDs numéricos. `saveDock()` llama `BicycleDockingApi.dock(bicycle_id, docking_point_id)` y refresca los datos solo si el servidor confirma. Importa `DatePipe`, `ReactiveFormsModule`, `TableModule`, `DialogModule`, `SelectModule`, `ButtonModule`, `MessageModule` y `PageHeader`.

### 5.4 Pruebas ejecutables

Asegura que cada servicio tenga `.spec.ts` con `provideHttpClient()` y `provideHttpClientTesting()`. Prueba `GET /bicycles/available` por separado de `GET /bicycles` y confirma que `verify()` no detecta solicitudes pendientes.

```bash
npm run ng -- test --watch=false --include='src/app/features/bicycles/**/*.spec.ts'
npm run ng -- test --watch=false --include='src/app/features/bicycle-dockings/**/*.spec.ts'
npm test -- --watch=false
npm run build
npm start
```

Abre `http://localhost:4200/bicycles` y `http://localhost:4200/bicycle-dockings`; recarga ambas rutas y comprueba el menú responsive. La prueba unitaria de `dock()` debe verificar POST `/bicycle-dockings/dock` y `{ bicycle_id, docking_point_id }`; la de `undock()` debe verificar PATCH `/:id/undock` y `{}`. El rechazo `409` debe mantener el formulario y notificar el mensaje.

La pantalla de bicicletas debe:

1. Mostrar número de serie, nombre, tipo, estado de lectura y actividad.
2. Permitir CRUD solo sobre los campos que el servicio admite. No incluyas `status` como campo editable del formulario.
3. Separar visualmente las bicicletas disponibles del historial de movimientos.
4. Consultar `GET /api/bicycles/available` para selectors de reserva; no deduzcas disponibilidad solo con `is_active`.
5. Permitir anclar una bicicleta seleccionando una bicicleta y un punto de anclaje disponible; el servidor vuelve a validar la operación.
6. Ofrecer desanclar únicamente para movimientos activos y refrescar los datos después de una respuesta exitosa.

La lista general de `bicycle-dockings` es de solo lectura por CRUD: el backend bloquea crear/editar/eliminar por esas rutas (`405`). Las escrituras se hacen exclusivamente con `/dock` y `/:id/undock`.

## Pruebas y criterios de aceptación

- [ ] CRUD de bicicleta verifica la lista `{ items }`, detalle `{ item }` y ausencia de `status` en payloads de escritura.
- [ ] La lista de disponibles consume la envoltura especial `{ bicycles }`.
- [ ] Anclar envía IDs, muestra la respuesta `{ docking }` y actualiza la lista sin recarga manual.
- [ ] No se permite solicitar desanclaje de un movimiento ya cerrado.
- [ ] Los errores 400/401/403/409/404 se presentan como error; no se cambia localmente el estado como si el servidor hubiera confirmado.
- [ ] La pantalla de movimientos conserva historial y distingue `undocked_at: null`.
- [ ] Las pruebas HTTP no requieren servidor ni desactivar JWT/RBAC.
- [ ] La ruta directa, el menú, `npm test -- --watch=false` y `npm run build` se verifican.

```bash
npm test -- --watch=false
npm run build
```

No afirmes que la bicicleta apareció físicamente en una estación por superar pruebas unitarias. La prueba E2E de movimientos requiere una sesión válida y datos compatibles en la API PedalLibre.

**Siguiente:** ISS-06 configura tarifas y registra reservas.  
**Ruta de lectura:** ← ISS-04 · ↑ [índice de guías](./README.md) · → ISS-06
