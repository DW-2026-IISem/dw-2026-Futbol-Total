# Fase I: Frontend — ISS-03: CRUD de clientes con Signals

**Estado:** 3.8 verificado con 43 pruebas aprobadas y build exitoso con advertencia de presupuesto  
**Evidencia recibida:** [E-FRONT-ISS-03-01 — Estructura, implementación y verificación](../trazabilidad/E-FRONT-ISS-03-01-estructura-y-plantillas.md)
**Proyecto:** PedalLibre, carpeta `Frontd-2026`
**Depende de:** ISS-02 — Núcleo: environment, modelos, servicios y layout
**Habilita:** ISS-04 — Estaciones y puntos de anclaje

> **Estado real:** las capturas iniciales mostraron 42 pruebas aprobadas y 1 fallida por dependencias no configuradas en el test scaffold de `ClientList`. Tras corregirlo, las capturas del 3-nov-2026 muestran 43 pruebas aprobadas y build completado. El build aún reporta una advertencia: el bundle inicial supera el presupuesto configurado por 37.39 kB; no es un fallo de compilación.

## Última verificación registrada

Las capturas de consola enlazadas en el [registro de evidencia](../trazabilidad/E-FRONT-ISS-03-01-estructura-y-plantillas.md) muestran la primera ejecución:

- Prueba del filtro: 3 pruebas aprobadas.
- Suite completa: 42 aprobadas y 1 fallida (43 en total). El fallo fue `ClientList` scaffold: faltaban los proveedores `MessageService` y HTTP de prueba.
- Build: completado; el bundle inicial quedó en 537.39 kB frente al presupuesto de 500 kB (37.39 kB por encima).
- `npm start`: compiló y mostró la URL local `http://localhost:4200`; la captura no acredita una comprobación visual en navegador ni una integración autenticada con la API.

Se completó el setup de `client-list.spec.ts` con `MessageService`, `HttpTestingController` y respuesta simulada para la carga inicial. La ejecución posterior confirmó que el test enfocado pasó, las pruebas del feature pasaron (15/15), y la suite completa pasó (43/43 en 17 archivos). El build completó con el mismo aviso de presupuesto de 37.39 kB. Con estas evidencias, las verificaciones automatizadas de 3.8 están aprobadas. La ruta `/clientes` también se inspeccionó en navegador: el Shell se representa en viewport móvil y `GET /api/clientes` devuelve 401 al no haber sesión. Como la BD vacía no se pudo consultar sin autorización, no se marca como verificada la respuesta vacía ni el CRUD conectado.

## Contexto de PedalLibre

- Frontend: Angular 22 standalone, PrimeNG 22 con Aura y Tailwind CSS 4.
- Backend: Express 5, TypeScript, Sequelize y MySQL. La URL local de API configurada en ISS-02 es `http://localhost:3002/api`.
- Feature: clientes (`clients`), con identificación personal y datos de contacto. No usa el modelo de tiendas del material de referencia: los campos principales son `first_name`, `last_name`, `document_type`, `document_number`, `phone`, `email` e `is_active`.
- Servicio existente en ISS-02: `src/app/features/clients/client-api.ts`.
- Modelos existentes en ISS-02: `src/app/core/models/client.model.ts`.
- No se debe acceder a Sequelize/MySQL desde Angular ni añadir campos que no existan en el DTO de PedalLibre.

## Contrato REST que debe respetar la pantalla

Todas estas rutas pasan por `authenticate` y `authorize`; requieren `Authorization: Bearer <access_token>` y permisos RBAC. El frontend todavía no tiene autenticación/interceptor mientras ISS-08 no esté implementado. No desactives la seguridad del backend para hacer funcionar la pantalla.

| Operación | Endpoint | Respuesta de éxito |
|---|---|---|
| Listar clientes activos | `GET /api/clientes` | `200 { clients: Client[] }` |
| Consultar un cliente activo | `GET /api/clientes/:id` | `200 { client: Client }` |
| Crear | `POST /api/clientes` | `201 { client: Client }` |
| Reemplazar | `PUT /api/clientes/:id` | `200 { client: Client }` |
| Editar parcialmente | `PATCH /api/clientes/:id` | `200 { client: Client }` |
| Baja lógica | `PATCH /api/clientes/:id/deactivate` | `200 { message, client }` |
| Eliminación física | `DELETE /api/clientes/:id` | `200 { message, id }` |

