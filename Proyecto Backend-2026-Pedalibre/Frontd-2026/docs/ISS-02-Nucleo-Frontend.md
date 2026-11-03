# Fase I: Frontend — ISS-02: Núcleo: environment, modelos, servicios y layout

**Estado:** pendiente
**Proyecto:** PedalLibre, carpeta `Frontd-2026`
**Depende de:** ISS-01A — Esqueleto de la interfaz e ISS-01B — Interacción del menú
**Habilita:** ISS-03 — CRUD de clientes

> **Estado real del proyecto:** ISS-01 dejó una portada local, pero `app.routes.ts` sigue vacío y todavía no existen Header, Aside, Footer ni Shell. Este ISS se redacta ahora para continuar la ruta, pero no se debe marcar iniciado ni dar por existente el layout hasta completar ISS-01A e ISS-01B. En esta guía, los nombres de las entidades y los contratos corresponden a PedalLibre, no al proyecto de referencia.

## Contexto de PedalLibre

- Frontend: Angular 22 standalone, PrimeNG 22 con Aura y Tailwind CSS 4.
- Backend: Express 5, TypeScript, Sequelize y MySQL. La API local comprobada escucha en `http://localhost:3002`; el backend obtiene el puerto de `.env` y tiene `4000` como valor predeterminado si no se configura.
- URL base del frontend: `http://localhost:3002/api`, sin slash final. Si el puerto configurado en el backend cambia, se debe actualizar el environment para que coincidan.
- El esquema PedalLibre contiene 17 tablas. La referencia de columnas y relaciones es [`../trazabilidad/pedalibre/README.md`](../trazabilidad/pedalibre/README.md) y el SQL [`../trazabilidad/pedalibre/pedalibre.sql`](../trazabilidad/pedalibre/pedalibre.sql).
- El contrato HTTP se puede contrastar en Swagger (`/api/docs`) y en los controladores y DTO del backend. El cliente no debe acceder a Sequelize ni a MySQL.
- Las rutas de negocio están protegidas con JWT y RBAC. ISS-02 registra `HttpClient`, pero no agrega interceptores de sesión: autenticación y renovación de tokens pertenecen a la fase correspondiente.

## Objetivo

Preparar la infraestructura que usarán las pantallas de negocio: environments, modelos TypeScript basados en las respuestas reales de PedalLibre, el primer servicio HTTP tipado, utilidades de error y notificaciones, componentes compartidos y la composición del Shell con el layout construido en ISS-01A/01B.

La cadena que debe quedar clara es:

```text
Plantilla → componente → ClientApi → HttpClient → API Express
          ← signal ← Client[] ← map() desenvuelve { clients } ← respuesta HTTP
```

La respuesta se desenvuelve en el servicio, no en la plantilla ni en cada componente.

## Criterios de aceptación

- [ ] `environment.ts` y `environment.development.ts` existen; `angular.json` reemplaza el environment para desarrollo.
- [ ] `apiUrl` es `http://localhost:3002/api`, sin slash final, y no contiene secretos.
- [ ] Los modelos reflejan los nombres y nulabilidad del JSON que devuelve PedalLibre; no exponen hashes ni tokens persistidos.
- [ ] Los tipos monetarios aceptan `number | string`, porque Sequelize puede serializar `DECIMAL` como texto.
- [ ] Los DTO de escritura distinguen crear, reemplazar y actualizar parcialmente; no presentan transiciones de negocio como cambios genéricos.
- [ ] `ClientApi` construye su URL desde `environment.apiUrl` y devuelve `Client`/`Client[]`, no las envolturas HTTP.
- [ ] `ClientApi` usa las envolturas reales de clientes: `{ clients }` y `{ client }`; no las del controlador genérico `{ items }` y `{ item }`.
- [ ] `toApiMessage` diferencia una API inaccesible (`status === 0`) de un `401` o `403`, y extrae el campo `error` cuando el backend lo devuelve.
- [ ] `NotificationService` centraliza los mensajes PrimeNG y no oculta los errores.
- [ ] `PageHeader`, `EmptyState` y `StatusTag` son standalone y no agregan CSS de negocio.
- [ ] Shell compone una vez Header, Aside, `router-outlet` y Footer, conservando el diseño/responsive y la navegación de ISS-01A/01B.
- [ ] `provideHttpClient()` está registrado sin interceptores de autenticación.
- [ ] Build y pruebas terminan correctamente; la prueba de `ClientApi` comprueba el URL, el método HTTP y el desenvolvimiento de la respuesta.

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

Después de completar el prerrequisito visual, crea componentes standalone sin CSS específico de negocio:

```bash
ng generate component shared/ui/page-header --standalone --skip-tests
ng generate component shared/ui/empty-state --standalone --skip-tests
ng generate component shared/ui/status-tag --standalone --skip-tests
```

- `PageHeader`: recibe título y, si hace falta, una descripción y acciones proyectadas.
- `EmptyState`: recibe un mensaje y permite proyectar una acción de recuperación.
- `StatusTag`: recibe el texto de estado y presenta una severidad PrimeNG; no asumas que todos los módulos usan los mismos valores. Conserva un caso neutral para estados que aún no estén mapeados.

Usa componentes PrimeNG y clases Tailwind existentes. No agregues PrimeFlex ni estilos globales para resolver la composición de una pantalla.

## 2.6 Shell y navegación

El Shell depende de Header, Aside y Footer construidos e integrados en ISS-01A/01B. En el estado actual esos componentes no existen: no copies una referencia de otro proyecto ni marques esta sección como completada antes de que estén implementados.

Al completar el prerrequisito, integra esos componentes una sola vez en el Shell. El botón del Header debe controlar la navegación lateral según el comportamiento responsive definido en ISS-01B. `app.routes.ts` debe conservar la portada como ruta local y usar el Shell sin duplicar encabezado o menú al navegar. Las rutas de negocio se agregan en los ISS de cada feature; no anuncies enlaces que conduzcan a pantallas inexistentes.

`App` debe renderizar la salida del router si la estrategia de ISS-01A/01B usa un Shell enrutado. Conserva la portada actual como pantalla local hasta que una etapa posterior la reemplace con una ruta real.

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

Antes de marcarlo completado, explica con tus palabras qué servicio desenvuelve `{ clients }`, por qué `DECIMAL` se modela como `number | string`, y por qué la interfaz no debe cambiar estados de alquiler por un CRUD genérico. El siguiente paso es ISS-03 — CRUD de clientes, después de completar las comprobaciones y registrar evidencia real.
