# 🛠 Unidad ISS-01 · Esqueleto del proyecto — capa 🛠 CONSTRUIR

> **🛠 Unidad ISS-01 · Esqueleto del proyecto** — capa **🛠 CONSTRUIR**
>
> [🧠 Comprender este bloque →](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-01-aprendizaje/) · [📝 Evaluación](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-01-aprendizaje/#evaluacion) · [✅ GATE de la unidad](https://tecnogua.com/academic/site/backend2026/manual/02-ISS-01-esqueleto-proyecto/#criterios-de-aceptacion-iss-01-consolidados)
>
> | **Capa**         | **Página**                                                                                                                                               | **Para qué**                             |
> | :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------- |
> | 🧠 **Aprender**  | [Esqueleto del proyecto](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-01-aprendizaje/)                                                 | comprender, explicar y relacionar        |
> | 🛠 **Construir** | esta página                                                                                                                                              | ejecutar, programar y verificar          |
> | ✅ **GATE**       | [Condiciones de cierre](https://tecnogua.com/academic/site/backend2026/manual/02-ISS-01-esqueleto-proyecto/#criterios-de-aceptacion-iss-01-consolidados) | condición para pasar al bloque siguiente |
>
> **Esta es la guía ejecutable.** Sigue los pasos en orden. El cuerpo de abajo es el **ISS técnico verbatim**: comandos, rutas, versiones, PARCHEs, verificaciones y criterios, sin simplificar ni modernizar.

---

# Fase I: Business — ISS-01 — Esqueleto del proyecto

> **Contexto mínimo (autosuficiente).** Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que hay que saber antes de ejecutarlo.
>
> - **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript + Sequelize, **arquitectura por features**, Fase I **solo Business** (sin auth ni roles).
> - **Recorrido obligatorio de una petición:** `HTTP → Controller → Service → Repository → Model → Sequelize → BD`. Ninguna capa se salta a la siguiente.
> - **Diseño de datos** (columnas, tipos, FK `RESTRICT`, índices, transacciones): [`../bd-storelab.md`](https://tecnogua.com/academic/site/backend2026/bd-storelab/), **Fase I — Business**.
> - **Capas, convenciones y reglas transversales:** [`00-contexto.md`](https://tecnogua.com/academic/site/backend2026/manual/00-contexto/).
>
> | **Este ISS**        |                                                                                                                                  |
> | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
> | **Título**          | Esqueleto del proyecto                                                                                                           |
> | **Feature / tabla** | estructura `src/`                                                                                                                |
> | **API**             | servidor HTTP base                                                                                                               |
> | **Depende de**      | [ISS-00 — Requisitos previos](https://tecnogua.com/academic/site/backend2026/manual/01-ISS-00-requisitos/)                       |
> | **Habilita**        | [ISS-02 — Infraestructura de base de datos](https://tecnogua.com/academic/site/backend2026/manual/03-ISS-02-infraestructura-bd/) |

## Contenido de este ISS

- 2.1 Inicializar npm y scripts
- 2.2 Estructura de carpetas (features)
- 2.3 Dependencias base (Express + TypeScript)
- 2.4 TypeScript (`tsconfig.json`)
- 2.5 Servidor y App (esqueleto HTTP)

---

**Objetivo:** proyecto npm + TypeScript + Express con estructura `features/` y servidor HTTP base.  
**Bloqueado por:** [ISS-00](https://tecnogua.com/academic/site/backend2026/manual/01-ISS-00-requisitos/).

### Criterios de aceptación (ISS-01) — consolidados

- [ ] **2.1** Existe `package.json` con `"type": "commonjs"` y scripts `build` / `dev`
- [ ] **2.2** Árbol `src/` con `config`, `database/seeders`, `routes`, `shared`, `features/business/clients` (auth **fuera de alcance** de este lab)
- [ ] **2.3** Dependencias Express/TS instaladas (`npm ls --depth=0`)
- [ ] **2.4** Existe `tsconfig.json` (`rootDir: ./src`, `outDir: ./dist`, `strict: true`)
- [ ] **2.5** Existen `src/server.ts` y `src/config/index.ts` (esqueleto App)
- [ ] `npx tsc --noEmit` sin errores al cerrar el ISS

---

## 2.1 Inicializar npm y scripts

**Criterios de este sub-ítem**

- [ ] `package.json` creado
- [ ] Scripts `build` y `dev` definidos

```bash
mkdir app-storelab-express
cd app-storelab-express
npm init -y
mkdir -p docs
```

**PARCHE** — `package.json` **ya existe** (lo creó `npm init -y`).

- **Dentro de** `"scripts"`: deja solo (o añade) `build` y `dev` como abajo.
- **Debajo de** `"license"` (o al mismo nivel que `"scripts"`): asegúrate de `"type": "commonjs"`.

Estado esperado de esas claves:

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "nodemon --watch src --ext ts --exec ts-node -- src/server.ts"
  },
  "type": "commonjs"
}
```

```bash
node -e "const p=require('./package.json'); console.log(p.scripts)"
```

---

## 2.2 Estructura de carpetas (features)

**Criterios de este sub-ítem**

- [ ] Carpetas de infra y features creadas según el árbol

```bash
mkdir -p \
  src/config \
  src/database/seeders \
  src/routes \
  src/shared/errors \
  src/shared/http \
  src/shared/database \
  src/features/business/clients
```

```text
src/
├── config/
├── database/
│   └── seeders/          # solo carpeta (ISS-02 §3.3); runner en ISS-04
├── routes/
├── shared/               # reutilizable por todos los features (ISS-03-A §4.0)
│   ├── database/         # with-transaction.ts (unit of work)
│   ├── errors/           # app-error.ts
│   └── http/             # base-controller.ts
├── features/
│   └── business/
│       └── clients/      # más features en ISS-06…08; capas en ISS-03-A §4.0
└── server.ts             # §2.5
```

| **Carpeta**                   | **Uso**                                                                                                           |
| :---------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| `features/business/<plural>/` | **feature por capas**: model + repository + service + controller + routes (+ seeder, swagger, http, associations) |
| `shared/`                     | utilidades transversales (`AppError`, `BaseController`, `withTransaction`)                                        |
| `database/seeders/`           | counts + SeedersRunner (`npm run db:seed`)                                                                        |
| `routes/index.ts`             | Agregador de features                                                                                             |
| `config/` · `database/`       | Arranque e infraestructura                                                                                        |

**Capas de un feature — flujo obligatorio (detalle en ISS-03-A §4.0)**

```text
HTTP (routes) -> Controller -> Service -> Repository -> Model -> Sequelize -> BD
```

| **Capa**   | **Archivo (plural)**              | **Responsabilidad**                                       |
| :--------- | :-------------------------------- | :-------------------------------------------------------- |
| Controller | `<plural>.controller.ts`          | HTTP: `req`/`res`, status codes                           |
| Service    | `<plural>.service.ts`             | reglas de negocio y transacciones                         |
| Repository | `<plural>.repository.ts`          | acceso a datos (Sequelize)                                |
| DTO        | `dto/` (un archivo por operación) | contrato de entrada/salida (Create/Update/Patch/Response) |
| Model      | `<singular>.model.ts`             | entidad/tabla (atributos, hooks)                          |

**Seeders (patrón del lab)**

| **Pieza**       | **Dónde**                                                    |
| :-------------- | :----------------------------------------------------------- |
| Por entidad     | `src/features/business/<plural>/<plural>.seeder.ts`          |
| Runner + counts | `src/database/seeders/{index,counts}.ts` → `npm run db:seed` |
| Datos falsos    | `@faker-js/faker`                                            |

```bash
find src -type d | sort
```

---

## 2.3 Dependencias base (Express + TypeScript)

**Criterios de este sub-ítem**

- [ ] `express`, `cors`, `dotenv`, `morgan` instalados
- [ ] `typescript`, `ts-node`, `nodemon`, `@types/*` instalados

```bash
npm install express@^5.2.1 cors@^2.8.6 dotenv@^17.4.2 morgan@^1.12.1

npm install -D typescript@~5.9.2 ts-node@^10.9.2 nodemon@^3.1.14 \
  @types/node@^22.20.3 @types/express@^5.0.6 \
  @types/cors@^2.8.19 @types/morgan@^1.9.10
```

> TypeScript en **5.9.x** por compatibilidad con `ts-node`.

```bash
npm ls --depth=0
```

---

## 2.4 TypeScript (`tsconfig.json`)

**Criterios de este sub-ítem**

- [ ] `tsconfig.json` con `rootDir: ./src`, `outDir: ./dist`, `strict: true`

```bash
: > tsconfig.json
cat >> tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "commonjs",
    "target": "ES2020",
    "lib": ["ES2020"],
    "types": ["node"],
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "strict": true,
    "skipLibCheck": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

```bash
test -f tsconfig.json && npx tsc --showConfig | head -20
```

---

## 2.5 Servidor y App (esqueleto HTTP)

**Criterios de este sub-ítem**

- [ ] Existen `src/server.ts` y `src/config/index.ts`
- [ ] `App` define `settings`, `middlewares`, `routes`, `dbConnection`, `listen` (placeholders OK)

### 2.5.1 `src/server.ts`

```bash
: > src/server.ts
cat >> src/server.ts << 'EOF'
import { App } from './config/index';

async function main() {
    const app = new App();
    await app.listen();
}

main();
EOF
```

### 2.5.2 `src/config/index.ts` (esqueleto)

> En ISS-01 el App es **esqueleto**. Los imports de modelos, associations, Routes, Swagger y el `sync` completo se añaden con **PARCHE** en ISS-02…08. El archivo **final** consolidado aparece en [ISS-08](https://tecnogua.com/academic/site/backend2026/manual/09-ISS-08-sale-product-sale/).

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

### Verificación del ISS-01

```bash
npx tsc --noEmit
find src -type f | sort
```

### Cierre del ISS

```bash
npm run dev
```

> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de continuar.

---

> **✅ GATE de la unidad ISS-01** — *este bloque no añade ningún criterio nuevo.*
>
> Las condiciones de cierre son exactamente las que define el ISS técnico de esta misma página:
>
> - 📋 **Criterios de aceptación** → [Criterios de aceptación](https://tecnogua.com/academic/site/backend2026/manual/02-ISS-01-esqueleto-proyecto/#criterios-de-aceptacion-iss-01-consolidados)
> - 🧩 **Cierre de la unidad** → [Cierre de la unidad](https://tecnogua.com/academic/site/backend2026/manual/02-ISS-01-esqueleto-proyecto/#cierre-del-iss)
> - 🧠 **Autoevaluación** → [Evaluación del cuaderno](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-01-aprendizaje/#evaluacion)
>
> Con el GATE en verde queda habilitado **ISS-02 · Infraestructura de base de datos**.
>
> **Navegación de la ruta:** **←** [ISS-01 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-01-aprendizaje/) · [↑ Ruta Express](https://tecnogua.com/academic/site/backend2026/) · **→** [ISS-02 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-02-aprendizaje/)