El listado y la consulta individual filtran clientes inactivos. La baja lógica cambia `is_active` a `false`; tras recargar, el registro deja de aparecer en `GET /api/clientes`. `DELETE` es una eliminación física, irreversible desde la interfaz, y puede fallar si existen restricciones de integridad. Presenta el error devuelto por la API; no simules que el registro fue eliminado.

El modelo HTTP expone `id` aunque la clave primaria de SQL se llame `client_id`. `user_id` puede ser nulo, y `phone`/`email` pueden ser nulos. `createdAt` y `updatedAt` llegan como fechas serializadas en JSON.

Payload de creación:

```ts
{
  user_id?: number | null;
  document_type?: string;
  first_name: string;
  last_name: string;
  document_number: string;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean;
}
```

`PUT` requiere `document_type`, `first_name`, `last_name` y `document_number`; `PATCH` acepta sus campos parcialmente. Aunque el DTO permite `is_active`, la pantalla no debe incluirlo en los datos de edición: usa la acción explícita de baja lógica. El modelo no incluye `password` ni `address`; no los agregues al formulario.

## Objetivo

Construir la primera pantalla de negocio de PedalLibre: mostrar clientes activos, buscar localmente, crear, editar, desactivar y, con confirmación explícita, eliminar físicamente. Usar Signals para estado reactivo y reutilizar el servicio, modelos, gestión de errores, notificaciones y componentes comunes de ISS-02.

## Evidencia de aprendizaje

Explica cómo `ClientForm` recibe el cliente con `input()` y emite datos con `output()`, por qué `computed()` mantiene sincronizada la búsqueda sin pedir datos otra vez a Express, y por qué las operaciones autenticadas no pueden comprobarse en vivo antes de integrar la sesión.

## Criterios de aceptación

- [ ] Se implementan `ClientList` y `ClientForm` standalone debajo de `features/clients/`.
- [ ] La tabla muestra los campos del modelo PedalLibre y solo los clientes activos devueltos por la API.
- [ ] El filtro local busca por nombre, apellido, número y tipo de documento, correo y teléfono; tolera campos `null` y no dispara peticiones HTTP.
- [ ] El formulario valida requeridos y longitudes antes de emitir: nombres (100), número de documento (50), tipo (30), teléfono (30) y correo (150).
- [ ] Crear envía `POST` con los datos del formulario; editar usa `PATCH` y no envía `is_active`.
- [ ] El formulario no llama al servicio HTTP; emite sus datos al padre.
- [ ] La baja lógica usa `PATCH /:id/deactivate`, confirma la acción y refresca el listado.
- [ ] El borrado físico usa `DELETE`, una advertencia inequívoca y confirmación; muestra los errores de integridad/autorización.
- [ ] Un fallo de carga se muestra de forma persistente en la página; los fallos de escritura se notifican y no cierran el diálogo como si hubiera éxito.
- [ ] La pantalla ofrece estados de carga, lista vacía y filtro sin coincidencias.
- [ ] La ruta `/clientes` se incorpora dentro del Shell y el menú existente enlaza a ella; no se duplica Header/Aside/Footer.
- [ ] No se crea aquí `HasPermission` ni un `permissionGuard`; la autorización de cada petición sigue a cargo del backend hasta ISS-09.
- [ ] Las pruebas cubren filtro, validación, emisiones del formulario y solicitudes/errores del listado con `HttpTestingController`.
- [x] Build y pruebas pasan: 43/43 pruebas aprobadas y build completado. El build advierte que el bundle inicial excede el presupuesto en 37.39 kB. La prueba de UI con API real queda pendiente hasta completar autenticación en ISS-08; no se usa un backend abierto ni un token pegado en código como sustituto.

## 3.1 Confirmar prerrequisitos

Desde `Frontd-2026`, antes de generar archivos, comprueba los resultados de ISS-02:

```bash
test -f src/app/features/clients/client-api.ts
test -f src/app/core/models/client.model.ts
test -f src/app/core/utils/to-api-message.ts
test -f src/app/core/services/notification.ts
test -f src/app/layout/shell/shell.ts
```

Estos son los nombres actuales comprobados en ISS-02. Si alguno no existe en tu copia, detente y termina la dependencia; no añadas un Shell alternativo ni un `NotificationService` duplicado dentro del feature.

Genera los componentes con las convenciones del workspace:

```bash
ng generate component features/clients/client-list --standalone
ng generate component features/clients/client-form --standalone
```

Revisa los nombres y los archivos producidos por el CLI antes de editar. Conserva los archivos de prueba generados o reemplázalos por pruebas completas; no uses `--skip-tests` para omitir validación.

## 3.2 Filtro local puro

La tabla recibe el resultado filtrado por `[value]`. Mantén la función independiente del DOM y de PrimeNG para poder probarla como función pura:

```bash
cat > src/app/core/utils/filter-clients.ts <<'EOF'
import { Client } from '../models/client.model';

export function filterClients(
  clients: readonly Client[],
  query: string,
): Client[] {
  const term = query.trim().toLowerCase();
  if (!term) return [...clients];

  return clients.filter((client) =>
    [
      client.first_name,
      client.last_name,
      client.document_type,
      client.document_number,
      client.email,
      client.phone,
    ].some((value) => (value ?? '').toLowerCase().includes(term)),
  );
}
EOF
```

Ejecuta desde `Frontd-2026`. No busques `address`, `name` ni campos de otras APIs: no son parte del `Client` de PedalLibre.

Si el workspace aún no tiene pruebas del helper, crea esta especificación ejecutable:

```bash
cat > src/app/core/utils/filter-clients.spec.ts <<'EOF'
import { describe, expect, it } from 'vitest';
import { Client } from '../models/client.model';
import { filterClients } from './filter-clients';

const client: Client = {
  id: 1,
  user_id: null,
  document_type: 'CC',
  first_name: 'Ana',
  last_name: 'Pérez',
  document_number: '123456789',
  phone: null,
  email: 'ana@example.com',
  is_active: true,
  createdAt: '2026-11-03T12:00:00.000Z',
  updatedAt: '2026-11-03T12:00:00.000Z',
};

describe('filterClients', () => {
  it('returns a copy of the full list for a blank query', () => {
    const input = [client];
    const result = filterClients(input, '  ');
    expect(result).toEqual(input);
    expect(result).not.toBe(input);
  });

  it('matches names and documents without case sensitivity', () => {
    expect(filterClients([client], 'PÉREZ')).toEqual([client]);
    expect(filterClients([client], '123456')).toEqual([client]);
  });

  it('tolerates null contact fields and matches email', () => {
    expect(filterClients([client], 'ANA@EXAMPLE')).toEqual([client]);
    expect(filterClients([client], '300')).toEqual([]);
  });
});
EOF
```

## 3.3 Formulario reutilizable

`ClientForm` recibe `client`, `saving` y el error de guardado mediante `input()`, y expone eventos `saved` y `cancelled` mediante `output()`. Usa Reactive Forms y controles tipados. El padre decide entre `ClientApi.create()` y `ClientApi.update()`. Crea la lógica TypeScript que usa la plantilla:

```bash
cat > src/app/features/clients/client-form/client-form.ts <<'EOF'
import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { Client } from '../../../core/models/client.model';

export interface ClientFormPayload {
  document_type?: string;
  first_name: string;
  last_name: string;
  document_number: string;
  phone: string | null;
  email: string | null;
}

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, MessageModule, SelectModule],
  templateUrl: './client-form.html',
  styleUrl: './client-form.css',
})
export class ClientForm {
  readonly client = input<Client | null>(null);
  readonly saving = input(false);
  readonly error = input<string | null>(null);
  readonly saved = output<ClientFormPayload>();
  readonly cancelled = output<void>();

  readonly documentTypes = [
    { label: 'Cédula de ciudadanía', value: 'CC' },
    { label: 'Cédula de extranjería', value: 'CE' },
    { label: 'Pasaporte', value: 'PASSPORT' },
    { label: 'Otro', value: 'OTHER' },
  ];

  readonly form = new FormGroup({
    document_type: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(30)] }),
    first_name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    last_name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    document_number: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(30)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.email, Validators.maxLength(150)] }),
  });

  constructor() {
    effect(() => {
      const client = this.client();
      this.form.reset({
        document_type: client?.document_type ?? '',
        first_name: client?.first_name ?? '',
        last_name: client?.last_name ?? '',
        document_number: client?.document_number ?? '',
        phone: client?.phone ?? '',
        email: client?.email ?? '',
      });
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;

    const value = this.form.getRawValue();
    const document_type = value.document_type.trim();
    this.saved.emit({
      ...(document_type ? { document_type } : {}),
      first_name: value.first_name.trim(),
      last_name: value.last_name.trim(),
      document_number: value.document_number.trim(),
      phone: value.phone.trim() || null,
      email: value.email.trim() || null,
    });
  }
}
EOF
```

