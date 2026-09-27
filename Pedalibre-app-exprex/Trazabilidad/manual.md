# Manual — app-storelab-express

Guía **única y autosuficiente** por **Issues (ISS-X)** verificables.
Express 5 + TypeScript + Sequelize, arquitectura por **features**.

> **Alcance de este laboratorio:** backend **business completo**
> (Client, ProductType, Product, Sale, ProductSale) **sin autenticación ni autorización**.
> Todas las rutas quedan **SIN AUTH**. Este archivo contiene **todos** los pasos
> (`cat >>` / **PARCHE**); no hace falta ningún otro `.md` para construir el backend.
>
> Cada **ISS** es un incremento comprobable. Los **sub-ítems** (`X.1`, `X.2`, …) son pasos técnicos.
> Versiones = `package.json` del repo.

### Convención de escritura en este manual

| Caso | Cómo se indica |
|------|----------------|
| **Archivo nuevo** | Siempre con `: > ruta` + `cat >> ruta << 'EOF'` … `EOF` (no basta con “crear el archivo”) |
| **Archivo ya existe** | Señalado como **PARCHE**. Indica **qué añadir/cambiar** y el ancla: **debajo de …** / **encima de …** / **dentro de …** / **reemplazar …** |
| **npm / carpetas** | Comandos `npm install`, `mkdir -p`, etc. |
| **Cierre de ISS** | Desde **ISS-01**, el último paso del ISS es `npm run dev` (el servidor debe arrancar). ISS-00 aún no tiene app. |

---

## Cómo usar este manual

| Concepto | Significado |
|----------|-------------|
| **ISS-X** | Unidad de trabajo con entrega demostrable |
| **Sub-ítem X.Y** | Paso dentro del ISS (npm, carpetas, archivo, parche…) |
| **DoR** | Listo para empezar el ISS |
| **DoD** | Listo para cerrar el ISS (todos los sub-ítems + verificación global) |
| **Bloqueado por** | ISS previos que deben estar Done |

### Definition of Ready (DoR)

- [ ] Leíste el objetivo y los **criterios de aceptación del ISS** (incluye todos los sub-ítems)
- [ ] Los ISS bloqueadores están cerrados
- [ ] Tienes herramientas / `.env` que el ISS pide
- [ ] Sabes cómo verificar el resultado final del ISS

### Definition of Done (DoD)

- [ ] **Todos** los criterios de aceptación del ISS (lista consolidada) cumplidos
- [ ] Código/carpetas en las rutas indicadas
- [ ] `npx tsc --noEmit` OK si hubo TypeScript
- [ ] Verificación global del ISS ejecutada
- [ ] Desde **ISS-01**: `npm run dev` arranca el servidor sin error (cierre del ISS)
- [ ] Evidencia alineada con lo construido

### Mapa

```text
1. ISS-00     Requisitos previos
2. ISS-01     Esqueleto del proyecto           (2.1 … 2.5)
3. ISS-02     Infraestructura de BD            (3.1 … 3.3)
4. ISS-03-A   Feature Client — fundación
5. ISS-03-B   Feature Client — GetAll / GetOne
6. ISS-03-C   Feature Client — Crear
7. ISS-03-D   Feature Client — Update PUT/PATCH
8. ISS-03-E   Feature Client — Delete físico / lógico
9. ISS-04     Seeders Faker (feature + runner) (9.1 … 9.2)
10. ISS-05    Swagger OpenAPI (feature + registry) → `/api/docs`
11. ISS-06    Feature ProductType              (11.1 … 11.6)
12. ISS-07    Feature Product + relación       (12.1 … 12.6 / 12.5 R)
13. ISS-08    Feature Sale + feature ProductSale + R (13.1 … 13.7)
14.           Estructura final del repo + verificación global
15.           Referencia de paquetes
```

```text
ISS-00 → … → ISS-05 → ISS-06 → ISS-07 (+R) → ISS-08 (+R) → DONE (business SIN AUTH)
```

| ISS | Entrega verificable (cierre) |
|-----|------------------------------|
| **00** | Node/npm/BD disponibles |
| **01** | App TypeScript arrancable |
| **02** | Sequelize + `.env` + carpeta `seeders/` |
| **03-A…E** | Client CRUD + http (**SIN AUTH**) |
| **04** | Seeder Client + SeedersRunner |
| **05** | Swagger UI `/api/docs` |
| **06** | ProductType CRUD + seeder + swagger `/api/tipos-producto` |
| **07** | Product CRUD + **relación** ProductType↔Product `/api/productos` |
| **08** | Sale + **feature ProductSale** + relaciones; `/api/ventas` + `/api/detalle-ventas` |

### Entidades / tablas cubiertas por ISS (business)

| Tabla BD | Clase | Feature | ISS | API |
|----------|-------|---------|-----|-----|
| `clients` | Client | `client/` | ISS-03-A…E (+04 seeder, +05 swagger) | `/api/clientes` |
| `product_types` | ProductType | `product-type/` | ISS-06 | `/api/tipos-producto` |
| `products` | Product | `product/` | ISS-07 (+R) | `/api/productos` |
| `sales` | Sale | `sale/` | ISS-08 | `/api/ventas` |
| `product_sales` | ProductSale | `product-sale/` | ISS-08 | `/api/detalle-ventas` |

Todas las tablas: `id` + `status` (`active`\|`inactive`) + `timestamps`. FKs y columnas en **snake_case**.

# 1. ISS-00 — Requisitos previos

**Objetivo:** entorno listo para el laboratorio.  
**Bloqueado por:** ninguno.

### Criterios de aceptación (ISS-00)

- [ ] `node -v` muestra v20+ (lab: v24.x)
- [ ] `npm -v` responde
- [ ] Motor de BD accesible (MySQL recomendado para el primer `sync`)

### Pasos

```bash
node -v
npm -v
```

### Verificación del ISS

```bash
node -v && npm -v
```

---

# 2. ISS-01 — Esqueleto del proyecto

**Objetivo:** proyecto npm + TypeScript + Express con estructura `features/` y servidor HTTP base.  
**Bloqueado por:** ISS-00.

### Criterios de aceptación (ISS-01) — consolidados

- [ ] **2.1** Existe `package.json` con `"type": "commonjs"` y scripts `build` / `dev`
- [ ] **2.2** Árbol `src/` con `config`, `database/seeders`, `routes`, `features/business/client` (auth **fuera de alcance** de este lab)
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
  src/features/business/client
```

```text
src/
├── config/
├── database/
│   └── seeders/          # solo carpeta (ISS-02 §3.3); runner en ISS-04
├── routes/
├── features/
│   └── business/
│       └── client/       # más features en ISS-06…08
└── server.ts             # §2.5
```

| Carpeta | Uso |
|---------|-----|
| `features/business/<entidad>/` | model + controller + routes (+ seeder, swagger, http, associations) |
| `database/seeders/` | counts + SeedersRunner (`npm run db:seed`) |
| `routes/index.ts` | Agregador de features |
| `config/` · `database/` | Arranque e infraestructura |

**Seeders (patrón del lab)**

| Pieza | Dónde |
|-------|-------|
| Por entidad | `src/features/business/<entidad>/<entidad>.seeder.ts` |
| Runner + counts | `src/database/seeders/{index,counts}.ts` → `npm run db:seed` |
| Datos falsos | `@faker-js/faker` |

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

> En ISS-01 el App es **esqueleto**. Los imports de modelos, associations, Routes,
> Swagger y el `sync` completo se añaden con **PARCHE** en ISS-02…08.
> El archivo **final** consolidado aparece al cierre de ISS-08.

```bash
: > src/config/index.ts
cat >> src/config/index.ts << 'EOF'
import dotenv from "dotenv";
import express, { Application } from "express";
import morgan from "morgan";
var cors = require("cors");

dotenv.config();

export class App {
  public app: Application;

  constructor(private port?: number | string) {
    this.app = express();
    this.settings();
    this.middlewares();
    this.routes();
    this.dbConnection();
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
    // ISS-03 §4.3
  }

  private async dbConnection(): Promise<void> {
    // ISS-02 / ISS-03
  }

  async listen() {
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

# 3. ISS-02 — Infraestructura de base de datos

**Objetivo:** drivers + `.env` + módulo Sequelize + carpeta `seeders/`.  
**Bloqueado por:** ISS-01.

### Criterios de aceptación (ISS-02) — consolidados

- [ ] **3.1** Paquetes Sequelize/drivers instalados; existe `.env` con `DB_ENGINE` y bloques de motores
- [ ] **3.2** Existe `src/database/db.ts` exportando `sequelize`, `getDatabaseInfo`, `testConnection`
- [ ] **3.3** Existe carpeta `src/database/seeders/` **sin** lógica implementada aún
- [ ] `npx tsc --noEmit` OK

---

## 3.1 Drivers Sequelize y `.env`

**Criterios de este sub-ítem**

- [ ] `sequelize`, `mysql2`, `pg`, `pg-hstore`, `tedious`, `oracledb` instalados
- [ ] `.env` con `PORT`, `DB_ENGINE`, MySQL/Postgres/MSSQL/Oracle

```bash
npm install sequelize@^6.37.8 mysql2@^3.24.4 pg@^8.23.0 pg-hstore@^2.3.4 \
  tedious@^20.0.0 oracledb@^7.0.1
npm install -D @types/sequelize@^6.12.0
```

```bash
: > .env
cat >> .env << 'EOF'
PORT=4000

# Variable para seleccionar el motor de base de datos
DB_ENGINE=mysql

# Configuración para MySQL
MYSQL_HOST=localhost
MYSQL_USER=admin
MYSQL_PASSWORD=MiNiCo57**
MYSQL_NAME=tecnogua
MYSQL_PORT=3306

# Configuración para PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_NAME=almacen_2025_iisem_node
POSTGRES_PORT=5432

# Configuración para SQL Server
MSSQL_HOST=localhost
MSSQL_USER=sa
MSSQL_PASSWORD=password
MSSQL_NAME=almacen_2025_iisem_node
MSSQL_PORT=1433

# Configuración para Oracle
ORACLE_HOST=localhost
ORACLE_USER=ALMACENDB_ADMIN
ORACLE_PASSWORD=password
ORACLE_NAME=xe
ORACLE_PORT=1521

EOF
```

```bash
test -f .env && grep DB_ENGINE .env
npm ls sequelize mysql2 --depth=0
```

---

## 3.2 Configuración Sequelize (`database/db.ts`)

**Criterios de este sub-ítem**

- [ ] Archivo `src/database/db.ts` creado
- [ ] Exporta `sequelize`, `getDatabaseInfo`, `testConnection`

```bash
: > src/database/db.ts
cat >> src/database/db.ts << 'EOF'
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

interface DatabaseConfig {
  dialect: string;
  host: string;
  username: string;
  password: string;
  database: string;
  port: number;
}

const dbConfigurations: Record<string, DatabaseConfig> = {
  mysql: {
    dialect: "mysql",
    host: process.env.MYSQL_HOST || "localhost",
    username: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_NAME || "test",
    port: parseInt(process.env.MYSQL_PORT || "3306")
  },
  postgres: {
    dialect: "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    username: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "",
    database: process.env.POSTGRES_NAME || "test",
    port: parseInt(process.env.POSTGRES_PORT || "5432")
  }
};

const selectedEngine = process.env.DB_ENGINE || "mysql";
const selectedConfig = dbConfigurations[selectedEngine];

if (!selectedConfig) {
  throw new Error(`Motor de base de datos no soportado: ${selectedEngine}`);
}

console.log(`🔌 Conectando a base de datos: ${selectedEngine.toUpperCase()}`);

export const sequelize = new Sequelize(
  selectedConfig.database,
  selectedConfig.username,
  selectedConfig.password,
  {
    host: selectedConfig.host,
    port: selectedConfig.port,
    dialect: selectedConfig.dialect as any,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export const getDatabaseInfo = () => {
  return {
    engine: selectedEngine,
    config: selectedConfig,
    connectionString: `${selectedConfig.dialect}://${selectedConfig.username}@${selectedConfig.host}:${selectedConfig.port}/${selectedConfig.database}`
  };
};

export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Conexión exitosa a ${selectedEngine.toUpperCase()}`);
    return true;
  } catch (error) {
    console.error(`❌ Error de conexión a ${selectedEngine.toUpperCase()}:`, error);
    return false;
  }
};
EOF
```

```bash
test -f src/database/db.ts && npx tsc --noEmit
```

---

## 3.3 Carpeta seeders (reservada)

**Criterios de este sub-ítem**

- [ ] `src/database/seeders/` existe (la lógica llega en ISS-04)
- [ ] `src/database/seeders/` existe **sin** `*.seeder.ts` ni runner

```bash
mkdir -p src/database/seeders
# opcional: touch src/database/seeders/.gitkeep
```

```bash
test -d src/database/seeders && echo OK
```

### Verificación del ISS-02

```bash
npx tsc --noEmit
test -f src/database/db.ts && test -f .env && test -d src/database/seeders
```

### Cierre del ISS

```bash
npm run dev
```

> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de continuar.

---

# 4. ISS-03-A — Feature Client — fundación (modelo, esqueleto, HTTP, cableado)

**Nombre recomendado:** *Feature Client — fundación*  
**Objetivo:** dejar el feature listo para CRUD: modelo con columnas obligatorias, esqueleto controller/routes, carpeta `http/`, agregador y sync.  
**Bloqueado por:** ISS-02.

### Criterios de aceptación (ISS-03-A)

- [ ] **4.1** Modelo `client.model.ts` con `status` + `timestamps: true` + bcrypt
- [ ] **4.2** Controller/routes esqueleto (sin CRUD aún en este sub-ítem pedagógico; el repo ya puede tener CRUD de ISS-03-B…E)
- [ ] **4.3** Carpeta `features/business/client/http/` creada
- [ ] **4.4** `routes/index.ts` + `config` importan modelo, conectan BD y hacen `sync`
- [ ] Con BD: `npm run dev` → conexión OK + sync OK + tabla `clients`

---

## 4.1 Modelo Client

**Criterios**

- [ ] `src/features/business/client/client.model.ts`
- [ ] Enum `active`/`inactive`, default `inactive`; `timestamps: true`

```bash
npm install bcryptjs@^3.0.3
npm install -D @types/bcryptjs@^3.0.0
```

```bash
: > src/features/business/client/client.model.ts
cat >> src/features/business/client/client.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";
import bcrypt from "bcryptjs";

export interface ClientI {
  id?: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  password: string;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Client extends Model {
  public id!: number;
  public name!: string;
  public address!: string;
  public phone!: string;
  public email!: string;
  public password!: string;
  public status!: "active" | "inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Client.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: { msg: "Phone cannot be empty" },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: { msg: "Email must be a valid email address" },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "inactive",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Client",
    tableName: "clients",
    timestamps: true,
    hooks: {
      beforeCreate: async (client: Client) => {
        if (client.password) {
          const salt = await bcrypt.genSalt(10);
          client.password = await bcrypt.hash(client.password, salt);
        }
      },
      beforeUpdate: async (client: Client) => {
        if (client.changed("password") && client.password) {
          const salt = await bcrypt.genSalt(10);
          client.password = await bcrypt.hash(client.password, salt);
        }
      },
      beforeBulkCreate: async (clients: Client[]) => {
        for (const client of clients) {
          if (client.password) {
            const salt = await bcrypt.genSalt(10);
            client.password = await bcrypt.hash(client.password, salt);
          }
        }
      },
    },
  }
);
EOF
```

---

## 4.2 Esqueleto controller / routes + carpeta HTTP

**Criterios**

- [ ] Archivos `client.controller.ts` y `client.routes.ts` existen (esqueleto)
- [ ] Carpeta `src/features/business/client/http/` existe

```bash
mkdir -p src/features/business/client/http
```

> El CRUD se completa en ISS-03-B…E. Aquí se reserva la carpeta `http/` para archivos `.http` (REST Client) con leyenda **SIN AUTH**.

