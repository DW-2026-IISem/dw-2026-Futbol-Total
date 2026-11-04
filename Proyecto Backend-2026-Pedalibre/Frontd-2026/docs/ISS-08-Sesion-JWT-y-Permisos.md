# Fase II: Frontend — ISS-08: Sesión JWT y permisos efectivos

**Estado:** preparado; el frontend inspeccionado todavía no implementa login ni sesión.  
**Proyecto:** PedalLibre, `Frontd-2026`  
**Depende de:** ISS-07 — cierre de la Fase I  
**Habilita:** ISS-09 — guards y RBAC visual  
**Revisión del contrato:** 3-nov-2026

> La autenticación PedalLibre no usa las rutas, roles ni nombres del sistema de referencia. El contrato de abajo se verificó en el backend PedalLibre.

## Contrato de sesión

| Método | Endpoint | Acceso | Respuesta |
|---|---|---|---|
| `POST` | `/api/sesion/login` | público | Tokens directamente en el JSON |
| `POST` | `/api/sesion/refresh` | público, refresh en el cuerpo | Par de tokens rotado |
| `POST` | `/api/sesion/logout` | público, refresh en el cuerpo | `{ message }` |
| `GET` | `/api/sesion/perfil` | JWT | `{ user }` |
| `GET` | `/api/permisos` | JWT | `{ permissions }` |

Login recibe `{ "identifier": "usuario o correo", "password": "..." }`. La respuesta de login/refresh incluye `access_token`, `token_type`, `expires_in`, `refresh_token` y `refresh_expires_in`; no incluye perfil ni permisos. Después de guardar tokens, carga perfil y permisos efectivos en paralelo. El permiso representa `resource_id`, `method`, `path`, descripción y datos del rol asignado.

El token de acceso es Bearer. El refresh es opaco, se envía en el cuerpo y se rota. Evita múltiples refresh concurrentes mediante un único observable compartido; si un refresh falla, limpia sesión y deriva al login. Login/refresh/logout no deben iniciar una recursión de interceptor.

## Trabajo de frontend

Crear modelos `AuthTokens`, `UserProfile` y `EffectivePermission` según las respuestas reales; no modeles el login como `{ user, roles, resources }`. Implementa:

- `AuthApi`/`AuthService`: login, perfil, permisos, refresh y logout.
- `SessionStore`: signals de solo lectura para token, usuario y permisos; `computed()` para `isAuthenticated` y permiso normalizado.
- Interceptor funcional: añade `Authorization: Bearer ...` a llamadas protegidas y maneja un solo refresh por oleada concurrente de `401`.
- Pantallas de login y perfil, y cierre de sesión desde el Shell existente.
- Validación de `returnUrl`: ruta interna únicamente; rechaza URLs externas y `/login` como destino.

Mantén `apiUrl` configurada en los environments de PedalLibre (`http://localhost:3002/api` en este workspace) y `requireAuth: true`. No dupliques `provideHttpClient`; registra `withInterceptors()` en `app.config.ts` siguiendo el orden elegido y probado.

La persistencia del token en `localStorage` facilita el laboratorio pero aumenta el impacto de XSS. No se debe registrar token en consola, capturas, documentación ni commits. No pegues secretos ni credenciales reales en archivos.

### 8.1 Crear los tipos y servicios

Ejecuta desde `Frontd-2026`:

```bash
mkdir -p src/app/core/models src/app/core/services src/app/core/interceptors
cat > src/app/core/models/auth.model.ts <<'EOF'
export interface SessionTokens {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
}

export interface SessionUser {
  id: number;
  role_id: number;
  username: string;
  email: string | null;
  status: 'active' | 'inactive';
}

export interface EffectivePermission {
  resource_id: number;
  method: string;
  path: string;
  description: string | null;
  role_id: number;
  role_name: string;
}

export interface SessionAccess {
  user: SessionUser;
  permissions: EffectivePermission[];
}
EOF

cat > src/app/core/services/session-store.ts <<'EOF'
import { computed, Injectable, signal } from '@angular/core';
import { EffectivePermission, SessionTokens, SessionUser } from '../models/auth.model';

const KEY = 'pedalibre.session.v1';
interface StoredSession {
  tokens: SessionTokens;
  user: SessionUser;
  permissions: EffectivePermission[];
}

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly state = signal<StoredSession | null>(this.restore());
  readonly tokens = computed(() => this.state()?.tokens ?? null);
  readonly accessToken = computed(() => this.state()?.tokens.access_token ?? null);
  readonly refreshToken = computed(() => this.state()?.tokens.refresh_token ?? null);
  readonly user = computed(() => this.state()?.user ?? null);
  readonly permissions = computed(() => this.state()?.permissions ?? []);
  readonly isAuthenticated = computed(() => this.accessToken() !== null);

  setTokens(tokens: SessionTokens): void {
    const current = this.state();
    if (current) this.set({ ...current, tokens });
    else this.pendingTokens = tokens;
  }

  setAccess(user: SessionUser, permissions: EffectivePermission[]): void {
    const tokens = this.state()?.tokens ?? this.pendingTokens;
    if (!tokens) throw new Error('Cannot store session access before receiving tokens');
    this.pendingTokens = null;
    this.set({ tokens, user, permissions });
  }

  canPermission(permission: string): boolean {
    const separator = permission.indexOf(' ');
    if (separator <= 0) return false;
    const method = permission.slice(0, separator).toUpperCase();
    const path = permission.slice(separator + 1).split('?')[0];
    return this.permissions().some((item) =>
      item.method.toUpperCase() === method && matchesPath(item.path, path),
    );
  }

  clear(): void {
    this.pendingTokens = null;
    this.state.set(null);
    try {
      localStorage.removeItem(KEY);
    } catch (error) {
      console.error('Could not clear the PedalLibre session storage', error);
    }
  }

  private pendingTokens: SessionTokens | null = null;

  private set(value: StoredSession): void {
    this.state.set(value);
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
    } catch (error) {
      console.error('Could not persist the PedalLibre session', error);
    }
  }

  private restore(): StoredSession | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const value: unknown = JSON.parse(raw);
      if (!isStoredSession(value)) {
        localStorage.removeItem(KEY);
        return null;
      }
      return value;
    } catch (error) {
      console.error('Could not restore the PedalLibre session', error);
      return null;
    }
  }
}

function isStoredSession(value: unknown): value is StoredSession {
  if (typeof value !== 'object' || value === null) return false;
  const session = value as Partial<StoredSession>;
  return typeof session.tokens?.access_token === 'string'
    && typeof session.tokens.refresh_token === 'string'
    && typeof session.user?.id === 'number'
    && Array.isArray(session.permissions);
}

function matchesPath(pattern: string, path: string): boolean {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = escaped.replace(/\\:[^/]+/g, '[^/]+');
  return new RegExp(`^${expression}/?$`).test(path);
}
EOF

cat > src/app/core/services/auth-api.ts <<'EOF'
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EffectivePermission, SessionAccess, SessionTokens, SessionUser } from '../models/auth.model';
import { SessionStore } from './session-store';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionStore);
  private readonly base = `${environment.apiUrl}/sesion`;

  login(identifier: string, password: string): Observable<SessionAccess> {
    return this.http.post<SessionTokens>(`${this.base}/login`, { identifier, password }).pipe(
      tap((tokens) => this.session.setTokens(tokens)),
      switchMap(() => this.loadAccess()),
      catchError((error: unknown) => {
        this.session.clear();
        return throwError(() => error);
      }),
    );
  }

  loadAccess(): Observable<SessionAccess> {
    return forkJoin({
      profile: this.http.get<{ user: SessionUser }>(`${this.base}/perfil`),
      permissionResult: this.http.get<{ permissions: EffectivePermission[] }>(
        `${environment.apiUrl}/permisos`,
      ),
    }).pipe(
      map(({ profile, permissionResult }) => ({
        user: profile.user,
        permissions: permissionResult.permissions,
      })),
      tap(({ user, permissions }) => this.session.setAccess(user, permissions)),
    );
  }

  refresh(): Observable<SessionTokens> {
    const refresh_token = this.session.refreshToken();
    if (!refresh_token) return throwError(() => new Error('Refresh token is unavailable'));
    return this.http.post<SessionTokens>(`${this.base}/refresh`, { refresh_token })
      .pipe(tap((tokens) => this.session.setTokens(tokens)));
  }

  logout(): Observable<void> {
    const refresh_token = this.session.refreshToken();
    if (!refresh_token) {
      this.session.clear();
      return of(void 0);
    }
    return this.http.post<{ message: string }>(`${this.base}/logout`, { refresh_token }).pipe(
      map(() => void 0),
      catchError((error: unknown) => {
        this.session.clear();
        return throwError(() => error);
      }),
      tap(() => this.session.clear()),
    );
  }
}
EOF
```

