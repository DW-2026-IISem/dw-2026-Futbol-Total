# Fase II: Frontend — ISS-09: Guards y RBAC en la interfaz

**Estado:** implementado: guards, control de acciones y navegación filtrada con permisos efectivos; cubierto por pruebas. La autorización del backend sigue siendo la autoridad y requiere validación integrada.  
**Proyecto:** PedalLibre, `Frontd-2026`  
**Depende de:** ISS-08 — Sesión JWT y permisos efectivos  
**Habilita:** ISS-10 — Administración de usuarios y RBAC  
**Revisión del contrato:** 3-nov-2026

## Objetivo

Usar los permisos efectivos que devuelve `GET /api/permisos` para controlar la navegación y las acciones disponibles. La UI es una ayuda de experiencia; Express sigue siendo la autoridad y valida cada llamada con `authenticate` y `authorize`.

PedalLibre define los roles `ADMIN`, `OPERACIONES`, `MANTENIMIENTO`, `SOPORTE` y `CLIENTE`. No hardcodees pantallas por nombre de rol ni supongas cantidades de permisos: la condición de cliente es el par `method + path` de los permisos efectivos actuales.

## Implementación

Genera guards funcionales y una directiva standalone, o integra la solución equivalente siguiendo las convenciones del proyecto:

```bash
ng generate guard core/guards/auth --functional --implements=CanActivate
ng generate guard core/guards/permission --functional --implements=CanActivate
ng generate guard core/guards/guest --functional --implements=CanActivate
ng generate directive shared/directives/has-permission
```

Responsabilidades:

- `authGuard`: sin sesión redirige a `/login` y conserva `returnUrl`.
- `guestGuard`: evita que una sesión activa entre de nuevo a login.
- `permissionGuard`: lee `data.permission` y redirige a `/forbidden` cuando falta.
- `appHasPermission`: muestra/oculta acciones según `SessionStore`; no sustituye al servidor.
- `nav.config.ts` + `computed()` del Shell: filtra las entradas usando `canPermission()`. El Aside presenta los enlaces; no vuelve a implementar RBAC.

Las rutas deben usar las operaciones reales de PedalLibre. Ejemplos:

```ts
{
  path: 'stations',
  canActivate: [authGuard, permissionGuard],
  data: { permission: 'GET /api/stations' },
  loadComponent: () =>
    import('./features/stations/station-list/station-list').then((m) => m.StationList),
}
```

El botón de anclaje requiere `POST /api/bicycle-dockings/dock`; desanclar requiere `PATCH /api/bicycle-dockings/:id/undock`. Para comenzar/finalizar alquiler se comprueba `POST /api/rentals/start` y `/api/rentals/finish`. No uses permisos de `products`, `sales`, ni endpoints genéricos que el backend PedalLibre no tenga.

El catálogo RBAC está sembrado por el backend y los permisos dependen del usuario/rol activo en la base. No documentes una matriz estática por usuario como evidencia. La lista de permisos puede cambiar después de volver a consultar `/api/permisos`.

### 9.1 Crear los guards y la directiva

```bash
mkdir -p src/app/core/guards src/app/shared/directives
cat > src/app/core/guards/auth-guard.ts <<'EOF'
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../services/session-store';

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionStore);
  const router = inject(Router);
  return session.isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
EOF

cat > src/app/core/guards/guest-guard.ts <<'EOF'
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../services/session-store';

export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  return session.isAuthenticated() ? inject(Router).createUrlTree(['/']) : true;
};
EOF

cat > src/app/core/guards/permission-guard.ts <<'EOF'
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../services/session-store';

export const permissionGuard: CanActivateFn = (route) => {
  const session = inject(SessionStore);
  const router = inject(Router);
  const permission = route.data['permission'];
  if (typeof permission !== 'string' || session.canPermission(permission)) return true;
  return router.createUrlTree(['/forbidden'], { queryParams: { permission } });
};
EOF

cat > src/app/shared/directives/has-permission.ts <<'EOF'
import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { SessionStore } from '../../core/services/session-store';

@Directive({ selector: '[appHasPermission]', standalone: true })
export class HasPermission {
  readonly appHasPermission = input.required<string>();
  private readonly session = inject(SessionStore);
  private readonly template = inject(TemplateRef<unknown>);
  private readonly view = inject(ViewContainerRef);
  private visible = false;

  constructor() {
    effect(() => {
      const allowed = this.session.canPermission(this.appHasPermission());
      if (allowed === this.visible) return;
      this.visible = allowed;
      this.view.clear();
      if (allowed) this.view.createEmbeddedView(this.template);
    });
  }
}
EOF
```

