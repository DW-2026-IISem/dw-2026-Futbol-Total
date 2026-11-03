# CIERRE-AUTH · Cierre Fase II — Auth con RBAC (backend completo)

## Fase II: Auth con RBAC — Cierre del laboratorio (backend completo)

> **Contexto mínimo (autosuficiente).** Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que hay que saber antes de ejecutarlo.
>
> - **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript + Sequelize, **arquitectura por features**.
> - **Alcance final:** Fase I (Business) **+** Fase II (Auth con RBAC). Todas las rutas de negocio pasan de *SIN AUTH* a **JWT + RBAC**.
> - **Recorrido obligatorio de una petición:** `HTTP → (middlewares) → Controller → Service → Repository → Model → Sequelize → BD`.
> - **Diseño de datos:** Fase I (§4–§11) y Fase II (§12–§22).
> - **Capas, convenciones y reglas transversales:** `00-contexto.md`.

| **Este cierre** | |
| :--- | :--- |
| **Título** | Cierre del laboratorio (backend completo con Auth + RBAC) |
| **Feature / tablas** | las 11 tablas |
| **API** | todas |
| **Depende de** | ISS-15 — Feature Session |
| **Habilita** | — |

## Contenido de este cierre

- Cableado final (`config`, `routes`, `swagger`, seeders)
- Las tres modalidades — mapa definitivo de rutas
- DoD del laboratorio
- Cómo repetir el patrón (otra entidad)
- Referencia rápida de paquetes
- Fuentes

---

**Objetivo:** dejar el backend **completo y funcional**: 12 features, 11 tablas, 3 modalidades, seguridad stateless con revocación inmediata, y todo verificable con TypeScript, seeders y Swagger.

## Cableado final

**`src/config/index.ts`** — arranque: modelos → asociaciones → rutas → Swagger.

