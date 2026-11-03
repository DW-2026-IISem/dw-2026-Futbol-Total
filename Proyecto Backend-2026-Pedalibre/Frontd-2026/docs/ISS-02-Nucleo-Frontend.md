# Fase I: Frontend — ISS-02: Núcleo: environment, modelos, servicios y layout

**Estado:** Completado — verificaciones locales aprobadas (3-nov-2026)
**Proyecto:** PedalLibre, carpeta `Frontd-2026`
**Depende de:** ISS-01 — Bootstrap Angular
**Habilita:** ISS-03 — CRUD de clientes

> **Cierre local al 3-nov-2026:** ISS-02 se completó sobre el workspace PedalLibre. El contrato de clientes se contrastó con sus DTO/backend; `ClientApi`, `toApiMessage`, `NotificationService`, componentes compartidos y Shell cuentan con pruebas. El Shell se verificó en navegador de escritorio y viewport móvil 375 × 667 px. La verificación final pasó con 12 archivos y 30 pruebas; el build de producción también pasó. Las pruebas HTTP usan `HttpTestingController` y no requieren levantar el backend ni omitir autenticación. La evidencia está enlazada en el informe y el registro final [E-FRONT-ISS-02-38](../trazabilidad/E-FRONT-ISS-02-38-cierre-tecnico.md).

## Contexto de PedalLibre

- Frontend: Angular 22 standalone, PrimeNG 22 con Aura y Tailwind CSS 4.
- Backend: Express 5, TypeScript, Sequelize y MySQL. La API local comprobada escucha en `http://localhost:3002`; el backend obtiene el puerto de `.env` y tiene `4000` como valor predeterminado si no se configura.
- URL base del frontend: `http://localhost:3002/api`, sin slash final. Si el puerto configurado en el backend cambia, se debe actualizar el environment para que coincidan.
- El esquema PedalLibre contiene 17 tablas. La referencia de columnas y relaciones es [`../trazabilidad/pedalibre/README.md`](../trazabilidad/pedalibre/README.md) y el SQL [`../trazabilidad/pedalibre/pedalibre.sql`](../trazabilidad/pedalibre/pedalibre.sql).
- El contrato HTTP se puede contrastar en Swagger (`/api/docs`) y en los controladores y DTO del backend. El cliente no debe acceder a Sequelize ni a MySQL.
- Las rutas de negocio están protegidas con JWT y RBAC. ISS-02 registra `HttpClient`, pero no agrega interceptores de sesión: autenticación y renovación de tokens pertenecen a la fase correspondiente.

## Objetivo

Preparar la infraestructura que usarán las pantallas de negocio: environments, modelos TypeScript basados en las respuestas reales de PedalLibre, el primer servicio HTTP tipado, utilidades de error y notificaciones, componentes compartidos y el Shell funcional (Header, Aside, contenido y Footer) con navegación responsive. El esqueleto visual y su interacción se construyen aquí como parte de ISS-02.

La cadena que debe quedar clara es:

```text
Plantilla → componente → ClientApi → HttpClient → API Express
          ← signal ← Client[] ← map() desenvuelve { clients } ← respuesta HTTP
```

La respuesta se desenvuelve en el servicio, no en la plantilla ni en cada componente.

## Criterios de aceptación

