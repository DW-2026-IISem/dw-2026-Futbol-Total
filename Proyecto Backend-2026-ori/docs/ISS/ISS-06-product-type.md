# 🛠 Unidad ISS-06 · Feature ProductType — capa 🛠 CONSTRUIR

> [🧠 Comprender este bloque →](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-06-aprendizaje/) · [📝 Evaluación](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-06-aprendizaje/#evaluacion) · [✅ GATE de la unidad](https://tecnogua.com/academic/site/backend2026/manual/07-ISS-06-product-type/#criterios-de-aceptacion-iss-06)

>
> | **Capa**         | **Página**                                                                                                                            | **Para qué**                             |
> | :--------------- | :------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------- |
> | 🧠 **Aprender**  | [Feature ProductType](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-06-aprendizaje/)                                 | comprender, explicar y relacionar        |
> | 🛠 **Construir** | esta página                                                                                                                           | ejecutar, programar y verificar          |
> | ✅ **GATE**       | [Condiciones de cierre](https://tecnogua.com/academic/site/backend2026/manual/07-ISS-06-product-type/#criterios-de-aceptacion-iss-06) | condición para pasar al bloque siguiente |
>
> **Esta es la guía ejecutable.** Sigue los pasos en orden. El cuerpo de abajo es el **ISS técnico verbatim**: comandos, rutas, versiones, PARCHEs, verificaciones y criterios, sin simplificar ni modernizar.

---

# Fase I: Business — ISS-06 — Feature ProductType (tipos de producto)

> **Contexto mínimo (autosuficiente).** Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que hay que saber antes de ejecutarlo. - **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript + Sequelize, **arquitectura por features**, Fase I **solo Business** (sin auth ni roles). - **Recorrido obligatorio de una petición:** `HTTP → Controller → Service → Repository → Model → Sequelize → BD`. Ninguna capa se salta a la siguiente. - **Diseño de datos** (columnas, tipos, FK `RESTRICT`, índices, transacciones): [`../bd-storelab.md`](https://tecnogua.com/academic/site/backend2026/bd-storelab/), **Fase I — Business**. - **Capas, convenciones y reglas transversales:** [`00-contexto.md`](https://tecnogua.com/academic/site/backend2026/manual/00-contexto/).
>
> | **Este ISS**        |                                                                                                        |
> | :------------------ | :----------------------------------------------------------------------------------------------------- |
> | **Título**          | Feature ProductType (tipos de producto)                                                                |
> | **Feature / tabla** | `product_types` → `product-types/`                                                                     |
> | **API**             | `/api/tipos-producto`                                                                                  |
> | **Depende de**      | [ISS-05 — Swagger / OpenAPI](https://tecnogua.com/academic/site/backend2026/manual/06-ISS-05-swagger/) |
> | **Habilita**        | [ISS-07 — Feature Product](https://tecnogua.com/academic/site/backend2026/manual/08-ISS-07-product/)   |

## Contenido de este ISS

- 11.1 Modelo ProductType
- 11.2 DTO + Repository + Service + Controller + routes (CRUD completo)
- 11.3 HTTP (REST Client)
- 11.4 Cableado Routes + Config
- 11.5 Seeder ProductType
- 11.6 Swagger ProductType

---

**Objetivo:** CRUD + seeder + swagger de ProductType (sin FK).
**Bloqueado por:** [ISS-05](https://tecnogua.com/academic/site/backend2026/manual/06-ISS-05-swagger/).
**API:** `/api/tipos-producto` — **SIN AUTH**.
**Patrón:** mismo que Client (ISS-03-A…E + 04 + 05).

### Criterios de aceptación (ISS-06)

- [ ] **11.1** Modelo `product-type.model.ts` (`status` + `timestamps: true`)
- [ ] **11.2** DTOs (`dto/`) + Repository + Service + Controller + routes en este orden: getAll, getOne, create, update PUT/PATCH, delete físico y lógico
- [ ] **11.3** Carpeta `http/` en el mismo orden: get, create, update, delete
- [ ] **11.4** Cableado en `routes/index.ts` + `config` (import model + route)
- [ ] **11.5** Seeder + registro en SeedersRunner / counts
- [ ] **11.6** Swagger + registro en `src/swagger`

```bash
mkdir -p src/features/business/product-types/http
```

---

## 11.1 Modelo ProductType

##

```bash
: > src/features/business/product-types/product-type.model.ts
cat >> src/features/business/product-types/product-type.model.ts << 'EOF'
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
      // Fail-safe: una fila insertada sin estado explícito NO queda visible en la API.
      // La vía de creación de la API siempre envía "active".
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

## 11.2 DTO + Repository + Service + Controller + routes (CRUD completo)

Recordemos el flujo por capas del feature:

```text
HTTP (routes) -> Controller -> Service -> Repository -> Model -> Sequelize -> BD
```

**DTOs — carpeta `dto/` (un archivo por operación)**

```bash
mkdir -p src/features/business/product-types/dto
```

**`dto/create-product-type.dto.ts`**

```bash
: > src/features/business/product-types/dto/create-product-type.dto.ts
cat >> src/features/business/product-types/dto/create-product-type.dto.ts << 'EOF'
/** Datos de entrada de `POST /api/tipos-producto`. */
export interface CreateProductTypeDto {
  name: string;
  description?: string | null;
  /** Opcional: por defecto `active`. Tras crearlo, el estado sólo cambia con el borrado lógico. */
  status?: "active" | "inactive";
}
EOF
```

**`dto/update-product-type.dto.ts`**

```bash
: > src/features/business/product-types/dto/update-product-type.dto.ts
cat >> src/features/business/product-types/dto/update-product-type.dto.ts << 'EOF'
/**
 * Datos de entrada de `PUT /api/tipos-producto/:id` (reemplazo completo).
 *
 * `status` **no** está aquí a propósito: el estado sólo cambia con el borrado
 * lógico (`DELETE /api/tipos-producto/:id/deactivate`).
 */
export interface UpdateProductTypeDto {
  name: string;
  description?: string | null;
}
EOF
```

**`dto/patch-product-type.dto.ts`**

```bash
: > src/features/business/product-types/dto/patch-product-type.dto.ts
cat >> src/features/business/product-types/dto/patch-product-type.dto.ts << 'EOF'
import { UpdateProductTypeDto } from "./update-product-type.dto";

/** Datos de entrada de `PATCH /api/tipos-producto/:id` (actualización parcial). */
export type PatchProductTypeDto = Partial<UpdateProductTypeDto>;
EOF
```

**`dto/product-type-response.dto.ts`**

```bash
: > src/features/business/product-types/dto/product-type-response.dto.ts
cat >> src/features/business/product-types/dto/product-type-response.dto.ts << 'EOF'
import { ProductType, ProductTypeI } from "../product-type.model";

/**
 * Respuesta HTTP de un tipo de producto. Lo usan `GET /api/tipos-producto`,
 * `GET /api/tipos-producto/:id` y la salida de create/update/delete lógico.
 *
 * Regla del DTO de respuesta: la API expone **sólo** lo que declara este tipo.
 * `ProductType` no guarda campos internos, por eso el contrato coincide hoy con
 * el modelo. Si mañana aparece uno, la proyección se vuelve explícita aquí
 * (`Omit<ProductTypeI, "...">`) y el mapper lo omite.
 */
export type ProductTypeResponseDto = ProductTypeI;

/** Mapper modelo -> DTO de respuesta (objeto plano, sin métodos de Sequelize). */
export function toProductTypeResponse(productType: ProductType): ProductTypeResponseDto {
  return productType.toJSON() as ProductTypeResponseDto;
}
EOF
```

**`dto/index.ts`**

```bash
: > src/features/business/product-types/dto/index.ts
cat >> src/features/business/product-types/dto/index.ts << 'EOF'
export * from "./create-product-type.dto";
export * from "./update-product-type.dto";
export * from "./patch-product-type.dto";
export * from "./product-type-response.dto";
EOF
```

- `product-types.repository.ts` → única capa que habla con el modelo `ProductType`.
- `product-types.service.ts` → reglas de negocio (`status` por defecto, `description` normalizada, 404 si no existe).
- `product-types.controller.ts` → solo HTTP (`req`/`res`).

**Repository**

```bash
: > src/features/business/product-types/product-types.repository.ts
cat >> src/features/business/product-types/product-types.repository.ts << 'EOF'
import { CreationAttributes } from "sequelize";
import { ProductType, ProductTypeI } from "./product-type.model";

/**
 * Capa Repository del feature ProductTypes.
 *
 * Única responsable de hablar con Sequelize (el modelo `ProductType`).
 */
export class ProductTypesRepository {
  /** Todos los tipos activos. */
  public async findAllActive(): Promise<ProductType[]> {
    return ProductType.findAll({ where: { status: "active" } });
  }

  /** Un tipo por PK (o `null`). */
  public async findById(id: number): Promise<ProductType | null> {
    return ProductType.findByPk(id);
  }

  /** Inserta un tipo de producto. */
  public async create(data: CreationAttributes<ProductType>): Promise<ProductType> {
    return ProductType.create(data);
  }

  /** Persiste cambios sobre una instancia existente. */
  public async update(
    productType: ProductType,
    data: Partial<ProductTypeI>
  ): Promise<ProductType> {
    return productType.update(data);
  }

  /** Elimina físicamente una instancia. */
  public async delete(productType: ProductType): Promise<void> {
    await productType.destroy();
  }
}
EOF
```

**Service**

```bash
: > src/features/business/product-types/product-types.service.ts
cat >> src/features/business/product-types/product-types.service.ts << 'EOF'
import {
  CreateProductTypeDto,
  PatchProductTypeDto,
  ProductTypeResponseDto,
  UpdateProductTypeDto,
  toProductTypeResponse,
} from "./dto";
import { ProductTypesRepository } from "./product-types.repository";
import { ProductType } from "./product-type.model";
import { AppError } from "../../../shared/errors/app-error";

/**
 * Capa Service del feature ProductTypes.
 *
 * Reglas de negocio: default de `status`, política de borrado lógico y borrado
 * físico. No conoce `req`/`res` ni escribe Sequelize: delega en el repository y
 * devuelve **DTOs** (carpeta `dto/`).
 */
export class ProductTypesService {
  public constructor(
    private readonly repository: ProductTypesRepository = new ProductTypesRepository()
  ) {}

  // ================== READ ==================
  public async getAll(): Promise<ProductTypeResponseDto[]> {
    const productTypes = await this.repository.findAllActive();
    return productTypes.map((productType) => toProductTypeResponse(productType));
  }

  public async getOne(id: number): Promise<ProductTypeResponseDto> {
    return toProductTypeResponse(await this.findOrFail(id));
  }

  // ================== CREATE ==================
  public async create(body: CreateProductTypeDto): Promise<ProductTypeResponseDto> {
    // Copia campo a campo a propósito (evita *mass assignment*).
    const productType = await this.repository.create({
      name: body.name,
      description: body.description ?? null,
      status: body.status ?? "active",
    });
    return toProductTypeResponse(productType);
  }

  // ================== UPDATE ==================
  public async updatePut(
    id: number,
    body: UpdateProductTypeDto
  ): Promise<ProductTypeResponseDto> {
    const productType = await this.findOrFail(id);

    await this.repository.update(productType, {
      name: body.name,
      description: body.description ?? null,
    });
    return toProductTypeResponse(productType);
  }

  public async updatePatch(
    id: number,
    body: PatchProductTypeDto
  ): Promise<ProductTypeResponseDto> {
    const productType = await this.findOrFail(id);

    await this.repository.update(productType, body);
    return toProductTypeResponse(productType);
  }

  // ================== DELETE ==================
  /** Eliminación física. */
  public async deletePhysical(id: number): Promise<void> {
    // `onlyActive: false` -> también permite purgar un registro ya desactivado.
    const productType = await this.findOrFail(id, false);
    await this.repository.delete(productType);
  }

  /** Eliminación lógica -> `status = inactive`. */
  public async deleteLogical(id: number): Promise<ProductTypeResponseDto> {
    const productType = await this.findOrFail(id);

    await this.repository.update(productType, { status: "inactive" });
    return toProductTypeResponse(productType);
  }

  // ================== HELPERS ==================
  /**
   * Busca por PK y falla con 404 si no existe.
   *
   * `onlyActive` (por defecto `true`) aplica la **política de borrado lógico**:
   * un registro `inactive` deja de ser visible para la API, igual que en
   * `getAll`.
   */
  private async findOrFail(id: number, onlyActive = true): Promise<ProductType> {
    const productType = await this.repository.findById(id);
    if (!productType || (onlyActive && productType.status !== "active")) {
      throw new AppError(404, "Product type not found");
    }
    return productType;
  }
}
EOF
```

**Controller**

```bash
: > src/features/business/product-types/product-types.controller.ts
cat >> src/features/business/product-types/product-types.controller.ts << 'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import {
  CreateProductTypeDto,
  PatchProductTypeDto,
  UpdateProductTypeDto,
} from "./dto";
import { ProductTypesService } from "./product-types.service";

/**
 * Capa Controller del feature ProductTypes.
 * Solo HTTP: lee `req`, llama al service y arma la respuesta.
 * El manejo de errores se delega en `run()` (ver `BaseController`).
 */
export class ProductTypesController extends BaseController {
  public constructor(
    private readonly service: ProductTypesService = new ProductTypesService()
  ) {
    super();
  }

  // ================== READ ==================
  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const product_types = await this.service.getAll();
      res.status(200).json({ product_types });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const product_type = await this.service.getOne(this.paramId(req));
      res.status(200).json({ product_type });
    });
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const product_type = await this.service.create(
        req.body as CreateProductTypeDto
      );
      res.status(201).json({ product_type });
    });
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const product_type = await this.service.updatePut(
        this.paramId(req),
        req.body as UpdateProductTypeDto
      );
      res.status(200).json({ product_type });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const product_type = await this.service.updatePatch(
        this.paramId(req),
        req.body as PatchProductTypeDto
      );
      res.status(200).json({ product_type });
    });
  }

  // ================== DELETE ==================
  /** Eliminación física. */
  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const id = this.paramId(req);
      await this.service.deletePhysical(id);
      res.status(200).json({ message: "Product type permanently deleted", id });
    });
  }

  /** Eliminación lógica -> `status = inactive`. */
  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const product_type = await this.service.deleteLogical(this.paramId(req));
      res.status(200).json({
        message: "Product type deactivated (logical delete)",
        product_type,
      });
    });
  }
}
EOF
```

```bash
: > src/features/business/product-types/product-types.routes.ts
cat >> src/features/business/product-types/product-types.routes.ts << 'EOF'
import { Application } from "express";
import { ProductTypesController } from "./product-types.controller";