La lista de tipos es una opción de interfaz, no una enumeración impuesta por el backend; ajústala si el dominio local requiere otros valores. El payload deliberadamente excluye `user_id` e `is_active`.

El formulario puede editar:

- Tipo de documento (opcional, máximo 30 caracteres).
- Nombres y apellidos (obligatorios, máximo 100 cada uno).
- Número de documento (obligatorio, máximo 50).
- Teléfono (opcional, máximo 30).
- Correo (opcional, válido, máximo 150).

No agregues dirección, contraseña, selector de rol ni activación/reactivación. `user_id` se omite de la UI si no existe un flujo de asociación explícito; el backend lo deja nulo por defecto. Al emitir el formulario, recorta espacios y convierte los campos de contacto vacíos en `null` según el payload.

En creación se puede reutilizar el formulario vacío; en edición se inicializa desde `client()`. Si el diálogo conserva su contenido entre aperturas, reinicia los controles al abrir una nueva operación y prueba la secuencia crear → cancelar → crear.

Sustituye la plantilla generada del formulario con el HTML funcional de Reactive Forms:

```bash
cat > src/app/features/clients/client-form/client-form.html <<'EOF'
<form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
  <div class="grid gap-4 sm:grid-cols-2">
    <div>
      <label for="client-first-name">Nombres *</label>
      <input id="client-first-name" pInputText formControlName="first_name" maxlength="100" class="w-full" />
      @if (form.controls.first_name.touched && form.controls.first_name.invalid) {
        <p-message severity="error" size="small" variant="simple">Escribe hasta 100 caracteres.</p-message>
      }
    </div>
    <div>
      <label for="client-last-name">Apellidos *</label>
      <input id="client-last-name" pInputText formControlName="last_name" maxlength="100" class="w-full" />
      @if (form.controls.last_name.touched && form.controls.last_name.invalid) {
        <p-message severity="error" size="small" variant="simple">Escribe hasta 100 caracteres.</p-message>
      }
    </div>
  </div>
  <div class="grid gap-4 sm:grid-cols-2">
    <div>
      <label for="client-document-type">Tipo de documento</label>
      <p-select inputId="client-document-type" [options]="documentTypes" formControlName="document_type"
        optionLabel="label" optionValue="value" [showClear]="true" [fluid]="true" />
    </div>
    <div>
      <label for="client-document-number">Número de documento *</label>
      <input id="client-document-number" pInputText formControlName="document_number" maxlength="50" class="w-full" />
      @if (form.controls.document_number.touched && form.controls.document_number.invalid) {
        <p-message severity="error" size="small" variant="simple">El documento es obligatorio (máximo 50 caracteres).</p-message>
      }
    </div>
  </div>
  <div class="grid gap-4 sm:grid-cols-2">
    <div>
      <label for="client-phone">Teléfono</label>
      <input id="client-phone" pInputText formControlName="phone" maxlength="30" class="w-full" />
    </div>
    <div>
      <label for="client-email">Correo</label>
      <input id="client-email" pInputText type="email" formControlName="email" maxlength="150" class="w-full" />
      @if (form.controls.email.touched && form.controls.email.invalid) {
        <p-message severity="error" size="small" variant="simple">Revisa el formato del correo.</p-message>
      }
    </div>
  </div>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <div class="flex justify-end gap-2">
    <button pButton type="button" severity="secondary" (click)="cancelled.emit()">Cancelar</button>
    <button pButton type="submit" [loading]="saving()">Guardar cliente</button>
  </div>
</form>
EOF
```

En `client-form.ts`, importa `ReactiveFormsModule`, `InputTextModule`, `SelectModule`, `ButtonModule` y `MessageModule`; implementa `documentTypes`, `form`, `submit()`, `input()` y `output()` definidos arriba. Omite `is_active` y `user_id` al construir el payload de edición/creación. Al normalizar, aplica `trim()` a nombres/documento/tipo y convierte `phone`/`email` vacíos a `null`.

## 3.4 Lista con Signals