- [x] `environment.ts` y `environment.development.ts` existen; `angular.json` reemplaza el environment para desarrollo.
- [x] `apiUrl` es `http://localhost:3002/api`, sin slash final, y no contiene secretos.
- [x] Los modelos iniciales de clientes reflejan sus nombres y nulabilidad (`user_id`, `phone` y `email` pueden ser `null`) y no exponen hashes ni tokens persistidos.
- [x] El tipo monetario común acepta `number | string`, porque Sequelize puede serializar `DECIMAL` como texto.
- [x] Los payloads de clientes distinguen crear, reemplazar y actualizar parcialmente, según los DTO reales del backend; los cambios de estado de negocio no se confunden con un CRUD genérico.
- [x] `ClientApi` construye su URL desde `environment.apiUrl` y devuelve `Client`/`Client[]`, no las envolturas HTTP.
- [x] `ClientApi` usa las envolturas reales de clientes: `{ clients }` y `{ client }`; no las del controlador genérico `{ items }` y `{ item }`.
- [x] `client-api.spec.ts` verifica `list`, `get`, `create`, `replace` y `update` con `HttpTestingController`; confirma método, URL, payload, respuesta desenvuelta y que no queden solicitudes pendientes.
- [x] `toApiMessage` diferencia una API inaccesible (`status === 0`) de un `401` o `403`, y extrae el campo `error` cuando el backend lo devuelve.
- [x] `NotificationService` centraliza notificaciones de éxito, aviso y error en PrimeNG; traduce los errores con `toApiMessage` y las pruebas confirman severidad, resumen, detalle y duración.
- [x] `PageHeader`, `EmptyState` y `StatusTag` son standalone, exponen inputs tipados, proyectan acciones donde aplica y no agregan CSS de negocio.
- [x] Header, Aside, Footer, Shell y la pantalla de inicio son componentes standalone creados en este ISS.
- [x] Shell compone una vez Header, Aside, `router-outlet` y Footer; el menú navega a la página de inicio existente.
- [x] El botón del Header alterna el Aside en escritorio y abre/cierra su navegación en móvil; `aria-expanded`/`aria-controls` describen el estado.
- [x] El layout responde a viewport móvil/escritorio con Tailwind y PrimeNG, sin PrimeFlex ni CSS de negocio propio.
- [x] La portada local de ISS-01 continúa accesible como contenido de inicio bajo el Shell.
- [x] `provideHttpClient()` está registrado sin interceptores de autenticación.
- [x] Build y pruebas terminan correctamente; las pruebas cubren `ClientApi`, notificaciones, errores y comportamiento del menú, con evidencia visual responsive.

## 2.1 Environments: una URL para el frontend

Este workspace aún no tiene environments ni `fileReplacements`. Desde `Frontd-2026`, genera los archivos y revisa lo que modificó el CLI:

```bash
ng generate environments
git diff -- angular.json src/environments
```

Si el generador indica que ya existen, no lo repitas: verifica los archivos y continúa. Configura ambos environments con el mismo host local comprobado:

`src/environments/environment.ts`:

```bash
cat > src/environments/environment.ts <<'EOF'
export const environment = {
  production: true,
  appName: 'PedalLibre',
  apiUrl: 'http://localhost:3002/api',
  requireAuth: true,
  primeUiLicense: '',
};
EOF
```

`src/environments/environment.development.ts`:

```bash
cat > src/environments/environment.development.ts <<'EOF'
export const environment = {
  production: false,
  appName: 'PedalLibre',
  apiUrl: 'http://localhost:3002/api',
  requireAuth: true,
  primeUiLicense: '',
};
EOF
```

`primeUiLicense` conserva el comportamiento documentado en ISS-01. Si se dispone de una clave, no se debe publicar una clave comercial en el repositorio; sigue la política de secretos del proyecto. No inventes una licencia ni copies una clave de otra persona.

Verifica que `angular.json`, dentro de `projects.pedalibre-frontend.architect.build.configurations.development`, incluya el reemplazo:

```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.development.ts"
  }
]
```

El CLI puede conservar otras opciones en esa configuración; no las elimines. Comprueba el resultado:

```bash
grep -n -A 8 -B 4 "fileReplacements" angular.json
grep -R "apiUrl" src/environments
```

No agregues slash final a `apiUrl`: cada servicio añadirá su segmento, por ejemplo `${environment.apiUrl}/clientes`.

`requireAuth` deja documentado el requisito de la API; en este ISS nadie lo consume. La aplicación todavía no adjunta el token. Un `401` al consultar una ruta protegida sin autenticación es esperado y no demuestra un error de `HttpClient`.

## 2.2 Modelos: seguir el JSON y los DTO de PedalLibre

No traduzcas nombres de campos al español en las interfaces HTTP. El backend usa, por ejemplo, `first_name`, `is_active`, `station_id` y `base_value`. Sequelize puede exponer `id` aunque la clave primaria de SQL se llame `client_id`, `station_id` o similar: modela la respuesta API, no una fila SQL inventada.

La referencia de las 17 tablas es: `roles`, `resources`, `role_resources`, `users`, `refresh_tokens`, `clients`, `stations`, `bicycles`, `docking_points`, `rates`, `reservations`, `rentals`, `rental_events`, `bicycle_dockings`, `penalties`, `maintenances` y `payments`. Crea interfaces de respuesta para las entidades que la API expone. `refresh_tokens` es almacenamiento del backend: no crees un modelo de frontend que exponga su hash.