export class ProductTypesRoutes {
  public productTypesController: ProductTypesController = new ProductTypesController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/tipos-producto")
      .get(this.productTypesController.getAll.bind(this.productTypesController));

    // getOne
    app
      .route("/api/tipos-producto/:id")
      .get(this.productTypesController.getOne.bind(this.productTypesController));

    // create
    app
      .route("/api/tipos-producto")
      .post(this.productTypesController.create.bind(this.productTypesController));

    // update (PUT / PATCH)
    app
      .route("/api/tipos-producto/:id")
      .put(this.productTypesController.updatePut.bind(this.productTypesController))
      .patch(this.productTypesController.updatePatch.bind(this.productTypesController));

    // delete físico
    app
      .route("/api/tipos-producto/:id")
      .delete(this.productTypesController.deletePhysical.bind(this.productTypesController));

    // delete lógico
    app
      .route("/api/tipos-producto/:id/deactivate")
      .patch(this.productTypesController.deleteLogical.bind(this.productTypesController));
  }
}
EOF
```

---

## 11.3 HTTP (REST Client)

```bash
: > src/features/business/product-types/http/product-types.get.http
cat >> src/features/business/product-types/http/product-types.get.http << 'EOF'
### Feature ProductType — GET ALL / GET ONE
### Modalidad JWT + RBAC: `authenticate` (401 sin token) + `authorize` (403 sin concesión).
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