### 8.2 Registrar el interceptor funcional

Escribe el interceptor funcional en el archivo usado por `app.config.ts`. No generes además otro interceptor con el mismo propósito:

```bash
cat > src/app/core/interceptors/auth-interceptor.ts <<'EOF'
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionTokens } from '../models/auth.model';
import { AuthApi } from '../services/auth-api';
import { SessionStore } from '../services/session-store';

let refreshInFlight: Observable<SessionTokens> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionStore);
  const auth = inject(AuthApi);
  const router = inject(Router);
  const isSessionEndpoint = /\/sesion\/(login|refresh|logout)$/.test(new URL(req.url, location.origin).pathname);
  const token = session.accessToken();
  const request = token && !isSessionEndpoint
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(catchError((error: unknown) => {
    if (!(error instanceof HttpErrorResponse) || error.status !== 401
      || isSessionEndpoint || !environment.requireAuth) {
      return throwError(() => error);
    }
    if (!session.refreshToken()) {
      session.clear();
      void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      return throwError(() => error);
    }
    refreshInFlight ??= auth.refresh().pipe(
      catchError((refreshError: unknown) => {
        session.clear();
        void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
        return throwError(() => refreshError);
      }),
      finalize(() => { refreshInFlight = null; }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return refreshInFlight.pipe(switchMap(() => {
      const renewed = session.accessToken();
      if (!renewed) return throwError(() => error);
      return next(req.clone({ setHeaders: { Authorization: `Bearer ${renewed}` } }));
    }));
  }));
};
EOF
```

En `auth-api.ts`, el logout no debe ocultar un error de revocación como éxito: si producto quiere permitir salida offline, notifica ese error explícitamente y limpia estado local en `finalize()`. Mantén esa decisión coherente con la UX y sus pruebas. Si el proyecto ejecuta SSR, evita usar `location` directo y sustituye la detección del endpoint por una comparación de URL relativa al `environment.apiUrl`.

Añade una sola vez a `src/app/app.config.ts`:

```ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth-interceptor';

// Dentro del array providers existente:
provideHttpClient(withInterceptors([authInterceptor])),
```

No dupliques `provideHttpClient()` que haya registrado ISS-02. Si existe un interceptor de errores, conserva el orden documentado y prueba el orden final.

### 8.3 Crear login y conectar el Shell

```bash
ng generate component features/auth/login --standalone
ng generate component features/auth/profile --standalone
cat > src/app/features/auth/login/login.html <<'EOF'
<main class="mx-auto mt-12 w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
  <h1 class="text-2xl font-semibold">Iniciar sesión en PedalLibre</h1>
  <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-4">
    <div><label for="login-identifier">Usuario o correo</label>
      <input id="login-identifier" pInputText formControlName="identifier" autocomplete="username" class="w-full" /></div>
    <div><label for="login-password">Contraseña</label>
      <input id="login-password" pInputText type="password" formControlName="password" autocomplete="current-password" class="w-full" /></div>
    @if (error()) { <p-message severity="error">{{ error() }}</p-message> }
    <button pButton type="submit" [loading]="loading()" class="w-full"><span pButtonLabel>Entrar</span></button>
  </form>
</main>
EOF
```