```bash
: > src/features/business/client/client.controller.ts
cat >> src/features/business/client/client.controller.ts << 'EOF'
import { Request, Response } from "express";
import { Client, ClientI } from "./client.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class ClientController {
  // ================== READ ==================
  // (rellenar en ISS-03-B) getAll, luego getOne

  // ================== CREATE ==================
  // (rellenar en ISS-03-C)

  // ================== UPDATE ==================
  // (rellenar en ISS-03-D)

  // ================== DELETE ==================
  // (rellenar en ISS-03-E)
}
EOF
```

```bash
: > src/features/business/client/client.routes.ts
cat >> src/features/business/client/client.routes.ts << 'EOF'
import { Application } from "express";
import { ClientController } from "./client.controller";

export class ClientRoutes {
  public clientController: ClientController = new ClientController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================
    // (rellenar en ISS-03-B…E)
  }
}
EOF
```

---

## 4.3 Agregador Routes + cableado en Config

**Criterios**

- [ ] `src/routes/index.ts` con `clientRoutes`
- [ ] `config` importa modelo + `dbConnection` + `routes`

```bash
: > src/routes/index.ts
cat >> src/routes/index.ts << 'EOF'
import { ClientRoutes } from "../features/business/client/client.routes";

export class Routes {
  public clientRoutes: ClientRoutes = new ClientRoutes();
}
EOF
```

**PARCHE** — `src/config/index.ts` **ya existe** (ISS-01).

1. **Debajo de** `var cors = require("cors");` **añadir**:

```ts
import { sequelize, getDatabaseInfo, testConnection } from "../database/db";
import "../features/business/client/client.model";
import { Routes } from "../routes/index";
```

2. **Dentro de** `export class App`, **debajo de** `public app: Application;` **añadir**:

```ts
  public routePrv: Routes = new Routes();
```

3. **Dentro de** `routes()`, **reemplazar** el comentario `// ISS-03 §4.3` por:

```ts
    this.routePrv.clientRoutes.routes(this.app);
```

4. **Dentro de** `dbConnection()`, **reemplazar** el comentario `// ISS-02 / ISS-03` por:

```ts
    try {
      // Mostrar información de la base de datos seleccionada
      const dbInfo = getDatabaseInfo();
      console.log(`🔗 Intentando conectar a: ${dbInfo.engine.toUpperCase()}`);

      // Probar la conexión
      const isConnected = await testConnection();

      if (!isConnected) {
        throw new Error(`No se pudo conectar a la base de datos ${dbInfo.engine.toUpperCase()}`);
      }

      // alter: true actualiza columnas faltantes (ej. createdAt/updatedAt tras timestamps: true).
      // force: false no recrea tablas; no borra datos. En producción preferir migraciones.
      await sequelize.sync({ force: false, alter: true });
      console.log(`📦 Base de datos sincronizada exitosamente`);
    } catch (error) {
      console.error("❌ Error al conectar con la base de datos:", error);
      process.exit(1); // Terminar la aplicación si no se puede conectar
    }
```

> **Importante (lab):** si la tabla `clients` se creó antes con `timestamps: false`,
> `sync({ force: false })` **no** añade `createdAt`/`updatedAt`. Por eso se usa `alter: true`.

### Verificación ISS-03-A

```bash
test -d src/features/business/client/http && echo HTTP_FOLDER_OK
```

### Cierre del ISS

```bash
npm run dev
```

> Sync OK y tabla `clients` (con `createdAt` / `updatedAt`). Detenerlo con Ctrl+C antes de continuar.

---

# 5. ISS-03-B — Feature Client — GetAll y GetOne

**Objetivo:** listar activos y obtener uno por id. Es el primer paso del feature: getAll, getOne, luego create, update y delete.  
**Bloqueado por:** ISS-03-A.

### Criterios de aceptación (ISS-03-B)

- [ ] Controller: `getAll` (solo `status: 'active'`) y, debajo, `getOne`
- [ ] Rutas `GET /api/clientes` y `GET /api/clientes/:id` — **sin auth**
- [ ] `http/clients.get.http` con leyenda **SIN AUTH**
- [ ] Respuestas sin campo `password`

### Controller — **PARCHE** `client.controller.ts` (ya existe)

**Debajo de** el comentario `// ================== READ ==================` (y **encima de** `// ================== CREATE ==================`), **añadir** primero `getAll` y después `getOne`:

```ts
  public async getAll(req: Request, res: Response) {
    try {
      const clients = await Client.findAll({
        where: { status: "active" },
        attributes: { exclude: ["password"] },
      });
      res.status(200).json({ clients });
    } catch (error) {
      res.status(500).json({ error: "Error fetching clients", detail: String(error) });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const client = await Client.findByPk(id, {
        attributes: { exclude: ["password"] },
      });
      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }
      res.status(200).json({ client });
    } catch (error) {
      res.status(500).json({ error: "Error fetching client", detail: String(error) });
    }
  }
```

### Rutas — **PARCHE** `client.routes.ts` (ya existe)

**Debajo de** el comentario `// ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================`, **añadir** primero `getAll` y después `getOne`:

```ts
    // getAll
    app
      .route("/api/clientes")
      .get(this.clientController.getAll.bind(this.clientController));

    // getOne
    app
      .route("/api/clientes/:id")
      .get(this.clientController.getOne.bind(this.clientController));
```

### HTTP — archivo nuevo

```bash
: > src/features/business/client/http/clients.get.http
cat >> src/features/business/client/http/clients.get.http << 'EOF'
### Feature Client — GET ALL / GET ONE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name getAllClients
GET {{baseUrl}}/api/clientes

###

# @name getOneClient
GET {{baseUrl}}/api/clientes/{{id}}
EOF
```

### Verificación

```bash
curl -s http://localhost:4000/api/clientes
curl -s http://localhost:4000/api/clientes/1
```

### Cierre del ISS

```bash
npm run dev
```

> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de continuar.

---

# 6. ISS-03-C — Feature Client — Crear cliente

**Objetivo:** alta de cliente vía API, después de getAll y getOne.  
**Bloqueado por:** ISS-03-B.

### Criterios de aceptación (ISS-03-C)

- [ ] Controller: método `create` **debajo de** `getOne` y **encima de** update
- [ ] Ruta `POST /api/clientes` **debajo de** `getOne` — **sin auth**
- [ ] Archivo `http/clients.create.http` con leyenda **SIN AUTH**
- [ ] `POST` responde `201` con cliente

### Controller — **PARCHE** `client.controller.ts` (ya existe)

**Debajo de** el comentario `// ================== CREATE ==================` (y **encima de** `// ================== UPDATE ==================`), **añadir** el método `create`:

```ts
  public async create(req: Request, res: Response) {
    try {
      const body = req.body as ClientI;
      const client = await Client.create({
        name: body.name,
        address: body.address,
        phone: body.phone,
        email: body.email,
        password: body.password,
        status: body.status ?? "active",
      });
      const { password, ...safe } = client.toJSON() as ClientI & { password?: string };
      res.status(201).json({ client: safe });
    } catch (error) {
      res.status(500).json({ error: "Error creating client", detail: String(error) });
    }
  }
```

### Rutas — **PARCHE** `client.routes.ts` (ya existe)

**Debajo de** el bloque `// getOne`, **añadir**:

```ts
    // create
    app
      .route("/api/clientes")
      .post(this.clientController.create.bind(this.clientController));
```

### HTTP — archivo nuevo

```bash
: > src/features/business/client/http/clients.create.http
cat >> src/features/business/client/http/clients.create.http << 'EOF'
### Feature Client — CREATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name createClient
POST {{baseUrl}}/api/clientes
Content-Type: application/json

{
  "name": "Ana Pérez",
  "address": "Calle 10 #20-30",
  "phone": "3001234567",
  "email": "ana.perez@example.com",
  "password": "Password123!",
  "status": "active"
}
EOF
```

### Verificación

```bash
curl -s -X POST http://localhost:4000/api/clientes \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana","phone":"3001","email":"ana@test.com","password":"Password123!","status":"active"}'
```

### Cierre del ISS

```bash
npm run dev
```

> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de continuar.

---

# 7. ISS-03-D — Feature Client — Update (PUT) y Update (PATCH)

**Objetivo:** actualización completa y parcial.  
**Bloqueado por:** ISS-03-C.

### Criterios de aceptación (ISS-03-D)

- [ ] Controller: `updatePut` y `updatePatch`
- [ ] Rutas `PUT` y `PATCH` `/api/clientes/:id` — **sin auth**
- [ ] `http/clients.update.http` con leyenda **SIN AUTH**

### Controller — **PARCHE** `client.controller.ts` (ya existe)

**Debajo de** el comentario `// ================== UPDATE ==================` (y **encima de** `// ================== DELETE ==================`), **añadir**:

```ts
  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as ClientI;
      const client = await Client.findByPk(id);
      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }

      await client.update({
        name: body.name,
        address: body.address,
        phone: body.phone,
        email: body.email,
        password: body.password ?? client.password,
        status: body.status ?? client.status,
      });

      const { password, ...safe } = client.toJSON() as ClientI & { password?: string };
      res.status(200).json({ client: safe });
    } catch (error) {
      res.status(500).json({ error: "Error updating client (PUT)", detail: String(error) });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<ClientI>;
      const client = await Client.findByPk(id);
      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }

      await client.update(body);
      const { password, ...safe } = client.toJSON() as ClientI & { password?: string };
      res.status(200).json({ client: safe });
    } catch (error) {
      res.status(500).json({ error: "Error updating client (PATCH)", detail: String(error) });
    }
  }
```

### Rutas — **PARCHE** `client.routes.ts` (ya existe)

**Debajo de** el bloque `// create`, **añadir** PUT y PATCH:

```ts
    // update (PUT / PATCH)
    app
      .route("/api/clientes/:id")
      .put(this.clientController.updatePut.bind(this.clientController))
      .patch(this.clientController.updatePatch.bind(this.clientController));
```

### HTTP — archivo nuevo

```bash
: > src/features/business/client/http/clients.update.http
cat >> src/features/business/client/http/clients.update.http << 'EOF'
### Feature Client — UPDATE (PUT) / UPDATE (PATCH)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name updateClientPut
PUT {{baseUrl}}/api/clientes/{{id}}
Content-Type: application/json

{
  "name": "Ana Pérez Actualizada",
  "address": "Carrera 15 #40-10",
  "phone": "3009876543",
  "email": "ana.perez@example.com",
  "password": "Password123!",
  "status": "active"
}

###

# @name updateClientPatch
PATCH {{baseUrl}}/api/clientes/{{id}}
Content-Type: application/json

{
  "phone": "3011112233",
  "address": "Nueva dirección parcial"
}
EOF
```

### Verificación

```bash
curl -s -X PUT http://localhost:4000/api/clientes/1 -H 'Content-Type: application/json' \
  -d '{"name":"Ana","address":"x","phone":"300","email":"ana@test.com","status":"active"}'
curl -s -X PATCH http://localhost:4000/api/clientes/1 -H 'Content-Type: application/json' \
  -d '{"phone":"301"}'
```

### Cierre del ISS

```bash
npm run dev
```

> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de continuar.

---

# 8. ISS-03-E — Feature Client — Eliminar (físico y lógico)

**Objetivo:** borrado físico (`DELETE`) y lógico (`status = 'inactive'`).  
**Bloqueado por:** ISS-03-D.

### Criterios de aceptación (ISS-03-E)

- [ ] Controller: `deletePhysical` y `deleteLogical`
- [ ] `DELETE /api/clientes/:id` — físico — **sin auth**
- [ ] `PATCH /api/clientes/:id/deactivate` — lógico → `inactive` — **sin auth**
- [ ] `http/clients.delete.http` con leyenda **SIN AUTH**

### Controller — **PARCHE** `client.controller.ts` (ya existe)

**Debajo de** el comentario `// ================== DELETE ==================`, **añadir** primero el borrado físico y después el lógico:

```ts
  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const client = await Client.findByPk(id);
      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }
      await client.destroy();
      res.status(200).json({ message: "Client permanently deleted", id });
    } catch (error) {
      res.status(500).json({ error: "Error deleting client", detail: String(error) });
    }
  }

  /** Eliminación lógica → status = inactive */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const client = await Client.findByPk(id);
      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }
      await client.update({ status: "inactive" });
      const { password, ...safe } = client.toJSON() as ClientI & { password?: string };
      res.status(200).json({ message: "Client deactivated (logical delete)", client: safe });
    } catch (error) {
      res.status(500).json({ error: "Error deactivating client", detail: String(error) });
    }
  }
```

### Rutas — **PARCHE** `client.routes.ts` (ya existe)

1. **Debajo de** el bloque `// update (PUT / PATCH)`, **añadir** el borrado físico:

```ts
    // delete físico
    app
      .route("/api/clientes/:id")
      .delete(this.clientController.deletePhysical.bind(this.clientController));
```

2. **Debajo de** ese bloque, **añadir** la baja lógica:

```ts
    // delete lógico
    app
      .route("/api/clientes/:id/deactivate")
      .patch(this.clientController.deleteLogical.bind(this.clientController));
```

### HTTP — archivo nuevo

```bash
: > src/features/business/client/http/clients.delete.http
cat >> src/features/business/client/http/clients.delete.http << 'EOF'
### Feature Client — DELETE físico / DELETE lógico (status = inactive)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name deleteClientPhysical
DELETE {{baseUrl}}/api/clientes/{{id}}

###

# @name deleteClientLogical
PATCH {{baseUrl}}/api/clientes/{{id}}/deactivate
EOF
```

### Verificación

```bash
curl -s -X PATCH http://localhost:4000/api/clientes/1/deactivate
curl -s -X DELETE http://localhost:4000/api/clientes/1
```

> Tras baja lógica, `GET /api/clientes` ya no debe listar ese registro (filtra `active`).

### Estado final Client (CRUD completo) — archivos consolidados

Tras ISS-03-B…E, estos archivos deben quedar así (equivalente a aplicar todos los PARCHE):

```bash
: > src/features/business/client/client.controller.ts
cat >> src/features/business/client/client.controller.ts << 'EOF'
import { Request, Response } from "express";
import { Client, ClientI } from "./client.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class ClientController {
  // ================== READ ==================
  public async getAll(req: Request, res: Response) {
    try {
      const clients = await Client.findAll({
        where: { status: "active" },
        attributes: { exclude: ["password"] },
      });
      res.status(200).json({ clients });
    } catch (error) {
      res.status(500).json({ error: "Error fetching clients", detail: String(error) });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const client = await Client.findByPk(id, {
        attributes: { exclude: ["password"] },
      });
      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }
      res.status(200).json({ client });
    } catch (error) {
      res.status(500).json({ error: "Error fetching client", detail: String(error) });
    }
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response) {
    try {
      const body = req.body as ClientI;
      const client = await Client.create({
        name: body.name,
        address: body.address,
        phone: body.phone,
        email: body.email,
        password: body.password,
        status: body.status ?? "active",
      });
      const { password, ...safe } = client.toJSON() as ClientI & { password?: string };
      res.status(201).json({ client: safe });
    } catch (error) {
      res.status(500).json({ error: "Error creating client", detail: String(error) });
    }
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as ClientI;
      const client = await Client.findByPk(id);
      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }

      await client.update({
        name: body.name,
        address: body.address,
        phone: body.phone,
        email: body.email,
        password: body.password ?? client.password,
        status: body.status ?? client.status,
      });

      const { password, ...safe } = client.toJSON() as ClientI & { password?: string };
      res.status(200).json({ client: safe });
    } catch (error) {
      res.status(500).json({ error: "Error updating client (PUT)", detail: String(error) });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<ClientI>;
      const client = await Client.findByPk(id);
      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }

      await client.update(body);
      const { password, ...safe } = client.toJSON() as ClientI & { password?: string };
      res.status(200).json({ client: safe });
    } catch (error) {
      res.status(500).json({ error: "Error updating client (PATCH)", detail: String(error) });
    }
  }

  // ================== DELETE ==================
  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const client = await Client.findByPk(id);
      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }
      await client.destroy();
      res.status(200).json({ message: "Client permanently deleted", id });
    } catch (error) {
      res.status(500).json({ error: "Error deleting client", detail: String(error) });
    }
  }

  /** Eliminación lógica → status = inactive */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const client = await Client.findByPk(id);
      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }
      await client.update({ status: "inactive" });
      const { password, ...safe } = client.toJSON() as ClientI & { password?: string };
      res.status(200).json({ message: "Client deactivated (logical delete)", client: safe });
    } catch (error) {
      res.status(500).json({ error: "Error deactivating client", detail: String(error) });
    }
  }
}
EOF
```