La fuente de verdad para cada campo es el modelo, DTO, controlador y OpenAPI del backend. En particular:

- `Client` expone `id`, `user_id`, `document_type`, `first_name`, `last_name`, `document_number`, `phone`, `email`, `is_active`, `createdAt` y `updatedAt`. `user_id`, `phone` y `email` pueden ser `null`.
- Las entidades de negocio incluyen estados propios; no uses un enum universal cerrado sin verificar todas las respuestas (`bicycle.status`, `reservation.status`, `rental.status`, etc.).
- `Rate.base_value`, `Rental.total`, `Penalty.amount`, `Maintenance.cost` y `Payment.amount` son valores `DECIMAL` y pueden llegar como texto.
- La respuesta pública de usuario nunca incluye `password` ni `password_hash`. No serialices tokens de refresco guardados en la base de datos.
- No habilites cambios genéricos del estado de alquiler o del inventario. Los flujos de inicio/finalización y los movimientos de anclaje tienen endpoints de negocio propios.

Al crear los modelos de lectura, usa este inventario como guía inicial de campos del modelo Sequelize/API. Convierte `Date` a `IsoDateTime` en las respuestas JSON, conserva `null` donde se indica y valida el DTO del endpoint antes de crear cada payload:

| Interfaz | Campos principales |
|---|---|
| `Role` | `id`, `name`, `description`, `is_active`, `status`, `createdAt` |
| `Resource` | `id`, `method`, `path`, `description`, `is_active`, `status` |
| `ResourceRole` | `id`, `role_id`, `resource_id`, `is_allowed`, `status`, `createdAt` |
| `User` | `id`, `role_id`, `username`, `email: string \| null`, `is_active`, `status`, `createdAt`; nunca `password` |
| `Client` | `id`, `user_id: number \| null`, `document_type`, `first_name`, `last_name`, `document_number`, `phone: string \| null`, `email: string \| null`, `is_active`, `createdAt`, `updatedAt` |
| `Station` | `id`, `name`, `description`, `address`, `capacity`, `status`, `is_active`, `createdAt`, `updatedAt` |
| `Bicycle` | `id`, `serial_number`, `name`, `description`, `bicycle_type`, `status`, `is_active`, `createdAt`, `updatedAt` |
| `DockingPoint` | `id`, `station_id`, `code: string \| null`, `name`, `description`, `status`, `is_active`, `createdAt`, `updatedAt` |
| `Rate` | `id`, `name`, `calculation_rule`, `base_value: Money`, `valid_from: string \| null`, `valid_until: string \| null`, `is_active`, timestamps |
| `Reservation` | `id`, `client_id`, `bicycle_id: number \| null`, `station_id: number \| null`, `start_at`, `end_at`, `reserved_at`, `expires_at`, `status`, `observations` |
| `Rental` | `id`, `reservation_id: number \| null`, `client_id`, `bicycle_id`, `rate_id`, `start_station_id: number \| null`, `end_station_id: number \| null`, `start_at`, `end_at: IsoDateTime \| null`, `total: Money`, `status`, `observations` |
| `RentalEvent` | `id`, `rental_id`, `type`, `event_date`, `quantity: number \| null`, `observations: string \| null`, `status` |
| `BicycleDocking` | `id`, `bicycle_id`, `docking_point_id`, `docked_at`, `undocked_at: IsoDateTime \| null` |
| `Penalty` | `id`, `reference_id`, `penalty_date`, `amount: Money`, `status`, `observations` |
| `Maintenance` | `id`, `resource_id`, `type`, `scheduled_at`, `closed_at: IsoDateTime \| null`, `cost: Money`, `status`, `observations`, timestamps |
| `Payment` | `id`, `reference_type`, `reference_id`, `method`, `amount: Money`, `payment_date`, `status` |

`timestamps` en esta tabla significa `createdAt` y `updatedAt` cuando el modelo los tiene; no agregues esas propiedades automáticamente a modelos que declaran `timestamps: false`. `status` es una cadena de dominio y solo `Role`, `Resource`, `ResourceRole` y `User` derivan algunos estados de booleanos virtuales. La tabla `refresh_tokens` queda fuera de los modelos de interfaz.

Empieza por los tipos comunes:

```bash
mkdir -p src/app/core/models
cat > src/app/core/models/api.model.ts <<'EOF'
export type Money = number | string;
export type IsoDateTime = string;

export interface ApiError {
  error: string;
  detail?: string;
}

export function toNumber(value: Money): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new TypeError(`Invalid monetary value: ${String(value)}`);
  }
  return parsed;
}
EOF
```

`toNumber` no reemplaza valores corruptos por cero: un dato inválido debe ser visible para quien lo corrige.

Modelo y payload de clientes:

```bash
mkdir -p src/app/core/models
cat > src/app/core/models/client.model.ts <<'EOF'
export interface Client {
  id: number;
  user_id: number | null;
  document_type: string;
  first_name: string;
  last_name: string;
  document_number: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientCreatePayload {
  user_id?: number | null;
  document_type?: string;
  first_name: string;
  last_name: string;
  document_number: string;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean;
}

export interface ClientReplacePayload {
  user_id?: number | null;
  document_type: string;
  first_name: string;
  last_name: string;
  document_number: string;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean;
}

export type ClientPatchPayload = Partial<ClientReplacePayload>;
EOF
```

Este ejemplo coincide con `ClientI`, `CreateClientDto`, `UpdateClientDto` y `PatchClientDto` actuales. Antes de ampliar las demás interfaces, consulta sus modelos y DTO vigentes y marca `null` solo en los campos que realmente lo permitan. Para peticiones de fechas, usa cadenas ISO; los objetos `Date` de Sequelize se serializan como cadenas JSON.

La API permite la baja lógica de clientes con `PATCH /api/clientes/:id/deactivate`; el DTO de actualización no define `status`. No presentes `status` como campo de formulario ni uses un `DELETE` para simular la baja lógica.

## 2.3 Servicio HTTP por feature: respetar las envolturas

El backend tiene dos formas de respuesta que no se deben confundir:

| API | Lista | Elemento | Observación |
|---|---|---|---|
| `/api/clientes` | `{ clients }` | `{ client }` | Controlador específico de clientes |
| `DELETE /api/clientes/:id` | — | `{ message, id }` | Eliminación física; responde HTTP 200 |
| Recursos genéricos de `/api/*` | `{ items }` | `{ item }` | `PedalibreController` |
| `GET /api/bicycles/available` | `{ bicycles }` | — | Endpoint de disponibilidad |
| Inicio/finalización de alquiler | — | `{ rental }` | Flujos de negocio |
| Anclar/desanclar bicicleta | — | `{ docking }` | Flujos de negocio |
| Eliminación genérica | — | respuesta `204` sin cuerpo | No intentes leer un `{ item }` |

Los recursos genéricos incluyen `/stations`, `/bicycles`, `/docking-points`, `/rates`, `/reservations`, `/rentals`, `/rental-events`, `/bicycle-dockings`, `/penalties`, `/maintenances` y `/payments`. Sus operaciones permitidas no son idénticas: por ejemplo, alquileres, eventos y movimientos se crean mediante flujos operativos. Implementa un servicio tipado cuando se trabaje el feature correspondiente; no generes CRUDs vacíos ni expongas métodos que el backend rechaza.

Para habilitar ISS-03, crea el servicio de clientes:

```bash
mkdir -p src/app/features/clients
cat > src/app/features/clients/client-api.ts <<'EOF'
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Client,
  ClientCreatePayload,
  ClientPatchPayload,
  ClientReplacePayload,
} from '../../core/models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/clientes`;

  list(): Observable<Client[]> {
    return this.http
      .get<{ clients: Client[] }>(this.base)
      .pipe(map((response) => response.clients));
  }

  get(id: number): Observable<Client> {
    return this.http
      .get<{ client: Client }>(`${this.base}/${id}`)
      .pipe(map((response) => response.client));
  }

  create(payload: ClientCreatePayload): Observable<Client> {
    return this.http
      .post<{ client: Client }>(this.base, payload)
      .pipe(map((response) => response.client));
  }

  replace(id: number, payload: ClientReplacePayload): Observable<Client> {
    return this.http
      .put<{ client: Client }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.client));
  }

  update(id: number, payload: ClientPatchPayload): Observable<Client> {
    return this.http
      .patch<{ client: Client }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.client));
  }

  deactivate(id: number): Observable<unknown> {
    return this.http.patch(
      `${this.base}/${id}/deactivate`,
      {},
    );
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
EOF
```

`deactivate` y `remove` son acciones diferentes: la primera cambia el estado lógico y devuelve `{ message, client }`; la segunda elimina físicamente y devuelve `{ message, id }` con HTTP 200. En cambio, el borrado genérico de `PedalibreController` responde 204 sin cuerpo. No uses `replace` si el formulario envía solo algunos campos.

## 2.4 Errores de API y notificaciones

El backend envía errores como `{ error }` y, ante errores no controlados, puede incluir `detail`. La interfaz debe mostrar un mensaje comprensible y no presentar el `detail` interno como si fuera un mensaje validado para el usuario.

```bash
mkdir -p src/app/core/utils
cat > src/app/core/utils/to-api-message.ts <<'EOF'
import { HttpErrorResponse } from '@angular/common/http';

interface ApiErrorBody {
  error?: unknown;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null && 'error' in value;
}

export function toApiMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado.';
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el backend de PedalLibre.';
  }
  if (error.status === 401) {
    return 'La sesión no está autenticada o ha caducado.';
  }
  if (error.status === 403) {
    return 'La sesión no tiene permiso para realizar esta acción.';
  }
  if (isApiErrorBody(error.error) && typeof error.error.error === 'string') {
    return error.error.error;
  }
  return `La solicitud falló (HTTP ${error.status}).`;
}
EOF
```

Registra `provideHttpClient()` en `app.config.ts`, conservando `provideRouter`, `providePrimeNG` y los providers actuales. Añade `MessageService` de PrimeNG al arreglo `providers`. No reemplaces toda la configuración existente ni añadas `withInterceptors(...)` en ISS-02.

`NotificationService` debe inyectar `MessageService` y ofrecer métodos tipados para éxito, aviso y error. Centraliza allí `summary`, `detail`, severidad y duración; usa `toApiMessage(error)` para los errores HTTP. Las pantallas deben mostrar el error o una notificación, no convertir el fallo en una lista vacía o en un éxito aparente.

## 2.5 Componentes compartidos

Genera componentes standalone sin CSS específico de negocio. Usa el CLI desde la raíz de `Frontd-2026`:

```bash
ng generate component shared/ui/page-header --standalone --skip-tests
ng generate component shared/ui/empty-state --standalone --skip-tests
ng generate component shared/ui/status-tag --standalone --skip-tests
```

- `PageHeader`: `title` requerido, `description` opcional y acciones proyectadas con el atributo `pageHeaderActions`.
- `EmptyState`: `message` requerido, título neutral por defecto y acción de recuperación proyectada con `emptyStateAction`.
- `StatusTag`: `value` requerido y severidad PrimeNG opcional, con `secondary` neutral por defecto. El feature decide su mapeo de estados; el componente no impone vocabulario de negocio.

Usa componentes PrimeNG y clases Tailwind existentes. No agregues PrimeFlex ni estilos globales para resolver la composición de una pantalla.

## 2.6 Construir el Shell y la navegación responsive

Este bloque incorpora aquí el trabajo de esqueleto visual e interacción: Header, Aside, Footer, Shell, menú y estados responsive. No esperes ni dependas de un ISS-01A/01B separado. Primero comprueba que la portada actual funciona; después muévela a una página standalone `HomePage`, conservando su contenido y sus textos (la página todavía no consulta el backend).

En la evidencia recibida el CLI ya generó estos componentes y sus archivos. Si partes de otra copia y aún no están, ejecuta:

```bash
ng generate component layout/header --standalone
ng generate component layout/aside --standalone
ng generate component layout/footer --standalone
ng generate component layout/shell --standalone
ng generate component features/home/home-page --standalone
```

La captura de esta generación es evidencia de scaffolding, no de componentes terminados. Desde `Frontd-2026`, reemplaza el contenido de los archivos TypeScript y HTML generados con los siguientes bloques. Los CSS generados pueden permanecer vacíos; la composición visual se hace con Tailwind y PrimeNG.

`src/app/layout/header/header.ts`:

```bash
cat > src/app/layout/header/header.ts <<'EOF'
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly menuExpanded = input(false);
  readonly menuToggle = output<void>();
}
EOF
```

`src/app/layout/header/header.html`:

```bash
cat > src/app/layout/header/header.html <<'EOF'
<header class="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
  <a routerLink="/" class="text-lg font-bold tracking-tight text-emerald-800">
    PedalLibre
  </a>
  <button
    type="button"
    class="inline-flex size-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
    aria-label="Alternar menú de navegación"
    aria-controls="app-navigation"
    [attr.aria-expanded]="menuExpanded()"
    (click)="menuToggle.emit()"
  >
    <i class="pi pi-bars text-lg" aria-hidden="true"></i>
  </button>
