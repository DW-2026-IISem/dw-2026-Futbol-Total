# Fase II: Frontend — ISS-10: Administración de usuarios y RBAC PedalLibre

**Estado:** implementado: usuarios, roles, recursos y concesiones según las rutas y envolturas del backend; cubierto por la suite frontend. La validación contra API real queda pendiente.  
**Proyecto:** PedalLibre, `Frontd-2026`  
**Depende de:** ISS-09 — Guards y RBAC en la interfaz  
**Habilita:** ISS-11 — Verificación y cierre del proyecto  
**Revisión del contrato:** 3-nov-2026

> El modelo PedalLibre no tiene el pivote `role_users` de otras aplicaciones. Cada usuario tiene un `role_id`; la relación muchos-a-muchos autorizadora es `role_resources`, expuesta por `/api/concesiones-rol`.

## Modelo de autorización

La autorización combina usuario activo → su `role_id` activo → concesión activa `role_id/resource_id` → recurso activo identificado por método y ruta. La respuesta efectiva del backend se consulta con `GET /api/permisos`; no reconstruyas permisos con tablas descargadas ni con el nombre del rol.

Roles sembrados: `ADMIN`, `OPERACIONES`, `MANTENIMIENTO`, `SOPORTE`, `CLIENTE`. El esquema inicial no inserta usuarios ni contraseñas. No asumas un administrador listo hasta verificar la siembra/configuración de usuarios en el backend.

## Endpoints disponibles

| Entidad | Colección | Respuesta de lista | Acciones |
|---|---|---|---|
| Usuarios | `/api/usuarios` | `{ users }` | GET/POST; GET/PUT/PATCH/DELETE `/:id`; PATCH `/:id/deactivate`, `/:id/password`; GET `/:id/permisos` |
| Roles | `/api/roles` | `{ roles }` | GET/POST; GET/PUT/PATCH/DELETE `/:id`; PATCH `/:id/deactivate` |
| Recursos | `/api/recursos` | `{ resources }` | GET/POST; GET/PUT/PATCH/DELETE `/:id`; PATCH `/:id/deactivate` |
| Concesiones | `/api/concesiones-rol` | `{ grants }` | GET/POST; GET `/:id`; PATCH `/:id/deactivate` y `/:id/reactivate` |

Respuestas de detalle/creación usan `{ user }`, `{ role }`, `{ resource }`; las concesiones usan `{ grant }` (el POST incluye además `message`). Las rutas requieren JWT y autorización.

Filtros de concesiones: `GET /api/concesiones-rol?role_id=<id>&resource_id=<id>`. Crear concesión manda `role_id` y `resource_id`; el servidor valida ambos recursos y crea/reactiva la pareja. No existe `/api/asignaciones-rol`, ni se asigna un rol a un usuario mediante un pivote: se gestiona por `role_id` de usuario en el contrato de usuario.

### Cuidado con usuarios

El API no debe exponer `password_hash`. Sigue los DTO de backend para creación y actualización; no mandes hash ni datos secretos. `PATCH /api/usuarios/:id/password` es un cambio de contraseña sujeto al DTO propio; no lo conviertas en un “admin resetea contraseña” sin autorización y reglas expresas. El listado de permisos de otro usuario usa `GET /api/usuarios/:id/permisos`, si el permiso está concedido.

### Recursos y concesiones

Un recurso es el par único `method + path` (por ejemplo `GET /api/stations` o `PATCH /api/bicycle-dockings/:id/undock`). Las concesiones se activan/desactivan; la reactivación es explícita. Desactivar un rol/recurso afecta los permisos efectivos, pero no borres registros a la ligera: el borrado físico puede afectar relaciones.

## Construcción sugerida

```bash
ng generate component features/admin/users/user-list --standalone
ng generate component features/admin/roles/role-list --standalone
ng generate component features/admin/resources/resource-list --standalone
ng generate component features/admin/resource-roles/resource-role-list --standalone
```