Implementa el componente que usa la plantilla. Incluye la carga inicial, búsqueda computada, confirmación explícita de bajas y borrado, y deja los errores de escritura en el diálogo:

```bash
cat > src/app/features/clients/client-list/client-list.ts <<'EOF'
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { Client } from '../../../core/models/client.model';
import { NotificationService } from '../../../core/services/notification';
import { filterClients } from '../../../core/utils/filter-clients';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { ClientApi } from '../client-api';
import { ClientForm, ClientFormPayload } from '../client-form/client-form';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [ButtonModule, DialogModule, InputTextModule, MessageModule, TableModule, PageHeader, ClientForm],
  templateUrl: './client-list.html',
  styleUrl: './client-list.css',
})
export class ClientList implements OnInit {
  private readonly api = inject(ClientApi);
  private readonly notify = inject(NotificationService);

  readonly clients = signal<Client[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly query = signal('');
  readonly visibleClients = computed(() => filterClients(this.clients(), this.query()));
  readonly dialogVisible = signal(false);
  readonly editing = signal<Client | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.list().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set('No se pudieron cargar los clientes. Actualiza la página o inténtalo de nuevo.');
        this.notify.error(error, 'Error al cargar clientes');
        this.loading.set(false);
      },
    });
  }

  setQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  openCreate(): void {
    this.editing.set(null);
    this.formError.set(null);
    this.dialogVisible.set(true);
  }

  openEdit(client: Client): void {
    this.editing.set(client);
    this.formError.set(null);
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    if (this.saving()) return;
    this.dialogVisible.set(false);
    this.editing.set(null);
    this.formError.set(null);
  }

  save(payload: ClientFormPayload): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.formError.set(null);
    const current = this.editing();
    const request = current
      ? this.api.update(current.id, payload)
      : this.api.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.editing.set(null);
        this.notify.success(current ? 'Cliente actualizado.' : 'Cliente creado.');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.formError.set('No se pudo guardar el cliente. Revisa los datos y permisos e inténtalo de nuevo.');
        this.notify.error(error, 'Error al guardar cliente');
      },
    });
  }

  deactivate(client: Client): void {
    if (!window.confirm(`¿Desactivar a ${client.first_name} ${client.last_name}?`)) return;
    this.api.deactivate(client.id).subscribe({
      next: () => {
        this.notify.success('Cliente desactivado.');
        this.load();
      },
      error: (error: unknown) => this.notify.error(error, 'No se pudo desactivar'),
    });
  }

  remove(client: Client): void {
    const name = `${client.first_name} ${client.last_name}`;
    if (!window.confirm(`Eliminación permanente: ¿borrar a ${name}? Esta acción no se puede deshacer.`)) return;
    this.api.remove(client.id).subscribe({
      next: () => {
        this.notify.success('Cliente eliminado permanentemente.');
        this.load();
      },
      error: (error: unknown) => this.notify.error(error, 'No se pudo eliminar'),
    });
  }
}
EOF
```

`ClientList` llama `ClientApi.list()` al iniciar y después de escrituras exitosas. En caso de error de carga conserva un mensaje visible; los errores de escritura se notifican y no cierran el diálogo. `window.confirm()` se usa aquí para que la muestra sea ejecutable sin registrar otro proveedor PrimeNG; si el workspace adopta un `ConfirmationService`, sustituye ambas confirmaciones y prueba aceptación/cancelación.

Con PrimeNG 22, usa las referencias de plantilla de `p-table` (por ejemplo `#header`, `#body` y `#emptymessage`) y verifica la API del paquete instalado. No copies snippets de versiones antiguas que dependan de `pTemplate`.

Columnas recomendadas: nombre completo, documento, correo/teléfono, estado `is_active` y acciones. En la tabla principal solo aparecerán clientes activos por contrato del backend; la etiqueta de estado puede presentar “Activo” sin inventar un campo `status`.

Sustituye la plantilla generada de `ClientList` con este comando:

```bash
cat > src/app/features/clients/client-list/client-list.html <<'EOF'
<section class="space-y-4">
  <app-page-header title="Clientes" description="Consulta y administra los clientes de PedalLibre.">
    <button pButton type="button" (click)="openCreate()">
      <i pButtonIcon class="pi pi-plus"></i><span pButtonLabel>Nuevo cliente</span>
    </button>
  </app-page-header>
  <label for="client-filter" class="sr-only">Buscar clientes</label>
  <input id="client-filter" pInputText [value]="query()" (input)="setQuery($event)"
    placeholder="Nombre, documento, correo o teléfono" class="w-full sm:max-w-md" />
  @if (loading()) { <p class="text-slate-600" role="status">Cargando clientes…</p> }
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  @if (!loading() && !error()) {
    <p-table [value]="visibleClients()" dataKey="id">
      <ng-template #header>
        <tr><th>Nombre</th><th>Documento</th><th>Contacto</th><th>Estado</th><th>Acciones</th></tr>
      </ng-template>
      <ng-template #body let-client>
        <tr>
          <td>{{ client.first_name }} {{ client.last_name }}</td>
          <td>{{ client.document_type || '—' }} {{ client.document_number }}</td>
          <td>{{ client.email || '—' }}<br />{{ client.phone || '—' }}</td>
          <td>Activo</td>
          <td class="flex flex-wrap gap-2">
            <button pButton type="button" text (click)="openEdit(client)"
              [attr.aria-label]="'Editar cliente ' + client.first_name + ' ' + client.last_name">Editar</button>
            <button pButton type="button" severity="secondary" (click)="deactivate(client)">Desactivar</button>
            <button pButton type="button" severity="danger" (click)="remove(client)">Eliminar definitivamente</button>
          </td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr><td colspan="5">{{ query().trim() ? 'No hay coincidencias.' : 'No hay clientes activos.' }}</td></tr>
      </ng-template>
    </p-table>
  }
  @if (dialogVisible()) {
    <p-dialog [visible]="true" (visibleChange)="dialogVisible.set($event)"
      [header]="editing() ? 'Editar cliente' : 'Nuevo cliente'" [modal]="true"
      [style]="{ width: 'min(42rem, 95vw)' }">
      <app-client-form [client]="editing()" [saving]="saving()" [error]="formError()"
        (saved)="save($event)" (cancelled)="closeDialog()" />
    </p-dialog>
  }
</section>
EOF
```

En `client-list.ts`, importa `TableModule`, `DialogModule`, `ButtonModule`, `InputTextModule`, `MessageModule`, `PageHeader` y `ClientForm`; implementa los Signals, `load()`, `openCreate()`, `openEdit()`, `setQuery()`, `save()`, `deactivate()`, `remove()` y `closeDialog()`. `load()` usa `ClientApi.list()`; `save()` selecciona `create()` o `update()`, y solo en `next` cierra, notifica y recarga. Las confirmaciones de baja y borrado deben usar el servicio/patrón de confirmación ya adoptado en el workspace; en caso de rechazo no envíes la petición. El mensaje de error de carga queda en la página, y los de escritura pasan a `NotificationService.error(error)`.

## 3.5 Crear y editar

El bloque `cat` de 3.4 implementa `ClientList.save()`: al recibir `saved`, selecciona `ClientApi.create()` si no hay cliente editado y `ClientApi.update()` si existe. El siguiente test verifica ambos caminos, el verbo/cuerpo, la recarga tras éxito y que un `409` no cierre el diálogo ni se presente como éxito. Crea el archivo de prueba:

```bash
cat > src/app/features/clients/client-list/client-list-save.spec.ts <<'EOF'
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { Client } from '../../../core/models/client.model';
import { MessageService } from 'primeng/api';
import { ClientFormPayload } from '../client-form/client-form';
import { ClientList } from './client-list';

describe('ClientList save', () => {
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/clientes`;
  const client: Client = {
    id: 17,
    user_id: null,
    document_type: 'CC',
    first_name: 'Ana',
    last_name: 'Pérez',
    document_number: '123456789',
    phone: null,
    email: 'ana@example.com',
    is_active: true,
    createdAt: '2026-11-03T12:00:00.000Z',
    updatedAt: '2026-11-03T12:00:00.000Z',
  };
  const payload: ClientFormPayload = {
    document_type: 'CC',
    first_name: 'Ana',
    last_name: 'Pérez',
    document_number: '123456789',
    phone: null,
    email: 'ana@example.com',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientList],
      providers: [provideHttpClient(), provideHttpClientTesting(), MessageService],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function createList() {
    const fixture = TestBed.createComponent(ClientList);
    fixture.detectChanges();
    http.expectOne(url).flush({ clients: [client] });
    return fixture.componentInstance;
  }

  it('creates a client with POST and reloads only after success', () => {
    const component = createList();
    component.openCreate();
    component.save(payload);

    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ client });

    expect(component.dialogVisible()).toBe(false);
    http.expectOne(url).flush({ clients: [client] });
  });

  it('updates a client with PATCH and does not send is_active', () => {
    const component = createList();
    component.openEdit(client);
    component.save({ ...payload, phone: '3001234567' });

    const request = http.expectOne(`${url}/${client.id}`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ ...payload, phone: '3001234567' });
    expect(request.request.body).not.toHaveProperty('is_active');
    request.flush({ client: { ...client, phone: '3001234567' } });

    expect(component.dialogVisible()).toBe(false);
    http.expectOne(url).flush({ clients: [client] });
  });

  it('keeps the dialog open and reports a conflict when save fails', () => {
    const component = createList();
    component.openCreate();
    component.save(payload);

    http.expectOne(url).flush(
      { error: 'El documento ya existe' },
      { status: 409, statusText: 'Conflict' },
    );

    expect(component.dialogVisible()).toBe(true);
    expect(component.saving()).toBe(false);
    expect(component.formError()).toBeTruthy();
    http.expectNone(url);
  });
});
EOF
```

No uses `PUT` para este formulario parcial. Mientras se guarda, evita envíos duplicados; en éxito cierra, notifica y recarga; en error deja el diálogo abierto y conserva los valores para reintentar.

## 3.6 Baja lógica y eliminación física

El bloque `cat` de 3.4 implementa `deactivate()` y `remove()`. Este test confirma que cancelar no hace llamadas, aceptar usa el endpoint/verbo correctos y después de éxito se recarga la lista:

```bash
cat > src/app/features/clients/client-list/client-list-removal.spec.ts <<'EOF'
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../environments/environment';
import { Client } from '../../../core/models/client.model';
import { ClientList } from './client-list';