</header>
EOF
```

`src/app/layout/aside/aside.ts`:

```bash
cat > src/app/layout/aside/aside.ts <<'EOF'
import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './aside.html',
  styleUrl: './aside.css',
})
export class Aside {
  readonly collapsed = input(false);
  readonly mobileOpen = input(false);
  readonly navigate = output<void>();
}
EOF
```

`src/app/layout/aside/aside.html`:

```bash
cat > src/app/layout/aside/aside.html <<'EOF'
<aside
  id="app-navigation"
  class="fixed inset-y-16 left-0 z-40 w-72 border-r border-slate-200 bg-white transition-all duration-200 md:static md:inset-auto md:z-auto md:translate-x-0"
  [class.-translate-x-full]="!mobileOpen()"
  [class.translate-x-0]="mobileOpen()"
  [class.md:w-20]="collapsed()"
  [class.md:w-64]="!collapsed()"
>
  <nav aria-label="Navegación principal" class="space-y-2 p-3">
    <a
      routerLink="/"
      routerLinkActive="bg-emerald-50 text-emerald-800"
      [routerLinkActiveOptions]="{ exact: true }"
      class="flex min-h-11 items-center gap-3 rounded-lg px-3 text-slate-700 hover:bg-slate-100"
      (click)="navigate.emit()"
    >
      <i class="pi pi-home" aria-hidden="true"></i>
      <span [class.md:hidden]="collapsed()">Inicio</span>
    </a>
  </nav>
</aside>
EOF
```

`src/app/layout/footer/footer.ts`:

```bash
cat > src/app/layout/footer/footer.ts <<'EOF'
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {}
EOF
```

`src/app/layout/footer/footer.html`:

```bash
cat > src/app/layout/footer/footer.html <<'EOF'
<footer class="border-t border-slate-200 bg-white px-4 py-4 text-center text-sm text-slate-500 sm:px-6">
  PedalLibre · Plataforma de movilidad compartida
</footer>
EOF
```

`src/app/layout/shell/shell.ts`:

```bash
cat > src/app/layout/shell/shell.ts <<'EOF'
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Aside } from '../aside/aside';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [Aside, Footer, Header, RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  readonly menuExpanded = signal(false);

  toggleMenu(): void {
    this.menuExpanded.update((expanded) => !expanded);
  }

  closeMenu(): void {
    this.menuExpanded.set(false);
  }
}
EOF
```

`src/app/layout/shell/shell.html`:

```bash
cat > src/app/layout/shell/shell.html <<'EOF'
<div class="flex min-h-dvh flex-col bg-slate-50 text-slate-900">
  <app-header
    [menuExpanded]="menuExpanded()"
    (menuToggle)="toggleMenu()"
  />
  <div class="relative flex flex-1">
    @if (menuExpanded()) {
      <button
        type="button"
        class="fixed inset-x-0 bottom-0 top-16 z-30 bg-slate-950/40 md:hidden"
        aria-label="Cerrar menú de navegación"
        (click)="closeMenu()"
      ></button>
    }
    <app-aside
      [collapsed]="!menuExpanded()"
      [mobileOpen]="menuExpanded()"
      (navigate)="closeMenu()"
    />
    <main id="main-content" class="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <router-outlet />
    </main>
  </div>
  <app-footer />
</div>
EOF
```

`src/app/features/home/home-page/home-page.html` conserva la portada de ISS-01 como contenido interno del Shell:

```bash
cat > src/app/features/home/home-page/home-page.html <<'EOF'
<section
  aria-labelledby="welcome-title"
  class="mx-auto flex min-h-[65dvh] w-full max-w-5xl flex-col justify-center"
>
  <p class="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
    Movilidad compartida
  </p>
  <h1 id="welcome-title" class="text-4xl font-bold tracking-tight sm:text-6xl">
    PedalLibre
  </h1>
  <p class="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
    Frontend en construcción. La conexión con los servicios de PedalLibre se
    incorporará en las siguientes etapas.
  </p>
  <p class="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
    <span aria-hidden="true" class="size-2 rounded-full bg-amber-500"></span>
    Integración con la API pendiente
  </p>