```bash
: > src/config/index.ts
cat >> src/config/index.ts << 'EOF'
import dotenv from "dotenv";
import express, { Application, ErrorRequestHandler } from "express";
import morgan from "morgan";
var cors = require("cors");
import { sequelize, getDatabaseInfo, testConnection } from "../database/db";
import "../features/business/clients/client.model";
import "../features/business/product-types/product-type.model";
import "../features/business/products/product.model";
import "../features/business/sales/sale.model";
import "../features/business/product-sales/product-sale.model";
import "../features/business/products/products.associations";
import "../features/business/sales/sales.associations";
import "../features/business/product-sales/product-sales.associations";
// Fase II — Auth con RBAC: primero los seis modelos, después las asociaciones
// (las asociaciones referencian los modelos, no al revés).
import "../features/auth/users/user.model";
import "../features/auth/roles/role.model";
import "../features/auth/resources/resource.model";
import "../features/auth/role-users/role-user.model";
import "../features/auth/resource-roles/resource-role.model";
import "../features/auth/refresh-tokens/refresh-token.model";
import "../features/auth/rbac.associations";
import { Routes } from "../routes/index";
import { setupSwagger } from "../swagger/index";

dotenv.config();

export class App {
  public app: Application;
  public routePrv: Routes = new Routes();

  constructor(private port?: number | string) {
    this.app = express();
    this.settings();
    this.middlewares();
    this.routes();
    this.docs();
    this.errorHandling();
  }

  private settings(): void {
    this.app.set('port', this.port || process.env.PORT || 4000);
  }

  private middlewares(): void {
    this.app.use(morgan('dev'));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  private routes(): void {
    // Fase I — Business (cada operación, modalidad JWT + RBAC)
    this.routePrv.clientsRoutes.routes(this.app);
    this.routePrv.productTypesRoutes.routes(this.app);
    this.routePrv.productsRoutes.routes(this.app);
    this.routePrv.salesRoutes.routes(this.app);
    this.routePrv.productSalesRoutes.routes(this.app);

    // Fase II — Auth con RBAC
    // `sessionRoutes` registra los endpoints OPEN/JWT (login, refresh, logout,
    // perfil, permisos); el resto son modalidad JWT + RBAC.
    this.routePrv.sessionRoutes.routes(this.app);
    this.routePrv.refreshTokensRoutes.routes(this.app);
    this.routePrv.usersRoutes.routes(this.app);
    this.routePrv.rolesRoutes.routes(this.app);
    this.routePrv.resourcesRoutes.routes(this.app);
    this.routePrv.roleUsersRoutes.routes(this.app);
    this.routePrv.resourceRolesRoutes.routes(this.app);
  }

  private docs(): void {
    setupSwagger(this.app);
  }

  /**
   * Errores que ocurren **antes** de llegar a un controller o middleware.
   *
   * El caso típico es un cuerpo JSON malformado: `express.json()` lanza un
   * `SyntaxError` que, sin manejador, cae en el de Express por defecto y responde
   * 400 con un HTML que incluye el **stack trace y rutas absolutas del servidor**
   * (fuga de información). Aquí se traduce a un 400 JSON limpio.
   *
   * Debe registrarse **después** de las rutas: Express reconoce un middleware de
   * error por su aridad de 4 argumentos.
   */
  private errorHandling(): void {
    const bodyErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
      if (err instanceof SyntaxError && "body" in err) {
        res.status(400).json({ error: "Malformed JSON body" });
        return;
      }
      next(err);
    };
    this.app.use(bodyErrorHandler);
  }

  private async dbConnection(): Promise<void> {
    try {
      const dbInfo = getDatabaseInfo();
      console.log(`🔗 Intentando conectar a: ${dbInfo.engine.toUpperCase()}`);

      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error(`No se pudo conectar a la base de datos ${dbInfo.engine.toUpperCase()}`);
      }

      // Lab: sync crea/altera tablas desde los modelos (BD limpia → snake_case desde cero).
      const force = process.env.DB_SYNC_FORCE === "true";
      const isMysql =
        sequelize.getDialect() === "mysql" || sequelize.getDialect() === "mariadb";

      if (isMysql) {
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
      }
      try {
        await sequelize.sync({ force, alter: !force });
      } finally {
        if (isMysql) {
          await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
        }
      }

      console.log(
        force
          ? "📦 Base de datos recreada (DB_SYNC_FORCE=true)"
          : "📦 Base de datos sincronizada exitosamente"
      );
    } catch (error) {
      console.error("❌ Error al conectar con la base de datos:", error);
      process.exit(1);
    }
  }

  async listen() {
    // Orden de arranque: primero la BD (conexión + `sync`), después abrir el puerto.
    // Si se abre el puerto antes de terminar `sync({ alter: true })`, las sentencias
    // DDL (ALTER TABLE, DROP/ADD FOREIGN KEY) compiten con las peticiones que ya
    // están entrando y provocan deadlocks y errores de FK intermitentes.
    await this.dbConnection();
    await this.app.listen(this.app.get('port'));
    console.log(`🚀 Servidor ejecutándose en puerto ${this.app.get('port')}`);
  }
}
EOF
```

**`src/routes/index.ts`** — agregador de features (5 de negocio + 7 de auth). Cada feature decide su **modalidad de acceso** middleware a middleware.

