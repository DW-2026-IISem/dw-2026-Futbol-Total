# 🛠 Unidad ISS-15 · Feature Session (login y perfil)

**Capa:** 🛠 CONSTRUIR

[🧠 Comprender este bloque](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-15-aprendizaje/) · [📝 Evaluación](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-15-aprendizaje/#evaluacion) · [✅ GATE de la unidad](https://tecnogua.com/academic/site/backend2026/manual/17-ISS-15-auth-session/#criterios-de-aceptacion-iss-15-consolidados)

| **Capa** | **Página** | **Para qué** |
| :--- | :--- | :--- |
| 🧠 **Aprender** | [Feature Session (login y perfil)](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-15-aprendizaje/) | comprender, explicar y relacionar |
| 🛠 **Construir** | esta página | ejecutar, programar y verificar |
| ✅ **GATE** | [Condiciones de cierre](https://tecnogua.com/academic/site/backend2026/manual/17-ISS-15-auth-session/#criterios-de-aceptacion-iss-15-consolidados) | condición para pasar al bloque siguiente |

**Esta es la guía ejecutable.** Sigue los pasos en orden. El cuerpo de abajo es el **ISS técnico verbatim**: comandos, rutas, versiones, PARCHEs, verificaciones y criterios, sin simplificar ni modernizar.

---

# Fase II: Auth con RBAC — ISS-15 — Feature Session (login, refresh, logout, perfil y permisos)

> **Contexto mínimo (autosuficiente).** Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que hay que saber antes de ejecutarlo.
>
> - **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript + Sequelize, **arquitectura por features**.
> - **Ya construido:** Fase I, [ISS-09 base](https://tecnogua.com/academic/site/backend2026/manual/11-ISS-09-auth-base/), [ISS-10 Users](https://tecnogua.com/academic/site/backend2026/manual/12-ISS-10-auth-users/), [ISS-11 Roles/Resources](https://tecnogua.com/academic/site/backend2026/manual/13-ISS-11-auth-roles-resources/), [ISS-12 pivotes](https://tecnogua.com/academic/site/backend2026/manual/14-ISS-12-auth-role-users-resource-roles/), [ISS-13 middlewares](https://tecnogua.com/academic/site/backend2026/manual/15-ISS-13-auth-access/) e [ISS-14 RefreshTokens](https://tecnogua.com/academic/site/backend2026/manual/16-ISS-14-auth-refresh-tokens/).
> - **Recorrido obligatorio de una petición:** `HTTP → Controller → Service → Repository → Model → Sequelize → BD`. Ninguna capa se salta a la siguiente.
> - **Diseño de datos (Fase II):** [`../bd-storelab.md`](https://tecnogua.com/academic/site/backend2026/bd-storelab/) §17 (ciclo de vida de la sesión) y §18 (tres formas de acceder a la BD).
> - **Capas, convenciones y reglas transversales:** [`00-contexto.md`](https://tecnogua.com/academic/site/backend2026/manual/00-contexto/).

| **Este ISS** | |
| :--- | :--- |
| **Título** | Feature Session (login, refresh, logout, perfil y permisos) |
| **Feature / tabla** | `features/auth/session/` · cruza `users` y `refresh_tokens` |
| **API** | `/api/sesion/*` y `/api/permisos` (**OPEN** y **JWT**) |
| **Depende de** | [ISS-14 — Feature RefreshTokens](https://tecnogua.com/academic/site/backend2026/manual/16-ISS-14-auth-refresh-tokens/) |
| **Habilita** | [Cierre de Fase II](https://tecnogua.com/academic/site/backend2026/manual/18-cierre-auth/) |

## Contenido de este ISS

- 20.1 DTOs del feature
- 20.2 Service (login, refresh, logout, perfil, permisos)
- 20.3 Controller
- 20.4 Rutas: las tres modalidades conviviendo en un archivo
- 20.5 Swagger
- 20.6 Pruebas HTTP
- 20.7 Verificación end-to-end de las tres modalidades

---

**Objetivo:** exponer el **punto de entrada** al sistema (login), la **renovación automática** (refresh con rotación), la **salida** (logout), el **perfil** del usuario y sus **permisos efectivos**. Es el feature que demuestra que las tres modalidades conviven sin fricción.

**Bloqueado por:** [ISS-14](https://tecnogua.com/academic/site/backend2026/manual/16-ISS-14-auth-refresh-tokens/).

### Criterios de aceptación (ISS-15) — consolidados

- [ ] **20.1** `session/dto/` (`login.dto.ts`, `refresh-session.dto.ts`, `logout-session.dto.ts`, `session-response.dto.ts`, `index.ts`)
- [ ] **20.2** `session.service.ts`: `login` (verifica contraseña + emite sesión), `refresh` (rota), `logout` (revoca), `profile`, `myPermissions`
- [ ] **20.3** `session.controller.ts` con `this.run(res, …)`
- [ ] **20.4** `session.routes.ts`: `login`/`refresh`/`logout` **OPEN**; `perfil`/`permisos` **JWT**
- [ ] **20.5** `session.swagger.ts` con `security: []` en las OPEN y `bearerAuth` en las JWT
- [ ] **20.6** archivos `.http` de login, refresh y perfil
- [ ] **20.7** recorrido E2E que prueba OPEN → JWT → JWT + RBAC
- [ ] `npx tsc --noEmit` OK

---

## 20.1 DTOs del feature

```bash
: > src/features/auth/session/dto/login.dto.ts
cat >> src/features/auth/session/dto/login.dto.ts << 'EOF'
/**
 * Datos de entrada de `POST /api/sesion/login` (modalidad OPEN).
 *
 * `identifier` acepta **usuario o correo**: la consulta de credenciales busca por
 * cualquiera de los dos, normalizando a minúsculas.
 */
export interface LoginDto {
  identifier: string;
  password: string;
}
EOF
```

```bash
: > src/features/auth/session/dto/refresh-session.dto.ts
cat >> src/features/auth/session/dto/refresh-session.dto.ts << 'EOF'
/**
 * Datos de entrada de `POST /api/sesion/refresh` (modalidad OPEN con credencial
 * de sesión).
 *
 * El refresh token viaja en el **cuerpo**, no en la cabecera `Authorization`:
 * es una credencial de sesión, no un token de acceso.
 */
export interface RefreshSessionDto {
  refresh_token: string;
}
EOF
```

```bash
: > src/features/auth/session/dto/logout-session.dto.ts
cat >> src/features/auth/session/dto/logout-session.dto.ts << 'EOF'
/**
 * Datos de entrada de `POST /api/sesion/logout`.
 *
 * Se envía el refresh token que se quiere revocar (la sesión concreta). Es
 * idempotente: repetirlo no devuelve error.
 */
export interface LogoutSessionDto {
  refresh_token: string;
}
EOF
```

```bash
: > src/features/auth/session/dto/session-response.dto.ts
cat >> src/features/auth/session/dto/session-response.dto.ts << 'EOF'
/**
 * Respuesta de `login` y `refresh`: el **par de tokens**.
 *
 * - `access_token`: JWT corto, autocontenido; viaja en `Authorization: Bearer`.
 * - `refresh_token`: token opaco larga vida; **se devuelve solo aquí**, en claro,
 *   porque el servidor guarda únicamente su hash. El cliente debe guardarlo y
 *   enviarlo a `/api/sesion/refresh` para renovar sin volver a autenticarse.
 * - `expires_in`: segundos de vida del token de acceso (para que el cliente
 *   programe la renovación *antes* de que expire).
 */
export interface SessionTokensDto {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
}

/** Datos públicos del perfil propio (modalidad JWT). Nunca incluye `password`. */
export interface ProfileDto {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  status: "active" | "inactive";
}
EOF
```

```bash
: > src/features/auth/session/dto/index.ts
cat >> src/features/auth/session/dto/index.ts << 'EOF'
export * from "./login.dto";
export * from "./refresh-session.dto";
export * from "./logout-session.dto";
export * from "./session-response.dto";
EOF
```

## 20.2 Service

`SessionService` **orquesta** piezas ya construidas y no duplica su lógica:

| **Método** | **Reutiliza** | **Hace** |
| :--- | :--- | :--- |
| `login` | `UsersRepository.findByUsernameOrEmail`, `verifyPassword`, `RefreshTokensService.issue` | autentica y abre sesión |
| `refresh` | `RefreshTokensService.rotate` | renueva el access token **rotando** el refresh |
| `logout` | `RefreshTokensService.revoke` | revoca la sesión |
| `profile` | `requireAuthUser` | devuelve la identidad |
| `myPermissions` | `UsersService.getEffectivePermissions` | lista los `(method, path)` vigentes |

**Seguridad del login:** si el usuario no existe **o** la contraseña no coincide, la respuesta es el **mismo 401 genérico**. No se distingue «usuario inexistente» de «contraseña incorrecta» (evita enumeración de usuarios). Un usuario `inactive` tampoco puede iniciar sesión.

```bash
: > src/features/auth/session/session.service.ts
cat >> src/features/auth/session/session.service.ts << 'EOF'
import {
  LoginDto,
  LogoutSessionDto,
  ProfileDto,
  RefreshSessionDto,
  SessionTokensDto,
} from "./dto";
import { UsersRepository } from "../users/users.repository";
import { RefreshTokensService } from "../refresh-tokens/refresh-tokens.service";
import { ResourceRolesService } from "../resource-roles/resource-roles.service";
import { EffectivePermissionDto } from "../resource-roles/dto";
import { User } from "../users/user.model";
import { AppError } from "../../../shared/errors/app-error";
import { comparePassword } from "../../../shared/auth/password";
import { ACCESS_TOKEN_TTL_SECONDS, signAccessToken } from "../../../shared/auth/jwt";

/**
 * Capa Service del feature Session — **el ciclo de vida de la sesión**.
 *
 * Cubre las dos modalidades sin autorización granular:
 *
 * | Operación | Modalidad | Escribe seguridad |
 * |---|---|---|
 * | `login`    | OPEN (valida credenciales) | `refresh_tokens` (nueva familia) |
 * | `refresh`  | OPEN (credencial de sesión) | `refresh_tokens` (rotación) |
 * | `logout`   | OPEN (credencial de sesión) | `refresh_tokens` (revocación) |
 * | `profile`  | JWT | — (solo lectura) |
 *
 * **Renovación automática.** El cliente mantiene la sesión sin volver a pedir
 * credenciales: cuando el access token está por expirar, llama a `refresh` con
 * el refresh token y recibe un par nuevo. La ventana del refresh token se
 * reinicia en cada rotación (ventana deslizante), así que un usuario que sigue
 * trabajando no se ve expulsado; uno inactivo durante toda la ventana, sí.
 */
export class SessionService {
  public constructor(
    private readonly usersRepository: UsersRepository = new UsersRepository(),
    private readonly refreshTokensService: RefreshTokensService = new RefreshTokensService(),
    private readonly resourceRolesService: ResourceRolesService = new ResourceRolesService()
  ) {}

  // ================== LOGIN (OPEN) ==================
  /**
   * Valida credenciales y abre una sesión.
   *
   * Nota de seguridad: la respuesta es **la misma** para "usuario inexistente" y
   * "contraseña incorrecta" (`Invalid credentials`) para no revelar qué usuarios
   * existen. La comparación de la contraseña ocurre en memoria; el hash nunca
   * sale de la base de datos.
   */
  public async login(body: LoginDto, deviceInfo: string | null): Promise<SessionTokensDto> {
    if (!body.identifier || !body.password) {
      throw new AppError(400, "identifier and password are required");
    }

    const user = await this.usersRepository.findByIdentifierWithPassword(body.identifier);
    if (!user || user.status !== "active") {
      throw new AppError(401, "Invalid credentials");
    }

    const matches = await comparePassword(body.password, user.password);
    if (!matches) {
      throw new AppError(401, "Invalid credentials");
    }

    const session = await this.refreshTokensService.issue(user.id, deviceInfo);
    return this.buildTokens(user, session.rawToken, session.expiresAt);
  }

  // ================== REFRESH (OPEN con credencial de sesión) ==================
  /**
   * Rota el refresh token y emite un par nuevo.
   *
   * Traduce el resultado de la rotación (que no lanza dentro de la transacción,
   * para no deshacer la revocación por reutilización) al error HTTP que
   * corresponde:
   *  - `invalid`  -> 401
   *  - `expired`  -> 401
   *  - `reuse`    -> 401 **habiendo revocado toda la familia**
   */
  public async refresh(
    body: RefreshSessionDto,
    deviceInfo: string | null
  ): Promise<SessionTokensDto> {
    if (!body.refresh_token) {
      throw new AppError(400, "refresh_token is required");
    }

    const outcome = await this.refreshTokensService.rotate(body.refresh_token, deviceInfo);

    if (outcome.kind === "invalid") {
      throw new AppError(401, "Invalid refresh token");
    }
    if (outcome.kind === "expired") {
      throw new AppError(401, "Refresh token expired");
    }
    if (outcome.kind === "reuse") {
      throw new AppError(401, "Refresh token reuse detected: session family revoked");
    }

    // Revalida la identidad: si el usuario fue desactivado, se corta la sesión
    // aunque el refresh token siga siendo válido.
    const user = await this.usersRepository.findById(outcome.userId);
    if (!user || user.status !== "active") {
      await this.refreshTokensService.revokeAllMine(outcome.userId);
      throw new AppError(401, "User is not active");
    }

    return this.buildTokens(user, outcome.rawToken, outcome.expiresAt);
  }

  // ================== LOGOUT (OPEN con credencial de sesión) ==================
  /** Revoca la sesión del refresh token presentado. Idempotente. */
  public async logout(body: LogoutSessionDto): Promise<void> {
    if (!body.refresh_token) {
      throw new AppError(400, "refresh_token is required");
    }
    await this.refreshTokensService.revokeByToken(body.refresh_token);
  }

  // ================== PERFIL (JWT) ==================
  /** Datos públicos del usuario autenticado. */
  public async profile(userId: number): Promise<ProfileDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user || user.status !== "active") {
      throw new AppError(404, "User not found");
    }
    return toProfile(user);
  }

  /** Permisos efectivos del propio usuario (modalidad JWT, sin RBAC). */
  public async myPermissions(userId: number): Promise<EffectivePermissionDto[]> {
    return this.resourceRolesService.findEffectiveForUser(userId);
  }

  // ================== HELPERS ==================
  /** Arma el par de tokens: firma el access y adjunta el refresh recién emitido. */
  private buildTokens(user: User, refreshToken: string, refreshExpiresAt: Date): SessionTokensDto {
    const access = signAccessToken({ id: user.id, username: user.username });
    return {
      access_token: access.token,
      token_type: "Bearer",
      expires_in: access.expiresIn,
      refresh_token: refreshToken,
      refresh_expires_in: Math.max(
        0,
        Math.floor((refreshExpiresAt.getTime() - Date.now()) / 1000)
      ),
    };
  }
}

/** Proyección a `ProfileDto`: solo campos públicos. */
function toProfile(user: User): ProfileDto {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar ?? null,
    status: user.status,
  };
}

/** Reexporta la constante para que el controller pueda documentar `expires_in`. */
export { ACCESS_TOKEN_TTL_SECONDS };
EOF
```

**Renovación automática mientras el usuario trabaja:** el cliente llama a `POST /api/sesion/refresh` con el refresh token cuando el access token expira. Como el refresh **rota** en cada uso y la familia se revoca ante reuso, la sesión puede prolongarse indefinidamente sin degradar la seguridad.

## 20.3 Controller

```bash
: > src/features/auth/session/session.controller.ts
cat >> src/features/auth/session/session.controller.ts << 'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import { requireAuthUser } from "../../../shared/auth/auth-user";
import { LoginDto, LogoutSessionDto, RefreshSessionDto } from "./dto";
import { SessionService } from "./session.service";

/**
 * Capa Controller del feature Session.
 *
 * Mezcla las dos modalidades base:
 *  - `login`, `refresh` y `logout` son **OPEN** (no hay identidad previa; la
 *    credencial va en el cuerpo);
 *  - `profile` y `myPermissions` son **JWT** (la identidad la resolvió
 *    `authenticate` antes de llegar aquí).
 */
export class SessionController extends BaseController {
  public constructor(
    private readonly service: SessionService = new SessionService()
  ) {
    super();
  }

  // ================== OPEN ==================
  /** Inicia sesión: credenciales -> par de tokens. */
  public async login(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const tokens = await this.service.login(req.body as LoginDto, deviceInfo(req));
      res.status(200).json(tokens);
    });
  }

  /** Renueva el access token rotando el refresh token. */
  public async refresh(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const tokens = await this.service.refresh(req.body as RefreshSessionDto, deviceInfo(req));
      res.status(200).json(tokens);
    });
  }

  /** Cierra la sesión del refresh token presentado. */
  public async logout(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      await this.service.logout(req.body as LogoutSessionDto);
      res.status(200).json({ message: "Session closed" });
    });
  }

  // ================== JWT ==================
  /** Perfil del usuario autenticado. */
  public async profile(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const user = await this.service.profile(requireAuthUser(req).id);
      res.status(200).json({ user });
    });
  }

  /** Permisos efectivos del usuario autenticado. */
  public async myPermissions(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const permissions = await this.service.myPermissions(requireAuthUser(req).id);
      res.status(200).json({ permissions });
    });
  }
}

/** `device_info` de auditoría a partir del encabezado `User-Agent`. */
function deviceInfo(req: Request): string | null {
  const value = req.headers["user-agent"];
  if (!value) return null;
  return String(value).slice(0, 500);
}
EOF
```

## 20.4 Rutas — las tres modalidades en un solo archivo

| **Ruta** | **Modalidad** | **Middleware** |
| :--- | :--- | :--- |
| `POST /api/sesion/login` | **OPEN** | — |
| `POST /api/sesion/refresh` | **OPEN** (credencial de sesión) | — |
| `POST /api/sesion/logout` | **OPEN** (credencial de sesión) | — |
| `GET /api/sesion/perfil` | **JWT** | `authenticate` |
| `GET /api/permisos` | **JWT** | `authenticate` |

Ninguna lleva `authorize`: la autorización granular no aplica a los puntos de acceso previos a la matriz. `GET /api/permisos` devuelve, eso sí, **los permisos efectivos** del usuario autenticado —la misma consulta que usa el middleware `authorize`—, lo que lo hace ideal para **depurar el RBAC**.

```bash
: > src/features/auth/session/session.routes.ts
cat >> src/features/auth/session/session.routes.ts << 'EOF'
import { Application } from "express";
import { SessionController } from "./session.controller";
import { authenticate } from "../access";

/**
 * Rutas del feature Session — **las tres modalidades en un solo archivo**.
 *
 * | Ruta | Modalidad | Middleware |
 * |---|---|---|
 * | `POST /api/sesion/login`   | OPEN | — |
 * | `POST /api/sesion/refresh` | OPEN (credencial de sesión) | — |
 * | `POST /api/sesion/logout`  | OPEN (credencial de sesión) | — |
 * | `GET  /api/sesion/perfil`  | JWT | `authenticate` |
 * | `GET  /api/permisos`       | JWT | `authenticate` |
 *
 * Ninguna lleva `authorize`: la autorización granular no aplica a los puntos de
 * acceso previos o ajenos a la matriz de permisos. `/api/permisos` devuelve, eso
 * sí, **los permisos efectivos** del usuario autenticado (la misma consulta que
 * usa el middleware `authorize`), lo que lo hace ideal para depurar el RBAC.
 */
export class SessionRoutes {
  public sessionController: SessionController = new SessionController();

  public routes(app: Application): void {
    // login (OPEN)
    app
      .route("/api/sesion/login")
      .post(this.sessionController.login.bind(this.sessionController));

    // refresh (OPEN + refresh token)
    app
      .route("/api/sesion/refresh")
      .post(this.sessionController.refresh.bind(this.sessionController));

    // logout (OPEN + refresh token)
    app
      .route("/api/sesion/logout")
      .post(this.sessionController.logout.bind(this.sessionController));

    // perfil (JWT)
    app
      .route("/api/sesion/perfil")
      .get(authenticate, this.sessionController.profile.bind(this.sessionController));

    // permisos efectivos del usuario autenticado (JWT)
    app
      .route("/api/permisos")
      .get(authenticate, this.sessionController.myPermissions.bind(this.sessionController));
  }
}
EOF
```

## 20.5 Swagger

`refresh` y `logout` son OPEN *de facto*: no exigen access token, sino el **refresh token** en el cuerpo. Por eso declaran `security: []` y documentan su propio cuerpo.

```bash
: > src/features/auth/session/session.swagger.ts
cat >> src/features/auth/session/session.swagger.ts << 'EOF'
import {
  bearerSecurity,
  openSecurity,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

/**
 * Documentación OpenAPI del feature Session — **las tres modalidades juntas**.
 *
 * - `login` / `refresh` / `logout`: **OPEN**. Nota didáctica: OPEN no significa
 *   "sin base de datos", significa "sin identidad previa". El login **lee** el
 *   hash de `users` y **escribe** `refresh_tokens`; el refresh **rota** el token.
 * - `perfil` / `permisos`: **JWT**.
 *
 * La respuesta de `login` y `refresh` es el **par de tokens**. El `refresh_token`
 * se devuelve en claro **solo aquí**: el servidor guarda únicamente su SHA-256.
 */
export const sessionSwagger = {
  tags: [
    { name: "Sesión", description: "Login, renovación, cierre y perfil — **OPEN** + **JWT**" },
  ],
  paths: {
    "/api/sesion/login": {
      post: {
        tags: ["Sesión"],
        summary: "Iniciar sesión (OPEN)",
        description:
          "Modalidad **OPEN**. Valida usuario/correo + contraseña y abre una sesión: " +
          "emite un access token corto (JWT) y un refresh token persistido como hash, con un `family_id` nuevo. " +
          "La respuesta es idéntica para usuario inexistente y contraseña incorrecta (no se enumeran usuarios).",
        security: openSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/Login" } },
          },
        },
        responses: {
          "200": { description: "Par de tokens (`access_token`, `refresh_token`, `expires_in`)" },
          "400": { description: "Faltan `identifier` o `password`" },
          "401": { description: "Credenciales inválidas o usuario inactivo" },
        },
      },
    },
    "/api/sesion/refresh": {
      post: {
        tags: ["Sesión"],
        summary: "Renovar el access token (OPEN con credencial de sesión)",
        description:
          "Modalidad **OPEN**. **Rota** el refresh token: invalida el presentado y emite uno nuevo con el mismo " +
          "`family_id`. Si se presenta un token ya rotado, se interpreta como **reutilización** y se revoca toda la " +
          "familia (401). La rotación es atómica y con bloqueo de fila, así que dos peticiones simultáneas no emiten " +
          "dos tokens válidos. La ventana del refresh se reinicia en cada rotación: renovación automática mientras el usuario trabaja.",
        security: openSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RefreshToken" } },
          },
        },
        responses: {
          "200": { description: "Par de tokens nuevo (`access_token` + `refresh_token` rotado)" },
          "400": { description: "Falta `refresh_token`" },
          "401": {
            description:
              "Token inválido, expirado o **reutilizado** (en este último caso, la familia queda revocada)",
          },
        },
      },
    },
    "/api/sesion/logout": {
      post: {
        tags: ["Sesión"],
        summary: "Cerrar sesión (OPEN con credencial de sesión)",
        description:
          "Modalidad **OPEN**. Revoca el refresh token presentado. Idempotente: repetirlo no devuelve error. " +
          "El access token sigue siendo válido hasta expirar (vida corta); para invalidación inmediata, desactivar el usuario.",
        security: openSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RefreshToken" } },
          },
        },
        responses: {
          "200": { description: "Sesión cerrada (`{ message }`)" },
          "400": { description: "Falta `refresh_token`" },
        },
      },
    },
    "/api/sesion/perfil": {
      get: {
        tags: ["Sesión"],
        summary: "Perfil del usuario autenticado (JWT)",
        description:
          "Modalidad **JWT**. El middleware `authenticate` valida el token y **revalida en la base** que el usuario " +
          "sigue activo: desactivar una cuenta invalida sus tokens al instante (401).",
        security: bearerSecurity,
        responses: {
          "200": { description: "Perfil (`{ user }`) — nunca incluye `password`" },
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/permisos": {
      get: {
        tags: ["Sesión"],
        summary: "Mis permisos efectivos (JWT)",
        description:
          "Modalidad **JWT**. Ejecuta la misma consulta que el middleware `authorize` " +
          "(`resource_roles → roles → role_users → resources`, todos los eslabones activos) y devuelve el par " +
          "`(method, path)` de cada permiso. Es la herramienta para **depurar el RBAC**: lo que aparece aquí es exactamente lo que autoriza.",
        security: bearerSecurity,
        responses: {
          "200": { description: "Permisos efectivos (`{ permissions: [...] }`)" },
          "401": unauthorizedResponse,
        },
      },
    },
  },
  components: {
    schemas: {
      Login: {
        type: "object",
        required: ["identifier", "password"],
        properties: {
          identifier: { type: "string", example: "admin", description: "`username` o `email`" },
          password: { type: "string", format: "password", example: "Admin123!" },
        },
      },
      RefreshToken: {
        type: "object",
        required: ["refresh_token"],
        properties: {
          refresh_token: { type: "string", example: "9f2c... (opaco, no es un JWT)" },
        },
      },
      SessionTokens: {
        type: "object",
        properties: {
          access_token: { type: "string", description: "JWT firmado (HS256), vida corta" },
          token_type: { type: "string", example: "Bearer" },
          expires_in: { type: "integer", example: 900, description: "Segundos de vida del access token" },
          refresh_token: { type: "string", description: "Token opaco; se devuelve solo en login/refresh" },
          refresh_expires_in: { type: "integer", example: 604800 },
        },
      },
    },
  },
};
EOF
```

## 20.6 Pruebas HTTP

```http
### Feature Session — LOGIN (modalidad OPEN)
### OPEN = sin identidad previa. Aquí SÍ se consulta `users` (hash) y se escribe `refresh_tokens`.
@baseUrl = http://localhost:4000

# @name loginAdmin
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin123!"
}

### Credenciales de ejemplo
# admin  / Admin123!   -> rol ADMIN  (58 permisos)
# seller / Seller123!  -> rol SELLER (7 permisos)

### Login por correo (mismo endpoint, `identifier` acepta username o email)
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin@storelab.local",
  "password": "Admin123!"
}

### Respuesta 401 - credenciales inválidas (mismo mensaje que "usuario inexistente")
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "password-incorrecta"
}

### Guarda los tokens para los demás archivos .http
@adminAccessToken = {{loginAdmin.response.body.$.access_token}}
@adminRefreshToken = {{loginAdmin.response.body.$.refresh_token}}
@expiresIn = {{loginAdmin.response.body.$.expires_in}}
```

```http
### Feature Session — REFRESH (modalidad OPEN con credencial de sesión)
### Renovación automática: el cliente llama aquí cuando el access token está por expirar.
### ROTACIÓN: el refresh token enviado queda inválido y se emite uno nuevo (misma familia).
### REUSE DETECTION: si se reenvía un token ya rotado -> 401 y se revoca toda la familia.
@baseUrl = http://localhost:4000

### 1) Login para obtener el par inicial
# @name loginAdmin
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin123!"
}

### 2) Refresh: devuelve access_token nuevo + refresh_token ROTADO
# @name refresh
POST {{baseUrl}}/api/sesion/refresh
Content-Type: application/json

{
  "refresh_token": "{{loginAdmin.response.body.$.refresh_token}}"
}

### 3) El access token nuevo sirve en una ruta JWT
GET {{baseUrl}}/api/sesion/perfil
Authorization: Bearer {{refresh.response.body.$.access_token}}

### 4) REUSE: reenviar el token viejo -> 401 y la familia queda revocada
POST {{baseUrl}}/api/sesion/refresh
Content-Type: application/json

{
  "refresh_token": "{{loginAdmin.response.body.$.refresh_token}}"
}

### 5) Consecuencia: el token rotado (paso 2) tampoco sirve ya -> 401
POST {{baseUrl}}/api/sesion/refresh
Content-Type: application/json

{
  "refresh_token": "{{refresh.response.body.$.refresh_token}}"
}
```

```http
### Feature Session — LOGOUT y PERFIL (OPEN con credencial de sesión + JWT)
@baseUrl = http://localhost:4000

# @name loginSeller
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "seller",
  "password": "Seller123!"
}

### PERFIL — modalidad JWT: `authenticate` valida el token y REVALIDA en la BD
### que el usuario sigue activo (desactivarlo invalida sus tokens al instante).
GET {{baseUrl}}/api/sesion/perfil
Authorization: Bearer {{loginSeller.response.body.$.access_token}}

### MIS PERMISOS — modalidad JWT: misma consulta RBAC que usa `authorize`
### (seller -> 7 permisos; admin -> 58). Es la herramienta para depurar el RBAC.
GET {{baseUrl}}/api/permisos
Authorization: Bearer {{loginSeller.response.body.$.access_token}}

### Sin token -> 401 (no autenticado)
GET {{baseUrl}}/api/sesion/perfil

### LOGOUT — modalidad OPEN con credencial de sesión. Idempotente.
POST {{baseUrl}}/api/sesion/logout
Content-Type: application/json

{
  "refresh_token": "{{loginSeller.response.body.$.refresh_token}}"
}

### Ya no se puede renovar -> 401
POST {{baseUrl}}/api/sesion/refresh
Content-Type: application/json

{
  "refresh_token": "{{loginSeller.response.body.$.refresh_token}}"
}
```

## 20.7 Verificación end-to-end de las tres modalidades

```bash
npm run db:seed && npm run dev
```

```bash
BASE=http://localhost:4000

# 1) OPEN — login (no requiere identidad)
curl -s -X POST $BASE/api/sesion/login -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"Admin123!"}'

# 2) JWT — perfil con el access token (sin permisos RBAC de por medio)
ADMIN=$(curl -s -X POST $BASE/api/sesion/login -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"Admin123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).access_token")
curl -s -H "Authorization: Bearer $ADMIN" $BASE/api/sesion/perfil

# 3) JWT + RBAC — el mismo token, ahora sí, autoriza negocio
curl -s -H "Authorization: Bearer $ADMIN" $BASE/api/clientes

# 4) JWT + RBAC (denegado) — seller no tiene POST /api/clientes
SELLER=$(curl -s -X POST $BASE/api/sesion/login -H "Content-Type: application/json" \
  -d '{"identifier":"seller","password":"Seller123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).access_token")
curl -i -X POST -H "Authorization: Bearer $SELLER" -H "Content-Type: application/json" \
  -d '{"name":"x","phone":"1","email":"x@x.com","password":"x"}' $BASE/api/clientes   # 403

# 5) Renovación — rotar el refresh token
curl -s -X POST $BASE/api/sesion/refresh -H "Content-Type: application/json" \
  -d '{"refresh_token":"<refresh_token del login>"}'
```

| **Comprobación** | **Esperado** |
| :--- | :--- |
| `POST /api/sesion/login` con credenciales válidas | 200 + `access_token` + `refresh_token` |
| `POST /api/sesion/login` con contraseña errónea | 401 genérico |
| `GET /api/sesion/perfil` sin token | 401 |
| `GET /api/permisos` con token de `seller` | lista de 7 recursos |
| `POST /api/clientes` con token de `seller` | 403 |
| `POST /api/sesion/refresh` con el refresh válido | 200 + nuevos tokens; el anterior queda `used` |
| Reusar el refresh anterior | 401 + familia revocada |

### DoD del ISS-15

- [ ] Todos los criterios de aceptación (20.1 … 20.7) cumplidos
- [ ] Las tres modalidades son observables con `curl` (401 sin token, 403 sin concesión, 200/201 con ella)
- [ ] `GET /api/permisos` refleja la matriz real (58 para `admin`, 7 para `seller`)
- [ ] La rotación de refresh invalida el token anterior
- [ ] `npx tsc --noEmit` sin errores y `npm run dev` arranca

---

> **✅ GATE de la unidad ISS-15** — *este bloque no añade ningún criterio nuevo.*
>
> Las condiciones de cierre son exactamente las que define el ISS técnico de esta misma página:
>
> - 📋 **Criterios de aceptación** → [Criterios de aceptación](https://tecnogua.com/academic/site/backend2026/manual/17-ISS-15-auth-session/#criterios-de-aceptacion-iss-15-consolidados)
> - 🧩 **Cierre de la unidad** → [Cierre de la unidad](https://tecnogua.com/academic/site/backend2026/manual/17-ISS-15-auth-session/#dod-del-iss-15)
> - 🧠 **Autoevaluación** → [Evaluación del cuaderno](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-15-aprendizaje/#evaluacion)
>
> Con el GATE en verde queda habilitado **CIERRE-AUTH · Cierre Fase II — Auth con RBAC (backend completo)**.
>
> **Navegación de la ruta:** **←** [ISS-15 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-15-aprendizaje/) · [↑ Ruta Express](https://tecnogua.com/academic/site/backend2026/) · **→** [CIERRE-AUTH · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/CIERRE-AUTH-aprendizaje/)