El `Login` component debe importar `ReactiveFormsModule`, `InputTextModule`, `ButtonModule`, `MessageModule`; validar ambos campos y llamar `AuthApi.login()`. Después del éxito, navega al `returnUrl` solo si empieza por `/` y no empieza por `//` ni `/login`; en otro caso usa `/`. El perfil debe mostrar `username`, `email`, `role_id` y los permisos efectivos devueltos; no intentes leer perfil dentro de la respuesta de login.

Integra `login` como ruta pública y conserva el Shell actual en `src/app/app.routes.ts`. Añade el perfil como ruta dentro de `children` solo después de ISS-09/guardas o protégela temporalmente en el componente. Conecta el botón de sesión del Header para emitir un evento; el Shell llama `AuthApi.logout()` y luego navega a `/login`. No reescribas Header/Aside con layout duplicado.

### 8.4 Pruebas que se deben crear y ejecutar

```bash
ng generate service core/services/auth-api --skip-tests=false
```

Si el generador indica que el servicio ya existe, no sobrescribas el servicio escrito arriba; crea `auth-api.spec.ts` junto a él. Configura `provideHttpClient()` antes de `provideHttpClientTesting()`. Asegura pruebas para:

- login → POST `/sesion/login`, luego GET `/sesion/perfil` y GET `/permisos`;
- respuesta login sin perfil y desenvuelto de `{ user }`/`{ permissions }`;
- error al cargar perfil/permisos limpia la sesión;
- refresh manda `{ refresh_token }` y actualiza tokens;
- dos llamadas protegidas concurrentes con 401 generan un solo refresh;
- auth endpoints no incluyen Bearer ni provocan refresh;
- returnUrl externo rechazado y logout limpia storage.

```bash
npm run ng -- test --watch=false --include='src/app/core/services/auth-api.spec.ts'
npm run ng -- test --watch=false --include='src/app/core/interceptors/auth-interceptor.spec.ts'
npm run ng -- test --watch=false --include='src/app/features/auth/**/*.spec.ts'
npm test -- --watch=false
npm run build
```

Tras configurar usuario de prueba de PedalLibre, integra con la API local real: login en navegador, verifica los cinco endpoints en Network y cierra sesión. No imprimas ni guardes tokens en la captura. La API puede estar en el puerto `.env`; valida que coincida con `environment.apiUrl`.

## Criterios de aceptación

- [ ] Login manda `identifier/password`, recibe solo tokens, y después carga `{ user }` y `{ permissions }`.
- [ ] Si la carga del perfil o permisos falla, la sesión parcial se limpia y se muestra el error real.
- [ ] Refresh manda `{ refresh_token }`, actualiza ambos tokens y comparte una petición en vuelo.
- [ ] Logout intenta revocar el refresh y siempre limpia estado local, incluso si la API no está disponible.
- [ ] Llamadas protegidas incluyen Bearer; los endpoints públicos de sesión no se refrescan recursivamente.
- [ ] Una petición con `401` y refresh válido se reintenta una sola vez; refresh inválido termina en login.
- [ ] `/login` admite `returnUrl` interno seguro. Perfil muestra usuario y permisos reportados, no permisos inventados.
- [ ] Pruebas cubren éxito/error de login, persistencia/restauración, refresh concurrente, logout y encabezados.
- [ ] `npm test -- --watch=false` y `npm run build` pasan.

## Comprobación integrada

Con backend levantado en su puerto configurado y un usuario PedalLibre válido:

1. Login desde la pantalla.
2. DevTools → Network: verifica login, perfil y permisos; revisa que los tokens no aparezcan en URL.
3. DevTools → Application: confirma el almacenamiento elegido sin copiar valores a la evidencia.
4. Fuerza expiración solo en un entorno de prueba y comprueba un refresh compartido y el reintento.
5. Cierra sesión y confirma que las señales y almacenamiento locales se limpian.

No reutilices contraseñas de un ejemplo ajeno. Las pruebas unitarias deben usar valores ficticios y `HttpTestingController`.

**Siguiente:** ISS-09 protege rutas y acciones según permisos.  
**Ruta de lectura:** ← ISS-07 · ↑ [índice de guías](./README.md) · → ISS-09