```bash
: > src/routes/index.ts
cat >> src/routes/index.ts << 'EOF'
import { ClientsRoutes } from "../features/business/clients/clients.routes";
import { ProductTypesRoutes } from "../features/business/product-types/product-types.routes";
import { ProductsRoutes } from "../features/business/products/products.routes";
import { SalesRoutes } from "../features/business/sales/sales.routes";
import { ProductSalesRoutes } from "../features/business/product-sales/product-sales.routes";
import { SessionRoutes } from "../features/auth/session/session.routes";
import { RefreshTokensRoutes } from "../features/auth/refresh-tokens/refresh-tokens.routes";
import { UsersRoutes } from "../features/auth/users/users.routes";
import { RolesRoutes } from "../features/auth/roles/roles.routes";
import { ResourcesRoutes } from "../features/auth/resources/resources.routes";
import { RoleUsersRoutes } from "../features/auth/role-users/role-users.routes";
import { ResourceRolesRoutes } from "../features/auth/resource-roles/resource-roles.routes";

export class Routes {
  public clientsRoutes: ClientsRoutes = new ClientsRoutes();
  public productTypesRoutes: ProductTypesRoutes = new ProductTypesRoutes();
  public productsRoutes: ProductsRoutes = new ProductsRoutes();
  public salesRoutes: SalesRoutes = new SalesRoutes();
  public productSalesRoutes: ProductSalesRoutes = new ProductSalesRoutes();

  public sessionRoutes: SessionRoutes = new SessionRoutes();
  public refreshTokensRoutes: RefreshTokensRoutes = new RefreshTokensRoutes();
  public usersRoutes: UsersRoutes = new UsersRoutes();
  public rolesRoutes: RolesRoutes = new RolesRoutes();
  public resourcesRoutes: ResourcesRoutes = new ResourcesRoutes();
  public roleUsersRoutes: RoleUsersRoutes = new RoleUsersRoutes();
  public resourceRolesRoutes: ResourceRolesRoutes = new ResourceRolesRoutes();
}
EOF
```

**`src/swagger/index.ts`** — registry OpenAPI: fusiona 12 módulos, declara `bearerAuth` y fija la postura *secure by default*.

