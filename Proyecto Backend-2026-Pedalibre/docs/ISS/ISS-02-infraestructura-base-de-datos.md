# 🛠 Unidad ISS-02 · Infraestructura de base de datos — capa 🛠 CONSTRUIR

> **🛠 Unidad ISS-02 · Infraestructura de base de datos** — capa **🛠 CONSTRUIR**
>
> [🧠 Comprender este bloque →](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-02-aprendizaje/) · [📝 Evaluación](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-02-aprendizaje/#evaluacion) · [✅ GATE de la unidad](https://tecnogua.com/academic/site/backend2026/manual/03-ISS-02-infraestructura-bd/#criterios-de-aceptacion-iss-02-consolidados)
>
> | **Capa**         | **Página**                                                                                                                                               | **Para qué**                             |
> | :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------- |
> | 🧠 **Aprender**  | [Infraestructura de base de datos](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-02-aprendizaje/)                                       | comprender, explicar y relacionar        |
> | 🛠 **Construir** | esta página                                                                                                                                              | ejecutar, programar y verificar          |
> | ✅ **GATE**       | [Condiciones de cierre](https://tecnogua.com/academic/site/backend2026/manual/03-ISS-02-infraestructura-bd/#criterios-de-aceptacion-iss-02-consolidados) | condición para pasar al bloque siguiente |
>
> **Esta es la guía ejecutable.** Sigue los pasos en orden. El cuerpo de abajo es el **ISS técnico verbatim**: comandos, rutas, versiones, PARCHEs, verificaciones y criterios, sin simplificar ni modernizar.

---

# Fase I: Business — ISS-02 — Infraestructura de base de datos

> **Contexto mínimo (autosuficiente).** Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que hay que saber antes de ejecutarlo.
>
> - **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript + Sequelize, **arquitectura por features**, Fase I **solo Business** (sin auth ni roles).
> - **Recorrido obligatorio de una petición:** `HTTP → Controller → Service → Repository → Model → Sequelize → BD`. Ninguna capa se salta a la siguiente.
> - **Diseño de datos** (columnas, tipos, FK `RESTRICT`, índices, transacciones): [`../bd-storelab.md`](https://tecnogua.com/academic/site/backend2026/bd-storelab/), **Fase I — Business**.
> - **Capas, convenciones y reglas transversales:** [`00-contexto.md`](https://tecnogua.com/academic/site/backend2026/manual/00-contexto/).
>
> | **Este ISS**        |                                                                                                                          |
> | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
> | **Título**          | Infraestructura de base de datos                                                                                         |
> | **Feature / tabla** | `src/database/`                                                                                                          |
> | **API**             | —                                                                                                                        |
> | **Depende de**      | [ISS-01 — Esqueleto del proyecto](https://tecnogua.com/academic/site/backend2026/manual/02-ISS-01-esqueleto-proyecto/)   |
> | **Habilita**        | [ISS-03 — Feature Client (CRUD por capas)](https://tecnogua.com/academic/site/backend2026/manual/04-ISS-03-client-crud/) |

## Contenido de este ISS

- 3.1 Drivers Sequelize y `.env`
- 3.2 Configuración Sequelize (`database/db.ts`)
- 3.3 Carpeta seeders (reservada)

---

**Objetivo:** drivers + `.env` + módulo Sequelize + carpeta `seeders/`.  
**Bloqueado por:** [ISS-01](https://tecnogua.com/academic/site/backend2026/manual/02-ISS-01-esqueleto-proyecto/).

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

> **✅ GATE de la unidad ISS-02** — *este bloque no añade ningún criterio nuevo.*
>
> Las condiciones de cierre son exactamente las que define el ISS técnico de esta misma página:
>
> - 📋 **Criterios de aceptación** → [Criterios de aceptación](https://tecnogua.com/academic/site/backend2026/manual/03-ISS-02-infraestructura-bd/#criterios-de-aceptacion-iss-02-consolidados)
> - 🧩 **Cierre de la unidad** → [Cierre de la unidad](https://tecnogua.com/academic/site/backend2026/manual/03-ISS-02-infraestructura-bd/#cierre-del-iss)
> - 🧠 **Autoevaluación** → [Evaluación del cuaderno](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-02-aprendizaje/#evaluacion)
>
> Con el GATE en verde queda habilitado **ISS-03 · Feature Client (CRUD por capas)**.
>
> **Navegación de la ruta:** **←** [ISS-02 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-02-aprendizaje/) · [↑ Ruta Express](https://tecnogua.com/academic/site/backend2026/) · **→** [ISS-03 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-03-aprendizaje/)