La directiva requiere que `SessionStore.permissions()` sea signal (como quedó en ISS-08), de modo que la lectura dentro de `effect()` vuelva a evaluarse al sincronizar permisos.

### 9.2 Integrar permisos en rutas y plantillas

Edita `src/app/app.routes.ts`: importa los guards y añade `canActivate/data` a rutas bajo el Shell. Ejemplos con endpoint real:

```ts
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { permissionGuard } from './core/guards/permission-guard';

// Ruta pública de login:
{
  path: 'login',
  canActivate: [guestGuard],
  loadComponent: () => import('./features/auth/login/login').then((module) => module.Login),
},

// Rutas hijas del Shell:
{
  path: 'bicycles',
  canActivate: [authGuard, permissionGuard],
  data: { permission: 'GET /api/bicycles' },
  loadComponent: () =>
    import('./features/bicycles/bicycle-list/bicycle-list').then((module) => module.BicycleList),
},
{
  path: 'reservations',
  canActivate: [authGuard, permissionGuard],
  data: { permission: 'GET /api/reservations' },
  loadComponent: () =>
    import('./features/reservations/reservation-list/reservation-list')
      .then((module) => module.ReservationList),
},
```

Aplica la misma pareja a `GET /api/stations`, `/api/docking-points`, `/api/rates`, `/api/rentals`, `/api/rental-events`, `/api/maintenances`, `/api/penalties` y `/api/payments`. En rutas de acción usa el permiso exacto del request: `POST /api/bicycle-dockings/dock`, `PATCH /api/bicycle-dockings/:id/undock`, `POST /api/rentals/start` y `POST /api/rentals/finish`.

En cada lista, importa `HasPermission` y envuelve solo la acción que corresponde:

```html
<ng-container *appHasPermission="'POST /api/stations'">
  <button pButton type="button" (click)="openCreate()">
    <span pButtonLabel>Nueva estación</span>
  </button>
</ng-container>
<ng-container *appHasPermission="'PATCH /api/stations/:id'">
  <button pButton type="button" (click)="openEdit(row)">Editar</button>
</ng-container>
```

El `:id` aquí es el patrón del catálogo, no el valor concreto; `SessionStore.canPermission()` compara segmento dinámico. No encierres el componente entero con un permiso de escritura si la lectura GET está autorizada.

### 9.3 Menú calculado e integración funcional

En `src/app/layout/shell/nav.config.ts`, crea una lista estática de enlaces de PedalLibre (no la pegues desde el proyecto de referencia):

```ts
import { MenuItem } from 'primeng/api';

export const NAV: Array<MenuItem & { permission: string }> = [
  { label: 'Inicio', icon: 'pi pi-home', routerLink: '/', permission: 'GET /api/sesion/perfil' },
  { label: 'Clientes', icon: 'pi pi-users', routerLink: '/clients', permission: 'GET /api/clientes' },
  { label: 'Estaciones', icon: 'pi pi-map-marker', routerLink: '/stations', permission: 'GET /api/stations' },
  { label: 'Puntos de anclaje', icon: 'pi pi-th-large', routerLink: '/docking-points', permission: 'GET /api/docking-points' },
  { label: 'Bicicletas', icon: 'pi pi-directions', routerLink: '/bicycles', permission: 'GET /api/bicycles' },
  { label: 'Tarifas', icon: 'pi pi-dollar', routerLink: '/rates', permission: 'GET /api/rates' },
  { label: 'Reservas', icon: 'pi pi-calendar', routerLink: '/reservations', permission: 'GET /api/reservations' },
  { label: 'Alquileres', icon: 'pi pi-refresh', routerLink: '/rentals', permission: 'GET /api/rentals' },
];
```