Construye una pantalla a la vez: primero usuarios/roles, luego catálogo de recursos y finalmente concesiones. Usa formularios de PrimeNG standalone, `HttpClient` tipado, `Signals`, confirmación para desactivar/eliminar y errores visibles. La lista de usuarios ofrece edición de `role_id` como selector solo si el DTO de backend y el permiso lo permiten. No agregues asignación de rol-usuario separada.

### 10.1 Crear los modelos y servicios HTTP

```bash
mkdir -p src/app/features/admin
cat > src/app/core/models/admin.model.ts <<'EOF'
export interface AdminUser {
  id: number;
  role_id: number;
  username: string;
  email: string | null;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface AdminUserCreate {
  role_id: number;
  username: string;
  email?: string | null;
  password: string;
  status?: 'active' | 'inactive';
}

export type AdminUserPatch = Partial<Omit<AdminUserCreate, 'password' | 'status'>>;

export interface AdminRole {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface AdminRolePayload {
  name: string;
  description?: string;
}

export interface AdminResource {
  id: number;
  method: string;
  path: string;
  description: string | null;
  status: 'active' | 'inactive';
}

export interface AdminResourcePayload {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description?: string;
}

export interface RoleGrant {
  id: number;
  role_id: number;
  resource_id: number;
  is_allowed: boolean;
  status: 'active' | 'inactive';
  role?: { id: number; name: string } | null;
  resource?: { id: number; method: string; path: string; description: string | null } | null;
}
EOF

cat > src/app/features/admin/admin-api.ts <<'EOF'
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminResource, AdminResourcePayload, AdminRole, AdminRolePayload,
  AdminUser, AdminUserCreate, AdminUserPatch, RoleGrant,
} from '../../core/models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  users(): Observable<AdminUser[]> {
    return this.http.get<{ users: AdminUser[] }>(`${this.base}/usuarios`).pipe(map((r) => r.users));
  }
  createUser(payload: AdminUserCreate): Observable<AdminUser> {
    return this.http.post<{ user: AdminUser }>(`${this.base}/usuarios`, payload).pipe(map((r) => r.user));
  }
  updateUser(id: number, payload: AdminUserPatch): Observable<AdminUser> {
    return this.http.patch<{ user: AdminUser }>(`${this.base}/usuarios/${id}`, payload).pipe(map((r) => r.user));
  }
  deactivateUser(id: number): Observable<AdminUser> {
    return this.http.patch<{ message: string; user: AdminUser }>(
      `${this.base}/usuarios/${id}/deactivate`, {},
    ).pipe(map((r) => r.user));
  }
  deleteUser(id: number): Observable<{ message: string; id: number }> {
    return this.http.delete<{ message: string; id: number }>(`${this.base}/usuarios/${id}`);
  }
  roles(): Observable<AdminRole[]> {
    return this.http.get<{ roles: AdminRole[] }>(`${this.base}/roles`).pipe(map((r) => r.roles));
  }
  createRole(payload: AdminRolePayload): Observable<AdminRole> {
    return this.http.post<{ role: AdminRole }>(`${this.base}/roles`, payload).pipe(map((r) => r.role));
  }
  updateRole(id: number, payload: Partial<AdminRolePayload>): Observable<AdminRole> {
    return this.http.patch<{ role: AdminRole }>(`${this.base}/roles/${id}`, payload).pipe(map((r) => r.role));
  }
  deactivateRole(id: number): Observable<AdminRole> {
    return this.http.patch<{ message: string; role: AdminRole }>(
      `${this.base}/roles/${id}/deactivate`, {},
    ).pipe(map((r) => r.role));
  }
  deleteRole(id: number): Observable<{ message: string; id: number }> {
    return this.http.delete<{ message: string; id: number }>(`${this.base}/roles/${id}`);
  }
  resources(): Observable<AdminResource[]> {
    return this.http.get<{ resources: AdminResource[] }>(`${this.base}/recursos`).pipe(map((r) => r.resources));
  }
  createResource(payload: AdminResourcePayload): Observable<AdminResource> {
    return this.http.post<{ resource: AdminResource }>(`${this.base}/recursos`, payload)
      .pipe(map((r) => r.resource));
  }
  updateResource(id: number, payload: Partial<AdminResourcePayload>): Observable<AdminResource> {
    return this.http.patch<{ resource: AdminResource }>(`${this.base}/recursos/${id}`, payload)
      .pipe(map((r) => r.resource));
  }
  deactivateResource(id: number): Observable<AdminResource> {
    return this.http.patch<{ message: string; resource: AdminResource }>(
      `${this.base}/recursos/${id}/deactivate`, {},
    ).pipe(map((r) => r.resource));
  }
  deleteResource(id: number): Observable<{ message: string; id: number }> {
    return this.http.delete<{ message: string; id: number }>(`${this.base}/recursos/${id}`);
  }
  grants(filters: { role_id?: number; resource_id?: number } = {}): Observable<RoleGrant[]> {
    let params = new HttpParams();
    if (filters.role_id !== undefined) params = params.set('role_id', filters.role_id);
    if (filters.resource_id !== undefined) params = params.set('resource_id', filters.resource_id);
    return this.http.get<{ grants: RoleGrant[] }>(`${this.base}/concesiones-rol`, { params })
      .pipe(map((r) => r.grants));
  }
  createGrant(role_id: number, resource_id: number): Observable<RoleGrant> {
    return this.http.post<{ message: string; grant: RoleGrant }>(`${this.base}/concesiones-rol`, {
      role_id, resource_id,
    }).pipe(map((r) => r.grant));
  }
  deactivateGrant(id: number): Observable<RoleGrant> {
    return this.http.patch<{ message: string; grant: RoleGrant }>(
      `${this.base}/concesiones-rol/${id}/deactivate`, {},
    ).pipe(map((r) => r.grant));
  }
  reactivateGrant(id: number): Observable<RoleGrant> {
    return this.http.patch<{ message: string; grant: RoleGrant }>(
      `${this.base}/concesiones-rol/${id}/reactivate`, {},
    ).pipe(map((r) => r.grant));
  }
}
EOF
```

