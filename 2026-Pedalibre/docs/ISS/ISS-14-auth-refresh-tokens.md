**🛠 Unidad ISS-14 · Feature RefreshTokens (sesiones)** — capa **🛠 CONSTRUIR**
[🧠 Comprender este bloque →](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-14-aprendizaje/) · [📝 Evaluación](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-14-aprendizaje/#evaluacion) · [✅ GATE de la unidad](https://tecnogua.com/academic/site/backend2026/manual/16-ISS-14-auth-refresh-tokens/#criterios-de-aceptacion-iss-14-consolidados)

| **Capa**         | **Página**                                                                                                                                                | **Para qué**                             |
| :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------- |
| 🧠 **Aprender**  | [Feature RefreshTokens (sesiones)](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-14-aprendizaje/)                                        | comprender, explicar y relacionar        |
| 🛠 **Construir** | esta página                                                                                                                                               | ejecutar, programar y verificar          |
| ✅ **GATE**       | [Condiciones de cierre](https://tecnogua.com/academic/site/backend2026/manual/16-ISS-14-auth-refresh-tokens/#criterios-de-aceptacion-iss-14-consolidados) | condición para pasar al bloque siguiente |

**Esta es la guía ejecutable.** Sigue los pasos en orden. El cuerpo de abajo es el **ISS técnico verbatim**: comandos, rutas, versiones, PARCHEs, verificaciones y criterios, sin simplificar ni modernizar.

---

# Fase II: Auth con RBAC — ISS-14 — Feature RefreshTokens (sesiones renovables y revocables)

> **Contexto mínimo (autosuficiente).** Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que hay que saber antes de ejecutarlo. - **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript + Sequelize, **arquitectura por features**. - **Ya construido:** Fase I, [ISS-09 base](https://tecnogua.com/academic/site/backend2026/manual/11-ISS-09-auth-base/), [ISS-10 Users](https://tecnogua.com/academic/site/backend2026/manual/12-ISS-10-auth-users/), [ISS-11 Roles/Resources](https://tecnogua.com/academic/site/backend2026/manual/13-ISS-11-auth-roles-resources/), [ISS-12 pivotes](https://tecnogua.com/academic/site/backend2026/manual/14-ISS-12-auth-role-users-resource-roles/) e [ISS-13 middlewares](https://tecnogua.com/academic/site/backend2026/manual/15-ISS-13-auth-access/). - **Recorrido obligatorio de una petición:** `HTTP → Controller → Service → Repository → Model → Sequelize → BD`. Ninguna capa se salta a la siguiente. - **Diseño de datos (Fase II):** [`../bd-storelab.md`](https://tecnogua.com/academic/site/backend2026/bd-storelab/) §14.6 (`refresh_tokens`) y §17 (ciclo de vida de la sesión persistida). - **Capas, convenciones y reglas transversales:** [`00-contexto.md`](https://tecnogua.com/academic/site/backend2026/manual/00-contexto/).
>
> | **Este ISS**        |                                                                                                                |
> | :------------------ | :------------------------------------------------------------------------------------------------------------- |
> | **Título**          | Feature RefreshTokens (sesiones renovables y revocables)                                                       |
> | **Feature / tabla** | `features/auth/refresh-tokens/` · `refresh_tokens`                                                             |
> | **API**             | `/api/sesiones…` (modalidad **JWT**)                                                                           |
> | **Depende de**      | [ISS-13 — Middlewares de acceso](https://tecnogua.com/academic/site/backend2026/manual/15-ISS-13-auth-access/) |
> | **Habilita**        | [ISS-15 — Feature Session](https://tecnogua.com/academic/site/backend2026/manual/17-ISS-15-auth-session/)      |

## Contenido de este ISS

- 19.1 DTOs del feature
- 19.2 Repository (búsqueda por hash, bloqueo pesimista y revocación por familia)
- 19.3 Service (emitir, rotar con detección de reuso y revocar)
- 19.4 Controller y rutas (sesiones propias, modalidad JWT)
- 19.5 Swagger
- 19.6 Pruebas HTTP

---

**Objetivo:** persistir las **sesiones** como tokens opacos, de modo que un access token corto pueda renovarse mientras el usuario trabaja, y que una sesión pueda **revocarse** de verdad.

**Bloqueado por:** [ISS-13](https://tecnogua.com/academic/site/backend2026/manual/15-ISS-13-auth-access/) (`authenticate` es lo que permite hablar de «sesiones propias»).

### Criterios de aceptación (ISS-14) — consolidados

- [ ] **19.1** `refresh-tokens/dto/` (`refresh-token-response.dto.ts`, `index.ts`)
- [ ] **19.2** `refresh-tokens.repository.ts`: busca por `token_hash`, lista por usuario, aplica **lock pesimista** al rotar y revoca **por familia**
- [ ] **19.3** `refresh-tokens.service.ts`: `issue`, `rotate` (con **reuse detection**) y `revoke*`
- [ ] **19.4** `refresh-tokens.controller.ts` y `refresh-tokens.routes.ts` (modalidad **JWT**, sin `authorize`)
- [ ] **19.5** `refresh-tokens.swagger.ts`
- [ ] **19.6** `http/sessions.get.http`
- [ ] `npx tsc --noEmit` OK

---

## 19.1 DTOs del feature

El service nunca devuelve la **instancia** de Sequelize: proyecta a un DTO plano que **jamás** incluye `token_hash`.

```text
: > src/features/auth/refresh-tokens/dto/refresh-token-response.dto.ts
cat >> src/features/auth/refresh-tokens/dto/refresh-token-response.dto.ts << 'EOF'
import { RefreshToken, RefreshTokenI } from "../refresh-token.model";

/**
 * Respuesta HTTP de una sesión persistida (refresh token).
 *
 * `token_hash` **se omite deliberadamente**: es un artefacto de seguridad. Ni
 * siquiera su hash tiene por qué salir de la API. El `id` basta para revocar.
 */
export type RefreshTokenResponseDto = Omit<RefreshTokenI, "token_hash"> & {
  /** Derivado, no columna: `expires_at` ya pasó. */
  is_expired: boolean;
};

/** Mapper modelo -> DTO de respuesta (objeto plano; elimina `token_hash`). */
export function toRefreshTokenResponse(token: RefreshToken): RefreshTokenResponseDto {
  const { token_hash, ...safe } = token.toJSON() as RefreshTokenI & { token_hash?: string };
  return {
    ...safe,
    is_expired: new Date(token.expires_at).getTime() <= Date.now(),
  };
}
EOF
```

```text
: > src/features/auth/refresh-tokens/dto/index.ts
cat >> src/features/auth/refresh-tokens/dto/index.ts << 'EOF'
export * from "./refresh-token-response.dto";
EOF
```

## 19.2 Repository

Tres operaciones son específicas y describen el diseño de seguridad:

| **Método**                  | **Por qué existe**                                                                                                   |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| `findByTokenHash`           | el token en claro **no** se almacena: se busca por su **SHA-256**                                                    |
| `rotate` con `lock: UPDATE` | la rotación es un *read-modify-write*; el lock evita que dos peticiones concurrentes consuman el mismo refresh token |
| `revokeFamily`              | la **reutilización** de un token ya rotado es señal de robo: se revoca toda la familia                               |

```text
: > src/features/auth/refresh-tokens/refresh-tokens.repository.ts
cat >> src/features/auth/refresh-tokens/refresh-tokens.repository.ts << 'EOF'
import { CreationAttributes, Op, Transaction } from "sequelize";
import { RefreshToken } from "./refresh-token.model";

/**
 * Capa Repository del feature RefreshTokens (tabla `refresh_tokens`).
 *
 * Única que habla con Sequelize. Las consultas que participan en la rotación
 * aceptan transacción y, cuando corresponde, bloquean la fila (`FOR UPDATE`)
 * para que dos peticiones de refresh simultáneas no emitan dos tokens válidos.
 */
export class RefreshTokensRepository {
  /**
   * Busca por hash del token.
   *
   * `lock: true` añade `FOR UPDATE` dentro de la transacción: es lo que hace que
   * la rotación sea segura bajo concurrencia (solo una petición gana).
   */
  public async findByHash(
    tokenHash: string,
    transaction?: Transaction,
    lock = false
  ): Promise<RefreshToken | null> {
    return RefreshToken.findOne({
      where: { token_hash: tokenHash },
      transaction,
      ...(lock ? { lock: transaction?.LOCK.UPDATE } : {}),
    });
  }

  /** Sesiones de un usuario (activas o todas según `onlyActive`). */
  public async findAllByUser(userId: number, onlyActive = true): Promise<RefreshToken[]> {
    const where: Record<string, unknown> = { user_id: userId };
    if (onlyActive) where.status = "active";

    return RefreshToken.findAll({ where, order: [["createdAt", "DESC"]] });
  }

  /** Una sesión por PK (o `null`). */
  public async findById(id: number): Promise<RefreshToken | null> {
    return RefreshToken.findByPk(id);
  }

  /** Inserta un refresh token (alta de sesión o rotación). */
  public async create(
    data: CreationAttributes<RefreshToken>,
    transaction?: Transaction
  ): Promise<RefreshToken> {
    return RefreshToken.create(data, { transaction });
  }

  /** Persiste cambios sobre una instancia existente. */
  public async update(
    token: RefreshToken,
    data: Partial<RefreshToken>,
    transaction?: Transaction
  ): Promise<RefreshToken> {
    return token.update(data, { transaction });
  }

  /**
   * Revoca **toda la familia** de rotación.
   *
   * Se ejecuta al detectar reutilización de un token ya rotado: si un atacante
   * tiene una copia del token anterior, la sesión legítima se invalida por
   * completo y el usuario debe autenticarse de nuevo (Owasp/OAuth2: reuse
   * detection con revocación de familia).
   */
  public async revokeFamily(familyId: string, transaction?: Transaction): Promise<number> {
    const [updated] = await RefreshToken.update(
      { status: "inactive" },
      { where: { family_id: familyId, status: "active" }, transaction }
    );
    return updated;
  }

  /** Revoca todas las sesiones activas de un usuario (cierre de sesión global). */
  public async revokeAllByUser(userId: number): Promise<number> {
    const [updated] = await RefreshToken.update(
      { status: "inactive" },
      { where: { user_id: userId, status: "active" } }
    );
    return updated;
  }

  /** Elimina físicamente las sesiones ya expiradas o revocadas de un usuario. */
  public async purgeInactiveByUser(userId: number): Promise<number> {
    return RefreshToken.destroy({
      where: {
        user_id: userId,
        [Op.or]: [{ status: "inactive" }, { expires_at: { [Op.lt]: new Date() } }],
      },
    });
  }

  /** Cuenta las sesiones activas de un usuario. */
  public async countActiveByUser(userId: number): Promise<number> {
    return RefreshToken.count({ where: { user_id: userId, status: "active" } });
  }
}
EOF
```

## 19.3 Service — emitir, rotar, revocar

**Ciclo de vida (RFC 6749 §1.5, RFC 6750, OWASP):**

```text
login  → emite family_id = <uuid>  +  refresh token (se guarda sha256)  +  access token (15 min)
uso    → POST /api/sesion/refresh con el refresh token
         ├─ token válido y no usado  → ROTA: el viejo pasa a `used`, nace uno nuevo (misma familia)
         └─ token ya usado           → REUSE DETECTION: se revoca la familia completa
logout → revoca el refresh token (o toda la familia)
```

| **Decisión**                       | **Motivo**                                                                    |
| :--------------------------------- | :---------------------------------------------------------------------------- |
| Access token corto (15 min)        | acota la ventana de un token robado                                           |
| Refresh token **opaco** y hasheado | puede revocarse y, si roban la BD, no sirve para autenticarse                 |
| **Rotación** en cada refresh       | un refresh token es de un solo uso                                            |
| **Familia** (`family_id`)          | permite revocar toda una cadena de sesión, no solo el último eslabón          |
| **Reuse detection**                | un token ya consumido que reaparece implica robo → se corta la familia entera |
| Lock pesimista al rotar            | dos refreshes simultáneos no pueden ganar los dos                             |

```text
: > src/features/auth/refresh-tokens/refresh-tokens.service.ts
cat >> src/features/auth/refresh-tokens/refresh-tokens.service.ts << 'EOF'
import { Transaction } from "sequelize";
import { randomUUID } from "node:crypto";
import {
  RefreshTokenResponseDto,
  toRefreshTokenResponse,
} from "./dto";
import { RefreshTokensRepository } from "./refresh-tokens.repository";
import { RefreshToken } from "./refresh-token.model";
import { AppError } from "../../../shared/errors/app-error";
import { generateOpaqueToken, sha256Hex } from "../../../shared/auth/password";
import { withTransaction } from "../../../shared/database/with-transaction";

/** Vida útil de un refresh token (días). Configurable por entorno. */
const REFRESH_TTL_DAYS = Number(process.env.JWT_REFRESH_TTL_DAYS ?? 7);

/** Resultado de emitir una sesión nueva. */
export interface IssuedSession {
  rawToken: string;
  familyId: string;
  expiresAt: Date;
}

/**
 * Resultado de intentar rotar un refresh token.
 *
 * Se devuelve una **unión discriminada** en lugar de lanzar dentro de la
 * transacción: si se lanzara, el `rollback` desharía la revocación de la familia
 * que acabamos de escribir. El service de sesión decide el error **después** de
 * que la transacción confirme.
 */
export type RotationOutcome =
  | { kind: "rotated"; userId: number; rawToken: string; familyId: string; expiresAt: Date }
  | { kind: "invalid" }
  | { kind: "expired" }
  | { kind: "reuse"; familyId: string; revoked: number };

/**
 * Capa Service del feature RefreshTokens.
 *
 * Cubre dos responsabilidades:
 *  1. **Gestión de las sesiones propias** (listar, consultar, revocar): es la
 *     parte que se expone con la modalidad JWT, sin RBAC, porque opera solo sobre
 *     las sesiones del usuario autenticado.
 *  2. **Ciclo de vida del token** (emitir, rotar, revocar), que consume el
 *     feature `session` en login/refresh/logout.
 */
export class RefreshTokensService {
  public constructor(
    private readonly repository: RefreshTokensRepository = new RefreshTokensRepository()
  ) {}

  // ================== GESTIÓN (sesiones propias) ==================
  public async getAllMine(userId: number): Promise<RefreshTokenResponseDto[]> {
    const tokens = await this.repository.findAllByUser(userId);
    return tokens.map((token) => toRefreshTokenResponse(token));
  }

  public async getMine(userId: number, id: number): Promise<RefreshTokenResponseDto> {
    return toRefreshTokenResponse(await this.findMineOrFail(userId, id));
  }

  /** Revoca una sesión propia concreta. */
  public async revokeMine(userId: number, id: number): Promise<RefreshTokenResponseDto> {
    const token = await this.findMineOrFail(userId, id);
    await this.repository.update(token, { status: "inactive" });
    return toRefreshTokenResponse(token);
  }

  /** Revoca **todas** las sesiones propias (útil si se sospecha un robo). */
  public async revokeAllMine(userId: number): Promise<number> {
    return this.repository.revokeAllByUser(userId);
  }

  /** Purga las sesiones propias ya revocadas o expiradas. */
  public async purgeMine(userId: number): Promise<number> {
    return this.repository.purgeInactiveByUser(userId);
  }

  public async countActiveMine(userId: number): Promise<number> {
    return this.repository.countActiveByUser(userId);
  }

  // ================== CICLO DE VIDA ==================
  /** Emite una sesión nueva (alta de login). Genera un `family_id` nuevo. */
  public async issue(
    userId: number,
    deviceInfo: string | null,
    transaction?: Transaction
  ): Promise<IssuedSession> {
    const rawToken = generateOpaqueToken();
    const familyId = randomUUID();
    const expiresAt = expiryFromNow();

    await this.repository.create(
      {
        user_id: userId,
        token_hash: sha256Hex(rawToken),
        family_id: familyId,
        device_info: deviceInfo,
        expires_at: expiresAt,
        status: "active",
      },
      transaction
    );

    // El token en claro se devuelve **una sola vez**; en la base solo queda el hash.
    return { rawToken, familyId, expiresAt };
  }

  /**
   * Rota un refresh token: lo invalida y emite uno nuevo con el mismo
   * `family_id`. Todo dentro de una transacción con bloqueo de fila.
   *
   * Concurrencia: si dos peticiones presentan el mismo token, una rota y la otra
   * encuentra el token ya inactivo -> se interpreta como reutilización y se
   * revoca la familia completa.
   */
  public async rotate(rawToken: string, deviceInfo: string | null): Promise<RotationOutcome> {
    const hash = sha256Hex(rawToken);

    // El valor de retorno de la transacción se decide **dentro**, pero los
    // efectos de revocación quedan confirmados aunque el resultado final sea un
    // rechazo (por eso no se lanza aquí dentro).
    const outcome = await withTransaction<RotationOutcome>(async (t) => {
      const current = await this.repository.findByHash(hash, t, true);

      if (!current) {
        return { kind: "invalid" };
      }

      // REUSE DETECTION: el token existía pero ya no está activo (fue rotado).
      if (current.status !== "active") {
        const revoked = await this.repository.revokeFamily(current.family_id, t);
        return { kind: "reuse", familyId: current.family_id, revoked };
      }

      if (new Date(current.expires_at).getTime() <= Date.now()) {
        await this.repository.update(current, { status: "inactive" }, t);
        return { kind: "expired" };
      }

      // Rotación: el token usado se invalida y nace uno nuevo en la misma familia.
      await this.repository.update(current, { status: "inactive" }, t);

      const rawNext = generateOpaqueToken();
      const expiresAt = expiryFromNow();
      await this.repository.create(
        {
          user_id: current.user_id,
          token_hash: sha256Hex(rawNext),
          family_id: current.family_id,
          device_info: deviceInfo ?? current.device_info,
          expires_at: expiresAt,
          status: "active",
        },
        t
      );

      return {
        kind: "rotated",
        userId: current.user_id,
        rawToken: rawNext,
        familyId: current.family_id,
        expiresAt,
      };
    });

    return outcome;
  }

  /**
   * Cierra la sesión asociada a un refresh token (logout).
   *
   * Es idempotente: un token inexistente o ya revocado no es un error, porque el
   * efecto deseado (que no sirva) ya se cumple.
   */
  public async revokeByToken(rawToken: string): Promise<boolean> {
    const token = await this.repository.findByHash(sha256Hex(rawToken));
    if (!token) return false;
    if (token.status !== "active") return true;

    await this.repository.update(token, { status: "inactive" });
    return true;
  }

  // ================== HELPERS ==================
  /**
   * Busca una sesión **del propio usuario**.
   *
   * El filtro por `user_id` es la frontera de seguridad: aunque el RBAC no
   * intervenga en estas rutas, un usuario nunca puede ver ni revocar la sesión
   * de otro. Un `id` ajeno responde 404, no 403 (no se filtra su existencia).
   */
  private async findMineOrFail(userId: number, id: number): Promise<RefreshToken> {
    const token = await this.repository.findById(id);
    if (!token || token.user_id !== userId) {
      throw new AppError(404, "Session not found");
    }
    return token;
  }
}

/** `now + REFRESH_TTL_DAYS`. Ventana deslizante: cada rotación la renueva. */
function expiryFromNow(): Date {
  return new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
}
EOF
```

## 19.4 Controller y rutas

A diferencia del CRUD de administración, estas rutas son **modalidad JWT** y **sin `authorize`**: ver y revocar **las propias sesiones** es un derecho derivado de estar autenticado, no una concesión de la matriz (no tendría sentido pedir un permiso para cerrar la propia sesión). Por eso tampoco figuran en el catálogo de 58 recursos.

```text
: > src/features/auth/refresh-tokens/refresh-tokens.controller.ts
cat >> src/features/auth/refresh-tokens/refresh-tokens.controller.ts << 'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import { requireAuthUser } from "../../../shared/auth/auth-user";
import { RefreshTokensService } from "./refresh-tokens.service";

/**
 * Capa Controller del feature RefreshTokens — **modalidad JWT**.
 *
 * Todas las operaciones actúan sobre las sesiones del usuario autenticado
 * (`req.auth.id`). No exigen RBAC: poder ver y revocar **tus propias** sesiones
 * es un derecho derivado de estar autenticado, no de tener un permiso concreto.
 *
 * Orden de operaciones (con una salvedad de enrutado, ver `refresh-tokens.routes.ts`):
 * getAll → getOne → revokeAll (literal) → revokeOne → purge.
 */
export class RefreshTokensController extends BaseController {
  public constructor(
    private readonly service: RefreshTokensService = new RefreshTokensService()
  ) {
    super();
  }

  // ================== READ ==================
  public async getAll(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const sessions = await this.service.getAllMine(requireAuthUser(req).id);
      res.status(200).json({ sessions });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const session = await this.service.getMine(requireAuthUser(req).id, this.paramId(req));
      res.status(200).json({ session });
    });
  }

  // ================== STATE (revocar) ==================
  /** Revoca **todas** las sesiones del usuario autenticado. */
  public async revokeAll(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const revoked = await this.service.revokeAllMine(requireAuthUser(req).id);
      res.status(200).json({ message: "All sessions revoked", revoked });
    });
  }

  /** Revoca una sesión propia. */
  public async revokeOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const session = await this.service.revokeMine(
        requireAuthUser(req).id,
        this.paramId(req)
      );
      res.status(200).json({ message: "Session revoked", session });
    });
  }

  // ================== PURGE ==================
  /** Purga (borrado físico) las sesiones propias ya revocadas o expiradas. */
  public async purge(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const purged = await this.service.purgeMine(requireAuthUser(req).id);
      res.status(200).json({ message: "Inactive sessions purged", purged });
    });
  }
}
EOF
```

```text
: > src/features/auth/refresh-tokens/refresh-tokens.routes.ts
cat >> src/features/auth/refresh-tokens/refresh-tokens.routes.ts << 'EOF'
import { Application } from "express";
import { RefreshTokensController } from "./refresh-tokens.controller";
import { authenticate } from "../access";

/**
 * Rutas del feature RefreshTokens — **modalidad 2 (JWT, sin RBAC)**.
 *
 * Todas operan sobre las **sesiones del usuario autenticado**. Ver y revocar las
 * propias sesiones es un derecho derivado de estar autenticado, no de un permiso
 * concreto; por eso no llevan `authorize` ni figuran en el catálogo de recursos.
 *
 * Nota de enrutado: `/api/sesiones/deactivate-all` es una **ruta literal** del
 * mismo verbo (`PATCH`) que la ruta parametrizada de una sola sesión
 * (`/api/sesiones/:id/deactivate`). No colisionan porque tienen distinto número
 * de segmentos, pero la literal se registra primero por claridad y para que
 * cualquier ruta literal futura siga la misma regla (Express resuelve por orden
 * de registro).
 */
export class RefreshTokensRoutes {
  public refreshTokensController: RefreshTokensController = new RefreshTokensController();

  public routes(app: Application): void {
    // getAll (sesiones propias)
    app
      .route("/api/sesiones")
      .get(
        authenticate,
        this.refreshTokensController.getAll.bind(this.refreshTokensController)
      );

    // revocar todas las sesiones propias (ruta literal: va ANTES de /:id)
    app
      .route("/api/sesiones/deactivate-all")
      .patch(
        authenticate,
        this.refreshTokensController.revokeAll.bind(this.refreshTokensController)
      );

    // getOne
    app
      .route("/api/sesiones/:id")
      .get(
        authenticate,
        this.refreshTokensController.getOne.bind(this.refreshTokensController)
      );

    // revocar una sesión propia
    app
      .route("/api/sesiones/:id/deactivate")
      .patch(
        authenticate,
        this.refreshTokensController.revokeOne.bind(this.refreshTokensController)
      );

    // purga de sesiones propias revocadas/expiradas
    app
      .route("/api/sesiones")
      .delete(authenticate, this.refreshTokensController.purge.bind(this.refreshTokensController));
  }
}
EOF
```

> **Nota de enrutado:** `/api/sesiones/deactivate-all` es una ruta **literal** del mismo verbo (`PATCH`) que `/api/sesiones/:id/deactivate`. No colisionan (distinto número de segmentos), pero la literal se registra **antes** por claridad y por si en el futuro se añade otra ruta literal.

## 19.5 Swagger

```text
: > src/features/auth/refresh-tokens/refresh-tokens.swagger.ts
cat >> src/features/auth/refresh-tokens/refresh-tokens.swagger.ts << 'EOF'
import { bearerSecurity, invalidIdResponse, unauthorizedResponse } from "../../../shared/http/swagger-security";

/**
 * Documentación OpenAPI del feature RefreshTokens — **sesiones propias**.
 *
 * Modalidad: **JWT** (sin RBAC). No forman parte del catálogo de recursos: ver y
 * revocar las **propias** sesiones deriva de estar autenticado, no de un permiso
 * concedido. Un `id` de sesión ajeno responde **404** (no se filtra su existencia).
 */
export const refreshTokensSwagger = {
  tags: [
    {
      name: "Sesiones",
      description:
        "Sesiones persistidas del usuario autenticado (refresh tokens): listar, consultar y revocar — **JWT**",
    },
  ],
  paths: {
    "/api/sesiones": {
      get: {
        tags: ["Sesiones"],
        summary: "Listar mis sesiones activas",
        description: "JWT — devuelve las sesiones del usuario del token. `token_hash` nunca se expone.",
        security: bearerSecurity,
        responses: {
          "200": { description: "Sesiones propias (`{ sessions: [...] }`)" },
          "401": unauthorizedResponse,
        },
      },
      delete: {
        tags: ["Sesiones"],
        summary: "Purgar mis sesiones revocadas/expiradas",
        description: "JWT — borrado físico de las sesiones propias ya inútiles.",
        security: bearerSecurity,
        responses: {
          "200": { description: "Purga realizada (`{ message, purged }`)" },
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/sesiones/deactivate-all": {
      patch: {
        tags: ["Sesiones"],
        summary: "Revocar todas mis sesiones",
        description:
          "JWT — pone `inactive` todas las sesiones propias (todos los dispositivos). " +
          "Útil ante sospecha de robo: el refresh token deja de servir de inmediato.",
        security: bearerSecurity,
        responses: {
          "200": { description: "Sesiones revocadas (`{ message, revoked }`)" },
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/sesiones/{id}": {
      get: {
        tags: ["Sesiones"],
        summary: "Consultar una sesión propia",
        description: "JWT — `family_id`, `device_info`, `expires_at`, `status`. 404 si no es del usuario.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Sesión (`{ session }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "404": { description: "No encontrada o no pertenece al usuario autenticado" },
        },
      },
    },
    "/api/sesiones/{id}/deactivate": {
      patch: {
        tags: ["Sesiones"],
        summary: "Revocar una sesión propia",
        description: "JWT — revocación lógica de una sesión concreta.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Sesión revocada (`{ message, session }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "404": { description: "No encontrada o no pertenece al usuario autenticado" },
        },
      },
    },
  },
  components: {
    schemas: {
      Session: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          user_id: { type: "integer", example: 2 },
          family_id: { type: "string", format: "uuid" },
          device_info: { type: "string", nullable: true, example: "Mozilla/5.0 ..." },
          expires_at: { type: "string", format: "date-time" },
          status: { type: "string", enum: ["active", "inactive"], example: "active" },
          is_expired: { type: "boolean", example: false },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
};
EOF
```

## 19.6 Pruebas HTTP

```text
: > src/features/auth/refresh-tokens/http/sessions.get.http
cat >> src/features/auth/refresh-tokens/http/sessions.get.http << 'EOF'
### Feature RefreshTokens — SESIONES PROPIAS (modalidad JWT, sin RBAC)
### Ver y revocar las propias sesiones deriva de estar autenticado, no de un permiso.
### Un id de sesión ajeno responde 404 (no se filtra su existencia).
@baseUrl = http://localhost:4000

# @name loginSeller
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "seller",
  "password": "Seller123!"
}

@token = {{loginSeller.response.body.$.access_token}}

### Listar mis sesiones activas (nunca expone `token_hash`)
GET {{baseUrl}}/api/sesiones
Authorization: Bearer {{token}}

### Consultar una sesión propia
GET {{baseUrl}}/api/sesiones/1
Authorization: Bearer {{token}}

### Revocar TODAS mis sesiones (ruta literal; registrar antes que /:id)
PATCH {{baseUrl}}/api/sesiones/deactivate-all
Authorization: Bearer {{token}}

### Revocar una sesión concreta
PATCH {{baseUrl}}/api/sesiones/1/deactivate
Authorization: Bearer {{token}}

### Purgar (borrado físico) mis sesiones revocadas/expiradas
DELETE {{baseUrl}}/api/sesiones
Authorization: Bearer {{token}}

### Modalidad JWT: sin token -> 401
GET {{baseUrl}}/api/sesiones
EOF
```

### Verificación

```sql
-- Tras un login hay una fila `active`; tras un refresh, la vieja queda `used`.
SELECT id, user_id, family_id, status, expires_at FROM refresh_tokens ORDER BY id;
```

### DoD del ISS-14

- [ ] Todos los criterios de aceptación (19.1 … 19.6) cumplidos
- [ ] En BD **nunca** hay un refresh token en claro: solo `token_hash`
- [ ] Rotar dos veces el mismo token dispara la **revocación de la familia**
- [ ] `PATCH /api/sesiones/:id/deactivate` solo afecta a una sesión **propia**
- [ ] `npx tsc --noEmit` sin errores y `npm run dev` arranca

---

> **✅ GATE de la unidad ISS-14** — *este bloque no añade ningún criterio nuevo.*
>
> Las condiciones de cierre son exactamente las que define el ISS técnico de esta misma página:
>
> - 📋 **Criterios de aceptación** → [Criterios de aceptación](https://tecnogua.com/academic/site/backend2026/manual/16-ISS-14-auth-refresh-tokens/#criterios-de-aceptacion-iss-14-consolidados)
> - 🧩 **Cierre de la unidad** → [Cierre de la unidad](https://tecnogua.com/academic/site/backend2026/manual/16-ISS-14-auth-refresh-tokens/#dod-del-iss-14)
> - 🧠 **Autoevaluación** → [Evaluación del cuaderno](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-14-aprendizaje/#evaluacion)
>
> Con el GATE en verde queda habilitado **ISS-15 · Feature Session (login y perfil)**.
>
> **Navegación de la ruta:** **←** [ISS-14 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-14-aprendizaje/) · [↑ Ruta Express](https://tecnogua.com/academic/site/backend2026/) · **→** [ISS-15 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-15-aprendizaje/)
