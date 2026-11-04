# Fase I: Frontend — ISS-04: Estaciones y puntos de anclaje

**Estado:** preparado para iniciar; no hay implementación de este feature en el frontend inspeccionado.  
**Proyecto:** PedalLibre, `Frontd-2026`  
**Depende de:** ISS-03 — CRUD de clientes  
**Habilita:** ISS-05 — Bicicletas y movimientos de anclaje  
**Revisión del contrato:** 3-nov-2026

> Esta guía describe el trabajo pendiente. Los componentes, pruebas y resultados de consola que aparecen como criterios no se consideran existentes hasta implementarlos y verificarlos en PedalLibre.

## Contexto y objetivo

La API de PedalLibre administra `stations` y `docking_points`. Una estación tiene varios puntos de anclaje; cada anclaje pertenece a una estación. La UI debe conservar el Shell de ISS-02 y no acceder directamente a Sequelize ni a MySQL.

Tecnologías del workspace: Angular 22 standalone, PrimeNG 22/Aura y Tailwind CSS 4. Para tablas usa las plantillas `#header`, `#body` y `#emptymessage` de PrimeNG 22. No agregues CSS propio ni PrimeFlex.

## Contrato HTTP comprobado

Las rutas de negocio requieren JWT y permiso RBAC. El controlador genérico responde con envolturas `{ items }` y `{ item }`, no `{ stations }`/`{ station }`. La respuesta serializada usa `id`, aunque la PK de MySQL tenga otro nombre. El backend limita las listas a 100 registros.

| Operación | Estaciones | Puntos de anclaje |
|---|---|---|
| Listar | `GET /api/stations` → `{ items }` | `GET /api/docking-points` → `{ items }` |
| Consultar | `GET /api/stations/:id` → `{ item }` | `GET /api/docking-points/:id` → `{ item }` |
| Crear | `POST /api/stations` → `201 { item }` | `POST /api/docking-points` → `201 { item }` |
| Actualizar | `PATCH /api/stations/:id` → `{ item }` | `PATCH /api/docking-points/:id` → `{ item }` |
| Eliminar | `DELETE /api/stations/:id` → `204` | `DELETE /api/docking-points/:id` → `204` |

No existe una ruta `/deactivate` para estas entidades. El borrado HTTP es físico; `is_active` es un campo editable del recurso, no una operación de baja lógica dedicada.

Campos aceptados por el servicio:

- Estación: `name` (requerido), `description`, `address`, `capacity`, `status`, `is_active`.
- Punto de anclaje: `station_id` (requerido), `code`, `name`, `description`, `status`, `is_active`.
- Los valores por defecto del esquema son `active` para estación y `available` para punto; no inventes un catálogo exhaustivo de estados.

El API del backend acepta solamente los campos indicados; campos adicionales producen `400`. El borrado de una estación puede fallar por sus puntos relacionados. Muestra el error de API y no simules éxito.

## Trabajo de construcción

Desde `Frontd-2026`, una vez cerrados los prerrequisitos:

```bash
ng generate component features/stations/station-list --standalone
ng generate component features/stations/station-form --standalone
ng generate component features/docking-points/docking-point-list --standalone
ng generate component features/docking-points/docking-point-form --standalone
```

Antes de crear servicios o modelos, revisa si ISS-03 ya extrajo helpers reutilizables para filtrado, confirmaciones, errores y formularios. Mantén modelos y servicios bajo `core/models/` y `features/<dominio>/`, siguiendo el estilo de `ClientApi`. No uses `cat >` para reemplazar un archivo completo que ya tenga cambios de trabajo: usa los bloques como archivos nuevos o adapta el diff de forma localizada.

### 4.1 Crear modelos y servicios con la terminal