```bash
: > src/features/business/client/client.routes.ts
cat >> src/features/business/client/client.routes.ts << 'EOF'
import { Application } from "express";
import { ClientController } from "./client.controller";

export class ClientRoutes {
  public clientController: ClientController = new ClientController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/clientes")
      .get(this.clientController.getAll.bind(this.clientController));

    // getOne
    app
      .route("/api/clientes/:id")
      .get(this.clientController.getOne.bind(this.clientController));

    // create
    app
      .route("/api/clientes")
      .post(this.clientController.create.bind(this.clientController));

    // update (PUT / PATCH)
    app
      .route("/api/clientes/:id")
      .put(this.clientController.updatePut.bind(this.clientController))
      .patch(this.clientController.updatePatch.bind(this.clientController));

    // delete físico
    app
      .route("/api/clientes/:id")
      .delete(this.clientController.deletePhysical.bind(this.clientController));

    // delete lógico
    app
      .route("/api/clientes/:id/deactivate")
      .patch(this.clientController.deleteLogical.bind(this.clientController));
  }
}
EOF
```

### Cierre del ISS

```bash
npm run dev
```

> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de continuar.

---

# 9. ISS-04 — Seeders con Faker (feature + runner externo)

**Objetivo:** datos falsos por feature (Faker) y un orquestador externo que ejecuta todos los seeders enviando la **cantidad por entidad**.  
**Bloqueado por:** ISS-03-A (modelo); recomendado tras ISS-03-E.

### Criterios de aceptación (ISS-04) — consolidados

- [ ] **9.1** Existe `features/business/client/client.seeder.ts` con `@faker-js/faker`, recibe `count`, es idempotente
- [ ] **9.2** Existe `database/seeders/index.ts` (SeedersRunner) que llama seeders de features
- [ ] **9.2** Existe `database/seeders/counts.ts` con cantidad por entidad (default / env / CLI)
- [ ] Script `npm run db:seed` funciona
- [ ] Se puede variar cantidad: `npm run db:seed -- --clients=20` o `SEED_CLIENTS=5`

**Diseño**

| Pieza | Ubicación | Rol |
|-------|-----------|-----|
| Seeder del feature | `src/features/business/client/client.seeder.ts` | Genera filas falsas de Client |
| Conteos | `src/database/seeders/counts.ts` | `clients: N` (y futuras entidades) |
| Runner | `src/database/seeders/index.ts` | Importa seeders de features y los ejecuta en orden |

---

## 9.1 Seeder dentro del feature Client

**Criterios**

- [ ] `seedClients(count: number)` exportado desde el feature
- [ ] Usa `@faker-js/faker`
- [ ] Si ya hay filas, no duplica

```bash
npm install -D @faker-js/faker@^10.6.0
```

```bash
: > src/features/business/client/client.seeder.ts
cat >> src/features/business/client/client.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { Client } from "./client.model";

/**
 * Seeder del feature Client (datos falsos con @faker-js/faker).
 * Se invoca desde `src/database/seeders` (SeedersRunner), no desde la App.
 *
 * Idempotente: si ya hay filas, no vuelve a insertar.
 */
export async function seedClients(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  clients: count=0, se omite");
    return 0;
  }

  const existing = await Client.count();
  if (existing > 0) {
    console.log(`⏭️  clients: ya hay ${existing} registro(s), se omite seeder`);
    return 0;
  }

  const rows = Array.from({ length: count }, (_, i) => ({
    name: faker.person.fullName(),
    address: faker.location.streetAddress(),
    phone: faker.phone.number({ style: "national" }),
    email: `client.${i}.${faker.string.alphanumeric(6)}@example.com`.toLowerCase(),
    password: "Password123!",
    status: "active" as const,
  }));

  await Client.bulkCreate(rows);
  console.log(`✅ clients: insertados ${count} registro(s) falsos`);
  return count;
}
EOF
```

---

## 9.2 SeedersRunner + conteos por entidad (`database/seeders`)

**Criterios**

- [ ] Runner fuera del feature en `src/database/seeders/`
- [ ] Cantidad configurable por feature (`clients`, …)

### 9.2.1 Conteos

```bash
: > src/database/seeders/counts.ts
cat >> src/database/seeders/counts.ts << 'EOF'
/**
 * Cantidad de registros por feature/entidad.
 * Prioridad: CLI (--clients=N) > env (SEED_CLIENTS) > default de este archivo.
 *
 * Cuando agregues features, suma aquí la clave y léela en el runner.
 */
export type SeedCounts = {
  clients: number;
  // users?: number;
  // roles?: number;
  // products?: number;
};

export const DEFAULT_SEED_COUNTS: SeedCounts = {
  clients: 10,
};

export function resolveSeedCounts(argv: string[] = process.argv.slice(2)): SeedCounts {
  const counts: SeedCounts = { ...DEFAULT_SEED_COUNTS };

  const envClients = process.env.SEED_CLIENTS;
  if (envClients !== undefined && envClients !== "") {
    counts.clients = Number(envClients);
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
EOF
```

### 9.2.2 Runner

```bash
: > src/database/seeders/index.ts
cat >> src/database/seeders/index.ts << 'EOF'
import dotenv from "dotenv";
import { sequelize, testConnection } from "../db";
import "../../features/business/client/client.model";
import { seedClients } from "../../features/business/client/client.seeder";
import { resolveSeedCounts } from "./counts";

dotenv.config();

/**
 * SeedersRunner — ejecuta TODOS los seeders de features.
 *
 * Ubicación: `src/database/seeders/` (orquestación fuera de cada feature).
 * Cada feature exporta su seeder (ej. `features/business/client/client.seeder.ts`).
 *
 * Uso:
 *   npm run db:seed
 *   npm run db:seed -- --clients=20
 *   SEED_CLIENTS=5 npm run db:seed
 */
export async function runAllSeeders(): Promise<void> {
  const counts = resolveSeedCounts();
  console.log("🌱 Iniciando SeedersRunner...");
  console.log("📊 Conteos:", counts);

  const ok = await testConnection();
  if (!ok) {
    throw new Error("No hay conexión a la base de datos");
  }

  await sequelize.sync({ force: false, alter: true });

  // Orden: business (padres → hijos)
  await seedClients(counts.clients);

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

**PARCHE** — `package.json` **ya existe**.

**Dentro de** `"scripts"`, **debajo de** `"dev": "..."`, **añadir** la coma al final de `dev` (si falta) y la clave:

```json
    "db:seed": "ts-node -- src/database/seeders/index.ts"
```

Fragmento esperado:

```json
  "scripts": {
    "build": "tsc",
    "dev": "nodemon --watch src --ext ts --exec ts-node -- src/server.ts",
    "db:seed": "ts-node -- src/database/seeders/index.ts"
  }
```

### Verificación ISS-04

```bash
npm run db:seed
npm run db:seed -- --clients=20
SEED_CLIENTS=5 npm run db:seed
```

**Al agregar otra entidad (patrón):**

1. Archivo **nuevo** `features/.../<entidad>.seeder.ts` con `: >` + `cat >>`.
2. **PARCHE** `counts.ts`: **dentro de** `SeedCounts` / defaults, **añadir** clave (ej. `products: 10`).
3. **PARCHE** `database/seeders/index.ts`: **debajo de** `await seedClients(...)`, **añadir** la llamada al nuevo seeder.

### Cierre del ISS

```bash
npm run dev
```

> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de continuar.

---

# 10. ISS-05 — Swagger / OpenAPI (feature + registry externo)

**Objetivo:** documentar el API del feature Client en OpenAPI 3 y montar Swagger UI desde un **registry externo** (mismo patrón que seeders).  
**Bloqueado por:** ISS-03-E (rutas CRUD definidas).

### Criterios de aceptación (ISS-05) — consolidados

- [ ] **10.1** Existe `features/business/client/client.swagger.ts` con tags, paths y schemas de Client (leyenda **SIN AUTH**)
- [ ] **10.2** Existe `src/swagger/index.ts` que agrega módulos de features y monta UI
- [ ] `App` llama `setupSwagger` (método `docs()`)
- [ ] `GET /api/docs` muestra Swagger UI
- [ ] `GET /api/docs.json` devuelve el documento OpenAPI

**Diseño**

| Pieza | Ubicación | Rol |
|-------|-----------|-----|
| Docs del feature | `src/features/business/client/client.swagger.ts` | Paths + schemas Client |
| Registry | `src/swagger/index.ts` | Fusiona features + `setupSwagger(app)` |
| UI | `/api/docs` | Swagger UI |
| Spec | `/api/docs.json` | OpenAPI JSON |

---

## 10.1 OpenAPI dentro del feature Client

**Criterios**

- [ ] Exporta `clientSwagger` con `tags`, `paths`, `components.schemas`
- [ ] Endpoints documentados como **SIN AUTH**

```bash
# Paquetes (una vez)
npm install swagger-ui-express@^5.0.1
npm install -D @types/swagger-ui-express@^4.1.8
```

Archivo **nuevo**:

```bash
: > src/features/business/client/client.swagger.ts
cat >> src/features/business/client/client.swagger.ts << 'EOF'
/**
 * Documentación OpenAPI del feature Client.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints documentados como SIN AUTH (sin middleware JWT).
 */