Estas operaciones siguen las envolturas reales de los controladores: `{ user }`, `{ role }` y `{ resource }`; los borrados físicos responden `200 { message, id }`, no `204`. El backend expone los cambios de contraseña con `current_password` y `new_password`; no lo incluyas en el formulario de alta ni lo persistas en Signals después de enviar el alta.

### 10.2 Plantillas de usuarios, roles y recursos

Sustituye los HTML generados por tablas y formularios conectados a los payloads tipados del `AdminApi`:

```bash
cat > src/app/features/admin/users/user-list/user-list.html <<'EOF'
<section class="space-y-4">
  <app-page-header title="Usuarios" subtitle="Gestiona usuarios y su role_id asignado.">
    <button pButton type="button" (click)="openCreate()">Nuevo usuario</button>
  </app-page-header>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <p-table [value]="rows()" [loading]="loading()" dataKey="id">
    <ng-template #header><tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></ng-template>
    <ng-template #body let-row><tr>
      <td>{{ row.username }}</td><td>{{ row.email || '—' }}</td>
      <td>{{ roleName()(row.role_id) }}</td><td>{{ row.status }}</td>
      <td class="flex gap-2">
        <button pButton type="button" text (click)="openEdit(row)" [attr.aria-label]="'Editar ' + row.username">Editar</button>
        <button pButton type="button" severity="secondary" (click)="deactivate(row)">Desactivar</button>
        <button pButton type="button" severity="danger" (click)="remove(row)">Eliminar</button>
      </td>
    </tr></ng-template>
    <ng-template #emptymessage><tr><td colspan="5">No hay usuarios.</td></tr></ng-template>
  </p-table>
  <p-dialog [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
    [header]="editing() ? 'Editar usuario' : 'Nuevo usuario'" [modal]="true">
    <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
      <div><label for="user-name">Usuario *</label>
        <input id="user-name" pInputText formControlName="username" class="w-full" /></div>
      <div><label for="user-email">Correo</label>
        <input id="user-email" pInputText type="email" formControlName="email" class="w-full" /></div>
      <div><label for="user-role">Rol *</label>
        <p-select inputId="user-role" [options]="roles()" optionLabel="name" optionValue="id"
          formControlName="role_id" [filter]="true" [fluid]="true" /></div>
      @if (!editing()) {
        <div><label for="user-password">Contraseña inicial *</label>
          <input id="user-password" pInputText type="password" formControlName="password"
            autocomplete="new-password" class="w-full" /></div>
      }
      @if (formError()) { <p-message severity="error">{{ formError() }}</p-message> }
      <button pButton type="submit" [loading]="saving()">Guardar usuario</button>
    </form>
  </p-dialog>
</section>
EOF

cat > src/app/features/admin/roles/role-list/role-list.html <<'EOF'
<section class="space-y-4">
  <app-page-header title="Roles" subtitle="Administra los perfiles de autorización PedalLibre.">
    <button pButton type="button" (click)="openCreate()">Nuevo rol</button>
  </app-page-header>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <p-table [value]="rows()" [loading]="loading()" dataKey="id">
    <ng-template #header><tr><th>Nombre</th><th>Descripción</th><th>Estado</th><th>Acciones</th></tr></ng-template>
    <ng-template #body let-row><tr>
      <td>{{ row.name }}</td><td>{{ row.description }}</td><td>{{ row.status }}</td>
      <td class="flex gap-2">
        <button pButton type="button" text (click)="openEdit(row)">Editar</button>
        <button pButton type="button" severity="secondary" (click)="deactivate(row)">Desactivar</button>
        <button pButton type="button" severity="danger" (click)="remove(row)">Eliminar</button>
      </td>
    </tr></ng-template>
    <ng-template #emptymessage><tr><td colspan="4">No hay roles.</td></tr></ng-template>
  </p-table>
  <p-dialog [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
    [header]="editing() ? 'Editar rol' : 'Nuevo rol'" [modal]="true">
    <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
      <div><label for="role-name">Nombre *</label>
        <input id="role-name" pInputText formControlName="name" class="w-full" /></div>
      <div><label for="role-description">Descripción</label>
        <textarea id="role-description" pTextarea formControlName="description" rows="3" class="w-full"></textarea></div>
      @if (formError()) { <p-message severity="error">{{ formError() }}</p-message> }
      <button pButton type="submit" [loading]="saving()">Guardar rol</button>
    </form>
  </p-dialog>
</section>
EOF

cat > src/app/features/admin/resources/resource-list/resource-list.html <<'EOF'
<section class="space-y-4">
  <app-page-header title="Recursos API" subtitle="Administra el catálogo method + path usado por RBAC.">
    <button pButton type="button" (click)="openCreate()">Nuevo recurso</button>
  </app-page-header>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <p-table [value]="rows()" [loading]="loading()" dataKey="id">
    <ng-template #header><tr><th>Método</th><th>Ruta</th><th>Descripción</th><th>Estado</th><th>Acciones</th></tr></ng-template>
    <ng-template #body let-row><tr>
      <td>{{ row.method }}</td><td><code>{{ row.path }}</code></td>
      <td>{{ row.description || '—' }}</td><td>{{ row.status }}</td>
      <td class="flex gap-2">
        <button pButton type="button" text (click)="openEdit(row)">Editar</button>
        <button pButton type="button" severity="secondary" (click)="deactivate(row)">Desactivar</button>
        <button pButton type="button" severity="danger" (click)="remove(row)">Eliminar</button>
      </td>
    </tr></ng-template>
    <ng-template #emptymessage><tr><td colspan="5">No hay recursos.</td></tr></ng-template>
  </p-table>
  <p-dialog [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
    [header]="editing() ? 'Editar recurso' : 'Nuevo recurso'" [modal]="true">
    <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
      <div><label for="resource-method">Método *</label>
        <p-select inputId="resource-method" [options]="methods" formControlName="method"
          optionLabel="label" optionValue="value" [fluid]="true" /></div>
      <div><label for="resource-path">Ruta *</label>
        <input id="resource-path" pInputText formControlName="path" class="w-full" /></div>
      <div><label for="resource-description">Descripción</label>
        <input id="resource-description" pInputText formControlName="description" class="w-full" /></div>
      @if (formError()) { <p-message severity="error">{{ formError() }}</p-message> }
      <button pButton type="submit" [loading]="saving()">Guardar recurso</button>
    </form>
  </p-dialog>
</section>
EOF
```