```bash
: > src/swagger/index.ts
cat >> src/swagger/index.ts << 'EOF'
import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import { clientsSwagger } from "../features/business/clients/clients.swagger";
import { productTypesSwagger } from "../features/business/product-types/product-types.swagger";
import { productsSwagger } from "../features/business/products/products.swagger";
import { salesSwagger } from "../features/business/sales/sales.swagger";
import { productSalesSwagger } from "../features/business/product-sales/product-sales.swagger";
import { sessionSwagger } from "../features/auth/session/session.swagger";
import { refreshTokensSwagger } from "../features/auth/refresh-tokens/refresh-tokens.swagger";
import { usersSwagger } from "../features/auth/users/users.swagger";
import { rolesSwagger } from "../features/auth/roles/roles.swagger";
import { resourcesSwagger } from "../features/auth/resources/resources.swagger";
import { roleUsersSwagger } from "../features/auth/role-users/role-users.swagger";
import { resourceRolesSwagger } from "../features/auth/resource-roles/resource-roles.swagger";
import { bearerSecurityScheme } from "../shared/http/swagger-security";
import { unauthorizedResponse, forbiddenResponse } from "../shared/http/swagger-security";

export type FeatureSwaggerModule = {
  tags: unknown[];
  paths: Record<string, unknown>;
  components?: { schemas?: Record<string, unknown> };
};

const featureSwaggerModules: FeatureSwaggerModule[] = [
  sessionSwagger,
  refreshTokensSwagger,
  usersSwagger,
  rolesSwagger,
  resourcesSwagger,
  roleUsersSwagger,
  resourceRolesSwagger,
  clientsSwagger,
  productTypesSwagger,
  productsSwagger,
  salesSwagger,
  productSalesSwagger,
];

export function buildOpenApiDocument() {
  const tags: unknown[] = [];
  const paths: Record<string, unknown> = {};
  const schemas: Record<string, unknown> = {};

  for (const mod of featureSwaggerModules) {
    tags.push(...mod.tags);
    Object.assign(paths, mod.paths);
    if (mod.components?.schemas) {
      Object.assign(schemas, mod.components.schemas);
    }
  }

  return {
    openapi: "3.0.3",
    info: {
      title: "StoreLab API",
      version: "2.0.0",
      description: [
        "API StoreLab (Express + Sequelize) con **Auth con RBAC**.",
        "",
        "**Las tres modalidades de acceso** (se declaran por operación, no globalmente):",
        "",
        "- **OPEN** — sin identidad previa: `POST /api/sesion/login`, `/refresh`, `/logout`.",
        "- **JWT** — token de acceso válido: `/api/sesion/perfil`, `/api/permisos`, `/api/sesiones/*`.",
        "- **JWT + RBAC** — token válido **y** concesión activa de `(method, path)`: todo el CRUD de negocio y de administración de seguridad.",
        "",
        "Autenticación: obtener el `access_token` en `POST /api/sesion/login` y pulsar **Authorize** con " +
          "`Bearer <access_token>`. La autorización aplica **deny by default**: sin concesión explícita, 403.",
        "",
        "Credenciales de laboratorio: `admin / Admin123!` y `seller / Seller123!`.",
      ].join("\n"),
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: "Local",
      },
    ],
    tags,
    paths,
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: bearerSecurityScheme,
      responses: {
        Unauthorized: unauthorizedResponse,
        Forbidden: forbiddenResponse,
      },
      schemas,
    },
  };
}

export function setupSwagger(app: Application): void {
  const document = buildOpenApiDocument();
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(document));
  app.get("/api/docs.json", (_req, res) => {
    res.json(document);
  });
  console.log("📘 Swagger UI: /api/docs  |  OpenAPI JSON: /api/docs.json");
}
EOF
```

**`src/database/seeders/index.ts`** — `SeedersRunner`: seguridad primero y después negocio.

```bash
: > src/database/seeders/index.ts
cat >> src/database/seeders/index.ts << 'EOF'
import dotenv from "dotenv";
import { sequelize, testConnection } from "../db";
import "../../features/business/clients/client.model";
import "../../features/business/product-types/product-type.model";
import "../../features/business/products/product.model";
import "../../features/business/sales/sale.model";
import "../../features/business/product-sales/product-sale.model";
import "../../features/business/products/products.associations";
import "../../features/business/sales/sales.associations";
import "../../features/business/product-sales/product-sales.associations";
import "../../features/auth/users/user.model";
import "../../features/auth/roles/role.model";
import "../../features/auth/resources/resource.model";
import "../../features/auth/role-users/role-user.model";
import "../../features/auth/resource-roles/resource-role.model";
import "../../features/auth/refresh-tokens/refresh-token.model";
import "../../features/auth/rbac.associations";
import { seedRoles } from "../../features/auth/roles/roles.seeder";
import { seedResources } from "../../features/auth/resources/resources.seeder";
import { seedUsers } from "../../features/auth/users/users.seeder";
import { seedRoleUsers } from "../../features/auth/role-users/role-users.seeder";
import { seedResourceRoles } from "../../features/auth/resource-roles/resource-roles.seeder";
import { seedClients } from "../../features/business/clients/clients.seeder";
import { seedProductTypes } from "../../features/business/product-types/product-types.seeder";
import { seedProducts } from "../../features/business/products/products.seeder";
import { seedSales } from "../../features/business/sales/sales.seeder";
import { seedProductSales } from "../../features/business/product-sales/product-sales.seeder";
import { resolveSeedCounts } from "./counts";

dotenv.config();

export async function runAllSeeders(): Promise<void> {
  const counts = resolveSeedCounts();
  console.log("🌱 Iniciando SeedersRunner...");
  console.log("📊 Conteos:", counts);

  const ok = await testConnection();
  if (!ok) {
    throw new Error("No hay conexión a la base de datos");
  }

  const isMysql =
    sequelize.getDialect() === "mysql" || sequelize.getDialect() === "mariadb";
  if (isMysql) {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
  }
  try {
    await sequelize.sync({ force: false, alter: true });
  } finally {
    if (isMysql) {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    }
  }

  await seedRoles();
  await seedResources();
  await seedUsers(counts.users);
  await seedRoleUsers();
  await seedResourceRoles();

  await seedClients(counts.clients);
  await seedProductTypes(counts.product_types);
  await seedProducts(counts.products);
  await seedSales(counts.sales);
  await seedProductSales(counts.product_sales);

  console.log("🌱 SeedersRunner finalizado");
}

if (require.main === module) {
  runAllSeeders()
    .then(async () => {
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("❌ Error en seeders:", err);
      await sequelize.close();
      process.exit(1);
    });
}
EOF
```

**`src/database/seeders/counts.ts`** — cantidades variables.

```typescript
/**
 * Cantidad de registros por tabla (snake_case = nombre de tabla BD).
 * Prioridad: CLI (--clients=N) > env (SEED_CLIENTS) > default de este archivo.
 */