export const clientSwagger = {
  tags: [
    {
      name: "Clientes",
      description: "CRUD de clientes — **SIN AUTH** (sin middleware JWT)",
    },
  ],
  paths: {
    "/api/clientes": {
      get: {
        tags: ["Clientes"],
        summary: "Listar clientes activos",
        description: "SIN AUTH — retorna clientes con status=active (sin password)",
        security: [],
        responses: {
          "200": {
            description: "Lista de clientes",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    clients: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Client" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Clientes"],
        summary: "Crear cliente",
        description: "SIN AUTH",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ClientCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Cliente creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    client: { $ref: "#/components/schemas/Client" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/clientes/{id}": {
      get: {
        tags: ["Clientes"],
        summary: "Obtener cliente por id",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Cliente encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    client: { $ref: "#/components/schemas/Client" },
                  },
                },
              },
            },
          },
          "404": { description: "No encontrado" },
        },
      },
      put: {
        tags: ["Clientes"],
        summary: "Actualizar cliente (PUT — reemplazo)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ClientUpdate" },
            },
          },
        },
        responses: {
          "200": { description: "Actualizado" },
          "404": { description: "No encontrado" },
        },
      },
      patch: {
        tags: ["Clientes"],
        summary: "Actualizar cliente (PATCH — parcial)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ClientPatch" },
            },
          },
        },
        responses: {
          "200": { description: "Actualizado" },
          "404": { description: "No encontrado" },
        },
      },
      delete: {
        tags: ["Clientes"],
        summary: "Eliminar cliente (físico)",
        description: "SIN AUTH — borra la fila",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Eliminado" },
          "404": { description: "No encontrado" },
        },
      },
    },
    "/api/clientes/{id}/deactivate": {
      patch: {
        tags: ["Clientes"],
        summary: "Eliminar cliente (lógico)",
        description: "SIN AUTH — status = inactive",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Desactivado" },
          "404": { description: "No encontrado" },
        },
      },
    },
  },
  components: {
    schemas: {
      Client: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Ana Pérez" },
          address: { type: "string", example: "Calle 10 #20-30" },
          phone: { type: "string", example: "3001234567" },
          email: { type: "string", format: "email", example: "ana@example.com" },
          status: { type: "string", enum: ["active", "inactive"], example: "active" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ClientCreate: {
        type: "object",
        required: ["name", "phone", "email", "password"],
        properties: {
          name: { type: "string" },
          address: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
          status: { type: "string", enum: ["active", "inactive"], default: "active" },
        },
      },
      ClientUpdate: {
        type: "object",
        required: ["name", "phone", "email"],
        properties: {
          name: { type: "string" },
          address: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
      ClientPatch: {
        type: "object",
        properties: {
          name: { type: "string" },
          address: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
    },
  },
};
EOF
```

---

## 10.2 Registry externo + montaje en Config

**Criterios**

- [ ] `buildOpenApiDocument()` fusiona módulos de features
- [ ] `setupSwagger(app)` monta `/api/docs` y `/api/docs.json`
- [ ] `config` invoca `setupSwagger` (método `docs()`)

```bash
mkdir -p src/swagger
```

Archivo **nuevo**:

```bash
: > src/swagger/index.ts
cat >> src/swagger/index.ts << 'EOF'
import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import { clientSwagger } from "../features/business/client/client.swagger";

export type FeatureSwaggerModule = {
  tags: unknown[];
  paths: Record<string, unknown>;
  components?: { schemas?: Record<string, unknown> };
};

/**
 * Registry externo: importa la documentación OpenAPI de cada feature
 * (mismo patrón que SeedersRunner).
 */
const featureSwaggerModules: FeatureSwaggerModule[] = [
  clientSwagger,
  // productSwagger,
  // userSwagger,
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
      version: "1.0.0",
      description:
        "API StoreLab (Express + Sequelize). Los endpoints de Client están documentados como **SIN AUTH** Todas las rutas business son **SIN AUTH** en este lab.",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: "Local",
      },
    ],
    tags,
    paths,
    components: { schemas },
  };
}

/** Monta Swagger UI y el JSON OpenAPI */
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

**PARCHE** — `src/config/index.ts` **ya existe**.

1. **Debajo de** `import { Routes } from "../routes/index";` (o **debajo de** los imports de BD/modelo), **añadir**:

```ts
import { setupSwagger } from "../swagger/index";
```

2. **Dentro del** `constructor`, **debajo de** `this.routes();` y **encima de** `this.dbConnection();`, **añadir**:

```ts
    this.docs();
```

3. **Dentro de** la clase `App`, **debajo de** el método `routes()` y **encima de** `dbConnection()`, **añadir**:

```ts
  private docs(): void {
    setupSwagger(this.app);
  }
```

### Verificación ISS-05

```bash
curl -s http://localhost:4000/api/docs.json | head
```

> Con el servidor del cierre: abrir `http://localhost:4000/api/docs`.

**Al agregar otra entidad (patrón):**

1. Archivo **nuevo** `features/.../<entidad>.swagger.ts` con `: >` + `cat >>`.
2. **PARCHE** `src/swagger/index.ts`: **debajo de** `import { clientSwagger } ...`, **añadir** el import; **dentro de** `featureSwaggerModules`, **debajo de** `clientSwagger,`, **añadir** el módulo nuevo.

### Cierre del ISS

```bash
npm run dev
```

> El servidor debe arrancar sin error. Abrir `http://localhost:4000/api/docs`. Detenerlo con Ctrl+C antes de continuar.

---

# 11. ISS-06 — Feature ProductType (tipos de producto)

**Objetivo:** CRUD + seeder + swagger de ProductType (sin FK).  
**Bloqueado por:** ISS-05.  
**API:** `/api/tipos-producto` — **SIN AUTH**.  
**Patrón:** mismo que Client (ISS-03-A…E + 04 + 05).

### Criterios de aceptación (ISS-06)

- [ ] **11.1** Modelo `product-type.model.ts` (`status` + `timestamps: true`)
- [ ] **11.2** Controller + routes en este orden: getAll, getOne, create, update PUT/PATCH, delete físico y lógico
- [ ] **11.3** Carpeta `http/` en el mismo orden: get, create, update, delete
- [ ] **11.4** Cableado en `routes/index.ts` + `config` (import model + route)
- [ ] **11.5** Seeder + registro en SeedersRunner / counts
- [ ] **11.6** Swagger + registro en `src/swagger`

```bash
mkdir -p src/features/business/product-type/http
```

---

## 11.1 Modelo ProductType

```bash
: > src/features/business/product-type/product-type.model.ts
cat >> src/features/business/product-type/product-type.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface ProductTypeI {
  id?: number;
  name: string;
  description?: string | null;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProductType extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public status!: "active" | "inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProductType.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "inactive",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ProductType",
    tableName: "product_types",
    timestamps: true,
  }
);
EOF
```
---

## 11.2 Controller + routes (CRUD completo)

```bash
: > src/features/business/product-type/product-type.controller.ts
cat >> src/features/business/product-type/product-type.controller.ts << 'EOF'
import { Request, Response } from "express";
import { ProductType, ProductTypeI } from "./product-type.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class ProductTypeController {
  // ================== READ ==================
  public async getAll(req: Request, res: Response) {
    try {
      const product_types = await ProductType.findAll({
        where: { status: "active" },
      });
      res.status(200).json({ product_types });
    } catch (error) {
      res.status(500).json({ error: "Error fetching product types", detail: String(error) });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const product_type = await ProductType.findByPk(id);
      if (!product_type) {
        res.status(404).json({ error: "Product type not found" });
        return;
      }
      res.status(200).json({ product_type });
    } catch (error) {
      res.status(500).json({ error: "Error fetching product type", detail: String(error) });
    }
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response) {
    try {
      const body = req.body as ProductTypeI;
      const product_type = await ProductType.create({
        name: body.name,
        description: body.description ?? null,
        status: body.status ?? "active",
      });
      res.status(201).json({ product_type });
    } catch (error) {
      res.status(500).json({ error: "Error creating product type", detail: String(error) });
    }
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as ProductTypeI;
      const product_type = await ProductType.findByPk(id);
      if (!product_type) {
        res.status(404).json({ error: "Product type not found" });
        return;
      }

      await product_type.update({
        name: body.name,
        description: body.description ?? null,
        status: body.status ?? product_type.status,
      });

      res.status(200).json({ product_type });
    } catch (error) {
      res.status(500).json({ error: "Error updating product type (PUT)", detail: String(error) });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<ProductTypeI>;
      const product_type = await ProductType.findByPk(id);
      if (!product_type) {
        res.status(404).json({ error: "Product type not found" });
        return;
      }

      await product_type.update(body);
      res.status(200).json({ product_type });
    } catch (error) {
      res.status(500).json({ error: "Error updating product type (PATCH)", detail: String(error) });
    }
  }

  // ================== DELETE ==================
  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const product_type = await ProductType.findByPk(id);
      if (!product_type) {
        res.status(404).json({ error: "Product type not found" });
        return;
      }
      await product_type.destroy();
      res.status(200).json({ message: "Product type permanently deleted", id });
    } catch (error) {
      res.status(500).json({ error: "Error deleting product type", detail: String(error) });
    }
  }

  /** Eliminación lógica → status = inactive */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const product_type = await ProductType.findByPk(id);
      if (!product_type) {
        res.status(404).json({ error: "Product type not found" });
        return;
      }
      await product_type.update({ status: "inactive" });
      res.status(200).json({
        message: "Product type deactivated (logical delete)",
        product_type,
      });
    } catch (error) {
      res.status(500).json({ error: "Error deactivating product type", detail: String(error) });
    }
  }
}
EOF
```
```bash
: > src/features/business/product-type/product-type.routes.ts
cat >> src/features/business/product-type/product-type.routes.ts << 'EOF'
import { Application } from "express";
import { ProductTypeController } from "./product-type.controller";

export class ProductTypeRoutes {
  public productTypeController: ProductTypeController = new ProductTypeController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/tipos-producto")
      .get(this.productTypeController.getAll.bind(this.productTypeController));

    // getOne
    app
      .route("/api/tipos-producto/:id")
      .get(this.productTypeController.getOne.bind(this.productTypeController));

    // create
    app
      .route("/api/tipos-producto")
      .post(this.productTypeController.create.bind(this.productTypeController));

    // update (PUT / PATCH)
    app
      .route("/api/tipos-producto/:id")
      .put(this.productTypeController.updatePut.bind(this.productTypeController))
      .patch(this.productTypeController.updatePatch.bind(this.productTypeController));

    // delete físico
    app
      .route("/api/tipos-producto/:id")
      .delete(this.productTypeController.deletePhysical.bind(this.productTypeController));

    // delete lógico
    app
      .route("/api/tipos-producto/:id/deactivate")
      .patch(this.productTypeController.deleteLogical.bind(this.productTypeController));
  }
}
EOF
```
---

## 11.3 HTTP (REST Client)

```bash
: > src/features/business/product-type/http/product-types.get.http
cat >> src/features/business/product-type/http/product-types.get.http << 'EOF'
### Feature ProductType — GET ALL / GET ONE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name getAllProductTypes
GET {{baseUrl}}/api/tipos-producto

###

# @name getOneProductType
GET {{baseUrl}}/api/tipos-producto/{{id}}
EOF
```

```bash
: > src/features/business/product-type/http/product-types.create.http
cat >> src/features/business/product-type/http/product-types.create.http << 'EOF'
### Feature ProductType — CREATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name createProductType
POST {{baseUrl}}/api/tipos-producto
Content-Type: application/json

{
  "name": "Electrónica",
  "description": "Dispositivos y accesorios",
  "status": "active"
}
EOF
```
```bash
: > src/features/business/product-type/http/product-types.update.http
cat >> src/features/business/product-type/http/product-types.update.http << 'EOF'
### Feature ProductType — UPDATE (PUT) / UPDATE (PATCH)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name updateProductTypePut
PUT {{baseUrl}}/api/tipos-producto/{{id}}
Content-Type: application/json

{
  "name": "Electrónica Actualizada",
  "description": "Categoría renovada",
  "status": "active"
}

###

# @name updateProductTypePatch
PATCH {{baseUrl}}/api/tipos-producto/{{id}}
Content-Type: application/json

{
  "description": "Descripción parcial"
}
EOF
```
```bash
: > src/features/business/product-type/http/product-types.delete.http
cat >> src/features/business/product-type/http/product-types.delete.http << 'EOF'
### Feature ProductType — DELETE físico / DELETE lógico (status = inactive)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name deleteProductTypePhysical
DELETE {{baseUrl}}/api/tipos-producto/{{id}}

###

# @name deleteProductTypeLogical
PATCH {{baseUrl}}/api/tipos-producto/{{id}}/deactivate
EOF
```
---

## 11.4 Cableado Routes + Config

**PARCHE** — `src/routes/index.ts` **ya existe**.

1. **Debajo de** `import { ClientRoutes } ...`, **añadir**:

```ts
import { ProductTypeRoutes } from "../features/business/product-type/product-type.routes";
```

2. **Dentro de** `export class Routes`, **debajo de** `clientRoutes`, **añadir**:

```ts
  public productTypeRoutes: ProductTypeRoutes = new ProductTypeRoutes();
```

**PARCHE** — `src/config/index.ts` **ya existe**.

1. **Debajo de** `import "../features/business/client/client.model";`, **añadir**:

```ts
import "../features/business/product-type/product-type.model";
```

2. **Dentro de** `routes()`, **debajo de** `this.routePrv.clientRoutes.routes(this.app);`, **añadir**:

```ts
    this.routePrv.productTypeRoutes.routes(this.app);
```

### Verificación

```bash
curl -s -X POST http://localhost:4000/api/tipos-producto -H 'Content-Type: application/json' \
  -d '{"name":"Bebidas","description":"Refrescos","status":"active"}'
curl -s http://localhost:4000/api/tipos-producto
```

---

## 11.5 Seeder ProductType

```bash
: > src/features/business/product-type/product-type.seeder.ts
cat >> src/features/business/product-type/product-type.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { ProductType } from "./product-type.model";

/**
 * Seeder del feature ProductType (datos falsos con @faker-js/faker).
 * Se invoca desde `src/database/seeders` (SeedersRunner), no desde la App.
 *
 * Idempotente: si ya hay filas, no vuelve a insertar.
 */
export async function seedProductTypes(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  product_types: count=0, se omite");
    return 0;
  }

  const existing = await ProductType.count();
  if (existing > 0) {
    console.log(`⏭️  product_types: ya hay ${existing} registro(s), se omite seeder`);
    return 0;
  }

  const rows = Array.from({ length: count }, () => ({
    name: faker.commerce.department(),
    description: faker.commerce.productDescription(),
    status: "active" as const,
  }));

  await ProductType.bulkCreate(rows);
  console.log(`✅ product_types: insertados ${count} registro(s) falsos`);
  return count;
}
EOF
```
**PARCHE** — `src/database/seeders/counts.ts` **ya existe**.

- **Dentro de** `SeedCounts`, **añadir** `product_types: number;`
- **Dentro de** `DEFAULT_SEED_COUNTS`, **añadir** `product_types: 25,`
- **Dentro de** la resolución por env, **añadir** lectura de `SEED_PRODUCT_TYPES` (ver archivo final abajo en ISS-08 si consolidás).

**PARCHE** — `src/database/seeders/index.ts` **ya existe**.

1. **Debajo de** imports de client, **añadir** import de `seedProductTypes`.
2. **Debajo de** `await seedClients(...)`, **añadir** `await seedProductTypes(counts.product_types);`

---

## 11.6 Swagger ProductType

```bash
: > src/features/business/product-type/product-type.swagger.ts
cat >> src/features/business/product-type/product-type.swagger.ts << 'EOF'
/**
 * Documentación OpenAPI del feature ProductType.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints documentados como SIN AUTH (sin middleware JWT).
 */

export const productTypeSwagger = {
  tags: [
    {
      name: "TiposProducto",
      description: "CRUD de tipos de producto — **SIN AUTH** (sin middleware JWT)",
    },
  ],
  paths: {
    "/api/tipos-producto": {
      get: {
        tags: ["TiposProducto"],
        summary: "Listar tipos de producto activos",
        description: "SIN AUTH — retorna tipos con status=active",
        security: [],
        responses: {
          "200": {
            description: "Lista de tipos de producto",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    product_types: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ProductType" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["TiposProducto"],
        summary: "Crear tipo de producto",
        description: "SIN AUTH",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductTypeCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Tipo de producto creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    product_type: { $ref: "#/components/schemas/ProductType" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/tipos-producto/{id}": {
      get: {
        tags: ["TiposProducto"],
        summary: "Obtener tipo de producto por id",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Tipo de producto encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    product_type: { $ref: "#/components/schemas/ProductType" },
                  },
                },
              },
            },
          },
          "404": { description: "No encontrado" },
        },
      },
      put: {
        tags: ["TiposProducto"],
        summary: "Actualizar tipo de producto (PUT — reemplazo)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductTypeUpdate" },
            },
          },
        },
        responses: {
          "200": { description: "Actualizado" },
          "404": { description: "No encontrado" },
        },
      },
      patch: {
        tags: ["TiposProducto"],
        summary: "Actualizar tipo de producto (PATCH — parcial)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductTypePatch" },
            },
          },
        },
        responses: {
          "200": { description: "Actualizado" },
          "404": { description: "No encontrado" },
        },
      },
      delete: {
        tags: ["TiposProducto"],
        summary: "Eliminar tipo de producto (físico)",
        description: "SIN AUTH — borra la fila",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Eliminado" },
          "404": { description: "No encontrado" },
        },
      },
    },
    "/api/tipos-producto/{id}/deactivate": {
      patch: {
        tags: ["TiposProducto"],
        summary: "Eliminar tipo de producto (lógico)",
        description: "SIN AUTH — status = inactive",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Desactivado" },
          "404": { description: "No encontrado" },
        },
      },
    },
  },
  components: {
    schemas: {
      ProductType: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Electrónica" },
          description: { type: "string", example: "Dispositivos y accesorios", nullable: true },
          status: { type: "string", enum: ["active", "inactive"], example: "active" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductTypeCreate: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["active", "inactive"], default: "active" },
        },
      },
      ProductTypeUpdate: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
      ProductTypePatch: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
    },
  },
};
EOF
```
**PARCHE** — `src/swagger/index.ts` **ya existe**.

1. **Debajo de** `import { clientSwagger } ...`, **añadir** import de `productTypeSwagger`.
2. **Dentro de** `featureSwaggerModules`, **debajo de** `clientSwagger,`, **añadir** `productTypeSwagger,`.

### Cierre del ISS

```bash
npm run dev
```

> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de continuar.

---

# 12. ISS-07 — Feature Product (productos)

**Objetivo:** CRUD de Product con FK `product_type_id`.  
**Bloqueado por:** ISS-06.  
**API:** `/api/productos` — **SIN AUTH**.

### Criterios de aceptación (ISS-07)

- [ ] **12.1** Modelo Product con `product_type_id`
- [ ] **12.2** Controller valida tipo **activo** en create/updatePut
- [ ] **12.3** Routes + http/ en orden getAll, getOne, create, update PUT/PATCH, delete físico y lógico
- [ ] **12.4** Cableado routes/config
- [ ] **12.5** **Relaciones** Product ↔ ProductType (archivo associations + import)
- [ ] **12.6** Seeder + swagger

```bash
mkdir -p src/features/business/product/http
```

---

## 12.1 Modelo Product

```bash
: > src/features/business/product/product.model.ts
cat >> src/features/business/product/product.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface ProductI {
  id?: number;
  name: string;
  brand: string;
  price: number;
  min_stock: number;
  quantity: number;
  product_type_id: number;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product extends Model {
  public id!: number;
  public name!: string;
  public brand!: string;
  public price!: number;
  public min_stock!: number;
  public quantity!: number;
  public product_type_id!: number;
  public status!: "active" | "inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    min_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    product_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "inactive",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
  }
);
EOF
```
---

## 12.2 Controller + routes

```bash
: > src/features/business/product/product.controller.ts
cat >> src/features/business/product/product.controller.ts << 'EOF'
import { Request, Response } from "express";
import { Product, ProductI } from "./product.model";
import { ProductType } from "../product-type/product-type.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

async function assertActiveProductType(product_type_id: number): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const productType = await ProductType.findByPk(product_type_id);
  if (!productType) {
    return { ok: false, status: 404, error: "Product type not found" };
  }
  if (productType.status !== "active") {
    return { ok: false, status: 400, error: "Product type must be active" };
  }
  return { ok: true };
}

export class ProductController {
  // ================== READ ==================
  public async getAll(req: Request, res: Response) {
    try {
      const products = await Product.findAll({
        where: { status: "active" },
      });
      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({ error: "Error fetching products", detail: String(error) });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const product = await Product.findByPk(id);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.status(200).json({ product });
    } catch (error) {
      res.status(500).json({ error: "Error fetching product", detail: String(error) });
    }
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response) {
    try {
      const body = req.body as ProductI;
      const check = await assertActiveProductType(Number(body.product_type_id));
      if (!check.ok) {
        res.status(check.status).json({ error: check.error });
        return;
      }

      const product = await Product.create({
        name: body.name,
        brand: body.brand,
        price: body.price,
        min_stock: body.min_stock,
        quantity: body.quantity,
        product_type_id: body.product_type_id,
        status: body.status ?? "active",
      });
      res.status(201).json({ product });
    } catch (error) {
      res.status(500).json({ error: "Error creating product", detail: String(error) });
    }
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as ProductI;
      const product = await Product.findByPk(id);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      const check = await assertActiveProductType(Number(body.product_type_id));
      if (!check.ok) {
        res.status(check.status).json({ error: check.error });
        return;
      }

      await product.update({
        name: body.name,
        brand: body.brand,
        price: body.price,
        min_stock: body.min_stock,
        quantity: body.quantity,
        product_type_id: body.product_type_id,
        status: body.status ?? product.status,
      });

      res.status(200).json({ product });
    } catch (error) {
      res.status(500).json({ error: "Error updating product (PUT)", detail: String(error) });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<ProductI>;
      const product = await Product.findByPk(id);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      if (body.product_type_id !== undefined) {
        const check = await assertActiveProductType(Number(body.product_type_id));
        if (!check.ok) {
          res.status(check.status).json({ error: check.error });
          return;
        }
      }

      await product.update(body);
      res.status(200).json({ product });
    } catch (error) {
      res.status(500).json({ error: "Error updating product (PATCH)", detail: String(error) });
    }
  }

  // ================== DELETE ==================
  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const product = await Product.findByPk(id);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      await product.destroy();
      res.status(200).json({ message: "Product permanently deleted", id });
    } catch (error) {
      res.status(500).json({ error: "Error deleting product", detail: String(error) });
    }
  }

  /** Eliminación lógica → status = inactive */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const product = await Product.findByPk(id);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      await product.update({ status: "inactive" });
      res.status(200).json({
        message: "Product deactivated (logical delete)",
        product,
      });
    } catch (error) {
      res.status(500).json({ error: "Error deactivating product", detail: String(error) });
    }
  }
}
EOF
```
```bash
: > src/features/business/product/product.routes.ts
cat >> src/features/business/product/product.routes.ts << 'EOF'
import { Application } from "express";
import { ProductController } from "./product.controller";

export class ProductRoutes {
  public productController: ProductController = new ProductController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/productos")
      .get(this.productController.getAll.bind(this.productController));

    // getOne
    app
      .route("/api/productos/:id")
      .get(this.productController.getOne.bind(this.productController));

    // create
    app
      .route("/api/productos")
      .post(this.productController.create.bind(this.productController));

    // update (PUT / PATCH)
    app
      .route("/api/productos/:id")
      .put(this.productController.updatePut.bind(this.productController))
      .patch(this.productController.updatePatch.bind(this.productController));

    // delete físico
    app
      .route("/api/productos/:id")
      .delete(this.productController.deletePhysical.bind(this.productController));

    // delete lógico
    app
      .route("/api/productos/:id/deactivate")
      .patch(this.productController.deleteLogical.bind(this.productController));
  }
}
EOF
```
---

## 12.3 HTTP

```bash
: > src/features/business/product/http/products.get.http
cat >> src/features/business/product/http/products.get.http << 'EOF'
### Feature Product — GET ALL / GET ONE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name getAllProducts
GET {{baseUrl}}/api/productos

###

# @name getOneProduct
GET {{baseUrl}}/api/productos/{{id}}
EOF
```

```bash
: > src/features/business/product/http/products.create.http
cat >> src/features/business/product/http/products.create.http << 'EOF'
### Feature Product — CREATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name createProduct
POST {{baseUrl}}/api/productos
Content-Type: application/json

{
  "name": "Laptop Pro",
  "brand": "TechBrand",
  "price": 1299.99,
  "min_stock": 5,
  "quantity": 50,
  "product_type_id": 1,
  "status": "active"
}
EOF
```
```bash
: > src/features/business/product/http/products.update.http
cat >> src/features/business/product/http/products.update.http << 'EOF'
### Feature Product — UPDATE (PUT) / UPDATE (PATCH)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name updateProductPut
PUT {{baseUrl}}/api/productos/{{id}}
Content-Type: application/json

{
  "name": "Laptop Pro Max",
  "brand": "TechBrand",
  "price": 1499.99,
  "min_stock": 5,
  "quantity": 40,
  "product_type_id": 1,
  "status": "active"
}

###

# @name updateProductPatch
PATCH {{baseUrl}}/api/productos/{{id}}
Content-Type: application/json

{
  "price": 1399.99,
  "quantity": 45
}
EOF
```
```bash
: > src/features/business/product/http/products.delete.http
cat >> src/features/business/product/http/products.delete.http << 'EOF'
### Feature Product — DELETE físico / DELETE lógico (status = inactive)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name deleteProductPhysical
DELETE {{baseUrl}}/api/productos/{{id}}

###

# @name deleteProductLogical
PATCH {{baseUrl}}/api/productos/{{id}}/deactivate
EOF
```
---

## 12.4 Cableado

**PARCHE** — `src/routes/index.ts`:

- **Debajo de** import ProductTypeRoutes, **añadir** ProductRoutes.
- **Dentro de** `Routes`, **añadir** `productRoutes`.

**PARCHE** — `src/config/index.ts`:

- **Debajo de** import product-type.model, **añadir** `import "../features/business/product/product.model";`
- **Dentro de** `routes()`, **añadir** `this.routePrv.productRoutes.routes(this.app);`

---

## 12.5 Relación ProductType ↔ Product (**obligatorio al cerrar la tabla Product**)

> Norma FK: `product_type_id` (tabla `product_types` → singular `product_type` + `_id`).

> Cuando una tabla nueva **se relaciona** con una ya existente, al final se agrega este paso:
> archivo de asociaciones + **PARCHE** en `config` para cargarlo (side-effect).

```bash
: > src/features/business/product/product.associations.ts
cat >> src/features/business/product/product.associations.ts << 'EOF'
import { Product } from "./product.model";
import { ProductType } from "../product-type/product-type.model";

Product.belongsTo(ProductType, { foreignKey: "product_type_id", as: "product_type" });
ProductType.hasMany(Product, { foreignKey: "product_type_id", as: "products" });
EOF
```
**PARCHE** — `src/config/index.ts` **ya existe**.

**Debajo de** los imports de modelos Product / ProductType (y **encima de** `import { Routes }`), **añadir**:

```ts
import "../features/business/product/product.associations";
```

Archivo **nuevo** (lab — alinea FK camelCase → snake_case antes del `sync`):


**PARCHE** — `src/config/index.ts`: **debajo de** `import { sequelize, getDatabaseInfo, testConnection } from "../database/db";`, **añadir**:

```ts
```

**Dentro de** `dbConnection()`, **reemplazar** el bloque de `sequelize.sync(...)` por el de `src/config/index.ts` del repo (`SET FOREIGN_KEY_CHECKS` en MySQL, y opcional `DB_SYNC_FORCE=true`). Con BD limpia no hace falta rename legacy.


Esto registra en Sequelize:

- `Product.belongsTo(ProductType, { foreignKey: "product_type_id", as: "product_type" })`
- `ProductType.hasMany(Product, { foreignKey: "product_type_id", as: "products" })`

### Verificación relación

```bash
curl -s -X POST http://localhost:4000/api/productos -H 'Content-Type: application/json' \
  -d '{"name":"Cola","brand":"ACME","price":2.5,"min_stock":5,"quantity":100,"product_type_id":1,"status":"active"}'
curl -s http://localhost:4000/api/productos
```

---

## 12.6 Seeder + Swagger Product

```bash
: > src/features/business/product/product.seeder.ts
cat >> src/features/business/product/product.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { Product } from "./product.model";
import { ProductType } from "../product-type/product-type.model";

/**
 * Seeder del feature Product (datos falsos con @faker-js/faker).
 * Se invoca desde `src/database/seeders` (SeedersRunner), no desde la App.
 *
 * Requiere tipos de producto activos. Idempotente: si ya hay filas, no inserta.
 */
export async function seedProducts(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  products: count=0, se omite");
    return 0;
  }

  const existing = await Product.count();
  if (existing > 0) {
    console.log(`⏭️  products: ya hay ${existing} registro(s), se omite seeder`);
    return 0;
  }

  const types = await ProductType.findAll({ where: { status: "active" } });
  if (types.length === 0) {
    console.log("⏭️  products: no hay tipos de producto activos, se omite seeder");
    return 0;
  }

  const rows = Array.from({ length: count }, () => {
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      name: faker.commerce.productName(),
      brand: faker.company.name(),
      price: Number(faker.commerce.price({ min: 5, max: 500, dec: 2 })),
      min_stock: faker.number.int({ min: 1, max: 10 }),
      quantity: faker.number.int({ min: 20, max: 100 }),
      product_type_id: type.id,
      status: "active" as const,
    };
  });

  await Product.bulkCreate(rows);
  console.log(`✅ products: insertados ${count} registro(s) falsos`);
  return count;
}
EOF
```
```bash
: > src/features/business/product/product.swagger.ts
cat >> src/features/business/product/product.swagger.ts << 'EOF'
/**
 * Documentación OpenAPI del feature Product.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints documentados como SIN AUTH (sin middleware JWT).
 */

export const productSwagger = {
  tags: [
    {
      name: "Productos",
      description: "CRUD de productos — **SIN AUTH** (sin middleware JWT)",
    },
  ],
  paths: {
    "/api/productos": {
      get: {
        tags: ["Productos"],
        summary: "Listar productos activos",
        description: "SIN AUTH — retorna productos con status=active",
        security: [],
        responses: {
          "200": {
            description: "Lista de productos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    products: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Product" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Productos"],
        summary: "Crear producto",
        description: "SIN AUTH — product_type_id debe existir y estar active",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Producto creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    product: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
          "400": { description: "Tipo de producto inactivo" },
          "404": { description: "Tipo de producto no encontrado" },
        },
      },
    },
    "/api/productos/{id}": {
      get: {
        tags: ["Productos"],
        summary: "Obtener producto por id",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Producto encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    product: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
          "404": { description: "No encontrado" },
        },
      },
      put: {
        tags: ["Productos"],
        summary: "Actualizar producto (PUT — reemplazo)",
        description: "SIN AUTH — product_type_id debe existir y estar active",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductUpdate" },
            },
          },
        },
        responses: {
          "200": { description: "Actualizado" },
          "400": { description: "Tipo de producto inactivo" },
          "404": { description: "No encontrado" },
        },
      },
      patch: {
        tags: ["Productos"],
        summary: "Actualizar producto (PATCH — parcial)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductPatch" },
            },
          },
        },
        responses: {
          "200": { description: "Actualizado" },
          "404": { description: "No encontrado" },
        },
      },
      delete: {
        tags: ["Productos"],
        summary: "Eliminar producto (físico)",
        description: "SIN AUTH — borra la fila",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Eliminado" },
          "404": { description: "No encontrado" },
        },
      },
    },
    "/api/productos/{id}/deactivate": {
      patch: {
        tags: ["Productos"],
        summary: "Eliminar producto (lógico)",
        description: "SIN AUTH — status = inactive",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Desactivado" },
          "404": { description: "No encontrado" },
        },
      },
    },
  },
  components: {
    schemas: {
      Product: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Laptop Pro" },
          brand: { type: "string", example: "TechBrand" },
          price: { type: "number", example: 1299.99 },
          min_stock: { type: "integer", example: 5 },
          quantity: { type: "integer", example: 50 },
          product_type_id: { type: "integer", example: 1 },
          status: { type: "string", enum: ["active", "inactive"], example: "active" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductCreate: {
        type: "object",
        required: ["name", "brand", "price", "min_stock", "quantity", "product_type_id"],
        properties: {
          name: { type: "string" },
          brand: { type: "string" },
          price: { type: "number" },
          min_stock: { type: "integer" },
          quantity: { type: "integer" },
          product_type_id: { type: "integer" },
          status: { type: "string", enum: ["active", "inactive"], default: "active" },
        },
      },
      ProductUpdate: {
        type: "object",
        required: ["name", "brand", "price", "min_stock", "quantity", "product_type_id"],
        properties: {
          name: { type: "string" },
          brand: { type: "string" },
          price: { type: "number" },
          min_stock: { type: "integer" },
          quantity: { type: "integer" },
          product_type_id: { type: "integer" },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
      ProductPatch: {
        type: "object",
        properties: {
          name: { type: "string" },
          brand: { type: "string" },
          price: { type: "number" },
          min_stock: { type: "integer" },
          quantity: { type: "integer" },
          product_type_id: { type: "integer" },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
    },
  },
};
EOF
```
**PARCHE** counts / SeedersRunner / swagger registry: añadir `products` (default 15), `seedProducts`, `productSwagger` (mismo patrón que ISS-06).

### Cierre del ISS

```bash
npm run dev
```

> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de continuar.

---

# 13. ISS-08 — Feature Sale + feature ProductSale (ventas)

**Objetivo:** ventas con ítems N:M vía feature propio `product-sale/` (tabla `product_sales`, API `/api/detalle-ventas`; detalle: `quantity`, `unit_price`, `line_total`); create transaccional de cabecera+ítems en `/api/ventas` con stock.  
**Bloqueado por:** ISS-07 (+ Client ISS-03).  
**API:** `/api/ventas` (cabecera) y `/api/detalle-ventas` (líneas) — **SIN AUTH**.

### Criterios de aceptación (ISS-08)

- [ ] Feature propio `src/features/business/product-sale/` (model, controller, routes, seeder, swagger, http, associations)
- [ ] Rutas `/api/detalle-ventas` montadas en aggregators
- [ ] **13.1** Modelos `sale` + feature `product-sale/` (tabla `product_sales`)
- [ ] **13.2** Controller Sale y ProductSale en orden getAll, getOne, create, update PUT/PATCH, delete físico y lógico (el create de Sale sigue siendo transaccional: cliente activo, stock, totales)
- [ ] **13.3** Routes `/api/ventas` + `/api/detalle-ventas` + http/ en ese mismo orden
- [ ] **13.4** Seeders: `sales` (cabeceras) → `product_sales` (líneas); clave `product_sales` en SeedCounts; swagger registry
- [ ] **13.5** **Relaciones** Client↔Sale (`sale.associations`) y Sale↔ProductSale↔Product (`product-sale.associations`)
- [ ] **13.6** Swagger Sale + ProductSale
- [ ] **13.7** Estado final consolidado (config / routes / seeders / swagger)

```bash
mkdir -p src/features/business/sale/http
mkdir -p src/features/business/product-sale/http
```

---

## 13.1 Modelos Sale y feature ProductSale (`product-sale/`)

```bash
: > src/features/business/sale/sale.model.ts
cat >> src/features/business/sale/sale.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface SaleI {
  id?: number;
  sale_date: Date | string;
  subtotal: number;
  tax: number;
  discounts: number;
  total: number;
  client_id: number;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Sale extends Model {
  public id!: number;
  public sale_date!: Date;
  public subtotal!: number;
  public tax!: number;
  public discounts!: number;
  public total!: number;
  public client_id!: number;
  public status!: "active" | "inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Sale.init(
  {
    sale_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discounts: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "inactive",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Sale",
    tableName: "sales",
    timestamps: true,
  }
);
EOF
```
```bash
: > src/features/business/product-sale/product-sale.model.ts
cat >> src/features/business/product-sale/product-sale.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

/**
 * Detalle N:M Sale ↔ Product (tabla `product_sales`).
 * Opción A lab: feature propio `product-sale/`; nombre de tabla `product_sales`.
 * `unit_price` = snapshot del precio al vender; `line_total` = quantity × unit_price.
 */
export interface ProductSaleI {
  id?: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  line_total: number;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProductSale extends Model {
  public id!: number;
  public sale_id!: number;
  public product_id!: number;
  public quantity!: number;
  public unit_price!: number;
  public line_total!: number;
  public status!: "active" | "inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProductSale.init(
  {
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    line_total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "inactive",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ProductSale",
    tableName: "product_sales",
    timestamps: true,
  }
);
EOF
```

## 13.1b Associations ProductSale

```bash
: > src/features/business/product-sale/product-sale.associations.ts
cat >> src/features/business/product-sale/product-sale.associations.ts << 'EOF'
import { ProductSale } from "./product-sale.model";
import { Sale } from "../sale/sale.model";
import { Product } from "../product/product.model";

ProductSale.belongsTo(Sale, { foreignKey: "sale_id", as: "sale" });
ProductSale.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Sale.hasMany(ProductSale, { foreignKey: "sale_id", as: "items" });
Product.hasMany(ProductSale, { foreignKey: "product_id", as: "sale_items" });
EOF
```

## 13.2b Controller ProductSale

```bash
: > src/features/business/product-sale/product-sale.controller.ts
cat >> src/features/business/product-sale/product-sale.controller.ts << 'EOF'
import { Request, Response } from "express";
import { Transaction } from "sequelize";
import { sequelize } from "../../../database/db";
import { ProductSale, ProductSaleI } from "./product-sale.model";
import { Sale } from "../sale/sale.model";
import { Product } from "../product/product.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

async function recalcSaleTotals(sale_id: number, t: Transaction): Promise<void> {
  const items = await ProductSale.findAll({
    where: { sale_id, status: "active" },
    transaction: t,
  });
  const subtotal = items.reduce((sum, row) => sum + Number(row.line_total), 0);
  const sale = await Sale.findByPk(sale_id, { transaction: t });
  if (!sale) return;
  const total = subtotal + Number(sale.tax) - Number(sale.discounts);
  await sale.update({ subtotal, total }, { transaction: t });
}

export class ProductSaleController {
  // ================== READ ==================
  public async getAll(req: Request, res: Response) {
    try {
      const product_sales = await ProductSale.findAll({
        where: { status: "active" },
      });
      res.status(200).json({ product_sales });
    } catch (error) {
      res.status(500).json({ error: "Error fetching product sales", detail: String(error) });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const product_sale = await ProductSale.findByPk(id);
      if (!product_sale) {
        res.status(404).json({ error: "Product sale not found" });
        return;
      }
      res.status(200).json({ product_sale });
    } catch (error) {
      res.status(500).json({ error: "Error fetching product sale", detail: String(error) });
    }
  }

  // ================== CREATE ==================
  /** Agrega una línea a una venta existente (ajusta stock y totales). */
  public async create(req: Request, res: Response) {
    const t = await sequelize.transaction();
    try {
      const body = req.body as Pick<ProductSaleI, "sale_id" | "product_id" | "quantity" | "status">;

      if (!body.sale_id || !body.product_id || !body.quantity || body.quantity < 1) {
        await t.rollback();
        res.status(400).json({ error: "sale_id, product_id and quantity (>=1) are required" });
        return;
      }

      const sale = await Sale.findByPk(body.sale_id, { transaction: t });
      if (!sale) {
        await t.rollback();
        res.status(404).json({ error: "Sale not found" });
        return;
      }
      if (sale.status !== "active") {
        await t.rollback();
        res.status(400).json({ error: "Sale must be active" });
        return;
      }

      const product = await Product.findByPk(body.product_id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!product) {
        await t.rollback();
        res.status(404).json({ error: "Product not found" });
        return;
      }
      if (product.status !== "active") {
        await t.rollback();
        res.status(400).json({ error: "Product must be active" });
        return;
      }
      if (product.quantity < body.quantity) {
        await t.rollback();
        res.status(400).json({
          error: "Insufficient stock",
          available: product.quantity,
          requested: body.quantity,
        });
        return;
      }

      const unit_price = Number(product.price);
      const line_total = unit_price * body.quantity;

      const product_sale = await ProductSale.create(
        {
          sale_id: body.sale_id,
          product_id: body.product_id,
          quantity: body.quantity,
          unit_price,
          line_total,
          status: body.status ?? "active",
        },
        { transaction: t }
      );

      await product.update(
        { quantity: product.quantity - body.quantity },
        { transaction: t }
      );
      await recalcSaleTotals(body.sale_id, t);

      await t.commit();
      res.status(201).json({ product_sale });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: "Error creating product sale", detail: String(error) });
    }
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response) {
    const t = await sequelize.transaction();
    try {
      const id = paramId(req);
      const body = req.body as Pick<ProductSaleI, "quantity" | "status">;
      const product_sale = await ProductSale.findByPk(id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!product_sale) {
        await t.rollback();
        res.status(404).json({ error: "Product sale not found" });
        return;
      }

      const newQty = Number(body.quantity);
      if (!newQty || newQty < 1) {
        await t.rollback();
        res.status(400).json({ error: "quantity (>=1) is required" });
        return;
      }

      const product = await Product.findByPk(product_sale.product_id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!product) {
        await t.rollback();
        res.status(404).json({ error: "Product not found" });
        return;
      }

      const delta = newQty - product_sale.quantity;
      if (delta > 0 && product.quantity < delta) {
        await t.rollback();
        res.status(400).json({
          error: "Insufficient stock",
          available: product.quantity,
          requested_extra: delta,
        });
        return;
      }

      const unit_price = Number(product_sale.unit_price);
      const line_total = unit_price * newQty;

      await product.update(
        { quantity: product.quantity - delta },
        { transaction: t }
      );
      await product_sale.update(
        {
          quantity: newQty,
          line_total,
          status: body.status ?? product_sale.status,
        },
        { transaction: t }
      );
      await recalcSaleTotals(product_sale.sale_id, t);

      await t.commit();
      res.status(200).json({ product_sale });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: "Error updating product sale (PUT)", detail: String(error) });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    const t = await sequelize.transaction();
    try {
      const id = paramId(req);
      const body = req.body as Partial<Pick<ProductSaleI, "quantity" | "status">>;
      const product_sale = await ProductSale.findByPk(id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!product_sale) {
        await t.rollback();
        res.status(404).json({ error: "Product sale not found" });
        return;
      }

      if (body.quantity !== undefined) {
        const newQty = Number(body.quantity);
        if (!newQty || newQty < 1) {
          await t.rollback();
          res.status(400).json({ error: "quantity must be >= 1" });
          return;
        }

        const product = await Product.findByPk(product_sale.product_id, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!product) {
          await t.rollback();
          res.status(404).json({ error: "Product not found" });
          return;
        }

        const delta = newQty - product_sale.quantity;
        if (delta > 0 && product.quantity < delta) {
          await t.rollback();
          res.status(400).json({
            error: "Insufficient stock",
            available: product.quantity,
            requested_extra: delta,
          });
          return;
        }

        await product.update(
          { quantity: product.quantity - delta },
          { transaction: t }
        );
        await product_sale.update(
          {
            quantity: newQty,
            line_total: Number(product_sale.unit_price) * newQty,
          },
          { transaction: t }
        );
      }

      if (body.status !== undefined) {
        await product_sale.update({ status: body.status }, { transaction: t });
      }

      await recalcSaleTotals(product_sale.sale_id, t);
      await t.commit();
      res.status(200).json({ product_sale });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: "Error updating product sale (PATCH)", detail: String(error) });
    }
  }

  // ================== DELETE ==================
  /** Eliminación física: restaura stock y recalcula totales de la venta */
  public async deletePhysical(req: Request, res: Response) {
    const t = await sequelize.transaction();
    try {
      const id = paramId(req);
      const product_sale = await ProductSale.findByPk(id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!product_sale) {
        await t.rollback();
        res.status(404).json({ error: "Product sale not found" });
        return;
      }

      const product = await Product.findByPk(product_sale.product_id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (product && product_sale.status === "active") {
        await product.update(
          { quantity: product.quantity + product_sale.quantity },
          { transaction: t }
        );
      }

      const sale_id = product_sale.sale_id;
      await product_sale.destroy({ transaction: t });
      await recalcSaleTotals(sale_id, t);

      await t.commit();
      res.status(200).json({ message: "Product sale permanently deleted", id });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: "Error deleting product sale", detail: String(error) });
    }
  }

  /** Eliminación lógica → status = inactive (restaura stock y recalcula) */
  public async deleteLogical(req: Request, res: Response) {
    const t = await sequelize.transaction();
    try {
      const id = paramId(req);
      const product_sale = await ProductSale.findByPk(id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!product_sale) {
        await t.rollback();
        res.status(404).json({ error: "Product sale not found" });
        return;
      }

      if (product_sale.status === "active") {
        const product = await Product.findByPk(product_sale.product_id, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (product) {
          await product.update(
            { quantity: product.quantity + product_sale.quantity },
            { transaction: t }
          );
        }
      }

      await product_sale.update({ status: "inactive" }, { transaction: t });
      await recalcSaleTotals(product_sale.sale_id, t);

      await t.commit();
      res.status(200).json({
        message: "Product sale deactivated (logical delete)",
        product_sale,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: "Error deactivating product sale", detail: String(error) });
    }
  }
}
EOF
```

## 13.3b Routes ProductSale (`/api/detalle-ventas`)

```bash
: > src/features/business/product-sale/product-sale.routes.ts
cat >> src/features/business/product-sale/product-sale.routes.ts << 'EOF'
import { Application } from "express";
import { ProductSaleController } from "./product-sale.controller";

export class ProductSaleRoutes {
  public productSaleController: ProductSaleController = new ProductSaleController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/detalle-ventas")
      .get(this.productSaleController.getAll.bind(this.productSaleController));

    // getOne
    app
      .route("/api/detalle-ventas/:id")
      .get(this.productSaleController.getOne.bind(this.productSaleController));

    // create
    app
      .route("/api/detalle-ventas")
      .post(this.productSaleController.create.bind(this.productSaleController));

    // update (PUT / PATCH)
    app
      .route("/api/detalle-ventas/:id")
      .put(this.productSaleController.updatePut.bind(this.productSaleController))
      .patch(this.productSaleController.updatePatch.bind(this.productSaleController));

    // delete físico
    app
      .route("/api/detalle-ventas/:id")
      .delete(this.productSaleController.deletePhysical.bind(this.productSaleController));

    // delete lógico
    app
      .route("/api/detalle-ventas/:id/deactivate")
      .patch(this.productSaleController.deleteLogical.bind(this.productSaleController));
  }
}
EOF
```

## 13.4b Seeder ProductSale

```bash
: > src/features/business/product-sale/product-sale.seeder.ts
cat >> src/features/business/product-sale/product-sale.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { sequelize } from "../../../database/db";
import { ProductSale } from "./product-sale.model";
import { Sale } from "../sale/sale.model";
import { Product } from "../product/product.model";

/**
 * Seeder del feature ProductSale (tabla `product_sales`).
 * Se invoca desde `src/database/seeders` (SeedersRunner), no desde la App.
 *
 * Requiere ventas y productos activos. Idempotente: si ya hay filas, omite.
 * Recalcula subtotal/total de cada venta afectada y reduce stock.
 */
export async function seedProductSales(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  product_sales: count=0, se omite");
    return 0;
  }

  const existing = await ProductSale.count();
  if (existing > 0) {
    console.log(`⏭️  product_sales: ya hay ${existing} registro(s), se omite seeder`);
    return 0;
  }

  const sales = await Sale.findAll({ where: { status: "active" } });
  const products = await Product.findAll({ where: { status: "active" } });

  if (sales.length === 0 || products.length === 0) {
    console.log("⏭️  product_sales: faltan ventas o productos activos, se omite seeder");
    return 0;
  }

  let created = 0;
  let saleIndex = 0;

  while (created < count && saleIndex < sales.length * 3) {
    const sale = sales[saleIndex % sales.length];
    saleIndex += 1;

    const t = await sequelize.transaction();
    try {
      const product = products[Math.floor(Math.random() * products.length)];
      const fresh = await Product.findByPk(product.id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!fresh || fresh.quantity < 1) {
        await t.rollback();
        continue;
      }

      const quantity = Math.min(
        fresh.quantity,
        faker.number.int({ min: 1, max: Math.min(3, fresh.quantity) })
      );
      const unit_price = Number(fresh.price);
      const line_total = unit_price * quantity;

      await ProductSale.create(
        {
          sale_id: sale.id,
          product_id: fresh.id,
          quantity,
          unit_price,
          line_total,
          status: "active",
        },
        { transaction: t }
      );

      await fresh.update(
        { quantity: fresh.quantity - quantity },
        { transaction: t }
      );

      const items = await ProductSale.findAll({
        where: { sale_id: sale.id, status: "active" },
        transaction: t,
      });
      const subtotal = items.reduce((sum, row) => sum + Number(row.line_total), 0);
      const saleRow = await Sale.findByPk(sale.id, { transaction: t });
      if (saleRow) {
        const total = subtotal + Number(saleRow.tax) - Number(saleRow.discounts);
        await saleRow.update({ subtotal, total }, { transaction: t });
      }

      await t.commit();
      created += 1;
    } catch {
      await t.rollback();
    }
  }

  console.log(`✅ product_sales: insertados ${created} registro(s) falsos`);
  return created;
}
EOF
```

## 13.6b Swagger ProductSale

```bash
: > src/features/business/product-sale/product-sale.swagger.ts
cat >> src/features/business/product-sale/product-sale.swagger.ts << 'EOF'
/**
 * Documentación OpenAPI del feature ProductSale (tabla product_sales).
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints documentados como SIN AUTH (sin middleware JWT).
 */

export const productSaleSwagger = {
  tags: [
    {
      name: "DetalleVentas",
      description:
        "CRUD de líneas Sale↔Product (tabla product_sales) — **SIN AUTH** (sin middleware JWT)",
    },
  ],
  paths: {
    "/api/detalle-ventas": {
      get: {
        tags: ["DetalleVentas"],
        summary: "Listar detalles de venta activos",
        description: "SIN AUTH — retorna product_sales con status=active",
        security: [],
        responses: {
          "200": {
            description: "Lista de detalles",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    product_sales: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ProductSale" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["DetalleVentas"],
        summary: "Agregar línea a una venta",
        description:
          "SIN AUTH — valida venta/producto activos y stock; crea product_sale, reduce quantity y recalcula totales de la venta",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductSaleCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Línea creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    product_sale: { $ref: "#/components/schemas/ProductSale" },
                  },
                },
              },
            },
          },
          "400": { description: "Validación (venta/producto/stock)" },
          "404": { description: "Venta o producto no encontrado" },
        },
      },
    },
    "/api/detalle-ventas/{id}": {
      get: {
        tags: ["DetalleVentas"],
        summary: "Obtener detalle por id",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Detalle encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    product_sale: { $ref: "#/components/schemas/ProductSale" },
                  },
                },
              },
            },
          },
          "404": { description: "No encontrado" },
        },
      },
      put: {
        tags: ["DetalleVentas"],
        summary: "Actualizar cantidad de línea (PUT)",
        description: "SIN AUTH — ajusta stock y recalcula totales",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductSaleUpdate" },
            },
          },
        },
        responses: {
          "200": { description: "Actualizado" },
          "400": { description: "Stock insuficiente" },
          "404": { description: "No encontrado" },
        },
      },
      patch: {
        tags: ["DetalleVentas"],
        summary: "Actualizar línea (PATCH — parcial)",
        description: "SIN AUTH — quantity y/ o status",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductSalePatch" },
            },
          },
        },
        responses: {
          "200": { description: "Actualizado" },
          "404": { description: "No encontrado" },
        },
      },
      delete: {
        tags: ["DetalleVentas"],
        summary: "Eliminar línea (físico)",
        description: "SIN AUTH — restaura stock y recalcula totales",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Eliminado" },
          "404": { description: "No encontrado" },
        },
      },
    },
    "/api/detalle-ventas/{id}/deactivate": {
      patch: {
        tags: ["DetalleVentas"],
        summary: "Eliminar línea (lógico)",
        description: "SIN AUTH — status = inactive; restaura stock y recalcula totales",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Desactivado" },
          "404": { description: "No encontrado" },
        },
      },
    },
  },
  components: {
    schemas: {
      ProductSale: {
        type: "object",
        description:
          "Detalle N:M Sale↔Product (tabla product_sales). quantity, unit_price (snapshot), line_total = quantity × unit_price",
        properties: {
          id: { type: "integer", example: 1 },
          sale_id: { type: "integer", example: 1 },
          product_id: { type: "integer", example: 1 },
          quantity: { type: "integer", example: 2 },
          unit_price: { type: "number", example: 100.0 },
          line_total: { type: "number", example: 200.0 },
          status: { type: "string", enum: ["active", "inactive"], example: "active" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductSaleCreate: {
        type: "object",
        required: ["sale_id", "product_id", "quantity"],
        properties: {
          sale_id: { type: "integer" },
          product_id: { type: "integer" },
          quantity: { type: "integer", minimum: 1 },
          status: { type: "string", enum: ["active", "inactive"], default: "active" },
        },
      },
      ProductSaleUpdate: {
        type: "object",
        required: ["quantity"],
        properties: {
          quantity: { type: "integer", minimum: 1 },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
      ProductSalePatch: {
        type: "object",
        properties: {
          quantity: { type: "integer", minimum: 1 },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
    },
  },
};
EOF
```

### HTTP ProductSale get

```bash
: > src/features/business/product-sale/http/product-sales.get.http
cat >> src/features/business/product-sale/http/product-sales.get.http << 'EOF'
### Feature ProductSale — GET
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name getProductSales
GET {{baseUrl}}/api/detalle-ventas

###

# @name getProductSale
GET {{baseUrl}}/api/detalle-ventas/1
EOF
```

### HTTP ProductSale create

```bash
: > src/features/business/product-sale/http/product-sales.create.http
cat >> src/features/business/product-sale/http/product-sales.create.http << 'EOF'
### Feature ProductSale — CREATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name createProductSale
POST {{baseUrl}}/api/detalle-ventas
Content-Type: application/json

{
  "sale_id": 1,
  "product_id": 1,
  "quantity": 2,
  "status": "active"
}
EOF
```

### HTTP ProductSale update

```bash
: > src/features/business/product-sale/http/product-sales.update.http
cat >> src/features/business/product-sale/http/product-sales.update.http << 'EOF'
### Feature ProductSale — UPDATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name updateProductSalePut
PUT {{baseUrl}}/api/detalle-ventas/1
Content-Type: application/json

{
  "quantity": 3,
  "status": "active"
}

###

# @name updateProductSalePatch
PATCH {{baseUrl}}/api/detalle-ventas/1
Content-Type: application/json

{
  "quantity": 1
}
EOF
```

### HTTP ProductSale delete

```bash
: > src/features/business/product-sale/http/product-sales.delete.http
cat >> src/features/business/product-sale/http/product-sales.delete.http << 'EOF'
### Feature ProductSale — DELETE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name deleteProductSalePhysical
DELETE {{baseUrl}}/api/detalle-ventas/1

###

# @name deleteProductSaleLogical
PATCH {{baseUrl}}/api/detalle-ventas/1/deactivate
EOF
```
---

## 13.2 Controller + routes

```bash
: > src/features/business/sale/sale.controller.ts
cat >> src/features/business/sale/sale.controller.ts << 'EOF'
import { Request, Response } from "express";
import { sequelize } from "../../../database/db";
import { Sale, SaleI } from "./sale.model";
import { ProductSale } from "../product-sale/product-sale.model";
import { Client } from "../client/client.model";
import { Product } from "../product/product.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

type SaleItemInput = { product_id: number; quantity: number };

type SaleCreateBody = {
  client_id: number;
  tax?: number;
  discounts?: number;
  sale_date?: Date | string;
  status?: "active" | "inactive";
  items: SaleItemInput[];
};

export class SaleController {
  // ================== READ ==================
  public async getAll(req: Request, res: Response) {
    try {
      const sales = await Sale.findAll({
        where: { status: "active" },
        include: [{ model: ProductSale, as: "items" }],
      });
      res.status(200).json({ sales });
    } catch (error) {
      res.status(500).json({ error: "Error fetching sales", detail: String(error) });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const sale = await Sale.findByPk(id, {
        include: [{ model: ProductSale, as: "items" }],
      });
      if (!sale) {
        res.status(404).json({ error: "Sale not found" });
        return;
      }
      res.status(200).json({ sale });
    } catch (error) {
      res.status(500).json({ error: "Error fetching sale", detail: String(error) });
    }
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response) {
    const t = await sequelize.transaction();
    try {
      const body = req.body as SaleCreateBody;

      if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
        await t.rollback();
        res.status(400).json({ error: "Sale requires at least one item" });
        return;
      }

      const client = await Client.findByPk(body.client_id, { transaction: t });
      if (!client) {
        await t.rollback();
        res.status(404).json({ error: "Client not found" });
        return;
      }
      if (client.status !== "active") {
        await t.rollback();
        res.status(400).json({ error: "Client must be active" });
        return;
      }

      const lineRows: Array<{
        product_id: number;
        quantity: number;
        unit_price: number;
        line_total: number;
        product: Product;
      }> = [];

      let subtotal = 0;

      for (const item of body.items) {
        const product = await Product.findByPk(item.product_id, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!product) {
          await t.rollback();
          res.status(404).json({ error: `Product not found: ${item.product_id}` });
          return;
        }
        if (product.status !== "active") {
          await t.rollback();
          res.status(400).json({ error: `Product must be active: ${item.product_id}` });
          return;
        }
        if (product.quantity < item.quantity) {
          await t.rollback();
          res.status(400).json({
            error: `Insufficient stock for product ${item.product_id}`,
            available: product.quantity,
            requested: item.quantity,
          });
          return;
        }

        const unit_price = Number(product.price);
        const line_total = unit_price * item.quantity;
        subtotal += line_total;
        lineRows.push({
          product_id: product.id,
          quantity: item.quantity,
          unit_price,
          line_total,
          product,
        });
      }

      const tax = Number(body.tax ?? 0);
      const discounts = Number(body.discounts ?? 0);
      const total = subtotal + tax - discounts;

      const sale = await Sale.create(
        {
          sale_date: body.sale_date ?? new Date(),
          subtotal,
          tax,
          discounts,
          total,
          client_id: body.client_id,
          status: body.status ?? "active",
        },
        { transaction: t }
      );

      const items = [];
      for (const line of lineRows) {
        const productSale = await ProductSale.create(
          {
            sale_id: sale.id,
            product_id: line.product_id,
            quantity: line.quantity,
            unit_price: line.unit_price,
            line_total: line.line_total,
            status: "active",
          },
          { transaction: t }
        );
        await line.product.update(
          { quantity: line.product.quantity - line.quantity },
          { transaction: t }
        );
        items.push(productSale);
      }

      await t.commit();
      res.status(201).json({ sale, items });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: "Error creating sale", detail: String(error) });
    }
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<SaleI>;
      const sale = await Sale.findByPk(id);
      if (!sale) {
        res.status(404).json({ error: "Sale not found" });
        return;
      }

      const tax = Number(body.tax ?? 0);
      const discounts = Number(body.discounts ?? 0);
      const subtotal = Number(sale.subtotal);
      const total = subtotal + tax - discounts;

      await sale.update({
        sale_date: body.sale_date ?? sale.sale_date,
        tax,
        discounts,
        total,
        client_id: body.client_id ?? sale.client_id,
        status: body.status ?? sale.status,
      });

      const withItems = await Sale.findByPk(sale.id, {
        include: [{ model: ProductSale, as: "items" }],
      });
      res.status(200).json({ sale: withItems });
    } catch (error) {
      res.status(500).json({ error: "Error updating sale (PUT)", detail: String(error) });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<SaleI>;
      const sale = await Sale.findByPk(id);
      if (!sale) {
        res.status(404).json({ error: "Sale not found" });
        return;
      }

      const tax = body.tax !== undefined ? Number(body.tax) : Number(sale.tax);
      const discounts =
        body.discounts !== undefined ? Number(body.discounts) : Number(sale.discounts);
      const needsRecalc = body.tax !== undefined || body.discounts !== undefined;
      const total = needsRecalc
        ? Number(sale.subtotal) + tax - discounts
        : Number(sale.total);

      const patch: Partial<SaleI> & { total?: number } = { ...body };
      if (needsRecalc) {
        patch.tax = tax;
        patch.discounts = discounts;
        patch.total = total;
      }

      await sale.update(patch);

      const withItems = await Sale.findByPk(sale.id, {
        include: [{ model: ProductSale, as: "items" }],
      });
      res.status(200).json({ sale: withItems });
    } catch (error) {
      res.status(500).json({ error: "Error updating sale (PATCH)", detail: String(error) });
    }
  }

  // ================== DELETE ==================
  /** Eliminación física: product_sales luego sale (transacción) */
  public async deletePhysical(req: Request, res: Response) {
    const t = await sequelize.transaction();
    try {
      const id = paramId(req);
      const sale = await Sale.findByPk(id, { transaction: t });
      if (!sale) {
        await t.rollback();
        res.status(404).json({ error: "Sale not found" });
        return;
      }

      await ProductSale.destroy({ where: { sale_id: id }, transaction: t });
      await sale.destroy({ transaction: t });
      await t.commit();
      res.status(200).json({ message: "Sale permanently deleted", id });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: "Error deleting sale", detail: String(error) });
    }
  }

  /** Eliminación lógica → status = inactive (sale + items) */
  public async deleteLogical(req: Request, res: Response) {
    const t = await sequelize.transaction();
    try {
      const id = paramId(req);
      const sale = await Sale.findByPk(id, { transaction: t });
      if (!sale) {
        await t.rollback();
        res.status(404).json({ error: "Sale not found" });
        return;
      }

      await sale.update({ status: "inactive" }, { transaction: t });
      await ProductSale.update(
        { status: "inactive" },
        { where: { sale_id: id }, transaction: t }
      );
      await t.commit();

      const withItems = await Sale.findByPk(id, {
        include: [{ model: ProductSale, as: "items" }],
      });
      res.status(200).json({
        message: "Sale deactivated (logical delete)",
        sale: withItems,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: "Error deactivating sale", detail: String(error) });
    }
  }
}
EOF
```
```bash
: > src/features/business/sale/sale.routes.ts
cat >> src/features/business/sale/sale.routes.ts << 'EOF'
import { Application } from "express";
import { SaleController } from "./sale.controller";

export class SaleRoutes {
  public saleController: SaleController = new SaleController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/ventas")
      .get(this.saleController.getAll.bind(this.saleController));

    // getOne
    app
      .route("/api/ventas/:id")
      .get(this.saleController.getOne.bind(this.saleController));

    // create
    app
      .route("/api/ventas")
      .post(this.saleController.create.bind(this.saleController));

    // update (PUT / PATCH)
    app
      .route("/api/ventas/:id")
      .put(this.saleController.updatePut.bind(this.saleController))
      .patch(this.saleController.updatePatch.bind(this.saleController));

    // delete físico
    app
      .route("/api/ventas/:id")
      .delete(this.saleController.deletePhysical.bind(this.saleController));

    // delete lógico
    app
      .route("/api/ventas/:id/deactivate")
      .patch(this.saleController.deleteLogical.bind(this.saleController));
  }
}
EOF
```
---

## 13.3 HTTP

```bash
: > src/features/business/sale/http/sales.get.http
cat >> src/features/business/sale/http/sales.get.http << 'EOF'
### Feature Sale — GET ALL / GET ONE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name getAllSales
GET {{baseUrl}}/api/ventas

###

# @name getOneSale
GET {{baseUrl}}/api/ventas/{{id}}
EOF
```

```bash
: > src/features/business/sale/http/sales.create.http
cat >> src/features/business/sale/http/sales.create.http << 'EOF'
### Feature Sale — CREATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name createSale
POST {{baseUrl}}/api/ventas
Content-Type: application/json

{
  "client_id": 1,
  "tax": 19,
  "discounts": 5,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 2, "quantity": 1 }
  ]
}
EOF
```
```bash
: > src/features/business/sale/http/sales.update.http
cat >> src/features/business/sale/http/sales.update.http << 'EOF'
### Feature Sale — UPDATE (PUT) / UPDATE (PATCH) — solo cabecera
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name updateSalePut
PUT {{baseUrl}}/api/ventas/{{id}}
Content-Type: application/json

{
  "client_id": 1,
  "tax": 20,
  "discounts": 10,
  "sale_date": "2026-09-16T12:00:00.000Z",
  "status": "active"
}

###

# @name updateSalePatch
PATCH {{baseUrl}}/api/ventas/{{id}}
Content-Type: application/json

{
  "tax": 15,
  "discounts": 0
}
EOF
```
```bash
: > src/features/business/sale/http/sales.delete.http
cat >> src/features/business/sale/http/sales.delete.http << 'EOF'
### Feature Sale — DELETE físico / DELETE lógico (status = inactive)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name deleteSalePhysical
DELETE {{baseUrl}}/api/ventas/{{id}}

###

# @name deleteSaleLogical
PATCH {{baseUrl}}/api/ventas/{{id}}/deactivate
EOF
```
---

## 13.4 Cableado

**PARCHE** — `src/routes/index.ts`: import + `saleRoutes`.

**PARCHE** — `src/config/index.ts`:

- **Debajo de** import product.model, **añadir**:

```ts
import "../features/business/sale/sale.model";
import "../features/business/product-sale/product-sale.model";
```

- **Dentro de** `routes()`, **añadir** `this.routePrv.saleRoutes.routes(this.app);`

---

## 13.5 Relaciones Sale / ProductSale / Client / Product (**obligatorio**)

> Norma FK: `client_id`, `sale_id`, `product_id` (singular de la tabla referenciada + `_id`).

```bash
: > src/features/business/sale/sale.associations.ts
cat >> src/features/business/sale/sale.associations.ts << 'EOF'
import { Sale } from "./sale.model";
import { Client } from "../client/client.model";

Sale.belongsTo(Client, { foreignKey: "client_id", as: "client" });
Client.hasMany(Sale, { foreignKey: "client_id", as: "sales" });
EOF
```
**PARCHE** — `src/config/index.ts` **ya existe**.

**Debajo de** `import "../features/business/product/product.associations";`, **añadir**:

```ts
import "../features/business/sale/sale.associations";
```

Relaciones registradas:

- `Sale.belongsTo(Client)` / `Client.hasMany(Sale)` — en `sale.associations.ts`
- `ProductSale.belongsTo(Sale|Product)` / `Sale.hasMany(items)` / `Product.hasMany(sale_items)` — en `product-sale.associations.ts`

**PARCHE** — también importar side-effect:

```ts
import "../features/business/product-sale/product-sale.associations";
```

### Verificación venta

```bash
curl -s -X POST http://localhost:4000/api/ventas -H 'Content-Type: application/json' \
  -d '{"client_id":1,"tax":0,"discounts":0,"items":[{"product_id":1,"quantity":2}],"status":"active"}'
curl -s http://localhost:4000/api/ventas
curl -s http://localhost:4000/api/detalle-ventas
```

---

## 13.6 Seeder + Swagger Sale

```bash
: > src/features/business/sale/sale.seeder.ts
cat >> src/features/business/sale/sale.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { Sale } from "./sale.model";
import { Client } from "../client/client.model";

/**
 * Seeder del feature Sale (cabeceras).
 * Las líneas `product_sales` las inserta `product-sale.seeder.ts`.
 * Idempotente: si ya hay ventas, no inserta.
 */
export async function seedSales(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  sales: count=0, se omite");
    return 0;
  }

  const existing = await Sale.count();
  if (existing > 0) {
    console.log(`⏭️  sales: ya hay ${existing} registro(s), se omite seeder`);
    return 0;
  }

  const clients = await Client.findAll({ where: { status: "active" } });
  if (clients.length === 0) {
    console.log("⏭️  sales: faltan clientes activos, se omite seeder");
    return 0;
  }

  const rows = Array.from({ length: count }, () => {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const tax = Number(faker.number.float({ min: 0, max: 20, fractionDigits: 2 }));
    const discounts = Number(faker.number.float({ min: 0, max: 10, fractionDigits: 2 }));
    return {
      sale_date: faker.date.recent({ days: 30 }),
      subtotal: 0,
      tax,
      discounts,
      total: tax - discounts,
      client_id: client.id,
      status: "active" as const,
    };
  });

  await Sale.bulkCreate(rows);
  console.log(`✅ sales: insertados ${count} registro(s) falsos (sin ítems)`);
  return count;
}
EOF
```
```bash
: > src/features/business/sale/sale.swagger.ts
cat >> src/features/business/sale/sale.swagger.ts << 'EOF'
/**
 * Documentación OpenAPI del feature Sale.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints documentados como SIN AUTH (sin middleware JWT).
 */

export const saleSwagger = {
  tags: [
    {
      name: "Ventas",
      description: "CRUD de ventas — **SIN AUTH** (sin middleware JWT)",
    },
  ],
  paths: {
    "/api/ventas": {
      get: {
        tags: ["Ventas"],
        summary: "Listar ventas activas",
        description: "SIN AUTH — retorna ventas con status=active e items (ProductSale)",
        security: [],
        responses: {
          "200": {
            description: "Lista de ventas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    sales: {
                      type: "array",
                      items: { $ref: "#/components/schemas/SaleWithItems" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Ventas"],
        summary: "Crear venta (transaccional)",
        description:
          "SIN AUTH — valida cliente/productos activos y stock; crea Sale + ProductSale y reduce quantity",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SaleCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Venta creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    sale: { $ref: "#/components/schemas/Sale" },
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ProductSale" },
                    },
                  },
                },
              },
            },
          },
          "400": { description: "Validación (cliente/producto/stock)" },
          "404": { description: "Cliente o producto no encontrado" },
        },
      },
    },
    "/api/ventas/{id}": {
      get: {
        tags: ["Ventas"],
        summary: "Obtener venta por id",
        description: "SIN AUTH — incluye items",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Venta encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    sale: { $ref: "#/components/schemas/SaleWithItems" },
                  },
                },
              },
            },
          },
          "404": { description: "No encontrado" },
        },
      },
      put: {
        tags: ["Ventas"],
        summary: "Actualizar cabecera de venta (PUT)",
        description:
          "SIN AUTH — solo tax, discounts, client_id, sale_date, status; recalcula total; no reescribe items",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SaleUpdate" },
            },
          },
        },
        responses: {
          "200": { description: "Actualizado" },
          "404": { description: "No encontrado" },
        },
      },
      patch: {
        tags: ["Ventas"],
        summary: "Actualizar cabecera de venta (PATCH)",
        description: "SIN AUTH — parcial; recalcula total si cambian tax/discounts",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SalePatch" },
            },
          },
        },
        responses: {
          "200": { description: "Actualizado" },
          "404": { description: "No encontrado" },
        },
      },
      delete: {
        tags: ["Ventas"],
        summary: "Eliminar venta (físico)",
        description: "SIN AUTH — borra product_sales y luego la venta (transacción)",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Eliminado" },
          "404": { description: "No encontrado" },
        },
      },
    },
    "/api/ventas/{id}/deactivate": {
      patch: {
        tags: ["Ventas"],
        summary: "Eliminar venta (lógico)",
        description: "SIN AUTH — status = inactive en venta e items",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Desactivado" },
          "404": { description: "No encontrado" },
        },
      },
    },
  },
  components: {
    schemas: {
      // ProductSale schema vive en product-sale.swagger.ts (feature propio)
      Sale: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          sale_date: { type: "string", format: "date-time" },
          subtotal: { type: "number", example: 200.0 },
          tax: { type: "number", example: 19.0 },
          discounts: { type: "number", example: 5.0 },
          total: { type: "number", example: 214.0 },
          client_id: { type: "integer", example: 1 },
          status: { type: "string", enum: ["active", "inactive"], example: "active" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      SaleWithItems: {
        allOf: [
          { $ref: "#/components/schemas/Sale" },
          {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/ProductSale" },
              },
            },
          },
        ],
      },
      SaleCreate: {
        type: "object",
        required: ["client_id", "items"],
        properties: {
          client_id: { type: "integer" },
          tax: { type: "number", default: 0 },
          discounts: { type: "number", default: 0 },
          sale_date: { type: "string", format: "date-time" },
          status: { type: "string", enum: ["active", "inactive"], default: "active" },
          items: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["product_id", "quantity"],
              properties: {
                product_id: { type: "integer" },
                quantity: { type: "integer", minimum: 1 },
              },
            },
          },
        },
      },
      SaleUpdate: {
        type: "object",
        properties: {
          sale_date: { type: "string", format: "date-time" },
          tax: { type: "number" },
          discounts: { type: "number" },
          client_id: { type: "integer" },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
      SalePatch: {
        type: "object",
        properties: {
          sale_date: { type: "string", format: "date-time" },
          tax: { type: "number" },
          discounts: { type: "number" },
          client_id: { type: "integer" },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
    },
  },
};
EOF
```
---

## 13.7 Estado final de agregadores (reemplazar / alinear)

Tras ISS-06…08, estos archivos quedan así (podés **reemplazar** el contenido completo con `cat >>` si preferís evitar parches acumulados):

### `src/routes/index.ts`

```bash
: > src/routes/index.ts
cat >> src/routes/index.ts << 'EOF'
import { ClientRoutes } from "../features/business/client/client.routes";
import { ProductTypeRoutes } from "../features/business/product-type/product-type.routes";
import { ProductRoutes } from "../features/business/product/product.routes";
import { SaleRoutes } from "../features/business/sale/sale.routes";
import { ProductSaleRoutes } from "../features/business/product-sale/product-sale.routes";

export class Routes {
  public clientRoutes: ClientRoutes = new ClientRoutes();
  public productTypeRoutes: ProductTypeRoutes = new ProductTypeRoutes();
  public productRoutes: ProductRoutes = new ProductRoutes();
  public saleRoutes: SaleRoutes = new SaleRoutes();
  public productSaleRoutes: ProductSaleRoutes = new ProductSaleRoutes();
}
EOF
```
### `src/database/seeders/counts.ts`

```bash
: > src/database/seeders/counts.ts
cat >> src/database/seeders/counts.ts << 'EOF'
/**
 * Cantidad de registros por tabla (snake_case = nombre de tabla BD).
 * Prioridad: CLI (--clients=N) > env (SEED_CLIENTS) > default de este archivo.
 *
 * Cuando agregues features, suma aquí la clave (nombre de tabla) y léela en el runner.
 */
export type SeedCounts = {
  clients: number;
  product_types: number;
  products: number;
  sales: number;
  product_sales: number;
  // users?: number;
  // roles?: number;
};

export const DEFAULT_SEED_COUNTS: SeedCounts = {
  clients: 10,
  product_types: 25,
  products: 15,
  sales: 5,
  product_sales: 12,
};

export function resolveSeedCounts(argv: string[] = process.argv.slice(2)): SeedCounts {
  const counts: SeedCounts = { ...DEFAULT_SEED_COUNTS };

  const envMap: Array<[keyof SeedCounts, string | undefined]> = [
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
EOF
```
### `src/database/seeders/index.ts`

```bash
: > src/database/seeders/index.ts
cat >> src/database/seeders/index.ts << 'EOF'
import dotenv from "dotenv";
import { sequelize, testConnection } from "../db";
import "../../features/business/client/client.model";
import "../../features/business/product-type/product-type.model";
import "../../features/business/product/product.model";
import "../../features/business/sale/sale.model";
import "../../features/business/product-sale/product-sale.model";
import "../../features/business/product/product.associations";
import "../../features/business/sale/sale.associations";
import "../../features/business/product-sale/product-sale.associations";
import { seedClients } from "../../features/business/client/client.seeder";
import { seedProductTypes } from "../../features/business/product-type/product-type.seeder";
import { seedProducts } from "../../features/business/product/product.seeder";
import { seedSales } from "../../features/business/sale/sale.seeder";
import { seedProductSales } from "../../features/business/product-sale/product-sale.seeder";
import { resolveSeedCounts } from "./counts";

dotenv.config();

/**
 * SeedersRunner — ejecuta los seeders de TODAS las tablas (features).
 *
 * Tablas actuales (orden padres → hijos):
 *   clients → product_types → products → sales → product_sales
 *
 * Ejecutar seeders de todas las tablas:
 *   npm run db:seed
 *
 * Variar cantidades (CLI o env; claves = nombre de tabla):
 *   npm run db:seed -- --clients=20 --product_types=5 --products=15 --sales=5 --product_sales=12
 *   SEED_CLIENTS=5 SEED_PRODUCT_TYPES=3 SEED_PRODUCTS=10 SEED_SALES=2 SEED_PRODUCT_SALES=6 npm run db:seed
 *
 * Defaults: ver `counts.ts`. Cada seeder es idempotente (si ya hay filas, omite).
 * Ubicación de cada seeder: `src/features/.../<entidad>.seeder.ts`
 * Este archivo solo orquesta; no define datos.
 */
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

  // Orden: business (padres → hijos)
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
### `src/swagger/index.ts`

```bash
: > src/swagger/index.ts
cat >> src/swagger/index.ts << 'EOF'
import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import { clientSwagger } from "../features/business/client/client.swagger";
import { productTypeSwagger } from "../features/business/product-type/product-type.swagger";
import { productSwagger } from "../features/business/product/product.swagger";
import { saleSwagger } from "../features/business/sale/sale.swagger";
import { productSaleSwagger } from "../features/business/product-sale/product-sale.swagger";

export type FeatureSwaggerModule = {
  tags: unknown[];
  paths: Record<string, unknown>;
  components?: { schemas?: Record<string, unknown> };
};

/**
 * Registry externo: importa la documentación OpenAPI de cada feature
 * (mismo patrón que SeedersRunner).
 */
const featureSwaggerModules: FeatureSwaggerModule[] = [
  clientSwagger,
  productTypeSwagger,
  productSwagger,
  saleSwagger,
  productSaleSwagger,
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
      version: "1.0.0",
      description:
        "API StoreLab (Express + Sequelize). Los endpoints de business están documentados como **SIN AUTH** (este lab no implementa autenticación).",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: "Local",
      },
    ],
    tags,
    paths,
    components: { schemas },
  };
}