Antes de copiar esta lista, confirma que cada ruta ya existe en `app.routes.ts`; quita `Inicio` del filtrado por permiso si la portada debe ser pública. En `shell.ts`, integra una señal calculada:

```ts
readonly navItems = computed(() =>
  NAV.filter((item) => this.session.canPermission(item.permission)),
);
```

Pasa `navItems()` al Aside como input; el Aside solo itera y dibuja `routerLink`. Para integrar sin reemplazar la plantilla existente, cambia los `<a>` fijos por un `@for (item of items(); track item.routerLink)` dentro del `<nav>`, y conserva `(click)="navigate.emit()"`, atributos accesibles y clases responsive.

### 9.4 Pruebas y ejecución

Crea `rbac-guards.spec.ts` y `has-permission.spec.ts` junto a sus archivos. Prueba sesión ausente, sesión presente, permiso exacto, patrón `:id`, permiso faltante y que la vista embebida aparezca/desaparezca cuando cambian los permisos. Mockea `SessionStore`; no llames el backend desde estas pruebas.

```bash
npm run ng -- test --watch=false --include='src/app/core/guards/**/*.spec.ts'
npm run ng -- test --watch=false --include='src/app/shared/directives/**/*.spec.ts'
npm run ng -- test --watch=false --include='src/app/layout/shell/**/*.spec.ts'
npm test -- --watch=false
npm run build
```

Integración en navegador con dos usuarios PedalLibre de prueba: entra con cada uno, copia permisos desde `/api/permisos` (sin guardar token), abre una URL no permitida y confirma `/forbidden`; fuerza en Console una llamada a un recurso denegado y comprueba `403`. Si la UI oculta un botón pero Express responde `200` a un usuario sin permiso, revisa el middleware RBAC del backend; la directiva no es seguridad.

## Autorización y estados HTTP

- `401`: falta/expiró una sesión válida.
- `403`: la sesión se autenticó pero no tiene permiso, o una regla de alcance impide la operación.
- `404`: entidad/referencia inexistente o no visible por alcance.
- `409`: conflicto de negocio, por ejemplo disponibilidad o reserva.

La ruta `/forbidden` debe presentar el permiso faltante sin exponer tokens. Un usuario puede escribir la URL manualmente o alterar el DOM: la API tiene que seguir rechazando operaciones no autorizadas.

## Criterios y comprobación

- [ ] Sin sesión, rutas protegidas redirigen a login con destino interno.
- [ ] Con sesión, una ruta permitida abre y otra sin permiso muestra `/forbidden`.
- [ ] Acciones de anclaje, reservas, alquiler, mantenimiento y administración dependen de permisos exactos.
- [ ] El menú se recalcula al renovar permisos; el Shell permanece montado y no duplica navegación.
- [ ] Los tests cubren guardas, parámetros de ruta `:id`, directiva y filtrado del menú.
- [ ] Para un rol sin permiso, el backend devuelve `403` aunque se fuerce una llamada desde DevTools.
- [ ] `npm test -- --watch=false` y `npm run build` pasan.

Al probar `CLIENTE`, verifica que una reserva se limite al perfil de cliente vinculado por el backend. No uses un `client_id` enviado desde la UI como mecanismo de autorización.

**Siguiente:** ISS-10 administra usuarios, roles, recursos y concesiones según el modelo real.  
**Ruta de lectura:** ← ISS-08 · ↑ [índice de guías](./README.md) · → ISS-10