export type SeedCounts = {
  users: number;
  clients: number;
  product_types: number;
  products: number;
  sales: number;
  product_sales: number;
};

export const DEFAULT_SEED_COUNTS: SeedCounts = {
  users: 2,
  clients: 10,
  product_types: 25,
  products: 15,
  sales: 5,
  product_sales: 12,
};

export function resolveSeedCounts(argv: string[] = process.argv.slice(2)): SeedCounts {
  const counts: SeedCounts = { ...DEFAULT_SEED_COUNTS };

  const envMap: Array<[keyof SeedCounts, string | undefined]> = [
    ["users", process.env.SEED_USERS],
    ["clients", process.env.SEED_CLIENTS],
    ["product_types", process.env.SEED_PRODUCT_TYPES],
    ["products", process.env.SEED_PRODUCTS],
    ["sales", process.env.SEED_SALES],
    ["product_sales", process.env.SEED_PRODUCT_SALES],
  ];
  for (const [key, value] of envMap) {
    if (value !== undefined && value !== "") {
      counts[key] = Number(value);
    }
  }

  for (const arg of argv) {
    const m = arg.match(/^--([a-zA-Z_]+)=(\d+)$/);
    if (!m) continue;
    const key = m[1] as keyof SeedCounts;
    const value = Number(m[2]);
    if (key in counts) {
      counts[key] = value;
    }
  }

  return counts;
}
```

## Las tres modalidades — mapa definitivo de rutas

| **Modalidad** | **Middlewares** | **Rutas** |
| :--- | :--- | :--- |
| **OPEN** | — | `POST /api/sesion/login` · `/refresh` · `/logout` · `GET /api/docs` · `/api/docs.json` |
| **JWT** | `authenticate` | `GET /api/sesion/perfil` · `/api/permisos` · `GET /api/sesiones` · `/:id` · `PATCH /api/sesiones/:id/deactivate` · `/deactivate-all` · `DELETE /api/sesiones` |
| **JWT + RBAC** | `authenticate, authorize` | `/api/usuarios…` · `/api/roles…` · `/api/recursos…` · `/api/asignaciones-rol…` · `/api/concesiones-rol…` · `/api/clientes…` · `/api/tipos-producto…` · `/api/productos…` · `/api/ventas…` · `/api/detalle-ventas…` |

### Alta de un permiso en caliente

```text
1. POST /api/recursos            { method, path, description }   → alta del punto de acceso
2. POST /api/concesiones-rol     { role_id, resource_id }        → concesión a un rol
3. GET  /api/roles/:id/... (o GET /api/concesiones-rol?role_id=) → verificación
```

El efecto es **inmediato**: `authorize` consulta la matriz en cada petición y no cachea.

## Estructura final

```text
src/
├── config/index.ts
├── database/seeders/{counts,index}.ts
├── routes/index.ts
├── shared/
│   ├── auth/{password,jwt,resource-match,auth-user}.ts
│   ├── http/{base-controller,error-response,swagger-security}.ts
│   ├── database/with-transaction.ts
│   └── errors/app-error.ts
├── features/
│   ├── business/
│   │   ├── clients/ product-types/ products/ sales/ product-sales/
│   │   └── (cada feature: model, dto/, repository, service, controller, routes, seeder, swagger, http/)
│   └── auth/
│       ├── access/{authenticate,authorize}.middleware.ts
│       ├── rbac.associations.ts
│       ├── users/ roles/ resources/ role-users/ resource-roles/ refresh-tokens/ session/
│       └── (cada feature: dto/, repository, service, controller, routes, ...[.seeder,.swagger], http/)
├── swagger/index.ts
└── server.ts
```

## DoD del laboratorio (Fase I + Fase II)

- [ ] **12 features** (5 business + 7 auth), cada uno con sus capas `controller → service → repository → model`
- [ ] **11 tablas**: `clients`, `product_types`, `products`, `sales`, `product_sales`, `users`, `roles`, `resources`, `role_users`, `resource_roles`, `refresh_tokens`
- [ ] **3 modalidades** aplicadas por ruta: OPEN, JWT, JWT + RBAC
- [ ] **No** existe entidad `Permission`; el permiso es `resource_roles (role_id, resource_id)`
- [ ] `deny by default`: sin concesión activa → **403**
- [ ] Access token **corto** (HS256, `iss`/`aud`/`exp`/`jti`), refresh token **opaco, hasheado, rotativo y revocable**
- [ ] `role_users` y `resource_roles` soportan **asignar / retirar / reactivar** y `reconcileRole`
- [ ] Seeders deterministas: 2 roles, 58 recursos, 2 usuarios, 2 asignaciones, **65** concesiones
- [ ] Swagger `/api/docs` con `bearerAuth`, 401/403 y las 3 modalidades por operación
- [ ] `npx tsc --noEmit` OK
- [ ] Smoke test E2E de las tres modalidades en verde

## Cómo repetir el patrón (otra entidad)

```text
ISS-n-A    modelo + DTO + esqueletos repository/service/controller/routes + cableado
ISS-n-B…E  CRUD en orden: getAll, getOne, create, update PUT/PATCH, delete físico/lógico
           (cada paso toca las 3 capas: repository -> service -> controller) + http