/** Monta Swagger UI y el JSON OpenAPI */
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
### Estado final `src/config/index.ts` (consolida ISS-01…08)

```bash
: > src/config/index.ts
cat >> src/config/index.ts << 'EOF'
import dotenv from "dotenv";
import express, { Application } from "express";
import morgan from "morgan";
var cors = require("cors");
import { sequelize, getDatabaseInfo, testConnection } from "../database/db";
import "../features/business/client/client.model";
import "../features/business/product-type/product-type.model";
import "../features/business/product/product.model";
import "../features/business/sale/sale.model";
import "../features/business/product-sale/product-sale.model";
import "../features/business/product/product.associations";
import "../features/business/sale/sale.associations";
import "../features/business/product-sale/product-sale.associations";
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
    this.dbConnection();
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
    this.routePrv.clientRoutes.routes(this.app);
    this.routePrv.productTypeRoutes.routes(this.app);
    this.routePrv.productRoutes.routes(this.app);
    this.routePrv.saleRoutes.routes(this.app);
    this.routePrv.productSaleRoutes.routes(this.app);
  }

  private docs(): void {
    setupSwagger(this.app);
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
    await this.app.listen(this.app.get('port'));
    console.log(`🚀 Servidor ejecutándose en puerto ${this.app.get('port')}`);
  }
}
EOF
```