# @name getAllProductTypes
GET {{baseUrl}}/api/tipos-producto
Authorization: Bearer {{token}}

###

# @name getOneProductType
GET {{baseUrl}}/api/tipos-producto/{{id}}
Authorization: Bearer {{token}}

### 401 — sin token
GET {{baseUrl}}/api/tipos-producto
EOF
```

```bash
: > src/features/business/product-types/http/product-types.create.http
cat >> src/features/business/product-types/http/product-types.create.http << 'EOF'
### Feature ProductType — CREATE
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

# @name createProductType
POST {{baseUrl}}/api/tipos-producto
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Electrónica",
  "description": "Dispositivos y accesorios",
  "status": "active"
}
EOF
```

```bash
: > src/features/business/product-types/http/product-types.update.http
cat >> src/features/business/product-types/http/product-types.update.http << 'EOF'
### Feature ProductType — UPDATE (PUT) / UPDATE (PATCH)
### Modalidad JWT + RBAC. `status` no se envía: el estado solo cambia con
### PATCH {{baseUrl}}/api/tipos-producto/{{id}}/deactivate (borrado lógico).
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

# @name updateProductTypePut
PUT {{baseUrl}}/api/tipos-producto/{{id}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Electrónica Actualizada",
  "description": "Categoría renovada"
}