Los componentes importan `ReactiveFormsModule`, `TableModule`, `DialogModule`, `SelectModule`, `ButtonModule`, `InputTextModule`, `TextareaModule`, `MessageModule` y `PageHeader` según cada plantilla. `methods` contiene únicamente `GET`, `POST`, `PUT`, `PATCH` y `DELETE`. Al crear usuario, borra inmediatamente el valor del control de contraseña tras la respuesta y no lo incluyas en el estado del usuario ni en notificaciones. Confirma la desactivación/eliminación y conserva errores `409`/`403`.

### 10.3 Formulario de concesión con plantilla reemplazable

El diálogo de concesión debe guardar IDs y mostrar el método/ruta como etiqueta. Sustituye la plantilla generada:

```bash
cat > src/app/features/admin/resource-roles/resource-role-list/resource-role-list.html <<'EOF'
<section class="space-y-4">
  <app-page-header title="Concesiones de permisos" subtitle="Relaciona roles con recursos de la API." />
  <div class="flex flex-wrap gap-3">
    <p-select [options]="roles()" optionLabel="name" optionValue="id"
      [ngModel]="roleFilter()" (ngModelChange)="roleFilter.set($event)"
      placeholder="Todos los roles" [showClear]="true" />
    <button pButton type="button" (click)="openGrant()">
      <i pButtonIcon class="pi pi-plus"></i><span pButtonLabel>Conceder recurso</span>
    </button>
  </div>
  @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
  <p-table [value]="rows()" [loading]="loading()" dataKey="id">
    <ng-template #header><tr><th>Rol</th><th>Método</th><th>Ruta</th><th>Estado</th><th></th></tr></ng-template>
    <ng-template #body let-row>
      <tr>
        <td>{{ row.role?.name || row.role_id }}</td><td><p-tag [value]="row.resource?.method || '—'" /></td>
        <td><code>{{ row.resource?.path || row.resource_id }}</code></td><td>{{ row.status }}</td>
        <td>
          <button pButton type="button" severity="danger" (click)="deactivate(row)">Retirar</button>
        </td>
      </tr>
    </ng-template>
    <ng-template #emptymessage><tr><td colspan="5">No hay concesiones.</td></tr></ng-template>
  </p-table>

  <p-dialog [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
    header="Conceder recurso a rol" [modal]="true" [style]="{ width: 'min(38rem, 95vw)' }">
    <form [formGroup]="form" (ngSubmit)="saveGrant()" class="space-y-4">
      <div><label for="grant-role">Rol *</label>
        <p-select inputId="grant-role" [options]="roles()" optionLabel="name" optionValue="id"
          formControlName="role_id" [filter]="true" /></div>
      <div><label for="grant-resource">Recurso *</label>
        <p-select inputId="grant-resource" [options]="resources()" optionLabel="label" optionValue="id"
          formControlName="resource_id" [filter]="true" /></div>
      @if (formError()) { <p-message severity="error">{{ formError() }}</p-message> }
      <button pButton type="submit" [loading]="saving()"><span pButtonLabel>Guardar concesión</span></button>
    </form>
  </p-dialog>
</section>
EOF
```