describe('ClientList client removal', () => {
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/clientes`;
  const client: Client = {
    id: 17,
    user_id: null,
    document_type: 'CC',
    first_name: 'Ana',
    last_name: 'Pérez',
    document_number: '123456789',
    phone: null,
    email: 'ana@example.com',
    is_active: true,
    createdAt: '2026-11-03T12:00:00.000Z',
    updatedAt: '2026-11-03T12:00:00.000Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientList],
      providers: [provideHttpClient(), provideHttpClientTesting(), MessageService],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  function createList() {
    const fixture = TestBed.createComponent(ClientList);
    fixture.detectChanges();
    http.expectOne(url).flush({ clients: [client] });
    return fixture.componentInstance;
  }

  it('does not deactivate when confirmation is cancelled', () => {
    const component = createList();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.deactivate(client);

    expect(window.confirm).toHaveBeenCalledOnce();
    http.expectNone(`${url}/${client.id}/deactivate`);
  });

  it('deactivates with PATCH only after confirmation and reloads', () => {
    const component = createList();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.deactivate(client);

    const request = http.expectOne(`${url}/${client.id}/deactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});
    request.flush({ message: 'Client deactivated', client: { ...client, is_active: false } });
    http.expectOne(url).flush({ clients: [] });
  });

  it('does not physically delete when confirmation is cancelled', () => {
    const component = createList();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.remove(client);

    expect(window.confirm).toHaveBeenCalledOnce();
    http.expectNone(`${url}/${client.id}`);
  });

  it('uses DELETE only after confirmation and reloads after success', () => {
    const component = createList();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.remove(client);

    const request = http.expectOne(`${url}/${client.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush({ message: 'Client permanently deleted', id: client.id });
    http.expectOne(url).flush({ clients: [] });
  });

  it('keeps the client in the list when DELETE is rejected by the backend', () => {
    const component = createList();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.remove(client);
    http.expectOne(`${url}/${client.id}`).flush(
      { error: 'El cliente tiene reservas asociadas' },
      { status: 409, statusText: 'Conflict' },
    );

    expect(component.clients()).toEqual([client]);
    http.expectNone(url);
  });
});
EOF
```

No mandes `is_active: false` desde el formulario: usa `PATCH /:id/deactivate`. `DELETE` es físico e irreversible, y puede fallar por relaciones existentes; prueba ese error y no marques éxito ni quites la fila antes de confirmación del servidor.

## 3.7 Ruta y menú

ISS-02 y su Shell son prerrequisitos. Agrega `ClientList` como ruta hija `clientes` usando `loadComponent`, y añade al menú existente el enlace correspondiente. Conserva el `router-outlet` y el layout compartido una sola vez. La portada de inicio creada en ISS-02 debe mantenerse disponible en su ruta; no la elimines al incorporar clientes.

Reemplaza `src/app/app.routes.ts` conservando HomePage, Shell y la ruta comodín, e incorporando Clientes como ruta hija:

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
      {
        path: 'clientes',
        title: 'Clientes · PedalLibre',
        loadComponent: () =>
          import('./features/clients/client-list/client-list').then(
            (module) => module.ClientList,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
EOF
```

Añade el enlace al `<nav>` existente de `src/app/layout/aside/aside.html`. Este comando escribe la plantilla completa conocida, conserva Inicio y agrega Clientes:

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
    <a
      routerLink="/clientes"
      routerLinkActive="bg-emerald-50 text-emerald-800"
      class="flex min-h-11 items-center gap-3 rounded-lg px-3 text-slate-700 hover:bg-slate-100"
      (click)="navigate.emit()"
    >
      <i class="pi pi-users" aria-hidden="true"></i>
      <span [class.md:hidden]="collapsed()">Clientes</span>
    </a>
  </nav>
</aside>
EOF
```

El backend protege los endpoints. La pantalla puede construirse y probarse con `HttpTestingController`, pero no se debe declarar integración manual exitosa contra `localhost:3002` hasta que ISS-08 proporcione una sesión válida. Sin token, un `401` es el comportamiento esperado; `403` indica que la identidad autenticada carece del permiso requerido. Nunca desactives `authenticate`/`authorize` ni pongas un JWT fijo en el código para validar el CRUD.

La directiva de permisos y el filtrado de acciones visuales son trabajo de ISS-09. El control de botones no reemplaza la autorización del servidor.

## 3.8 Pruebas y verificación

Prueba al menos:

1. `filterClients`: búsqueda sin distinción de mayúsculas, campos nulos, coincidencia por documento y cero resultados.
2. `ClientForm`: valores iniciales, validación de requeridos y email, payload sin campos ajenos al DTO, edición sin `is_active`, reset entre aperturas y cancelación.
3. `ClientList`: carga desde `{ clients }`, filtro sin nuevas peticiones, `POST`, `PATCH`, recarga tras éxito y error visible ante fallos.
4. Bajas: `PATCH /:id/deactivate` y `DELETE /:id` solo tras aceptar confirmación; error de backend notificado sin simular éxito.
5. Prueba de tabla: al menos una fila por cliente y plantilla de vacío para lista sin datos/filtro sin coincidencias.

Simula HTTP con `HttpTestingController`; no dependas de credenciales de una base real en las pruebas unitarias. Comprueba los verbos, URLs, cuerpos enviados y envolturas esperadas.

```bash
npm run ng -- test --watch=false --include='src/app/core/utils/filter-clients.spec.ts'
npm run ng -- test --watch=false --include='src/app/features/clients/**/*.spec.ts'
npm test -- --watch=false
npm run build
npm start
```

No copies resultados de pruebas de otro workspace. Anota en el informe la salida efectivamente observada, la cantidad real de archivos/casos, limitaciones por JWT y capturas nuevas de PedalLibre.

Con `npm start`, abre `http://localhost:4200/clientes` y recarga la ruta directa. Antes de ISS-08, si la vista llama al backend sin sesión, documenta `401` como esperado; las pruebas con `HttpTestingController` deben continuar pasando sin quitar JWT/RBAC.

## Evidencias de avance recibidas

Las capturas de estructura inicial y las capturas posteriores de implementación, pruebas, build y respuesta 401 están descritas en [E-FRONT-ISS-03-01 — Estructura, implementación y verificación](../trazabilidad/E-FRONT-ISS-03-01-estructura-y-plantillas.md). La ruta visual y las verificaciones automatizadas están documentadas; la lectura exitosa de la lista vacía y el CRUD conectado requieren una sesión autenticada.

## Cierre

ISS-03 se cierra cuando los criterios anteriores están implementados y verificados, y cuando existe evidencia del CRUD probado. La comprobación E2E contra el backend autenticado se completa después de ISS-08; el cierre de ISS-03 no autoriza a presentar una API abierta como equivalente. La siguiente unidad se define según el orden acordado de features de PedalLibre.