###

# @name updateProductTypePatch
PATCH {{baseUrl}}/api/tipos-producto/{{id}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "description": "Descripción parcial"
}
EOF
```

```bash
: > src/features/business/product-types/http/product-types.delete.http
cat >> src/features/business/product-types/http/product-types.delete.http << 'EOF'
### Feature ProductType — DELETE físico / DELETE lógico (status = inactive)
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

# @name deleteProductTypePhysical
DELETE {{baseUrl}}/api/tipos-producto/{{id}}
Authorization: Bearer {{token}}

###

# @name deleteProductTypeLogical
PATCH {{baseUrl}}/api/tipos-producto/{{id}}/deactivate
Authorization: Bearer {{token}}
EOF
```

---

## 11.4 Cableado Routes + Config

**PARCHE** — `src/routes/index.ts` **ya existe**.

1. **Debajo de** `import { ClientsRoutes } ...`, **añadir**:

```ts
import { ProductTypesRoutes } from "../features/business/product-types/product-types.routes";
```

1. **Dentro de** `export class Routes`, **debajo de** `clientsRoutes`, **añadir**:

```ts
  public productTypesRoutes: ProductTypesRoutes = new ProductTypesRoutes();
```

**PARCHE** — `src/config/index.ts` **ya existe**.

1. **Debajo de** `import "../features/business/clients/client.model";`, **añadir**:

```ts
import "../features/business/product-types/product-type.model";
```

1. **Dentro de** `routes()`, **debajo de** `this.routePrv.clientsRoutes.routes(this.app);`, **añadir**:

```ts
    this.routePrv.productTypesRoutes.routes(this.app);
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
: > src/features/business/product-types/product-types.seeder.ts
cat >> src/features/business/product-types/product-types.seeder.ts << 'EOF'
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
- **Dentro de** la resolución por env, **añadir** lectura de `SEED_PRODUCT_TYPES` (ver [ISS-08](https://tecnogua.com/academic/site/backend2026/manual/09-ISS-08-sale-product-sale/) si consolidás).

**PARCHE** — `src/database/seeders/index.ts` **ya existe**.

1. **Debajo de** imports de client, **añadir** import de `seedProductTypes`.
2. **Debajo de** `await seedClients(...)`, **añadir** `await seedProductTypes(counts.product_types);`

---

## 11.6 Swagger ProductType

```bash
: > src/features/business/product-types/product-types.swagger.ts
cat >> src/features/business/product-types/product-types.swagger.ts << 'EOF'
import {
  bearerSecurity,
  forbiddenResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

/**
 * Documentación OpenAPI del feature ProductType.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: todos los endpoints son **JWT + RBAC** (`authenticate` + `authorize`).
 * La modalidad se declara por operación: aquí heredan el `security` global del documento.
 */

export const productTypesSwagger = {
  tags: [
    {
      name: "TiposProducto",
      description: "CRUD de tipos de producto — **JWT + RBAC** (authenticate + authorize)",
    },
  ],
  paths: {
    "/api/tipos-producto": {
      get: {
        tags: ["TiposProducto"],
        summary: "Listar tipos de producto activos",
        description: "JWT + RBAC — retorna tipos con status=active",
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
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
        description: "JWT + RBAC",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductTypeCreate" },
            },
          },
        },
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
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
        description: "JWT + RBAC — 404 si no existe o tiene borrado lógico",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "id numérico (> 0). Si no lo es, la API responde 400.",
            schema: { type: "integer", minimum: 1 },
          },
        ],
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
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
          "400": { description: "id inválido (debe ser un entero positivo)" },
          "404": { description: "No encontrado" },
        },
      },
      put: {
        tags: ["TiposProducto"],
        summary: "Actualizar tipo de producto (PUT — reemplazo)",
        description: "JWT + RBAC",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "id numérico (> 0). Si no lo es, la API responde 400.",
            schema: { type: "integer", minimum: 1 },
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
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "200": { description: "Actualizado" },
          "400": { description: "id inválido (debe ser un entero positivo)" },
          "404": { description: "No encontrado" },
        },
      },
      patch: {
        tags: ["TiposProducto"],
        summary: "Actualizar tipo de producto (PATCH — parcial)",
        description: "JWT + RBAC",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "id numérico (> 0). Si no lo es, la API responde 400.",
            schema: { type: "integer", minimum: 1 },
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
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "200": { description: "Actualizado" },
          "400": { description: "id inválido (debe ser un entero positivo)" },
          "404": { description: "No encontrado" },
        },
      },
      delete: {
        tags: ["TiposProducto"],
        summary: "Eliminar tipo de producto (físico)",
        description: "JWT + RBAC — borra la fila (también si tiene borrado lógico)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "id numérico (> 0). Si no lo es, la API responde 400.",
            schema: { type: "integer", minimum: 1 },
          },
        ],
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "200": { description: "Eliminado" },
          "400": { description: "id inválido (debe ser un entero positivo)" },
          "404": { description: "No encontrado" },
        },
      },
    },
    "/api/tipos-producto/{id}/deactivate": {
      patch: {
        tags: ["TiposProducto"],
        summary: "Eliminar tipo de producto (lógico)",
        description: "JWT + RBAC — status = inactive",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "id numérico (> 0). Si no lo es, la API responde 400.",
            schema: { type: "integer", minimum: 1 },
          },
        ],
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "200": { description: "Desactivado" },
          "400": { description: "id inválido (debe ser un entero positivo)" },
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
        },
      },
      ProductTypePatch: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
        },
      },
    },
  },
};
EOF
```

**PARCHE** — `src/swagger/index.ts` **ya existe**.

1. **Debajo de** `import { clientsSwagger } ...`, **añadir** import de `productTypesSwagger`.
2. **Dentro de** `featureSwaggerModules`, **debajo de** `clientsSwagger,`, **añadir** `productTypesSwagger,`.

### Cierre del ISS

```bash
npm run dev
```

> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de continuar.

---

> **✅ GATE de la unidad ISS-06** — *este bloque no añade ningún criterio nuevo.*
>
> Las condiciones de cierre son exactamente las que define el ISS técnico de esta misma página:
>
> - 📋 **Criterios de aceptación** → [Criterios de aceptación](https://tecnogua.com/academic/site/backend2026/manual/07-ISS-06-product-type/#criterios-de-aceptacion-iss-06)
> - 🧩 **Cierre de la unidad** → [Cierre de la unidad](https://tecnogua.com/academic/site/backend2026/manual/07-ISS-06-product-type/#cierre-del-iss)
> - 🧠 **Autoevaluación** → [Evaluación del cuaderno](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-06-aprendizaje/#evaluacion)
>
> Con el GATE en verde queda habilitado **ISS-07 · Feature Product**.
>
> **Navegación de la ruta:** **←** [ISS-06 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-06-aprendizaje/) · [↑ Ruta Express](https://tecnogua.com/academic/site/backend2026/) · **→** [ISS-07 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-07-aprendizaje/)