ISS-n-F    seeder + PARCHE counts/runner
ISS-n-G    swagger + PARCHE registry
ISS-n-R    si hay FK `tabla_singular_id`: associations.ts + PARCHE config
ISS-n-S    si el recurso debe protegerse: alta en `resource-catalog.ts` + concesión por rol
```

> Regla de oro del lab: `routes -> controller -> service -> repository -> model`. Ninguna capa se salta a la siguiente ni consulta el modelo directamente. El **DTO** es el contrato que cruza `routes`/`controller`/`service`; el `repository` y el `model` no lo conocen.

## Referencia rápida de paquetes

```bash
npm install express@^5.2.1 cors@^2.8.6 dotenv@^17.4.2 morgan@^1.12.1 \
  sequelize@^6.37.8 mysql2@^3.24.4 pg@^8.23.0 pg-hstore@^2.3.4 \
  tedious@^20.0.0 oracledb@^7.0.1 bcryptjs@^3.0.3 \
  jsonwebtoken@^9.0.3 swagger-ui-express@^5.0.1

npm install -D typescript@~5.9.2 ts-node@^10.9.2 nodemon@^3.1.14 \
  @types/node@^22.20.4 @types/express@^5.0.6 \
  @types/cors@^2.8.19 @types/morgan@^1.9.10 \
  @types/sequelize@^6.12.0 @types/bcryptjs@^3.0.0 \
  @types/jsonwebtoken@^9.0.10 @types/swagger-ui-express@^4.1.8 \
  @faker-js/faker@^10.6.0
```

## Fuentes

- **Este manual** es la única guía de construcción (ISS, `cat >>`, **PARCHE**).
- `bd-storelab.md` — **solo consulta**: entidades y campos (Fase I y Fase II).
- RFC 7519 — JSON Web Token
- RFC 8725 — JWT Best Current Practices
- RFC 6749 — OAuth 2.0 · RFC 6750 — Bearer Token Usage
- OWASP — Authentication Cheat Sheet · Session Management · Authorization
- NIST SP 800-63B — Digital Identity Guidelines
- Express — Middleware

---

> **✅ GATE de la unidad CIERRE-AUTH** — *este bloque no añade ningún criterio nuevo.*
>
> Las condiciones de cierre son exactamente las que define el ISS técnico de esta misma página:
>
> - 📋 **DoD del laboratorio** → DoD del laboratorio
> - 🧠 **Autoevaluación** → Evaluación del cuaderno
>
> Con el GATE en verde queda cerrado el **laboratorio completo (Fase I + Fase II)**.