```bash
mkdir -p src/app/core/models
cat > src/app/core/models/station.model.ts <<'EOF'
export interface Station {
  id: number;
  name: string;
  description: string;
  address: string;
  capacity: number;
  status: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StationPayload = Partial<
  Pick<Station, 'name' | 'description' | 'address' | 'capacity' | 'status' | 'is_active'>
> & Pick<Station, 'name'>;
EOF

cat > src/app/core/models/docking-point.model.ts <<'EOF'
export interface DockingPoint {
  id: number;
  station_id: number;
  code: string | null;
  name: string;
  description: string;
  status: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DockingPointPayload {
  station_id: number;
  code?: string | null;
  name?: string;
  description?: string;
  status?: string;
  is_active?: boolean;
}
EOF

cat > src/app/features/stations/station-api.ts <<'EOF'
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Station, StationPayload } from '../../core/models/station.model';

@Injectable({ providedIn: 'root' })
export class StationApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/stations`;

  list(): Observable<Station[]> {
    return this.http.get<{ items: Station[] }>(this.base).pipe(map(({ items }) => items));
  }

  get(id: number): Observable<Station> {
    return this.http.get<{ item: Station }>(`${this.base}/${id}`).pipe(map(({ item }) => item));
  }

  create(payload: StationPayload): Observable<Station> {
    return this.http.post<{ item: Station }>(this.base, payload).pipe(map(({ item }) => item));
  }

  update(id: number, payload: Partial<StationPayload>): Observable<Station> {
    return this.http.patch<{ item: Station }>(`${this.base}/${id}`, payload).pipe(map(({ item }) => item));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
EOF

cat > src/app/features/docking-points/docking-point-api.ts <<'EOF'
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DockingPoint, DockingPointPayload } from '../../core/models/docking-point.model';

@Injectable({ providedIn: 'root' })
export class DockingPointApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/docking-points`;

  list(): Observable<DockingPoint[]> {
    return this.http.get<{ items: DockingPoint[] }>(this.base).pipe(map(({ items }) => items));
  }

  get(id: number): Observable<DockingPoint> {
    return this.http.get<{ item: DockingPoint }>(`${this.base}/${id}`).pipe(map(({ item }) => item));
  }

  create(payload: DockingPointPayload): Observable<DockingPoint> {
    return this.http.post<{ item: DockingPoint }>(this.base, payload).pipe(map(({ item }) => item));
  }

  update(id: number, payload: Partial<DockingPointPayload>): Observable<DockingPoint> {
    return this.http.patch<{ item: DockingPoint }>(`${this.base}/${id}`, payload).pipe(map(({ item }) => item));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
EOF
```

### 4.2 Integrar las rutas y el Aside

Edita `src/app/app.routes.ts`: añade estos objetos dentro de `children` del Shell que ya existe. No reemplaces el archivo ni crees un segundo Shell:

```ts
// src/app/app.routes.ts, dentro del children existente:
{
  path: 'stations',
  title: 'Estaciones · PedalLibre',
  loadComponent: () =>
    import('./features/stations/station-list/station-list').then((module) => module.StationList),
},
{
  path: 'docking-points',
  title: 'Puntos de anclaje · PedalLibre',
  loadComponent: () =>
    import('./features/docking-points/docking-point-list/docking-point-list').then(
      (module) => module.DockingPointList,
    ),
},
```

Edita `src/app/layout/aside/aside.html` y añade estos enlaces dentro del `<nav>` existente. Conserva el enlace de Inicio y sus clases responsive:

```html
<a routerLink="/stations" routerLinkActive="bg-emerald-50 text-emerald-800"
   class="flex min-h-11 items-center gap-3 rounded-lg px-3 text-slate-700 hover:bg-slate-100"
   (click)="navigate.emit()">
  <i class="pi pi-map-marker" aria-hidden="true"></i>
  <span [class.md:hidden]="collapsed()">Estaciones</span>
</a>
<a routerLink="/docking-points" routerLinkActive="bg-emerald-50 text-emerald-800"
   class="flex min-h-11 items-center gap-3 rounded-lg px-3 text-slate-700 hover:bg-slate-100"
   (click)="navigate.emit()">
  <i class="pi pi-th-large" aria-hidden="true"></i>
  <span [class.md:hidden]="collapsed()">Puntos de anclaje</span>
</a>
```

### 4.3 Editar plantillas con `cat`

El CLI ya genera los `.html`; para sustituir una plantilla generada, ejecuta desde `Frontd-2026`:

```bash
cat > src/app/features/stations/station-list/station-list.html <<'EOF'
<section class="space-y-4">
  <app-page-header title="Estaciones" subtitle="Administra las estaciones de PedalLibre.">
    <button pButton type="button" (click)="openCreate()">
      <i pButtonIcon class="pi pi-plus"></i><span pButtonLabel>Nueva estación</span>
    </button>
  </app-page-header>

  <label class="sr-only" for="station-filter">Buscar estaciones</label>
  <input id="station-filter" pInputText [value]="filter()" (input)="setFilter($event)"
         placeholder="Buscar por nombre, dirección o descripción" class="w-full sm:max-w-md" />

  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <p-table [value]="visibleRows()" [loading]="loading()" dataKey="id">
    <ng-template #header><tr><th>Nombre</th><th>Dirección</th><th>Capacidad</th><th>Estado</th><th>Acciones</th></tr></ng-template>
    <ng-template #body let-row>
      <tr>
        <td>{{ row.name }}</td><td>{{ row.address || '—' }}</td><td>{{ row.capacity }}</td>
        <td><p-tag [value]="row.is_active ? 'Activa' : 'Inactiva'"
          [severity]="row.is_active ? 'success' : 'secondary'" /></td>
        <td class="flex gap-2">
          <button pButton type="button" text (click)="openEdit(row)" [attr.aria-label]="'Editar ' + row.name"><i pButtonIcon class="pi pi-pencil"></i></button>
          <button pButton type="button" text severity="danger" (click)="remove(row)" [attr.aria-label]="'Eliminar ' + row.name"><i pButtonIcon class="pi pi-trash"></i></button>
        </td>
      </tr>
    </ng-template>
    <ng-template #emptymessage><tr><td colspan="5">No hay estaciones para mostrar.</td></tr></ng-template>
  </p-table>

  <p-dialog [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
            [header]="editing() ? 'Editar estación' : 'Nueva estación'" [modal]="true"
            [style]="{ width: 'min(38rem, 95vw)' }">
    <app-station-form [station]="editing()" [saving]="saving()"
      (saved)="save($event)" (cancelled)="dialogVisible.set(false)" />
  </p-dialog>
</section>
EOF

cat > src/app/features/docking-points/docking-point-list/docking-point-list.html <<'EOF'
<section class="space-y-4">
  <app-page-header title="Puntos de anclaje" subtitle="Consulta los puntos asociados a cada estación.">
    <button pButton type="button" (click)="openCreate()">
      <i pButtonIcon class="pi pi-plus"></i><span pButtonLabel>Nuevo punto</span>
    </button>
  </app-page-header>

  <label class="sr-only" for="point-filter">Buscar puntos de anclaje</label>
  <input id="point-filter" pInputText [value]="filter()" (input)="setFilter($event)"
         placeholder="Buscar por estación, código o nombre" class="w-full sm:max-w-md" />
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }

  <p-table [value]="visibleRows()" [loading]="loading()" dataKey="id">
    <ng-template #header><tr><th>Estación</th><th>Código</th><th>Nombre</th><th>Estado</th><th>Acciones</th></tr></ng-template>
    <ng-template #body let-row>
      <tr>
        <td>{{ stationName()(row.station_id) }}</td><td>{{ row.code || '—' }}</td>
        <td>{{ row.name || '—' }}</td><td>{{ row.status }}</td>
        <td class="flex gap-2">
          <button pButton type="button" text (click)="openEdit(row)" [attr.aria-label]="'Editar punto ' + row.id"><i pButtonIcon class="pi pi-pencil"></i></button>
          <button pButton type="button" text severity="danger" (click)="remove(row)" [attr.aria-label]="'Eliminar punto ' + row.id"><i pButtonIcon class="pi pi-trash"></i></button>
        </td>
      </tr>
    </ng-template>
    <ng-template #emptymessage><tr><td colspan="5">No hay puntos de anclaje para mostrar.</td></tr></ng-template>
  </p-table>

  <p-dialog [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
            [header]="editing() ? 'Editar punto' : 'Nuevo punto'" [modal]="true"
            [style]="{ width: 'min(38rem, 95vw)' }">
    <app-docking-point-form [dockingPoint]="editing()" [saving]="saving()"
      (saved)="save($event)" (cancelled)="dialogVisible.set(false)" />
  </p-dialog>
</section>
EOF
```

El estado de estación se muestra con `p-tag`; no uses `app-status-tag [status]`, porque el componente compartido recibe severidad PrimeNG y no traduce estados de dominio. Escribe las plantillas de los formularios generados:

```bash
cat > src/app/features/stations/station-form/station-form.html <<'EOF'
<form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
  <div><label for="station-name">Nombre *</label>
    <input id="station-name" pInputText formControlName="name" class="w-full" /></div>
  <div><label for="station-address">Dirección</label>
    <input id="station-address" pInputText formControlName="address" class="w-full" /></div>
  <div><label for="station-description">Descripción</label>
    <textarea id="station-description" pTextarea formControlName="description" rows="3" class="w-full"></textarea></div>
  <div><label for="station-capacity">Capacidad</label>
    <p-inputnumber inputId="station-capacity" formControlName="capacity" [min]="0" [fluid]="true" /></div>
  <div><label for="station-status">Estado</label>
    <input id="station-status" pInputText formControlName="status" class="w-full" /></div>
  <div class="flex items-center gap-2"><p-checkbox inputId="station-active" formControlName="is_active" [binary]="true" />
    <label for="station-active">Activa</label></div>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <div class="flex justify-end gap-2">
    <button pButton type="button" severity="secondary" (click)="cancelled.emit()">Cancelar</button>
    <button pButton type="submit" [loading]="saving()">Guardar estación</button>
  </div>
</form>
EOF

cat > src/app/features/docking-points/docking-point-form/docking-point-form.html <<'EOF'
<form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
  <div><label for="point-station">Estación *</label>
    <p-select inputId="point-station" [options]="stations()" optionLabel="name" optionValue="id"
      formControlName="station_id" [filter]="true" [fluid]="true" /></div>
  <div><label for="point-code">Código</label>
    <input id="point-code" pInputText formControlName="code" class="w-full" /></div>
  <div><label for="point-name">Nombre</label>
    <input id="point-name" pInputText formControlName="name" class="w-full" /></div>
  <div><label for="point-description">Descripción</label>
    <textarea id="point-description" pTextarea formControlName="description" rows="3" class="w-full"></textarea></div>
  <div><label for="point-status">Estado</label>
    <input id="point-status" pInputText formControlName="status" class="w-full" /></div>
  <div class="flex items-center gap-2"><p-checkbox inputId="point-active" formControlName="is_active" [binary]="true" />
    <label for="point-active">Activo</label></div>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <div class="flex justify-end gap-2">
    <button pButton type="button" severity="secondary" (click)="cancelled.emit()">Cancelar</button>
    <button pButton type="submit" [loading]="saving()">Guardar punto</button>
  </div>
</form>
EOF
```

En `imports` de cada lista importa explícitamente `TableModule`, `DialogModule`, `ButtonModule`, `InputTextModule`, `MessageModule`, `TagModule`, `PageHeader` y `StationForm` o `DockingPointForm`. En cada formulario importa `ReactiveFormsModule`, `InputNumberModule`, `InputTextModule`, `TextareaModule`, `CheckboxModule`, `SelectModule` y `MessageModule`. Define en TypeScript `openCreate`, `openEdit`, `setFilter`, `save`, `remove` y `stationName` antes de compilar. Eliminar debe pedir confirmación mediante el patrón existente de ISS-03, no ejecutar el `DELETE` directamente desde una plantilla.

### 4.4 Pruebas y ejecución

Conserva las pruebas `.spec.ts` creadas por Angular y añade casos de `HttpTestingController` para cada servicio: lista y detalle desenvuelven sus envolturas, `POST`, `PATCH` y `DELETE` usan URL correcta, `204` no espera JSON y `verify()` no deja solicitudes pendientes. Prueba en formularios estación obligatoria, capacidad no negativa y que el anclaje emite `station_id` numérico.

```bash
npm run ng -- test --watch=false --include='src/app/features/stations/**/*.spec.ts'
npm run ng -- test --watch=false --include='src/app/features/docking-points/**/*.spec.ts'
npm test -- --watch=false
npm run build
npm start
```

Con el servidor de desarrollo abierto, comprueba `http://localhost:4200/stations` y `http://localhost:4200/docking-points`, también tras recargar cada URL. Antes de ISS-08, la respuesta API real `401` es esperada; registra las pruebas HTTP como simuladas, no como integración con MySQL.

## Criterios de aceptación

- [ ] Se crean, listan, editan y eliminan estaciones según el contrato real.
- [ ] Se crean, listan, editan y eliminan puntos de anclaje vinculados a una estación existente.
- [ ] Los formularios no mandan nombres de campos de otro dominio ni envían objetos completos donde el API espera IDs.
- [ ] Los filtros son locales, toleran valores nulos y no producen nuevas solicitudes.
- [ ] Carga, vacío, error y guardado se distinguen en la UI; los errores no se convierten en estados de éxito.
- [ ] La eliminación física advierte su irreversibilidad y muestra errores de integridad/autorización.
- [ ] Las rutas directas se renderizan dentro del Shell y la navegación aparece en el Aside.
- [ ] Las pruebas cubren modelos/payloads, formulario, filtro y métodos, URLs y envolturas HTTP.
- [ ] `npm test -- --watch=false` y `npm run build` pasan.

## Verificación y cierre

```bash
npm test -- --watch=false
npm run build
```

Anota la salida realmente observada y adjunta capturas nuevas de PedalLibre. Un test HTTP simulado no prueba que la base esté sembrada ni que un token tenga permisos. La integración con API protegida queda para ISS-08/ISS-09.

**Siguiente:** ISS-05 administra bicicletas y sus movimientos de anclaje.  
**Ruta de lectura:** ← ISS-03 · ↑ [índice de guías](./README.md) · → ISS-05