**PARCHE** — `src/config/index.ts`: al cerrar ISS-08 el bloque de imports de modelos/asociaciones y `routes()` debe quedar como en el repo (models client→product-type→product→sale→product-sale; associations product + sale + product-sale; `routes()` registra las **5** features business).

### Verificación ISS-08 / business completo

```bash
npx tsc --noEmit
npm run db:seed
curl -s http://localhost:4000/api/tipos-producto | head
curl -s http://localhost:4000/api/productos | head
curl -s http://localhost:4000/api/ventas | head
curl -s http://localhost:4000/api/detalle-ventas | head
```

### Cierre del ISS

```bash
npm run dev
```

> Swagger: `http://localhost:4000/api/docs`. El servidor debe arrancar sin error.

---

# 14. Estructura final (tras ISS-08)

## DoD del laboratorio (business SIN AUTH)

Al cerrar ISS-08 el backend está **completo para este lab**:

- [ ] 5 features: `client`, `product-type`, `product`, `sale`, `product-sale`
- [ ] 5 tablas: `clients`, `product_types`, `products`, `sales`, `product_sales`
- [ ] APIs: `/api/clientes`, `/api/tipos-producto`, `/api/productos`, `/api/ventas`, `/api/detalle-ventas`
- [ ] SeedersRunner + Swagger `/api/docs`
- [ ] **Sin** autenticación ni autorización (todas las rutas SIN AUTH)
- [ ] `npx tsc --noEmit` OK