</section>
EOF
```

`src/app/app.html`:

```bash
cat > src/app/app.html <<'EOF'
<router-outlet />
EOF
```

`src/app/app.ts`:

```bash
cat > src/app/app.ts <<'EOF'
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
EOF
```

`src/app/app.routes.ts`:

```bash
cat > src/app/app.routes.ts <<'EOF'
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell/shell').then((module) => module.Shell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/home/home-page/home-page').then(
            (module) => module.HomePage,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
EOF
```

Los nombres de importación corresponden a los archivos generados en este workspace (`*.ts`, `*.html`). No reemplaces `app.config.ts`: debe conservar `provideRouter(routes)`, PrimeNG y los providers globales de ISS-01/02.

Contrato de interacción que implementan los bloques:

- `Header` muestra el nombre PedalLibre y un botón de menú accesible. Emite `menuToggle` con `output<void>()`; no conoce el estado del Shell.
- `Aside` muestra la navegación y recibe el estado de colapso/visibilidad por `input()`. Deja como enlace real la pantalla de inicio; no muestres destinos sin ruta.
- `Footer` muestra información breve de la aplicación sin datos operativos inventados.
- `Shell` es dueño del estado con `signal()`: recibe `menuToggle`, alterna el menú en escritorio y móvil, e incluye `<router-outlet />` una sola vez entre Header/Aside y Footer.
- `HomePage` conserva la portada actual de PedalLibre como contenido de `/`; no presenta datos de clientes, bicicletas ni estaciones como si fueran datos reales.

Usa Tailwind para grid/flex, anchuras, espaciado y breakpoints. En escritorio, el menú lateral queda visible junto al contenido y el botón del Header puede colapsarlo. En móvil, el mismo Aside se muestra como panel superpuesto con fondo de cierre; al seleccionar una ruta, cierra el panel. El control debe tener `aria-label`, `aria-expanded` y `aria-controls`, y el fondo debe ser un botón accesible que cierre el menú. No mantengas dos copias independientes del menú para desktop/móvil.

Después de escribir los archivos, valida rutas y compilación. Prueba en navegador ancho móvil y escritorio, botón de menú, cierre del panel y portada conservada:

```bash
npm run build
npm test -- --watch=false
```

## 2.7 Registrar HttpClient sin interceptores de sesión

En `src/app/app.config.ts`, incorpora:

```ts
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
```

Añade `provideHttpClient()` a `providers` y registra `MessageService` para las notificaciones. Mantén los providers globales de errores, Router y PrimeNG de ISS-01. No configures un token ficticio ni almacenes credenciales para hacer pasar pruebas locales; el interceptor de autorización y la renovación pertenecen a su ISS de autenticación.

## 2.8 Comprobación antes de avanzar

Ejecuta desde `Frontd-2026`:

```bash
npm run build
npm test -- --watch=false
```

Añade una prueba de `ClientApi` con `HttpTestingController` que verifique al menos:

1. `list()` solicita `GET http://localhost:3002/api/clientes` y emite el arreglo `clients`, no el objeto envolvente.
2. `get(id)` solicita el recurso esperado y emite `client`.
3. `create()` envía el payload al endpoint correcto y desenvuelve la respuesta.
4. `update()` usa `PATCH`; `replace()` usa `PUT`.
5. Se verifica que no queden solicitudes pendientes al terminar cada prueba.

No cuentes los resultados de esta guía como ejecutados. Al cerrar el ISS, registra los comandos realmente corridos, su salida, los errores encontrados y la evidencia en el informe. Para revisar una ruta protegida desde el navegador, espera `401` mientras no haya un token válido; la integración autenticada se verifica después.

## Cierre del ISS

Verificación local registrada el 3-nov-2026:

```bash
npm test -- --watch=false
npm run build
```

Resultado: 12 archivos de prueba y 30 pruebas aprobadas; build de producción exitoso. La navegación del Shell tiene capturas en escritorio y móvil (375 × 667 px), y las pruebas confirman toggle, estado accesible, cierre por overlay y cierre al emitir navegación desde Aside. Los criterios de aceptación quedan completados para este núcleo inicial de PedalLibre. El siguiente ISS es ISS-03 — CRUD de clientes.
