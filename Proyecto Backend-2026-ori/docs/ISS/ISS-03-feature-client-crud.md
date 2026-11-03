> **🛠 Unidad ISS-03 · Feature Client (CRUD por capas)** — capa **🛠 CONSTRUIR**
>
> [🧠 Comprender este bloque →](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-03-aprendizaje/) · [📝 Evaluación](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-03-aprendizaje/#evaluacion) · [✅ GATE de la unidad](https://tecnogua.com/academic/site/backend2026/manual/04-ISS-03-client-crud/#criterios-de-aceptacion-iss-03-a)
>
> | **Capa**         | **Página**                                                                                                                             | **Para qué**                             |
> | :--------------- | :------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------- |
> | 🧠 **Aprender**  | [Feature Client (CRUD por capas)](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-03-aprendizaje/)                      | comprender, explicar y relacionar        |
> | 🛠 **Construir** | esta página                                                                                                                            | ejecutar, programar y verificar          |
> | ✅ **GATE**       | [Condiciones de cierre](https://tecnogua.com/academic/site/backend2026/manual/04-ISS-03-client-crud/#criterios-de-aceptacion-iss-03-a) | condición para pasar al bloque siguiente |
>
> **Esta es la guía ejecutable.** Sigue los pasos en orden. El cuerpo de abajo es el **ISS técnico verbatim**: comandos, rutas, versiones, PARCHEs, verificaciones y criterios, sin simplificar ni modernizar.

---

# Fase I: Business — ISS-03 — Feature Client (CRUD por capas: A…E)

> **Contexto mínimo (autosuficiente).** Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que hay que saber antes de ejecutarlo. - **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript + Sequelize, **arquitectura por features**, Fase I **solo Business** (sin auth ni roles). - **Recorrido obligatorio de una petición:** `HTTP → Controller → Service → Repository → Model → Sequelize → BD`. Ninguna capa se salta a la siguiente. - **Diseño de datos** (columnas, tipos, FK `RESTRICT`, índices, transacciones): [`../bd-storelab.md`](https://tecnogua.com/academic/site/backend2026/bd-storelab/), **Fase I — Business**. - **Capas, convenciones y reglas transversales:** [`00-contexto.md`](https://tecnogua.com/academic/site/backend2026/manual/00-contexto/).
>
> | **Este ISS**                      |                                                                                                                                                                                                                       |
> | :-------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | **Título**                        | Feature Client (CRUD por capas: A…E)                                                                                                                                                                                  |
> | **Feature / tabla**               | `clients` → `clients/`                                                                                                                                                                                                |
> | **API**                           | `/api/clientes`                                                                                                                                                                                                       |
> | **Depende de**                    | [ISS-02 — Infraestructura de base de datos](https://tecnogua.com/academic/site/backend2026/manual/03-ISS-02-infraestructura-bd/)                                                                                      |
> | **Habilita**                      | [ISS-04 — Seeders con Faker](https://tecnogua.com/academic/site/backend2026/manual/05-ISS-04-seeders-faker/) · [ISS-05 — Swagger / OpenAPI](https://tecnogua.com/academic/site/backend2026/manual/06-ISS-05-swagger/) |
> | **Variantes internas (en orden)** | `ISS-03-A` fundación → `ISS-03-B` getAll/getOne → `ISS-03-C` create → `ISS-03-D` update PUT/PATCH → `ISS-03-E` delete físico/lógico                                                                                   |

## Contenido de este ISS

- ISS-03-A — Feature Client — fundación (capas, modelo, esqueleto, HTTP, cableado)
- ISS-03-B — Feature Client — GetAll y GetOne
- ISS-03-C — Feature Client — Crear cliente
- ISS-03-D — Feature Client — Update (PUT) y Update (PATCH)
- ISS-03-E — Feature Client — Eliminar (físico y lógico)

---

## ISS-03-A — Feature Client — fundación (capas, modelo, esqueleto, HTTP, cableado)

**Nombre recomendado:** *Feature Client — fundación*
**Objetivo:** dejar el feature listo para CRUD con la arquitectura por capas — **HTTP → Controller → Service → Repository → Model → Sequelize → BD** —: modelo, repository, service, controller, routes, carpeta `http/` y cableado.
**Bloqueado por:** [ISS-02](https://tecnogua.com/academic/site/backend2026/manual/03-ISS-02-infraestructura-bd/).

### Criterios de aceptación (ISS-03-A)

- [ ] **4.0** Capa compartida `src/shared/` creada (`AppError`, `BaseController`, `withTransaction`)
- [ ] **4.1** Modelo `client.model.ts` con `status` + `timestamps: true` + bcrypt
- [ ] **4.2** Carpeta `dto/` con un archivo por operación (create/update/patch/response) + `index.ts`
- [ ] **4.3** Esqueletos `clients.repository.ts`, `clients.service.ts`, `clients.controller.ts` y `clients.routes.ts`
- [ ] **4.4** Carpeta `features/business/clients/http/` creada
- [ ] **4.5** `routes/index.ts` + `config` importan modelo, conectan BD y hacen `sync`
- [ ] Con BD: `npm run dev` → conexión OK + sync OK + tabla `clients`

---

### 4.0 Arquitectura por capas del feature

Cada feature de `features/business/<plural>/` se organiza en capas. Una petición recorre **siempre** el mismo camino y **nunca se salta una capa**:

```
HTTP (routes)
   ↓
Controller   → solo HTTP: lee req, llama al service y arma res (status codes)
   ↓
Service      → reglas de negocio, validaciones, transacciones
   ↓
Repository   → acceso a datos: la única capa que usa Sequelize
   ↓
Model        → definición de la tabla (atributos, hooks, relaciones)
   ↓
Sequelize    → ORM
   ↓
BD

```

| **Capa**   | **Archivo**              | **Sabe de**                                   | **NO sabe de**          |
| :--------- | :----------------------- | :-------------------------------------------- | :---------------------- |
| Controller | `<plural>.controller.ts` | `req`, `res`, códigos HTTP                    | negocio, Sequelize      |
| Service    | `<plural>.service.ts`    | reglas de negocio, transacciones              | `req`/`res`, SQL        |
| Repository | `<plural>.repository.ts` | modelo Sequelize (`where`, `include`, `lock`) | HTTP, reglas de negocio |
| Model      | `<singular>.model.ts`    | atributos, hooks, nombre de tabla             | HTTP, reglas de negocio |

**Ventajas:** cada capa se testea/entiende por separado; cambiar el ORM solo toca los repositories; cambiar un código HTTP solo toca los controllers; las reglas de negocio quedan en un único lugar (services).

**Norma de nombres del feature**

| **Pieza**                   | **Convención**              | **Ejemplo**                                                            |
| :-------------------------- | :-------------------------- | :--------------------------------------------------------------------- |
| Carpeta del feature         | **plural** kebab-case       | `clients/`, `product-types/`, `product-sales/`                         |
| Archivos de capa            | **plural** + sufijo de capa | `clients.controller.ts`, `clients.service.ts`, `clients.repository.ts` |
| Modelo (entidad)            | **singular**                | `client.model.ts`                                                      |
| Clase del modelo / interfaz | **singular** PascalCase     | `Client`, `ClientI`                                                    |
| Tabla en BD                 | **plural** snake_case       | `clients`, `product_types`                                             |

> Es la convención recomendada por la documentación de NestJS y por la mayoría de guías de backend: el feature representa una **colección** (plural) y la entidad, **un registro** (singular).

**DTO: el contrato de entrada/salida del feature**

El **DTO** (Data Transfer Object) es la forma de los datos que **entran y salen** por la API. No es una capa más: es el contrato que comparten el controller y el service, y evita que los tipos anden sueltos por el código.

| **DTO**          | **Ruta que lo usa** | **Forma**                                 |
| :--------------- | :------------------ | :---------------------------------------- |
| `Create<X>Dto`   | `POST /…`           | campos obligatorios de creación           |
| `Update<X>Dto`   | `PUT /…/:id`        | reemplazo completo                        |
| `Patch<X>Dto`    | `PATCH /…/:id`      | `Partial<Update<X>Dto>`                   |
| `<X>ResponseDto` | respuesta           | forma de salida (oculta campos sensibles) |

| **Pieza**        | **Convención**             | **Ejemplo**                                   |
| :--------------- | :------------------------- | :-------------------------------------------- |
| Carpeta DTO      | `dto/` dentro del feature  | `clients/dto/`                                |
| Archivo DTO      | **uno por operación**      | `create-client.dto.ts`, `patch-client.dto.ts` |
| DTO de entrada   | PascalCase + sufijo `Dto`  | `CreateClientDto`, `PatchClientDto`           |
| DTO de respuesta | PascalCase + `ResponseDto` | `ClientResponseDto`                           |
| Mapper           | `to<X>Response()`          | `toClientResponse(client)`                    |
| Barrel           | `dto/index.ts`             | reexporta todos los DTOs del feature          |

Los DTOs viven en la carpeta `dto/` del feature, **un archivo por operación del CRUD**:

```
features/business/clients/
├── client.model.ts               <- Model (entidad)
├── dto/                          <- contrato de la API
│   ├── create-client.dto.ts      -> POST   /api/clientes
│   ├── update-client.dto.ts      -> PUT    /api/clientes/:id
│   ├── patch-client.dto.ts       -> PATCH  /api/clientes/:id
│   ├── client-response.dto.ts    -> GET ALL, GET ONE y salidas de create/update/delete lógico
│   └── index.ts                  <- barrel: export * from "./…"
├── clients.repository.ts
├── clients.service.ts
├── clients.controller.ts
└── clients.routes.ts

```

Las consultas `GET ALL` y `GET ONE` no reciben cuerpo: **comparten** el DTO de respuesta. Las operaciones de escritura (`POST`, `PUT`, `PATCH`) sí tienen su propio DTO de entrada.

Ventajas: el controller ya no hace `as ClientI` con tipos genéricos; el service declara exactamente qué recibe y qué devuelve; los campos derivados (`total` de una venta) o sensibles (`password`) **no están** en los DTOs de entrada; y el mapper es el único lugar donde se decide qué se expone.

> `status` **no** aparece en `Update<X>Dto` ni en `Patch<X>Dto`: el estado sólo cambia con el endpoint de **borrado lógico** (`PATCH /api/<plural>/:id/deactivate`). Así no hay dos formas de desactivar un registro y nadie «resucita» una fila `inactive` con un PUT.
>
> El **repository** sigue trabajando con tipos del modelo (`Partial<ClientI>`), no con DTOs: su contrato es la base de datos, no la API.

#### Reglas transversales del CRUD (aplican a los **5** features)

Estas cinco reglas son las que mantienen la arquitectura sin redundancia. Si se respetan, todos los features se leen igual y el patrón se puede copiar tal cual a otro proyecto:

1. **Todo handler se envuelve en `this.run(res, …)`.** El `try/catch` existe **una sola vez**, en `BaseController`. El controller sólo expresa el *camino feliz*: leer la entrada → llamar al service → responder.
2. **Todo `:id` se lee con `this.paramId(req)`.** Si no es un entero `≥ 1`, responde **400** y el service nunca recibe un id inválido. La validación no se repite en cada método.
3. **Todo método que recibe un `id` usa `findOrFail(id)`.** Si el registro no existe **o** está `inactive`, lanza `AppError(404, …)`. Es el único lugar donde se define «no existe», y es lo que hace que el borrado lógico sea consistente entre `getOne`, `updatePut`, `updatePatch` y `deleteLogical`.
4. **`status` no viaja en `Update<X>Dto` ni en `Patch<X>Dto`.** Sólo cambia con el borrado lógico (o al crear, donde es opcional y vale `active` por defecto). En el **modelo**, el `defaultValue` de `status` es `"inactive"` (*fail-safe*: una fila insertada sin estado explícito no queda visible en la API); la creación vía API siempre envía `"active"`.
5. **El service devuelve DTOs de respuesta, nunca instancias de Sequelize.** Siempre con `to<X>Response(...)`: garantiza un objeto plano (sin metadatos del ORM) y oculta los campos sensibles.

Además, los DTOs se importan **siempre desde el barrel** del feature (`from "./dto"`), no desde el archivo suelto: cada capa tiene un único punto de importación.

| **Lo repetitivo…**                              | **…vive en**                                  | **Veces en el proyecto** |
| :---------------------------------------------- | :-------------------------------------------- | :----------------------- |
| `try/catch` + traducción de errores             | `BaseController.run`                          | **1**                    |
| Validación de `:id`                             | `BaseController.paramId`                      | **1**                    |
| «no existe / está inactivo» → 404               | `<feature>.service.findOrFail`                | 1 por feature            |
| Qué campos se exponen por la API                | `<feature>-response.dto.ts` (`to<X>Response`) | 1 por feature            |
| Acceso a Sequelize (`where`, `include`, `lock`) | `<feature>.repository.ts`                     | 1 por feature            |

#### 4.0.1 `src/shared/errors/app-error.ts`

Los **services** no devuelven códigos HTTP: lanzan errores de negocio. Este error transporta el status que el controller traducirá.

```
mkdir -p src/shared/errors src/shared/http src/shared/database

```

**Nuevo archivo**

```
: > src/shared/errors/app-error.ts
cat >> src/shared/errors/app-error.ts << 'EOF'
/**
 * Error de aplicación con código HTTP asociado.
 *
 * Lo lanzan los **services** (capa de negocio) cuando una regla no se cumple
 * (no encontrado, estado inválido, stock insuficiente, etc.).
 * Los **controllers** lo traducen a una respuesta HTTP.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  public constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}
EOF

```

#### 4.0.2 `src/shared/http/base-controller.ts`

Clase base de todos los controllers. Concentra las **tres** responsabilidades puramente HTTP, para que no se repitan en los \~35 métodos del proyecto:

- `run(res, work)`: ejecuta el handler y traduce cualquier error a HTTP (un solo `try/catch`).
- `paramId(req)`: lee el `:id` de la URL y lo valida como entero `≥ 1` (si no, **400**).
- `handleError(res, error)`: mapea `AppError` a su status y lo demás a **500**.

Gracias a esta clase, cada handler de controller sólo escribe el *camino feliz* de su endpoint.

**Nuevo archivo**

```
: > src/shared/http/base-controller.ts
cat >> src/shared/http/base-controller.ts << 'EOF'
import { Request, Response } from "express";
import { AppError } from "../errors/app-error";

/**
 * Base de los controllers HTTP.
 *
 * Aísla las tres responsabilidades puramente HTTP que, si no, se repetirían en
 * los 7 métodos de cada controller:
 *
 *  - `run`:            ejecuta el cuerpo del handler y traduce el error a HTTP.
 *  - `paramId`:        lee y valida el `:id` de la URL.
 *  - `handleError`:    mapea `AppError` a su status y lo demás a 500.
 *
 * La capa de negocio (service) no conoce `req`/`res`.
 */
export abstract class BaseController {
  /**
   * Ejecuta el cuerpo de un handler y centraliza el manejo de errores.
   *
   * Sin este helper, cada uno de los 35 métodos de los controllers tendría su
   * propio `try/catch`. Aquí el `catch` vive una sola vez.
   */
  protected async run(res: Response, work: () => Promise<void>): Promise<void> {
    try {
      await work();
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Lee el `:id` de la URL y lo valida como entero positivo.
   *
   * Sin la validación, `GET /api/clientes/abc` llegaría al repository como
   * `Number("abc") === NaN` y devolvería un 404 engañoso en vez de un 400.
   */
  protected paramId(req: Request): number {
    const raw = req.params.id;
    const value = Array.isArray(raw) ? raw[0] : raw;

    if (!value || !/^\d+$/.test(value) || Number(value) < 1) {
      throw new AppError(400, "Invalid id: must be a positive integer");
    }
    return Number(value);
  }

  /** Mapea errores: `AppError` -> su status; cualquier otro -> 500. */
  protected handleError(res: Response, error: unknown): void {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Internal server error", detail: String(error) });
  }
}
EOF

```

#### 4.0.3 `src/shared/database/with-transaction.ts`

Helper *unit of work*: ejecuta un bloque dentro de una transacción (commit/rollback). Se usa en ISS-08 para ventas; conviene crearlo ahora.

**Nuevo archivo**

```
: > src/shared/database/with-transaction.ts
cat >> src/shared/database/with-transaction.ts << 'EOF'
import { Transaction } from "sequelize";
import { sequelize } from "../../database/db";

/**
 * Ejecuta `work` dentro de una transacción (patrón *unit of work*).
 *
 * - Commit si `work` termina bien.
 * - Rollback si `work` lanza (y re-lanza el error).
 *
 * Lo usan los services que tocan varias tablas a la vez
 * (ej. crear una venta = `sales` + `product_sales` + stock de `products`).
 */
export async function withTransaction<T>(
  work: (transaction: Transaction) => Promise<T>
): Promise<T> {
  const transaction = await sequelize.transaction();
  let committed = false;

  try {
    const result = await work(transaction);
    await transaction.commit();
    committed = true;
    return result;
  } catch (error) {
    if (!committed) {
      await transaction.rollback().catch(() => undefined);
    }
    throw error;
  }
}
EOF

```

---

### 4.1 Modelo Client

**Criterios**

- [ ] `src/features/business/clients/client.model.ts`
- [ ] Enum `active`/`inactive`, default `inactive`; `timestamps: true`

```
npm install bcryptjs@^3.0.3
npm install -D @types/bcryptjs@^3.0.0

```

**Archivo del feature**

```
: > src/features/business/clients/client.model.ts
cat >> src/features/business/clients/client.model.ts << 'EOF'
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
      // Fail-safe: una fila insertada sin estado explícito NO queda visible en la API.
      // La vía de creación de la API siempre envía "active".
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

### 4.2 DTO + esqueletos repository / service / controller / routes + carpeta HTTP

**Criterios**

- [ ] Carpeta `dto/` creada (create/update/patch/response + `index.ts`)
- [ ] `clients.repository.ts`, `clients.service.ts`, `clients.controller.ts` y `clients.routes.ts` existen (esqueletos)
- [ ] Carpeta `src/features/business/clients/http/` existe

El **DTO** es el contrato del feature y se define completo desde el inicio. Las cuatro capas se completan en ISS-03-B…E en el orden **getAll → getOne → create → update → delete**. Observe cómo cada capa delega en la siguiente.

```
mkdir -p src/features/business/clients/http

```

**DTOs — carpeta `dto/` (un archivo por operación)**

```
mkdir -p src/features/business/clients/dto

```

**`dto/create-client.dto.ts`**

```
: > src/features/business/clients/dto/create-client.dto.ts
cat >> src/features/business/clients/dto/create-client.dto.ts << 'EOF'
/** Datos de entrada de `POST /api/clientes`. */
export interface CreateClientDto {
  name: string;
  address: string;
  phone: string;
  email: string;
  password: string;
  /** Opcional: por defecto `active`. Tras crearlo, el estado sólo cambia con el borrado lógico. */
  status?: "active" | "inactive";
}
EOF

```

**`dto/update-client.dto.ts`**

```
: > src/features/business/clients/dto/update-client.dto.ts
cat >> src/features/business/clients/dto/update-client.dto.ts << 'EOF'
/**
 * Datos de entrada de `PUT /api/clientes/:id` (reemplazo completo).
 *
 * `status` **no** está aquí a propósito: el estado sólo cambia con el borrado
 * lógico (`DELETE /api/clientes/:id/deactivate`), que es una regla de negocio y
 * no un campo editable. Así se evita desactivar un registro por PUT/PATCH
 * saltándose el resto de reglas del caso de uso.
 */
export interface UpdateClientDto {
  name: string;
  address: string;
  phone: string;
  email: string;
  /** Si no se envía, el service conserva el hash actual. */
  password?: string;
}
EOF

```

**`dto/patch-client.dto.ts`**

```
: > src/features/business/clients/dto/patch-client.dto.ts
cat >> src/features/business/clients/dto/patch-client.dto.ts << 'EOF'
import { UpdateClientDto } from "./update-client.dto";

/** Datos de entrada de `PATCH /api/clientes/:id` (actualización parcial). */
export type PatchClientDto = Partial<UpdateClientDto>;
EOF

```

**`dto/client-response.dto.ts`**

```
: > src/features/business/clients/dto/client-response.dto.ts
cat >> src/features/business/clients/dto/client-response.dto.ts << 'EOF'
import { Client, ClientI } from "../client.model";

/**
 * Respuesta HTTP de un cliente. Lo usan `GET /api/clientes`,
 * `GET /api/clientes/:id` y la salida de create/update/delete lógico.
 *
 * Regla del DTO de respuesta: la API expone **sólo** lo que declara este tipo y
 * `password` nunca sale. La proyección es explícita (`Omit`) porque hay algo que
 * ocultar; en las entidades que no tienen campos internos el DTO coincide con el
 * modelo y basta con documentarlo.
 */
export type ClientResponseDto = Omit<ClientI, "password">;

/** Mapper modelo -> DTO de respuesta (objeto plano; elimina `password`). */
export function toClientResponse(client: Client): ClientResponseDto {
  const { password, ...safe } = client.toJSON() as ClientI & { password?: string };
  return safe;
}
EOF

```

**`dto/index.ts`**

```
: > src/features/business/clients/dto/index.ts
cat >> src/features/business/clients/dto/index.ts << 'EOF'
export * from "./create-client.dto";
export * from "./update-client.dto";
export * from "./patch-client.dto";
export * from "./client-response.dto";
EOF

```

**Repository (esqueleto)**

```
: > src/features/business/clients/clients.repository.ts
cat >> src/features/business/clients/clients.repository.ts << 'EOF'
import { Client } from "./client.model";

/**
 * Capa Repository del feature Clients.
 * Única responsable de hablar con Sequelize (el modelo `Client`).
 */
export class ClientsRepository {
  // ================== READ ==================
  // (rellenar en ISS-03-B) findAllActive, findById

  // ================== CREATE ==================
  // (rellenar en ISS-03-C) create

  // ================== UPDATE ==================
  // (rellenar en ISS-03-D) update

  // ================== DELETE ==================
  // (rellenar en ISS-03-E) delete
}
EOF

```

**Service (esqueleto)**

```
: > src/features/business/clients/clients.service.ts
cat >> src/features/business/clients/clients.service.ts << 'EOF'
import { ClientsRepository } from "./clients.repository";

/**
 * Capa Service del feature Clients.
 * Reglas de negocio; no conoce req/res ni Sequelize (delega en el repository).
 */
export class ClientsService {
  public constructor(
    private readonly repository: ClientsRepository = new ClientsRepository()
  ) {}

  // ================== READ ==================
  // (rellenar en ISS-03-B) getAll, getOne

  // ================== CREATE ==================
  // (rellenar en ISS-03-C) create

  // ================== UPDATE ==================
  // (rellenar en ISS-03-D) updatePut, updatePatch

  // ================== DELETE ==================
  // (rellenar en ISS-03-E) deletePhysical, deleteLogical
}
EOF

```

**Controller (esqueleto)**

```
: > src/features/business/clients/clients.controller.ts
cat >> src/features/business/clients/clients.controller.ts << 'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import { ClientsService } from "./clients.service";

/**
 * Capa Controller del feature Clients.
 * Solo HTTP: lee req, llama al service y arma res.
 */
export class ClientsController extends BaseController {
  public constructor(
    private readonly service: ClientsService = new ClientsService()
  ) {
    super();
  }

  // ================== READ ==================
  // (rellenar en ISS-03-B) getAll, getOne

  // ================== CREATE ==================
  // (rellenar en ISS-03-C) create

  // ================== UPDATE ==================
  // (rellenar en ISS-03-D) updatePut, updatePatch

  // ================== DELETE ==================
  // (rellenar en ISS-03-E) deletePhysical, deleteLogical
}
EOF

```

**Routes (esqueleto)**

```
: > src/features/business/clients/clients.routes.ts
cat >> src/features/business/clients/clients.routes.ts << 'EOF'
import { Application } from "express";
import { ClientsController } from "./clients.controller";

export class ClientsRoutes {
  public clientsController: ClientsController = new ClientsController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================
    // (rellenar en ISS-03-B…E)
  }
}
EOF

```

> El CRUD se completa en ISS-03-B…E. Aquí se reserva también la carpeta `http/` para archivos `.http` (REST Client) con leyenda **SIN AUTH**.

---

### 4.3 Agregador Routes + cableado en Config

**Criterios**

- [ ] `src/routes/index.ts` con `clientsRoutes`
- [ ] `config` importa modelo + `dbConnection` + `routes`

```
: > src/routes/index.ts
cat >> src/routes/index.ts << 'EOF'
import { ClientsRoutes } from "../features/business/clients/clients.routes";

export class Routes {
  public clientsRoutes: ClientsRoutes = new ClientsRoutes();
}
EOF

```

**PARCHE** — `src/config/index.ts` **ya existe** (ISS-01).

1. **Debajo de** `var cors = require("cors");` **añadir**:

```
import { sequelize, getDatabaseInfo, testConnection } from "../database/db";
import "../features/business/clients/client.model";
import { Routes } from "../routes/index";

```

1. **Dentro de** `export class App`, **debajo de** `public app: Application;` **añadir**:

```
  public routePrv: Routes = new Routes();

```

1. **Dentro de** `routes()`, **reemplazar** el comentario `// ISS-03 §4.3` por:

```
    this.routePrv.clientsRoutes.routes(this.app);

```

1. **Dentro de** `dbConnection()`, **reemplazar** el comentario `// ISS-02 / ISS-03` por:

```
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

> **Importante (lab):** si la tabla `clients` se creó antes con `timestamps: false`, `sync({ force: false })` **no** añade `createdAt`/`updatedAt`. Por eso se usa `alter: true`.
>
> **Orden de arranque (importante):** `sync({ alter: true })` emite `ALTER TABLE` y `DROP/ADD FOREIGN KEY`, que toman *metadata locks*. Si el puerto ya está escuchando mientras el `sync` corre, esas sentencias DDL compiten con las peticiones en curso y aparecen **deadlocks** y errores de FK intermitentes. Por eso `listen()` hace `await this.dbConnection()` **antes** de `app.listen(...)`: primero la BD, después HTTP.

### Verificación ISS-03-A

```
test -d src/features/business/clients/http && echo HTTP_FOLDER_OK

```

### Cierre del ISS

```
npm run dev

```

> Sync OK y tabla `clients` (con `createdAt` / `updatedAt`). Detenerlo con Ctrl+C antes de continuar.

---

## ISS-03-B — Feature Client — GetAll y GetOne

**Objetivo:** listar activos y obtener uno por id. Es el primer paso del feature: getAll, getOne, luego create, update y delete.
**Bloqueado por:** ISS-03-A.

### Criterios de aceptación (ISS-03-B)

- [ ] **Repository**: `findAllActive` (solo `status: 'active'`) y, debajo, `findById`
- [ ] **Service**: `getAll` y `getOne` (404 si no existe **o** está `inactive`) + mapper `toClientResponse` (sin `password`)
- [ ] **Service**: helper privado `findOrFail(id, onlyActive = true)`: la política de borrado lógico se decide **una sola vez**
- [ ] **Controller**: `getAll` y, debajo, `getOne` (envueltos en `run()`, que ya traduce los errores)
- [ ] Rutas `GET /api/clientes` y `GET /api/clientes/:id` — **sin auth**
- [ ] `http/clients.get.http` con leyenda **SIN AUTH**

### Repository — **PARCHE** `clients.repository.ts` (ya existe)

**Arriba**, junto al import del modelo, **añadir** el import de `Transaction`:

```
import { Transaction } from "sequelize";

```

**Debajo de** `// ================== READ ==================` (y **encima de** `// ================== CREATE ==================`), **añadir** primero `findAllActive` y después `findById`:

```
  /** Todos los clientes activos. */
  public async findAllActive(): Promise<Client[]> {
    return Client.findAll({ where: { status: "active" } });
  }

  /** Un cliente por PK (o `null`). Acepta transacción para flujos de ventas. */
  public async findById(id: number, transaction?: Transaction): Promise<Client | null> {
    return Client.findByPk(id, { transaction });
  }

```

### Service — **PARCHE** `clients.service.ts` (ya existe)

**Arriba**, junto al import del repository, **añadir** el import del DTO, del modelo y de `AppError`:

```
import { ClientResponseDto, toClientResponse } from "./dto";
import { Client } from "./client.model";
import { AppError } from "../../../shared/errors/app-error";

```

**Debajo de** `// ================== READ ==================` (y **encima de** `// ================== CREATE ==================`), **añadir** `getAll` y `getOne`:

```
  public async getAll(): Promise<ClientResponseDto[]> {
    const clients = await this.repository.findAllActive();
    return clients.map((client) => toClientResponse(client));
  }

  public async getOne(id: number): Promise<ClientResponseDto> {
    return toClientResponse(await this.findOrFail(id));
  }

```

> El saneamiento (ocultar `password`) ya no vive en el service: lo hace el mapper `toClientResponse` declarado en `dto/client-response.dto.ts`.
>
> El service **no** arma respuestas HTTP: si no existe lanza `AppError(404, …)` y el `BaseController` lo traduce.

**Al final de la clase**, **debajo de** `// ================== HELPERS ==================`, **añadir** `findOrFail`. Es el **único** sitio donde se decide qué es «no existe»:

```
  private async findOrFail(id: number, onlyActive = true): Promise<Client> {
    const client = await this.repository.findById(id);
    if (!client || (onlyActive && client.status !== "active")) {
      throw new AppError(404, "Client not found");
    }
    return client;
  }

```

> `onlyActive` (por defecto `true`) aplica la **política de borrado lógico**: un registro `inactive` deja de ser visible para la API, igual que en `getAll`. `deletePhysical` lo pasa en `false` para poder purgar también registros ya desactivados.
>
> Con este helper, `getOne`, `updatePut`, `updatePatch` y `deleteLogical` quedan consistentes **sin repetir** la comprobación en cada método.

### Controller — **PARCHE** `clients.controller.ts` (ya existe)

**Debajo de** `// ================== READ ==================` (y **encima de** `// ================== CREATE ==================`), **añadir** primero `getAll` y después `getOne`:

```
  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const clients = await this.service.getAll();
      res.status(200).json({ clients });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const client = await this.service.getOne(this.paramId(req));
      res.status(200).json({ client });
    });
  }

```

### Rutas — **PARCHE** `clients.routes.ts` (ya existe)

**Debajo de** `// ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================`, **añadir** primero `getAll` y después `getOne`:

```
    // getAll
    app
      .route("/api/clientes")
      .get(this.clientsController.getAll.bind(this.clientsController));

    // getOne
    app
      .route("/api/clientes/:id")
      .get(this.clientsController.getOne.bind(this.clientsController));

```

**HTTP — archivo nuevo**

```
: > src/features/business/clients/http/clients.get.http
cat >> src/features/business/clients/http/clients.get.http << 'EOF'
### Feature Client — GET ALL / GET ONE
### Modalidad JWT + RBAC: `authenticate` (401 sin token) + `authorize` (403 sin concesión).
@baseUrl = http://localhost:4000

# @name loginAdmin
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin123!"
}

# @name loginSeller
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "seller",
  "password": "Seller123!"
}

@token = {{loginAdmin.response.body.$.access_token}}
@sellerToken = {{loginSeller.response.body.$.access_token}}
@id = 1

### GET ALL — recurso `GET /api/clientes` (ADMIN y SELLER lo tienen concedido)
# @name getAllClients
GET {{baseUrl}}/api/clientes
Authorization: Bearer {{token}}

### GET ONE — recurso `GET /api/clientes/:id`
# @name getOneClient
GET {{baseUrl}}/api/clientes/{{id}}
Authorization: Bearer {{token}}

### 401 — sin token (modalidad JWT no cumplida)
GET {{baseUrl}}/api/clientes

### 200 — SELLER sí tiene esta lectura concedida
GET {{baseUrl}}/api/clientes
Authorization: Bearer {{sellerToken}}
EOF

```

### Verificación

Ver **Verificación** al final de `ISS-03-E` (más abajo, en este mismo archivo).

---

## ISS-03-C — Feature Client — Crear cliente

**Objetivo:** `create` con `status` por defecto `active` y hash de `password` (hook del modelo).
**Bloqueado por:** ISS-03-B.

### Criterios de aceptación (ISS-03-C)

- [ ] **Repository**: `create`
- [ ] **Service**: `create` (default de `status`) y respuesta sin `password`
- [ ] **Controller**: `create` con `201`
- [ ] Ruta `POST /api/clientes` — **sin auth**
- [ ] `http/clients.create.http` con leyenda **SIN AUTH**

### Repository — **PARCHE** `clients.repository.ts` (ya existe)

**Arriba**, **ampliar** el import de `sequelize` para incluir `CreationAttributes`:

```
import { CreationAttributes, Transaction } from "sequelize";

```

**Debajo de** `// ================== CREATE ==================`, **añadir**:

```
  /** Inserta un cliente. */
  public async create(data: CreationAttributes<Client>): Promise<Client> {
    return Client.create(data);
  }

```

### Service — **PARCHE** `clients.service.ts` (ya existe)

**Debajo de** `// ================== CREATE ==================`, **añadir**:

```
  public async create(body: CreateClientDto): Promise<ClientResponseDto> {
    const client = await this.repository.create({
      name: body.name,
      address: body.address,
      phone: body.phone,
      email: body.email,
      password: body.password,
      status: body.status ?? "active",
    });
    return toClientResponse(client);
  }

```

> La regla «si no viene `status`, usar `active`» vive en el **service**. El hashing del `password` es responsabilidad del **modelo** (`beforeCreate`). El `CreateClientDto` documenta qué acepta el `POST`.

### Controller — **PARCHE** `clients.controller.ts` (ya existe)

**Debajo de** `// ================== CREATE ==================`, **añadir**:

```
  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const client = await this.service.create(req.body as CreateClientDto);
      res.status(201).json({ client });
    });
  }

```

> En el controller, **arriba**, añade el import de los DTOs: `import { CreateClientDto, PatchClientDto, UpdateClientDto } from "./dto";`

### Rutas — **PARCHE** `clients.routes.ts` (ya existe)

**Debajo** del bloque de `getOne`, **añadir**:

```
    // create
    app
      .route("/api/clientes")
      .post(this.clientsController.create.bind(this.clientsController));

```

**HTTP — archivo nuevo**

```
: > src/features/business/clients/http/clients.create.http
cat >> src/features/business/clients/http/clients.create.http << 'EOF'
### Feature Client — CREATE
### Modalidad JWT + RBAC. Recurso `POST /api/clientes`: solo lo concede ADMIN (SELLER no).
@baseUrl = http://localhost:4000

# @name loginAdmin
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin123!"
}

# @name loginSeller
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "seller",
  "password": "Seller123!"
}

@token = {{loginAdmin.response.body.$.access_token}}
@sellerToken = {{loginSeller.response.body.$.access_token}}

### CREATE — admin -> 201
# @name createClient
POST {{baseUrl}}/api/clientes
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Ana Pérez",
  "address": "Calle 10 #20-30",
  "phone": "3001234567",
  "email": "ana.perez@example.com",
  "password": "Password123!",
  "status": "active"
}

### 403 — el SELLER NO tiene concedido `POST /api/clientes` (deny by default)
POST {{baseUrl}}/api/clientes
Authorization: Bearer {{sellerToken}}
Content-Type: application/json

{
  "name": "Prueba RBAC",
  "phone": "3000000000",
  "email": "rbac.demo@example.com",
  "password": "Password123!"
}

### 401 — sin token
POST {{baseUrl}}/api/clientes
Content-Type: application/json

{
  "name": "Sin token",
  "phone": "3000000001",
  "email": "sin.token@example.com",
  "password": "Password123!"
}
EOF

```

### Verificación

Ver **Verificación** al final de `ISS-03-E` (más abajo, en este mismo archivo).

---

## ISS-03-D — Feature Client — Update (PUT) y Update (PATCH)

**Objetivo:** `updatePut` (reemplazo completo) y `updatePatch` (parcial).
**Bloqueado por:** ISS-03-C.

### Criterios de aceptación (ISS-03-D)

- [ ] **Repository**: `update`
- [ ] **Service**: `updatePut` (conserva `password` si no viene) y `updatePatch`
- [ ] **Service**: `status` **no** se edita por PUT/PATCH: sólo cambia con el borrado lógico
- [ ] **Controller**: `updatePut` y `updatePatch`
- [ ] Rutas `PUT /api/clientes/:id` y `PATCH /api/clientes/:id` — **sin auth**
- [ ] `http/clients.update.http` con leyenda **SIN AUTH**

### Repository — **PARCHE** `clients.repository.ts` (ya existe)

**Debajo de** `// ================== UPDATE ==================`, **añadir**:

```
  /** Persiste cambios sobre una instancia existente. */
  public async update(client: Client, data: Partial<ClientI>): Promise<Client> {
    return client.update(data);
  }

```

> El repository recibe la **instancia** ya cargada (`client`) y solo la persiste: no sabe si es un PUT, un PATCH o un borrado lógico.

### Service — **PARCHE** `clients.service.ts` (ya existe)

**Debajo de** `// ================== UPDATE ==================`, **añadir** `updatePut` y después `updatePatch`:

```
  public async updatePut(id: number, body: UpdateClientDto): Promise<ClientResponseDto> {
    const client = await this.findOrFail(id);

    await this.repository.update(client, {
      name: body.name,
      address: body.address,
      phone: body.phone,
      email: body.email,
      password: body.password ?? client.password,
    });
    return toClientResponse(client);
  }

  public async updatePatch(id: number, body: PatchClientDto): Promise<ClientResponseDto> {
    const client = await this.findOrFail(id);

    await this.repository.update(client, body);
    return toClientResponse(client);
  }

```

### Controller — **PARCHE** `clients.controller.ts` (ya existe)

**Debajo de** `// ================== UPDATE ==================`, **añadir** `updatePut` y después `updatePatch`:

```
  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const client = await this.service.updatePut(
        this.paramId(req),
        req.body as UpdateClientDto
      );
      res.status(200).json({ client });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const client = await this.service.updatePatch(
        this.paramId(req),
        req.body as PatchClientDto
      );
      res.status(200).json({ client });
    });
  }

```

### Rutas — **PARCHE** `clients.routes.ts` (ya existe)

**Debajo** del bloque de `create`, **añadir**:

```
    // update (PUT / PATCH)
    app
      .route("/api/clientes/:id")
      .put(this.clientsController.updatePut.bind(this.clientsController))
      .patch(this.clientsController.updatePatch.bind(this.clientsController));

```

**HTTP — archivo nuevo**

```
: > src/features/business/clients/http/clients.update.http
cat >> src/features/business/clients/http/clients.update.http << 'EOF'
### Feature Client — UPDATE (PUT) / UPDATE (PATCH)
### Modalidad JWT + RBAC. `status` no se envía: el estado solo cambia con
### PATCH {{baseUrl}}/api/clientes/{{id}}/deactivate (borrado lógico).
@baseUrl = http://localhost:4000

# @name loginAdmin
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin123!"
}

@token = {{loginAdmin.response.body.$.access_token}}
@id = 1

# @name updateClientPut
PUT {{baseUrl}}/api/clientes/{{id}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Ana Pérez Actualizada",
  "address": "Carrera 15 #40-10",
  "phone": "3009876543",
  "email": "ana.perez@example.com",
  "password": "Password123!"
}

###

# @name updateClientPatch
PATCH {{baseUrl}}/api/clientes/{{id}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "phone": "3011112233",
  "address": "Nueva dirección parcial"
}
EOF

```

### Verificación

Ver **Verificación** al final de `ISS-03-E` (más abajo, en este mismo archivo).

---

## ISS-03-E — Feature Client — Eliminar (físico y lógico)

**Objetivo:** `deletePhysical` (DELETE) y `deleteLogical` (`status = inactive`).
**Bloqueado por:** ISS-03-D.

### Criterios de aceptación (ISS-03-E)

- [ ] **Repository**: `delete`
- [ ] **Service**: `deletePhysical` y `deleteLogical`
- [ ] **Controller**: `deletePhysical` y `deleteLogical`
- [ ] Rutas `DELETE /api/clientes/:id` y `PATCH /api/clientes/:id/deactivate` — **sin auth**
- [ ] `http/clients.delete.http` con leyenda **SIN AUTH**

### Repository — **PARCHE** `clients.repository.ts` (ya existe)

**Debajo de** `// ================== DELETE ==================`, **añadir**:

```
  /** Elimina físicamente una instancia. */
  public async delete(client: Client): Promise<void> {
    await client.destroy();
  }

```

### Service — **PARCHE** `clients.service.ts` (ya existe)

**Debajo de** `// ================== DELETE ==================`, **añadir** `deletePhysical` y después `deleteLogical`:

```
  /** Eliminación física. */
  public async deletePhysical(id: number): Promise<void> {
    // `onlyActive: false` -> también permite purgar un registro ya desactivado.
    const client = await this.findOrFail(id, false);
    await this.repository.delete(client);
  }

  /** Eliminación lógica -> `status = inactive`. */
  public async deleteLogical(id: number): Promise<ClientResponseDto> {
    const client = await this.findOrFail(id);

    await this.repository.update(client, { status: "inactive" });
    return toClientResponse(client);
  }

```

> El **borrado lógico no es un DELETE**: es un `UPDATE ... status = inactive` reutilizando el mismo método `update` del repository.

### Controller — **PARCHE** `clients.controller.ts` (ya existe)

**Debajo de** `// ================== DELETE ==================`, **añadir** `deletePhysical` y después `deleteLogical`:

```
  /** Eliminación física. */
  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const id = this.paramId(req);
      await this.service.deletePhysical(id);
      res.status(200).json({ message: "Client permanently deleted", id });
    });
  }

  /** Eliminación lógica -> `status = inactive`. */
  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const client = await this.service.deleteLogical(this.paramId(req));
      res.status(200).json({ message: "Client deactivated (logical delete)", client });
    });
  }

```

### Rutas — **PARCHE** `clients.routes.ts` (ya existe)

**Debajo** del bloque de `update`, **añadir**:

```
    // delete físico
    app
      .route("/api/clientes/:id")
      .delete(this.clientsController.deletePhysical.bind(this.clientsController));

    // delete lógico
    app
      .route("/api/clientes/:id/deactivate")
      .patch(this.clientsController.deleteLogical.bind(this.clientsController));

```

**HTTP — archivo nuevo**

```
: > src/features/business/clients/http/clients.delete.http
cat >> src/features/business/clients/http/clients.delete.http << 'EOF'
### Feature Client — DELETE físico / DELETE lógico (status = inactive)
### Modalidad JWT + RBAC.
@baseUrl = http://localhost:4000

# @name loginAdmin
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin123!"
}

@token = {{loginAdmin.response.body.$.access_token}}
@id = 1

# @name deleteClientPhysical
DELETE {{baseUrl}}/api/clientes/{{id}}
Authorization: Bearer {{token}}

###

# @name deleteClientLogical
PATCH {{baseUrl}}/api/clientes/{{id}}/deactivate
Authorization: Bearer {{token}}
EOF

```

### Estado final Client (CRUD completo) — archivos consolidados

Estos son los archivos definitivos del feature (equivalentes a aplicar todos los PARCHE anteriores):

**DTOs — carpeta `dto/` (un archivo por operación)**

```
mkdir -p src/features/business/clients/dto

```

**`dto/create-client.dto.ts`**

```
: > src/features/business/clients/dto/create-client.dto.ts
cat >> src/features/business/clients/dto/create-client.dto.ts << 'EOF'
/** Datos de entrada de `POST /api/clientes`. */
export interface CreateClientDto {
  name: string;
  address: string;
  phone: string;
  email: string;
  password: string;
  /** Opcional: por defecto `active`. Tras crearlo, el estado sólo cambia con el borrado lógico. */
  status?: "active" | "inactive";
}
EOF

```

**`dto/update-client.dto.ts`**

```
: > src/features/business/clients/dto/update-client.dto.ts
cat >> src/features/business/clients/dto/update-client.dto.ts << 'EOF'
/**
 * Datos de entrada de `PUT /api/clientes/:id` (reemplazo completo).
 *
 * `status` **no** está aquí a propósito: el estado sólo cambia con el borrado
 * lógico (`DELETE /api/clientes/:id/deactivate`), que es una regla de negocio y
 * no un campo editable. Así se evita desactivar un registro por PUT/PATCH
 * saltándose el resto de reglas del caso de uso.
 */
export interface UpdateClientDto {
  name: string;
  address: string;
  phone: string;
  email: string;
  /** Si no se envía, el service conserva el hash actual. */
  password?: string;
}
EOF

```

**`dto/patch-client.dto.ts`**

```
: > src/features/business/clients/dto/patch-client.dto.ts
cat >> src/features/business/clients/dto/patch-client.dto.ts << 'EOF'
import { UpdateClientDto } from "./update-client.dto";

/** Datos de entrada de `PATCH /api/clientes/:id` (actualización parcial). */
export type PatchClientDto = Partial<UpdateClientDto>;
EOF

```

**`dto/client-response.dto.ts`**

```
: > src/features/business/clients/dto/client-response.dto.ts
cat >> src/features/business/clients/dto/client-response.dto.ts << 'EOF'
import { Client, ClientI } from "../client.model";

/**
 * Respuesta HTTP de un cliente. Lo usan `GET /api/clientes`,
 * `GET /api/clientes/:id` y la salida de create/update/delete lógico.
 *
 * Regla del DTO de respuesta: la API expone **sólo** lo que declara este tipo y
 * `password` nunca sale. La proyección es explícita (`Omit`) porque hay algo que
 * ocultar; en las entidades que no tienen campos internos el DTO coincide con el
 * modelo y basta con documentarlo.
 */
export type ClientResponseDto = Omit<ClientI, "password">;

/** Mapper modelo -> DTO de respuesta (objeto plano; elimina `password`). */
export function toClientResponse(client: Client): ClientResponseDto {
  const { password, ...safe } = client.toJSON() as ClientI & { password?: string };
  return safe;
}
EOF

```

**`dto/index.ts`**

```
: > src/features/business/clients/dto/index.ts
cat >> src/features/business/clients/dto/index.ts << 'EOF'
export * from "./create-client.dto";
export * from "./update-client.dto";
export * from "./patch-client.dto";
export * from "./client-response.dto";
EOF

```

```
: > src/features/business/clients/clients.repository.ts
cat >> src/features/business/clients/clients.repository.ts << 'EOF'
import { CreationAttributes, Transaction } from "sequelize";
import { Client, ClientI } from "./client.model";

/**
 * Capa Repository del feature Clients.
 *
 * Única responsable de hablar con Sequelize (el modelo `Client`).
 * No contiene reglas de negocio ni conoce `req`/`res`.
 */
export class ClientsRepository {
  /** Todos los clientes activos. */
  public async findAllActive(): Promise<Client[]> {
    return Client.findAll({ where: { status: "active" } });
  }

  /** Un cliente por PK (o `null`). Acepta transacción para flujos de ventas. */
  public async findById(id: number, transaction?: Transaction): Promise<Client | null> {
    return Client.findByPk(id, { transaction });
  }

  /** Inserta un cliente. */
  public async create(data: CreationAttributes<Client>): Promise<Client> {
    return Client.create(data);
  }

  /** Persiste cambios sobre una instancia existente. */
  public async update(client: Client, data: Partial<ClientI>): Promise<Client> {
    return client.update(data);
  }

  /** Elimina físicamente una instancia. */
  public async delete(client: Client): Promise<void> {
    await client.destroy();
  }
}
EOF

```

```
: > src/features/business/clients/clients.service.ts
cat >> src/features/business/clients/clients.service.ts << 'EOF'
import {
  ClientResponseDto,
  CreateClientDto,
  PatchClientDto,
  UpdateClientDto,
  toClientResponse,
} from "./dto";
import { ClientsRepository } from "./clients.repository";
import { Client } from "./client.model";
import { AppError } from "../../../shared/errors/app-error";

/**
 * Capa Service del feature Clients.
 *
 * Reglas de negocio: default de `status`, política de borrado lógico, borrado
 * físico y saneamiento de la respuesta (oculta `password`).
 *
 * No conoce `req`/`res` ni escribe Sequelize directamente: delega en el
 * repository y devuelve **DTOs** (carpeta `dto/`), nunca instancias del modelo.
 */
export class ClientsService {
  public constructor(
    private readonly repository: ClientsRepository = new ClientsRepository()
  ) {}

  // ================== READ ==================
  public async getAll(): Promise<ClientResponseDto[]> {
    const clients = await this.repository.findAllActive();
    return clients.map((client) => toClientResponse(client));
  }

  public async getOne(id: number): Promise<ClientResponseDto> {
    return toClientResponse(await this.findOrFail(id));
  }

  // ================== CREATE ==================
  public async create(body: CreateClientDto): Promise<ClientResponseDto> {
    // Se copian los campos uno a uno a propósito: sólo lo que declara el DTO
    // llega al modelo (evita *mass assignment* de campos no permitidos).
    const client = await this.repository.create({
      name: body.name,
      address: body.address,
      phone: body.phone,
      email: body.email,
      password: body.password,
      status: body.status ?? "active",
    });
    return toClientResponse(client);
  }

  // ================== UPDATE ==================
  public async updatePut(id: number, body: UpdateClientDto): Promise<ClientResponseDto> {
    const client = await this.findOrFail(id);

    await this.repository.update(client, {
      name: body.name,
      address: body.address,
      phone: body.phone,
      email: body.email,
      password: body.password ?? client.password,
    });
    return toClientResponse(client);
  }

  public async updatePatch(id: number, body: PatchClientDto): Promise<ClientResponseDto> {
    const client = await this.findOrFail(id);

    await this.repository.update(client, body);
    return toClientResponse(client);
  }

  // ================== DELETE ==================
  /** Eliminación física. */
  public async deletePhysical(id: number): Promise<void> {
    // `onlyActive: false` -> también permite purgar un registro ya desactivado.
    const client = await this.findOrFail(id, false);
    await this.repository.delete(client);
  }

  /** Eliminación lógica -> `status = inactive`. */
  public async deleteLogical(id: number): Promise<ClientResponseDto> {
    const client = await this.findOrFail(id);

    await this.repository.update(client, { status: "inactive" });
    return toClientResponse(client);
  }

  // ================== HELPERS ==================
  /**
   * Busca por PK y falla con 404 si no existe.
   *
   * `onlyActive` (por defecto `true`) aplica la **política de borrado lógico**:
   * un registro `inactive` deja de ser visible para la API, igual que en
   * `getAll`. Es el único punto donde se decide, así que `getOne`, `updatePut`,
   * `updatePatch` y `deleteLogical` quedan automáticamente consistentes.
   *
   * `deletePhysical` lo desactiva (`onlyActive: false`) para poder purgar
   * también los registros que ya tienen borrado lógico.
   */
  private async findOrFail(id: number, onlyActive = true): Promise<Client> {
    const client = await this.repository.findById(id);
    if (!client || (onlyActive && client.status !== "active")) {
      throw new AppError(404, "Client not found");
    }
    return client;
  }
}
EOF

```

```
: > src/features/business/clients/clients.controller.ts
cat >> src/features/business/clients/clients.controller.ts << 'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import { CreateClientDto, PatchClientDto, UpdateClientDto } from "./dto";
import { ClientsService } from "./clients.service";

/**
 * Capa Controller del feature Clients.
 *
 * Traduce HTTP <-> negocio: lee `req`, llama al service y arma la respuesta.
 * No contiene reglas de negocio ni consultas a Sequelize.
 *
 * Cada método delega el manejo de errores en `run()` (ver `BaseController`):
 * así el `try/catch` no se repite en los 7 métodos.
 */
export class ClientsController extends BaseController {
  public constructor(
    private readonly service: ClientsService = new ClientsService()
  ) {
    super();
  }

  // ================== READ ==================
  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const clients = await this.service.getAll();
      res.status(200).json({ clients });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const client = await this.service.getOne(this.paramId(req));
      res.status(200).json({ client });
    });
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const client = await this.service.create(req.body as CreateClientDto);
      res.status(201).json({ client });
    });
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const client = await this.service.updatePut(
        this.paramId(req),
        req.body as UpdateClientDto
      );
      res.status(200).json({ client });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const client = await this.service.updatePatch(
        this.paramId(req),
        req.body as PatchClientDto
      );
      res.status(200).json({ client });
    });
  }

  // ================== DELETE ==================
  /** Eliminación física. */
  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const id = this.paramId(req);
      await this.service.deletePhysical(id);
      res.status(200).json({ message: "Client permanently deleted", id });
    });
  }

  /** Eliminación lógica -> `status = inactive`. */
  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const client = await this.service.deleteLogical(this.paramId(req));
      res.status(200).json({ message: "Client deactivated (logical delete)", client });
    });
  }
}
EOF

```

```
: > src/features/business/clients/clients.routes.ts
cat >> src/features/business/clients/clients.routes.ts << 'EOF'
import { Application } from "express";
import { ClientsController } from "./clients.controller";

export class ClientsRoutes {
  public clientsController: ClientsController = new ClientsController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/clientes")
      .get(this.clientsController.getAll.bind(this.clientsController));

    // getOne
    app
      .route("/api/clientes/:id")
      .get(this.clientsController.getOne.bind(this.clientsController));

    // create
    app
      .route("/api/clientes")
      .post(this.clientsController.create.bind(this.clientsController));

    // update (PUT / PATCH)
    app
      .route("/api/clientes/:id")
      .put(this.clientsController.updatePut.bind(this.clientsController))
      .patch(this.clientsController.updatePatch.bind(this.clientsController));

    // delete físico
    app
      .route("/api/clientes/:id")
      .delete(this.clientsController.deletePhysical.bind(this.clientsController));

    // delete lógico
    app
      .route("/api/clientes/:id/deactivate")
      .patch(this.clientsController.deleteLogical.bind(this.clientsController));
  }
}
EOF

```

### Verificación

```
npx tsc --noEmit                 # 0 errores de tipos
npm run dev                      # sync OK

# getAll / getOne
curl -s http://localhost:4000/api/clientes | head -c 200
curl -s http://localhost:4000/api/clientes/1 | head -c 200

# create
curl -s -X POST http://localhost:4000/api/clientes \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana","address":"Calle 1","phone":"3001234567","email":"ana@example.com","password":"Password123!"}'

# update PUT / PATCH
curl -s -X PUT http://localhost:4000/api/clientes/1 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana 2","address":"Calle 2","phone":"3007654321","email":"ana@example.com"}'
curl -s -X PATCH http://localhost:4000/api/clientes/1 \
  -H 'Content-Type: application/json' -d '{"address":"Calle 3"}'

# delete lógico y físico
curl -s -X PATCH http://localhost:4000/api/clientes/1/deactivate
curl -s -X DELETE http://localhost:4000/api/clientes/1

# contrato de errores (BaseController + findOrFail)
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4000/api/clientes/abc   # 400 (:id no entero)
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4000/api/clientes/0     # 400 (no positivo)
# con el id 1 ya desactivado, volver a leerlo debe dar 404 (el borrado lógico se filtra)
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4000/api/clientes/1
# PUT con "status": el campo no está en el DTO, así que se ignora (sigue 'active')
curl -s -X PUT http://localhost:4000/api/clientes/2 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana 2","address":"Calle 2","phone":"3007654321","email":"ana@example.com","status":"inactive"}'

```

- [ ] `getAll` devuelve solo `status = active` y **nunca** el campo `password`
- [ ] `getOne` con id inexistente **o** con `status = inactive` devuelve **404** (la misma regla que `getAll`)
- [ ] Un `:id` no numérico o `0` devuelve **400** (lo valida `paramId` en `BaseController`, no el service)
- [ ] `PUT` conserva `password` si no se envía; `PATCH` actualiza solo lo enviado
- [ ] `status` **no** se puede cambiar con `PUT`/`PATCH`: si se envía, se ignora; sólo cambia con `deactivate`
- [ ] `deactivate` deja `status = inactive`; `DELETE` borra la fila
- [ ] Las respuestas son **objetos planos** (DTOs de respuesta), sin campos internos de Sequelize

### Cierre del ISS

Client queda **completo por capas**: `clients.routes.ts` → `clients.controller.ts` → `clients.service.ts` → `clients.repository.ts` → `client.model.ts`.

---

> **✅ GATE de la unidad ISS-03** — *este bloque no añade ningún criterio nuevo.*
>
> Las condiciones de cierre son exactamente las que define el ISS técnico de esta misma página:
>
> - 📋 **Criterios de aceptación** → [Criterios de aceptación](https://tecnogua.com/academic/site/backend2026/manual/04-ISS-03-client-crud/#criterios-de-aceptacion-iss-03-a)
> - 🧩 **Cierre de la unidad** → [Cierre de la unidad](https://tecnogua.com/academic/site/backend2026/manual/04-ISS-03-client-crud/#cierre-del-iss_1)
> - 🧠 **Autoevaluación** → [Evaluación del cuaderno](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-03-aprendizaje/#evaluacion)
>
> Con el GATE en verde queda habilitado **ISS-04 · Seeders con Faker**.
>
> **Navegación de la ruta:** **←** [ISS-03 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-03-aprendizaje/) · [↑ Ruta Express](https://tecnogua.com/academic/site/backend2026/) · **→** [ISS-04 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-04-aprendizaje/)