En `resource-role-list.ts`, deriva `label: \`${resource.method} ${resource.path}\`` solo para presentar opciones; envía `{ role_id: number, resource_id: number }`. El componente standalone importa `FormsModule`, `ReactiveFormsModule`, `TableModule`, `DialogModule`, `SelectModule`, `ButtonModule`, `TagModule`, `MessageModule` y `PageHeader`. La lista GET devuelve concesiones activas; al volver a conceder una pareja inactiva el POST la reactiva, mientras que una pareja ya activa devuelve `409`. Deja el diálogo abierto y notifica el error. La concesión nueva/reactivada devuelve `201 { message, grant }`; no asumas `200`. Usa `PATCH /concesiones-rol/:id/reactivate` solo desde una vista que tenga el ID de una concesión inactiva.

### 10.4 Integrar las rutas y el menú

Añade dentro de los `children` existentes en `src/app/app.routes.ts`; cada ruta debe usar `authGuard` y `permissionGuard`:

```ts
{
  path: 'admin/users',
  canActivate: [authGuard, permissionGuard],
  data: { permission: 'GET /api/usuarios' },
  loadComponent: () =>
    import('./features/admin/users/user-list/user-list').then((module) => module.UserList),
},
{
  path: 'admin/roles',
  canActivate: [authGuard, permissionGuard],
  data: { permission: 'GET /api/roles' },
  loadComponent: () =>
    import('./features/admin/roles/role-list/role-list').then((module) => module.RoleList),
},
{
  path: 'admin/resources',
  canActivate: [authGuard, permissionGuard],
  data: { permission: 'GET /api/recursos' },
  loadComponent: () =>
    import('./features/admin/resources/resource-list/resource-list').then((module) => module.ResourceList),
},
{
  path: 'admin/grants',
  canActivate: [authGuard, permissionGuard],
  data: { permission: 'GET /api/concesiones-rol' },
  loadComponent: () =>
    import('./features/admin/resource-roles/resource-role-list/resource-role-list')
      .then((module) => module.ResourceRoleList),
},
```