Consulta de campos/tablas (opcional): `docs/BD_STORELAB_ENTIDADES_Y_ARQUITECTURA_BACKEND_FRONTEND.md`.


```text
app-storelab-express/
├── src/
│   ├── config/index.ts
│   ├── database/
│   │   ├── db.ts
│   │   └── seeders/{counts,index}.ts
│   ├── features/
│   │   └── business/
│   │       ├── client/
│   │       ├── product-type/     # + http + seeder + swagger
│   │       ├── product/          # + associations + http + seeder + swagger
│   │       ├── sale/             # cabecera + sale.associations + http + seeder + swagger
│   │       └── product-sale/     # pivote product_sales + associations + CRUD + seeder + swagger
│   ├── routes/index.ts
│   ├── swagger/index.ts
│   └── server.ts
└── …
```

| Método | Ruta | Nota |
|--------|------|------|
| * | `/api/clientes…` | SIN AUTH (ISS-03) |
| * | `/api/tipos-producto…` | SIN AUTH (ISS-06) |
| * | `/api/productos…` | SIN AUTH (ISS-07) |
| * | `/api/ventas…` | SIN AUTH (ISS-08) |
| * | `/api/detalle-ventas…` | SIN AUTH (ISS-08 · ProductSale) |
| GET | `/api/docs` | Swagger UI |
| GET | `/api/docs.json` | OpenAPI JSON |

