# 🛠 Unidad ISS-13 · Middlewares de acceso y las 3 modalidades

[🧠 Comprender este bloque →](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-13-aprendizaje/) · [📝 Evaluación](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-13-aprendizaje/#evaluacion) · [✅ GATE de la unidad](https://tecnogua.com/academic/site/backend2026/manual/15-ISS-13-auth-access/#criterios-de-aceptacion-iss-13-consolidados)

| **Capa**        | **Página**                                                                                                                                | **Para qué**                       |
| :-------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------- |
| 🧠**Aprender**  | [Middlewares de acceso y las 3 modalidades](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-13-aprendizaje/)                       | comprender, explicar y relacionar         |
| 🛠**Construir** | esta página                                                                                                                                     | ejecutar, programar y verificar           |
| ✅**GATE**      | [Condiciones de cierre](https://tecnogua.com/academic/site/backend2026/manual/15-ISS-13-auth-access/#criterios-de-aceptacion-iss-13-consolidados) | condición para pasar al bloque siguiente |

**Esta es la guía ejecutable.** Sigue los pasos en orden. El cuerpo de abajo es el **ISS técnico verbatim**: comandos, rutas, versiones, PARCHEs, verificaciones y criterios, sin simplificar ni modernizar.

---

# Fase II: Auth con RBAC — ISS-13 — Middlewares de acceso y las tres modalidades en rutas

> **Contexto mínimo (autosuficiente).** Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que hay que saber antes de ejecutarlo. - **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript + Sequelize, **arquitectura por features**. - **Ya construido:** Fase I, [ISS-09 base](https://tecnogua.com/academic/site/backend2026/manual/11-ISS-09-auth-base/), [ISS-10 Users](https://tecnogua.com/academic/site/backend2026/manual/12-ISS-10-auth-users/), [ISS-11 Roles/Resources](https://tecnogua.com/academic/site/backend2026/manual/13-ISS-11-auth-roles-resources/) y [ISS-12 pivotes](https://tecnogua.com/academic/site/backend2026/manual/14-ISS-12-auth-role-users-resource-roles/). - **Recorrido obligatorio de una petición:** `HTTP → Controller → Service → Repository → Model → Sequelize → BD`. Además, en este ISS se insertan **middlewares** entre `HTTP` y `Controller`. - **Diseño de datos (Fase II):** [`../bd-storelab.md`](https://tecnogua.com/academic/site/backend2026/bd-storelab/) §16 (autorización efectiva), §18 (tres formas de acceder a la BD) y §20 (deny by default). - **Capas, convenciones y reglas transversales:** [`00-contexto.md`](https://tecnogua.com/academic/site/backend2026/manual/00-contexto/).
>
> | **Este ISS**         |                                                                                                                                       |
> | :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
> | **Título**          | Middlewares de acceso y las tres modalidades en rutas                                                                                 |
> | **Feature / tablas** | `features/auth/access/` + PARCHE de las 5 rutas de negocio                                                                          |
> | **API**              | todas las de Fase I pasan a**JWT + RBAC**                                                                                       |
> | **Depende de**       | [ISS-12 — RoleUsers y ResourceRoles](https://tecnogua.com/academic/site/backend2026/manual/14-ISS-12-auth-role-users-resource-roles/) |
> | **Habilita**         | [ISS-14 — Feature RefreshTokens](https://tecnogua.com/academic/site/backend2026/manual/16-ISS-14-auth-refresh-tokens/)                |

## Contenido de este ISS

- 18.1 `authenticate.middleware.ts` (modalidad JWT)
- 18.2 `authorize.middleware.ts` (modalidad JWT + RBAC)
- 18.3 `access/index.ts` (barrel)
- 18.4 PARCHE: las 5 rutas de negocio pasan a JWT + RBAC
- 18.5 Las tres modalidades en una tabla
- 18.6 Verificación de 401 y 403

---

**Objetivo:** materializar las **tres modalidades** mediante dos middlewares componibles y aplicarlos a las rutas existentes sin tocar controllers, services ni repositories.

```text
OPEN            app.route(...).get(controller)
JWT             app.route(...).get(authenticate, controller)
JWT + RBAC      app.route(...).get(authenticate, authorize, controller)
```

**Bloqueado por:** [ISS-12](https://tecnogua.com/academic/site/backend2026/manual/14-ISS-12-auth-role-users-resource-roles/) (la matriz debe existir para que `authorize` tenga algo que consultar).

### Criterios de aceptación (ISS-13) — consolidados

- [ ] **18.1** `authenticate` valida el Bearer token, verifica algoritmo/issuer/audience/exp y carga el usuario activo en `req.auth`
- [ ] **18.2** `authorize` resuelve `(method, path)` y busca concesión activa; **deny by default** → 403
- [ ] **18.3** `access/index.ts` reexporta ambos middlewares
- [ ] **18.4** las 5 features de negocio (`clients`, `product-types`, `products`, `sales`, `product-sales`) aplican `authenticate, authorize`
- [ ] **18.5** documentadas las tres modalidades y qué códigos produce cada una
- [ ] **18.6** sin token → **401**; con token pero sin concesión → **403**; con concesión → **200/201**
- [ ] `npx tsc --noEmit` OK

---

## 18.1 `authenticate` — modalidad JWT

Hace exactamente cuatro cosas, en este orden:

1. Lee el encabezado `Authorization: Bearer <token>` (RFC 6750). Si falta o está mal formado → **401**.
2. Verifica el JWT con **algoritmo, emisor y audiencia fijos** (RFC 8725). Si falla → **401**.
3. Carga el usuario en BD y exige `status = 'active'`. Si no existe o está inactivo → **401**.
4. Deja la identidad en `req.auth` (tipado por `auth-user.ts`) y llama a `next()`.

> **No consulta roles ni permisos.** La autorización es responsabilidad del siguiente middleware: mezclar ambas impediría tener endpoints solo-JWT.

```bash
: > src/features/auth/access/authenticate.middleware.ts
cat >> src/features/auth/access/authenticate.middleware.ts << 'EOF'
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../shared/errors/app-error";
import { sendError } from "../../../shared/http/error-response";
import { extractBearerToken, verifyAccessToken } from "../../../shared/auth/jwt";
import { UsersRepository } from "../users/users.repository";

/**
 * **MODALIDAD 2 — JWT (identidad).** Middleware de autenticación.
 *
 * Responde únicamente a la pregunta **¿quién eres?**:
 *
 *  1. Lee el token de `Authorization: Bearer <token>` (RFC 6750).
 *  2. Verifica firma, algoritmo, `iss`, `aud`, `exp` (RFC 8725).
 *  3. **Revalida contra la base de datos** que el usuario sigue existiendo y con
 *     `status = active`. Un token firmado sigue siendo válido después de
 *     desactivar la cuenta; esta revalidación hace que la desactivación tenga
 *     efecto inmediato.
 *
 * NO consulta la matriz de permisos: eso es responsabilidad de `authorize`.
 * Si todo va bien, deja la identidad en `req.auth` y cede el paso.
 *
 * Cualquier fallo se responde con **401 (no autenticado)**.
 */
const usersRepository = new UsersRepository();

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      throw new AppError(401, "Missing Bearer token");
    }

    const payload = verifyAccessToken(token);

    // Defensa en profundidad: `verifyAccessToken` ya garantiza que `sub` es un
    // entero positivo. Se vuelve a comprobar para que ningún cambio futuro en la
    // verificación pueda enviar un `NaN` al repositorio (500 en vez de 401).
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId < 1) {
      throw new AppError(401, "Invalid or expired access token");
    }

    const user = await usersRepository.findById(userId);

    if (!user || user.status !== "active") {
      throw new AppError(401, "User is not active");
    }

    req.auth = {
      id: user.id,
      username: user.username,
      email: user.email,
      tokenId: payload.jti,
    };
    next();
  } catch (error) {
    sendError(res, error);
  }
}
EOF
```

## 18.2 `authorize` — modalidad JWT + RBAC

Recibe la petición, **normaliza** el `(method, path)` real y comprueba si el usuario autenticado alcanza ese recurso por el grafo:

```text
req.auth.user
  → role_users (active)
  → roles (active)
  → resource_roles (active)
  → resources (active, method = req.method, path ≈ req.path)
```

Si no hay concesión → **403** (`deny by default`). Como la consulta se hace **en cada petición**, revocar un permiso tiene **efecto inmediato** (no hay que esperar a que caduque el token, porque los permisos no viajan en él).

```bash
: > src/features/auth/access/authorize.middleware.ts
cat >> src/features/auth/access/authorize.middleware.ts << 'EOF'
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../shared/errors/app-error";
import { sendError } from "../../../shared/http/error-response";
import { isOperationGranted, normalizePath } from "../../../shared/auth/resource-match";
import { ResourceRolesRepository } from "../resource-roles/resource-roles.repository";

/**
 * **MODALIDAD 3 — RBAC (identidad + autorización granular).** Middleware de
 * autorización.
 *
 * Debe montarse **después** de `authenticate`. Responde a la segunda pregunta:
 * *¿puede esta identidad ejecutar `method + path`?*
 *
 * Cómo resuelve la decisión:
 *  1. Toma la identidad ya resuelta en `req.auth`.
 *  2. Consulta la **cadena completa** de autorización en la base de datos
 *     (`resource_roles → roles → role_users → resources`, todos los eslabones
 *     activos) para ese `user_id`.
 *  3. Compara el par `(method, path)` de la petición con las concesiones,
 *     por patrón (`/api/productos/:id` casa con `/api/productos/42`).
 *
 * Reglas:
 *  - **Deny by default**: sin concesión activa que cubra la operación -> 403.
 *  - **401** si no hay identidad (falta `authenticate` o el token no valió).
 *  - **403** si hay identidad válida pero no hay permiso.
 *
 * No recibe parámetros: el recurso y la acción se derivan de la propia petición.
 * Añadir un permiso es insertar filas en la base de datos, nunca tocar el código.
 */
const resourceRolesRepository = new ResourceRolesRepository();

export async function authorize(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      throw new AppError(401, "Authentication required");
    }

    const method = req.method.toUpperCase();
    const path = normalizePath(req.originalUrl);

    const granted = await resourceRolesRepository.findEffectiveForUser(req.auth.id);

    if (!isOperationGranted(granted, method, path)) {
      throw new AppError(403, `Forbidden: no grant for ${method} ${path}`);
    }

    next();
  } catch (error) {
    sendError(res, error);
  }
}
EOF
```

## 18.3 Barrel de acceso

```bash
: > src/features/auth/access/index.ts
cat >> src/features/auth/access/index.ts << 'EOF'
export * from "./authenticate.middleware";
export * from "./authorize.middleware";
EOF
```

## 18.4 PARCHE: las 5 rutas de negocio pasan a JWT + RBAC

El cambio es **quirúrgico**: se importa `authenticate, authorize` desde el barrel de auth y se insertan entre la ruta y el controller. Ni el contrato de la API ni las capas de negocio cambian.

```ts
import { authenticate, authorize } from "../../auth/access";
// ...
app.route("/api/clientes/:id").get(
  authenticate,
  authorize,
  this.clientsController.getOne.bind(this.clientsController)
);
```

**PARCHE** en `clients.routes.ts`:

```bash
: > src/features/business/clients/clients.routes.ts
cat >> src/features/business/clients/clients.routes.ts << 'EOF'
import { Application } from "express";
import { ClientsController } from "./clients.controller";
import { authenticate, authorize } from "../../auth/access";

/**
 * Rutas del feature Clients.
 *
 * **Modalidad 3 — JWT + RBAC**: `authenticate` resuelve la identidad (401 si no
 * hay token válido o el usuario está inactivo) y `authorize` decide sobre el par
 * `(method, path)` (403 si no hay concesión activa). El rol `SELLER` recibe solo
 * las lecturas; `ADMIN`, las 7 operaciones.
 */
export class ClientsRoutes {
  public clientsController: ClientsController = new ClientsController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/clientes")
      .get(authenticate, authorize, this.clientsController.getAll.bind(this.clientsController));

    // getOne
    app
      .route("/api/clientes/:id")
      .get(authenticate, authorize, this.clientsController.getOne.bind(this.clientsController));

    // create
    app
      .route("/api/clientes")
      .post(authenticate, authorize, this.clientsController.create.bind(this.clientsController));

    // update (PUT / PATCH)
    app
      .route("/api/clientes/:id")
      .put(authenticate, authorize, this.clientsController.updatePut.bind(this.clientsController))
      .patch(
        authenticate,
        authorize,
        this.clientsController.updatePatch.bind(this.clientsController)
      );

    // delete físico
    app
      .route("/api/clientes/:id")
      .delete(
        authenticate,
        authorize,
        this.clientsController.deletePhysical.bind(this.clientsController)
      );

    // delete lógico
    app
      .route("/api/clientes/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.clientsController.deleteLogical.bind(this.clientsController)
      );
  }
}
EOF
```

**PARCHE** en `product-types.routes.ts`:

```bash
: > src/features/business/product-types/product-types.routes.ts
cat >> src/features/business/product-types/product-types.routes.ts << 'EOF'
import { Application } from "express";
import { ProductTypesController } from "./product-types.controller";
import { authenticate, authorize } from "../../auth/access";

/**
 * Rutas del feature ProductTypes.
 *
 * **Modalidad 3 — JWT + RBAC.** Cada operación exige, en este orden:
 *  1. `authenticate` -> valida el access token y revalida que el usuario siga activo (401 si no);
 *  2. `authorize`    -> comprueba la concesión del par `(method, path)` en la matriz RBAC (403 si no);
 *  3. el handler del controller.
 *
 * El catálogo de recursos incluye estas 7 operaciones
 * (`/api/tipos-producto`, `/api/tipos-producto/:id`, ...): concederlas a un rol
 * no requiere tocar este archivo.
 */
export class ProductTypesRoutes {
  public productTypesController: ProductTypesController = new ProductTypesController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/tipos-producto")
      .get(
        authenticate,
        authorize,
        this.productTypesController.getAll.bind(this.productTypesController)
      );

    // getOne
    app
      .route("/api/tipos-producto/:id")
      .get(
        authenticate,
        authorize,
        this.productTypesController.getOne.bind(this.productTypesController)
      );

    // create
    app
      .route("/api/tipos-producto")
      .post(
        authenticate,
        authorize,
        this.productTypesController.create.bind(this.productTypesController)
      );

    // update (PUT / PATCH)
    app
      .route("/api/tipos-producto/:id")
      .put(
        authenticate,
        authorize,
        this.productTypesController.updatePut.bind(this.productTypesController)
      )
      .patch(
        authenticate,
        authorize,
        this.productTypesController.updatePatch.bind(this.productTypesController)
      );

    // delete físico
    app
      .route("/api/tipos-producto/:id")
      .delete(
        authenticate,
        authorize,
        this.productTypesController.deletePhysical.bind(this.productTypesController)
      );

    // delete lógico
    app
      .route("/api/tipos-producto/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.productTypesController.deleteLogical.bind(this.productTypesController)
      );
  }
}
EOF
```

**PARCHE** en `products.routes.ts`:

```bash
: > src/features/business/products/products.routes.ts
cat >> src/features/business/products/products.routes.ts << 'EOF'
import { Application } from "express";
import { ProductsController } from "./products.controller";
import { authenticate, authorize } from "../../auth/access";

/**
 * Rutas del feature Products.
 *
 * **Modalidad 3 — JWT + RBAC**: `authenticate` (401 si no hay identidad válida)
 * seguido de `authorize` (403 si la matriz no concede el par `(method, path)`).
 */
export class ProductsRoutes {
  public productsController: ProductsController = new ProductsController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/productos")
      .get(authenticate, authorize, this.productsController.getAll.bind(this.productsController));

    // getOne
    app
      .route("/api/productos/:id")
      .get(authenticate, authorize, this.productsController.getOne.bind(this.productsController));

    // create
    app
      .route("/api/productos")
      .post(authenticate, authorize, this.productsController.create.bind(this.productsController));

    // update (PUT / PATCH)
    app
      .route("/api/productos/:id")
      .put(authenticate, authorize, this.productsController.updatePut.bind(this.productsController))
      .patch(
        authenticate,
        authorize,
        this.productsController.updatePatch.bind(this.productsController)
      );

    // delete físico
    app
      .route("/api/productos/:id")
      .delete(
        authenticate,
        authorize,
        this.productsController.deletePhysical.bind(this.productsController)
      );

    // delete lógico
    app
      .route("/api/productos/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.productsController.deleteLogical.bind(this.productsController)
      );
  }
}
EOF
```

**PARCHE** en `sales.routes.ts`:

```bash
: > src/features/business/sales/sales.routes.ts
cat >> src/features/business/sales/sales.routes.ts << 'EOF'
import { Application } from "express";
import { SalesController } from "./sales.controller";
import { authenticate, authorize } from "../../auth/access";

/**
 * Rutas del feature Sales.
 *
 * **Modalidad 3 — JWT + RBAC**. El rol `SELLER` recibe las 3 concesiones de este
 * feature (`GET /api/ventas`, `GET /api/ventas/:id`, `POST /api/ventas`); el
 * resto de verbos quedan solo para `ADMIN`.
 */
export class SalesRoutes {
  public salesController: SalesController = new SalesController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/ventas")
      .get(authenticate, authorize, this.salesController.getAll.bind(this.salesController));

    // getOne
    app
      .route("/api/ventas/:id")
      .get(authenticate, authorize, this.salesController.getOne.bind(this.salesController));

    // create (registrar venta)
    app
      .route("/api/ventas")
      .post(authenticate, authorize, this.salesController.create.bind(this.salesController));

    // update (PUT / PATCH)
    app
      .route("/api/ventas/:id")
      .put(authenticate, authorize, this.salesController.updatePut.bind(this.salesController))
      .patch(authenticate, authorize, this.salesController.updatePatch.bind(this.salesController));

    // delete físico
    app
      .route("/api/ventas/:id")
      .delete(
        authenticate,
        authorize,
        this.salesController.deletePhysical.bind(this.salesController)
      );

    // delete lógico
    app
      .route("/api/ventas/:id/deactivate")
      .patch(authenticate, authorize, this.salesController.deleteLogical.bind(this.salesController));
  }
}
EOF
```

**PARCHE** en `product-sales.routes.ts`:

```bash
: > src/features/business/product-sales/product-sales.routes.ts
cat >> src/features/business/product-sales/product-sales.routes.ts << 'EOF'
import { Application } from "express";
import { ProductSalesController } from "./product-sales.controller";
import { authenticate, authorize } from "../../auth/access";

/**
 * Rutas del feature ProductSales (tabla `product_sales`).
 *
 * **Modalidad 3 — JWT + RBAC**. Solo `ADMIN` recibe la concesión de
 * `GET /api/detalle-ventas`; el detalle de una venta concreta se consulta a
 * través de `GET /api/ventas/:id` (que sí concede `SELLER`).
 */
export class ProductSalesRoutes {
  public productSalesController: ProductSalesController = new ProductSalesController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/detalle-ventas")
      .get(
        authenticate,
        authorize,
        this.productSalesController.getAll.bind(this.productSalesController)
      );

    // getOne
    app
      .route("/api/detalle-ventas/:id")
      .get(
        authenticate,
        authorize,
        this.productSalesController.getOne.bind(this.productSalesController)
      );

    // create
    app
      .route("/api/detalle-ventas")
      .post(
        authenticate,
        authorize,
        this.productSalesController.create.bind(this.productSalesController)
      );

    // update (PUT / PATCH)
    app
      .route("/api/detalle-ventas/:id")
      .put(
        authenticate,
        authorize,
        this.productSalesController.updatePut.bind(this.productSalesController)
      )
      .patch(
        authenticate,
        authorize,
        this.productSalesController.updatePatch.bind(this.productSalesController)
      );

    // delete físico
    app
      .route("/api/detalle-ventas/:id")
      .delete(
        authenticate,
        authorize,
        this.productSalesController.deletePhysical.bind(this.productSalesController)
      );

    // delete lógico
    app
      .route("/api/detalle-ventas/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.productSalesController.deleteLogical.bind(this.productSalesController)
      );
  }
}
EOF
```

## 18.5 Las tres modalidades en una tabla

| **Modalidad**  | **Middleware en la ruta** | **Qué exige**                                             | **Sin cumplir**                                   |
| :------------------- | :------------------------------ | :--------------------------------------------------------------- | :------------------------------------------------------ |
| **OPEN**       | —                              | nada                                                             | —                                                      |
| **JWT**        | `authenticate`                | access token válido y usuario activo                            | **401**                                           |
| **JWT + RBAC** | `authenticate, authorize`     | token válido**y** concesión activa de `(method, path)` | **401** (sin token) / **403** (sin permiso) |

| **Petición**                            | **Resultado**                            |
| :--------------------------------------------- | :--------------------------------------------- |
| `GET /api/clientes` sin `Authorization`    | 401                                            |
| `GET /api/clientes` con token de `seller`  | 200 (SELLER tiene esa lectura)                 |
| `POST /api/clientes` con token de `seller` | **403** (SELLER no tiene esa concesión) |
| `POST /api/clientes` con token de `admin`  | 201 (ADMIN tiene los 58)                       |
| `GET /api/clientes/abc` con token válido    | **400** (`paramId`)                    |
| Cualquier ruta con token caducado o manipulado | 401                                            |

## 18.6 Verificación de 401 y 403

```bash
npm run dev
```

```bash
# 401 — sin token
curl -i http://localhost:4000/api/clientes

# 401 — token manipulado
curl -i -H "Authorization: Bearer no.es.un.jwt" http://localhost:4000/api/clientes

# 200 — seller lee
TOKEN=$(curl -s -X POST http://localhost:4000/api/sesion/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"seller","password":"Seller123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).access_token")
curl -i -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/clientes

# 403 — seller intenta crear (no tiene la concesión)
curl -i -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"x","phone":"1","email":"x@x.com","password":"x"}' \
  http://localhost:4000/api/clientes
```

### DoD del ISS-13

- [ ] Todos los criterios de aceptación (18.1 … 18.6) cumplidos
- [ ] `GET /api/clientes` pasa de *SIN AUTH* a exigir token (**401** sin él)
- [ ] `POST /api/clientes` con `seller` → **403**; con `admin` → **201**
- [ ] Los controllers, services y repositories de Fase I **no** fueron modificados
- [ ] `npx tsc --noEmit` sin errores y `npm run dev` arranca

---

> **✅ GATE de la unidad ISS-13** — *este bloque no añade ningún criterio nuevo.*
>
> Las condiciones de cierre son exactamente las que define el ISS técnico de esta misma página:
>
> - 📋 **Criterios de aceptación** → [Criterios de aceptación](https://tecnogua.com/academic/site/backend2026/manual/15-ISS-13-auth-access/#criterios-de-aceptacion-iss-13-consolidados)
> - 🧩 **Cierre de la unidad** → [Cierre de la unidad](https://tecnogua.com/academic/site/backend2026/manual/15-ISS-13-auth-access/#dod-del-iss-13)
> - 🧠 **Autoevaluación** → [Evaluación del cuaderno](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-13-aprendizaje/#evaluacion)
>
> Con el GATE en verde queda habilitado **ISS-14 · Feature RefreshTokens (sesiones)**.
>
> **Navegación de la ruta:** **←** [ISS-13 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-13-aprendizaje/) · [↑ Ruta Express](https://tecnogua.com/academic/site/backend2026/) · **→** [ISS-14 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-14-aprendizaje/)