Usa rutas UI en inglés o español de forma consistente, pero conserva los endpoints HTTP exactos en español. En `nav.config.ts`, agrega `Usuarios`, `Roles`, `Recursos` y `Concesiones` con sus permisos GET. No agregues `Asignaciones` ni `/api/asignaciones-rol`: esa entidad no existe en este esquema.

### 10.5 Pruebas y ejecución

```bash
npm run ng -- test --watch=false --include='src/app/features/admin/**/*.spec.ts'
npm test -- --watch=false
npm run build
npm start
```

En `admin-api.spec.ts`, verifica URL de colección y objeto de respuesta específico; prueba que los filtros sean query params numéricos y que reactivar use `PATCH /concesiones-rol/:id/reactivate`. En navegador, `/admin/users`, `/admin/roles`, `/admin/resources` y `/admin/grants` deben abrir dentro del Shell cuando el permiso esté concedido; con un usuario sin permiso, la guard redirige y la API debe responder `403` si se invoca directamente.

Para conceder un permiso:

1. Comprueba que existe el recurso exacto `method/path`.
2. Crea/reactiva la concesión rol-recurso.
3. Vuelve a cargar los permisos efectivos del usuario de prueba.
4. Comprueba el menú/acción bajo ISS-09.

## Criterios de aceptación

- [ ] Administra usuarios respetando los campos de los DTO y sin exponer `password_hash`.
- [ ] La relación de usuario a rol usa `role_id`; no se implementa una pantalla `role_users`.
- [ ] Roles y recursos usan campos y envolturas propias de sus controladores.
- [ ] Concesiones filtran y escriben usando `role_id/resource_id`; reactivar y revocar usan sus rutas explícitas.
- [ ] Un permiso agregado/revocado cambia `GET /api/permisos` al sincronizar sesión.
- [ ] Rutas admin están protegidas por los permisos `GET /api/usuarios`, `/api/roles`, `/api/recursos` y `/api/concesiones-rol`.
- [ ] Pruebas HTTP verifican query params, payloads, respuestas, conflictos y errores 401/403.
- [ ] Build y suite unitaria pasan; se registra evidencia en una instancia PedalLibre y con usuario/rol de prueba.

No copies IDs de recursos ni supongas número fijo de permisos; se obtienen del entorno activo. No publiques credenciales ni tokens en capturas.

**Siguiente:** ISS-11 hace verificación reproducible, accesibilidad y publicación.  
**Ruta de lectura:** ← ISS-09 · ↑ [índice de guías](./README.md) · → ISS-11