### Norma de nombres (carpeta, clase, tabla, FK)

| Pieza | Norma | Ejemplo |
|-------|-------|---------|
| Carpeta feature | kebab-case | `product-type/`, `product-sale/` |
| Clase | PascalCase singular | `Client`, `ProductType`, `Sale`, `ProductSale` |
| Tabla BD | snake_case plural (compuestos con `_`) | `clients`, `product_types`, `product_sales` |
| FK | singular de la tabla referenciada + `_id` | `client_id`, `product_type_id`, `sale_id`, `product_id` |
| Columnas de negocio | snake_case | `min_stock`, `sale_date`, `unit_price`, `line_total` |
| SeedCounts / JSON compuestos | snake_case | `product_types`, `product_sales`, `product_type` |

No uses camelCase en tablas (`productTypes` ❌ → `product_types` ✅).

En `*.associations.ts`:

```ts
Sale.belongsTo(Client, { foreignKey: "client_id", as: "client" });
Client.hasMany(Sale, { foreignKey: "client_id", as: "sales" });
ProductSale.belongsTo(Sale, { foreignKey: "sale_id", as: "sale" });
Sale.hasMany(ProductSale, { foreignKey: "sale_id", as: "items" });
Product.hasMany(ProductSale, { foreignKey: "product_id", as: "sale_items" });
```

Con BD limpia, `sequelize.sync` crea FKs snake_case desde modelos/`*.associations.ts`.
Opcional: `DB_SYNC_FORCE=true npm run dev` recrea tablas.

### Cómo repetir el patrón (otra entidad)

```text
ISS-n-A…E  CRUD + http (cat >> / PARCHE)
ISS-n-F    seeder + PARCHE counts/runner
ISS-n-G    swagger + PARCHE registry
ISS-n-R    si hay FK `tabla_singular_id`: associations.ts + PARCHE config
```

---


# 15. Referencia rápida de paquetes

```bash
npm install express@^5.2.1 cors@^2.8.6 dotenv@^17.4.2 morgan@^1.12.1 \
  sequelize@^6.37.8 mysql2@^3.24.4 pg@^8.23.0 pg-hstore@^2.3.4 \
  tedious@^20.0.0 oracledb@^7.0.1 bcryptjs@^3.0.3 \
  swagger-ui-express@^5.0.1

npm install -D typescript@~5.9.2 ts-node@^10.9.2 nodemon@^3.1.14 \
  @types/node@^22.20.3 @types/express@^5.0.6 \
  @types/cors@^2.8.19 @types/morgan@^1.9.10 \
  @types/sequelize@^6.12.0 @types/bcryptjs@^3.0.0 \
  @types/swagger-ui-express@^4.1.8 \
  @faker-js/faker@^10.6.0
```

---

# 16. Fuentes

- **Este manual** es la única guía de construcción (ISS, `cat >>`, **PARCHE**).
- [`BD_STORELAB_ENTIDADES_Y_ARQUITECTURA_BACKEND_FRONTEND.md`](./BD_STORELAB_ENTIDADES_Y_ARQUITECTURA_BACKEND_FRONTEND.md) — **solo consulta**: entidades **business** y sus campos (no es un paso de construcción).
