# Fase I: Business — ISS-07 — Feature Product (productos)

> **🛠 Unidad ISS-07 · Feature Product** — capa **🛠 CONSTRUIR**
>
> [🧠 Comprender este bloque →](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-07-aprendizaje/) · [📝 Evaluación](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-07-aprendizaje/#evaluacion) · [✅ GATE de la unidad](https://tecnogua.com/academic/site/backend2026/manual/08-ISS-07-product/#criterios-de-aceptacion-iss-07)
>
> | **Capa**         | **Página**                                                                                                                       | **Para qué**                             |
> | :--------------- | :------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------- |
> | 🧠 **Aprender**  | [Feature Product](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-07-aprendizaje/)                                | comprender, explicar y relacionar        |
> | 🛠 **Construir** | esta página                                                                                                                      | ejecutar, programar y verificar          |
> | ✅ **GATE**       | [Condiciones de cierre](https://tecnogua.com/academic/site/backend2026/manual/08-ISS-07-product/#criterios-de-aceptacion-iss-07) | condición para pasar al bloque siguiente |
>
> **Esta es la guía ejecutable.** Sigue los pasos en orden. El cuerpo de abajo es el **ISS técnico verbatim**: comandos, rutas, versiones, PARCHEs, verificaciones y criterios, sin simplificar ni modernizar.

---

## Contexto mínimo (autosuficiente)

> Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que hay que saber antes de ejecutarlo.
>
> - **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript + Sequelize, **arquitectura por features**, Fase I **solo Business** (sin auth ni roles).
> - **Recorrido obligatorio de una petición:** `HTTP → Controller → Service → Repository → Model → Sequelize → BD`.
> - **Diseño de datos** (columnas, tipos, FK `RESTRICT`, índices, transacciones): [`../bd-storelab.md`](https://tecnogua.com/academic/site/backend2026/bd-storelab/), **Fase I — Business**.
> - **Capas, convenciones y reglas transversales:** [`00-contexto.md`](https://tecnogua.com/academic/site/backend2026/manual/00-contexto/).

| **Este ISS** | |
| :-- | :-- |
| **Título** | Feature Product (productos) |
| **Feature / tabla** | `products` → `products/` |
| **API** | `/api/productos` |
| **Depende de** | [ISS-06 — Feature ProductType](https://tecnogua.com/academic/site/backend2026/manual/07-ISS-06-product-type/) |
| **Habilita** | [ISS-08 — Feature Sale + ProductSale](https://tecnogua.com/academic/site/backend2026/manual/09-ISS-08-sale-product-sale/) |

## Contenido de este ISS

- 12.1 Modelo Product
- 12.2 DTO + Repository + Service + Controller + routes
- 12.3 HTTP
- 12.4 Cableado
- 12.5 Relación ProductType ↔ Product (**obligatorio al cerrar la tabla Product**)
- 12.6 Seeder + Swagger Product

---

**Objetivo:** CRUD de Product con FK `product_type_id`.
**Bloqueado por:** [ISS-06](https://tecnogua.com/academic/site/backend2026/manual/07-ISS-06-product-type/).
**API:** `/api/productos` — **SIN AUTH**.

### Criterios de aceptación (ISS-07)

- [ ] **12.1** Modelo Product con `product_type_id`
- [ ] **12.2** DTOs (`dto/`) + service que valida tipo **activo** en create/updatePut (usando `ProductTypesRepository`)
- [ ] **12.3** Routes + http/ en orden getAll, getOne, create, update PUT/PATCH, delete físico y lógico
- [ ] **12.4** Cableado routes/config
- [ ] **12.5** **Relaciones** Product ↔ ProductType (archivo associations + import)
- [ ] **12.6** Seeder + swagger

```
mkdir -p src/features/business/products/http

```

---

## 12.1 Modelo Product

```bash
: > src/features/business/products/product.model.ts
cat >> src/features/business/products/product.model.ts << 'EOF'
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
      // Fail-safe: una fila insertada sin estado explícito NO queda visible en la API.
      // La vía de creación de la API siempre envía "active".
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

## 12.2 DTO + Repository + Service + Controller + routes

Recordemos el flujo por capas del feature:

```text
HTTP (routes) -> Controller -> Service -> Repository -> Model -> Sequelize -> BD
```

**DTOs — carpeta `dto/` (un archivo por operación)**

```bash
mkdir -p src/features/business/products/dto
```

**`dto/create-product.dto.ts`**

```bash
: > src/features/business/products/dto/create-product.dto.ts
cat >> src/features/business/products/dto/create-product.dto.ts << 'EOF'
/** Datos de entrada de `POST /api/productos`. */
export interface CreateProductDto {
  name: string;
  brand: string;
  price: number;
  min_stock: number;
  quantity: number;
  product_type_id: number;
  /** Opcional: por defecto `active`. Tras crearlo, el estado sólo cambia con el borrado lógico. */
  status?: "active" | "inactive";
}
EOF
```

**`dto/update-product.dto.ts`**

```bash
: > src/features/business/products/dto/update-product.dto.ts
cat >> src/features/business/products/dto/update-product.dto.ts << 'EOF'
/**
 * Datos de entrada de `PUT /api/productos/:id` (reemplazo completo).
 *
 * `status` **no** está aquí a propósito: el estado sólo cambia con el borrado
 * lógico (`DELETE /api/productos/:id/deactivate`).
 */
export interface UpdateProductDto {
  name: string;
  brand: string;
  price: number;
  min_stock: number;
  quantity: number;
  product_type_id: number;
}
EOF
```

**`dto/patch-product.dto.ts`**

```bash
: > src/features/business/products/dto/patch-product.dto.ts
cat >> src/features/business/products/dto/patch-product.dto.ts << 'EOF'
import { UpdateProductDto } from "./update-product.dto";

/** Datos de entrada de `PATCH /api/productos/:id` (actualización parcial). */
export type PatchProductDto = Partial<UpdateProductDto>;
EOF
```

**`dto/product-response.dto.ts`**

```bash
: > src/features/business/products/dto/product-response.dto.ts
cat >> src/features/business/products/dto/product-response.dto.ts << 'EOF'
import { Product, ProductI } from "../product.model";

/**
 * Respuesta HTTP de un producto. Lo usan `GET /api/productos`,
 * `GET /api/productos/:id` y la salida de create/update/delete lógico.
 *
 * Regla del DTO de respuesta: la API expone **sólo** lo que declara este tipo.
 * `Product` no guarda campos internos, por eso el contrato coincide hoy con el
 * modelo. Si mañana aparece uno (ej. `cost`), la proyección se vuelve explícita
 * aquí y el mapper lo omite:
 *
 * ```ts
 * export type ProductResponseDto = Omit<ProductI, "cost">;
 * ```
 */
export type ProductResponseDto = ProductI;

/** Mapper modelo -> DTO de respuesta (objeto plano, sin métodos de Sequelize). */
export function toProductResponse(product: Product): ProductResponseDto {
  return product.toJSON() as ProductResponseDto;
}
EOF
```

**`dto/index.ts`**

```bash
: > src/features/business/products/dto/index.ts
cat >> src/features/business/products/dto/index.ts << 'EOF'
export * from "./create-product.dto";
export * from "./update-product.dto";
export * from "./patch-product.dto";
export * from "./product-response.dto";
EOF
```

- `products.repository.ts` → acceso a `Product` (incluye variantes con `transaction`/`lock` para ventas).
- `products.service.ts` → reglas de negocio: `status` por defecto y **el tipo de producto debe existir y estar activo** (lee `ProductTypesRepository`, no el modelo directamente).
- `products.controller.ts` → solo HTTP.

**Repository**

```bash
: > src/features/business/products/products.repository.ts
cat >> src/features/business/products/products.repository.ts << 'EOF'
import { CreationAttributes, Transaction } from "sequelize";
import { Product, ProductI } from "./product.model";

/**
 * Capa Repository del feature Products.
 *
 * Única responsable de hablar con Sequelize (el modelo `Product`).
 * Expone variantes con `transaction`/`lock` que usan los flujos de ventas.
 */
export class ProductsRepository {
  /** Todos los productos activos. */
  public async findAllActive(): Promise<Product[]> {
    return Product.findAll({ where: { status: "active" } });
  }

  /** Un producto por PK (o `null`). */
  public async findById(id: number, transaction?: Transaction): Promise<Product | null> {
    return Product.findByPk(id, { transaction });
  }

  /** Un producto por PK bloqueando la fila (`SELECT ... FOR UPDATE`). */
  public async findByIdForUpdate(
    id: number,
    transaction: Transaction
  ): Promise<Product | null> {
    return Product.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
  }

  /** Inserta un producto. */
  public async create(data: CreationAttributes<Product>): Promise<Product> {
    return Product.create(data);
  }

  /** Persiste cambios sobre una instancia existente. */
  public async update(
    product: Product,
    data: Partial<ProductI>,
    transaction?: Transaction
  ): Promise<Product> {
    return product.update(data, { transaction });
  }

  /** Elimina físicamente una instancia. */
  public async delete(product: Product): Promise<void> {
    await product.destroy();
  }
}
EOF
```

**Service**

> `ProductsService` inyecta **dos** repositories: el propio `ProductsRepository` y el `ProductTypesRepository` de otro feature. Así el service orquesta reglas entre entidades sin romper las capas.

```bash
: > src/features/business/products/products.service.ts
cat >> src/features/business/products/products.service.ts << 'EOF'
import {
  CreateProductDto,
  PatchProductDto,
  ProductResponseDto,
  UpdateProductDto,
  toProductResponse,
} from "./dto";
import { ProductsRepository } from "./products.repository";
import { ProductTypesRepository } from "../product-types/product-types.repository";
import { Product } from "./product.model";
import { AppError } from "../../../shared/errors/app-error";

/**
 * Capa Service del feature Products.
 *
 * Reglas de negocio: default de `status`, política de borrado lógico y
 * validación de que el tipo de producto referenciado exista y esté activo.
 *
 * Delega la persistencia en su repository y la lectura de tipos en el
 * repository de ProductTypes. Devuelve **DTOs** (carpeta `dto/`).
 */
export class ProductsService {
  public constructor(
    private readonly repository: ProductsRepository = new ProductsRepository(),
    private readonly productTypesRepository: ProductTypesRepository = new ProductTypesRepository()
  ) {}

  // ================== READ ==================
  public async getAll(): Promise<ProductResponseDto[]> {
    const products = await this.repository.findAllActive();
    return products.map((product) => toProductResponse(product));
  }

  public async getOne(id: number): Promise<ProductResponseDto> {
    return toProductResponse(await this.findOrFail(id));
  }

  // ================== CREATE ==================
  public async create(body: CreateProductDto): Promise<ProductResponseDto> {
    await this.assertActiveProductType(body.product_type_id);

    // Copia campo a campo a propósito (evita *mass assignment*).
    const product = await this.repository.create({
      name: body.name,
      brand: body.brand,
      price: body.price,
      min_stock: body.min_stock,
      quantity: body.quantity,
      product_type_id: body.product_type_id,
      status: body.status ?? "active",
    });
    return toProductResponse(product);
  }

  // ================== UPDATE ==================
  public async updatePut(id: number, body: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.findOrFail(id);

    await this.assertActiveProductType(body.product_type_id);

    await this.repository.update(product, {
      name: body.name,
      brand: body.brand,
      price: body.price,
      min_stock: body.min_stock,
      quantity: body.quantity,
      product_type_id: body.product_type_id,
    });
    return toProductResponse(product);
  }

  public async updatePatch(id: number, body: PatchProductDto): Promise<ProductResponseDto> {
    const product = await this.findOrFail(id);

    if (body.product_type_id !== undefined) {
      await this.assertActiveProductType(body.product_type_id);
    }

    await this.repository.update(product, body);
    return toProductResponse(product);
  }

  // ================== DELETE ==================
  /** Eliminación física. */
  public async deletePhysical(id: number): Promise<void> {
    // `onlyActive: false` -> también permite purgar un registro ya desactivado.
    const product = await this.findOrFail(id, false);
    await this.repository.delete(product);
  }

  /** Eliminación lógica -> `status = inactive`. */
  public async deleteLogical(id: number): Promise<ProductResponseDto> {
    const product = await this.findOrFail(id);

    await this.repository.update(product, { status: "inactive" });
    return toProductResponse(product);
  }

  // ================== HELPERS ==================
  /**
   * Busca por PK y falla con 404 si no existe.
   *
   * `onlyActive` (por defecto `true`) aplica la **política de borrado lógico**:
   * un registro `inactive` deja de ser visible para la API, igual que en
   * `getAll`.
   */
  private async findOrFail(id: number, onlyActive = true): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product || (onlyActive && product.status !== "active")) {
      throw new AppError(404, "Product not found");
    }
    return product;
  }

  /**
   * Regla: el tipo de producto referenciado debe existir y estar activo.
   *
   * Aquí el 400 (y no el 404 de `findOrFail`) es intencional: el recurso de la
   * URL sí existe, lo que falla es la **referencia** que se quiere asignar.
   */
  private async assertActiveProductType(product_type_id: number): Promise<void> {
    const productType = await this.productTypesRepository.findById(product_type_id);
    if (!productType) {
      throw new AppError(404, "Product type not found");
    }
    if (productType.status !== "active") {
      throw new AppError(400, "Product type must be active");
    }
  }
}
EOF
```

**Controller**

```bash
: > src/features/business/products/products.controller.ts
cat >> src/features/business/products/products.controller.ts << 'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import { CreateProductDto, PatchProductDto, UpdateProductDto } from "./dto";
import { ProductsService } from "./products.service";

/**
 * Capa Controller del feature Products.
 * Solo HTTP: lee `req`, llama al service y arma la respuesta.
 * El manejo de errores se delega en `run()` (ver `BaseController`).
 */
export class ProductsController extends BaseController {
  public constructor(
    private readonly service: ProductsService = new ProductsService()
  ) {
    super();
  }

  // ================== READ ==================
  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const products = await this.service.getAll();
      res.status(200).json({ products });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const product = await this.service.getOne(this.paramId(req));
      res.status(200).json({ product });
    });
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const product = await this.service.create(req.body as CreateProductDto);
      res.status(201).json({ product });
    });
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const product = await this.service.updatePut(
        this.paramId(req),
        req.body as UpdateProductDto
      );
      res.status(200).json({ product });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const product = await this.service.updatePatch(
        this.paramId(req),
        req.body as PatchProductDto
      );
      res.status(200).json({ product });
    });
  }

  // ================== DELETE ==================
  /** Eliminación física. */
  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const id = this.paramId(req);
      await this.service.deletePhysical(id);
      res.status(200).json({ message: "Product permanently deleted", id });
    });
  }

  /** Eliminación lógica -> `status = inactive`. */
  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const product = await this.service.deleteLogical(this.paramId(req));
      res.status(200).json({
        message: "Product deactivated (logical delete)",
        product,
      });
    });
  }
}
EOF
```

```bash
: > src/features/business/products/products.routes.ts
cat >> src/features/business/products/products.routes.ts << 'EOF'
import { Application } from "express";
import { ProductsController } from "./products.controller";

export class ProductsRoutes {
  public productsController: ProductsController = new ProductsController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/productos")
      .get(this.productsController.getAll.bind(this.productsController));

    // getOne
    app
      .route("/api/productos/:id")
      .get(this.productsController.getOne.bind(this.productsController));

    // create
    app
      .route("/api/productos")
      .post(this.productsController.create.bind(this.productsController));

    // update (PUT / PATCH)
    app
      .route("/api/productos/:id")
      .put(this.productsController.updatePut.bind(this.productsController))
      .patch(this.productsController.updatePatch.bind(this.productsController));

    // delete físico
    app
      .route("/api/productos/:id")
      .delete(this.productsController.deletePhysical.bind(this.productsController));

    // delete lógico
    app
      .route("/api/productos/:id/deactivate")
      .patch(this.productsController.deleteLogical.bind(this.productsController));
  }
}
EOF
```

---

## 12.3 HTTP

```http
: > src/features/business/products/http/products.get.http
cat >> src/features/business/products/http/products.get.http << 'EOF'
### Feature Product — GET ALL / GET ONE
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

# @name getAllProducts
GET {{baseUrl}}/api/productos
Authorization: Bearer {{token}}

###

# @name getOneProduct
GET {{baseUrl}}/api/productos/{{id}}
Authorization: Bearer {{token}}

### 401 — sin token
GET {{baseUrl}}/api/productos
EOF
```

```http
: > src/features/business/products/http/products.create.http
cat >> src/features/business/products/http/products.create.http << 'EOF'
### Feature Product — CREATE
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

# @name createProduct
POST {{baseUrl}}/api/productos
Authorization: Bearer {{token}}
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

```http
: > src/features/business/products/http/products.update.http
cat >> src/features/business/products/http/products.update.http << 'EOF'
### Feature Product — UPDATE (PUT) / UPDATE (PATCH)
### Modalidad JWT + RBAC. `status` no se envía: el estado solo cambia con
### PATCH {{baseUrl}}/api/productos/{{id}}/deactivate (borrado lógico).
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

# @name updateProductPut
PUT {{baseUrl}}/api/productos/{{id}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Laptop Pro Max",
  "brand": "TechBrand",
  "price": 1499.99,
  "min_stock": 5,
  "quantity": 40,
  "product_type_id": 1
}

###

# @name updateProductPatch
PATCH {{baseUrl}}/api/productos/{{id}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "price": 1399.99,
  "quantity": 45
}
EOF
```

```http
: > src/features/business/products/http/products.delete.http
cat >> src/features/business/products/http/products.delete.http << 'EOF'
### Feature Product — DELETE físico / DELETE lógico (status = inactive)
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

# @name deleteProductPhysical
DELETE {{baseUrl}}/api/productos/{{id}}
Authorization: Bearer {{token}}

###

# @name deleteProductLogical
PATCH {{baseUrl}}/api/productos/{{id}}/deactivate
Authorization: Bearer {{token}}
EOF
```

---

## 12.4 Cableado

**PARCHE** — `src/routes/index.ts`:

- **Debajo de** import ProductTypesRoutes, **añadir** ProductsRoutes.
- **Dentro de** `Routes`, **añadir** `productsRoutes`.

**PARCHE** — `src/config/index.ts`:

- **Debajo de** import product-type.model, **añadir** `import "../features/business/products/product.model";`
- **Dentro de** `routes()`, **añadir** `this.routePrv.productsRoutes.routes(this.app);`

---

## 12.5 Relación ProductType ↔ Product (**obligatorio al cerrar la tabla Product**)

> Norma FK: `product_type_id` (tabla `product_types` → singular `product_type` + `_id`).
>
> Cuando una tabla nueva **se relaciona** con una ya existente, al final se agrega este paso: archivo de asociaciones + **PARCHE** en `config` para cargarlo (side-effect).

```bash
: > src/features/business/products/products.associations.ts
cat >> src/features/business/products/products.associations.ts << 'EOF'
import { Product } from "./product.model";
import { ProductType } from "../product-types/product-type.model";

Product.belongsTo(ProductType, { foreignKey: "product_type_id", as: "product_type" });
ProductType.hasMany(Product, { foreignKey: "product_type_id", as: "products" });
EOF
```

**PARCHE** — `src/config/index.ts` **ya existe**.

**Debajo de** los imports de modelos Product / ProductType (y **encima de** `import { Routes }`), **añadir**:

```ts
import "../features/business/products/products.associations";
```

Archivo **nuevo** (lab — alinea FK camelCase → snake_case antes del `sync`):

**PARCHE** — `src/config/index.ts`: **debajo de** `import { sequelize, getDatabaseInfo, testConnection } from "../database/db";`, **añadir**:

```text

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
: > src/features/business/products/products.seeder.ts
cat >> src/features/business/products/products.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { Product } from "./product.model";
import { ProductType } from "../product-types/product-type.model";

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
: > src/features/business/products/products.swagger.ts
cat >> src/features/business/products/products.swagger.ts << 'EOF'
import {
  bearerSecurity,
  forbiddenResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

/**
 * Documentación OpenAPI del feature Product.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: todos los endpoints son **JWT + RBAC** (`authenticate` + `authorize`).
 * La modalidad se declara por operación: aquí heredan el `security` global del documento.
 */

export const productsSwagger = {
  tags: [
    {
      name: "Productos",
      description: "CRUD de productos — **JWT + RBAC** (authenticate + authorize)",
    },
  ],
  paths: {
    "/api/productos": {
      get: {
        tags: ["Productos"],
        summary: "Listar productos activos",
        description: "JWT + RBAC — retorna productos con status=active",
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
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
        description: "JWT + RBAC — product_type_id debe existir y estar active",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductCreate" },
            },
          },
        },
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
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
          "400": { description: "id inválido (debe ser un entero positivo)" },
          "404": { description: "No encontrado" },
        },
      },
      put: {
        tags: ["Productos"],
        summary: "Actualizar producto (PUT — reemplazo)",
        description: "JWT + RBAC — product_type_id debe existir y estar active",
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
              schema: { $ref: "#/components/schemas/ProductUpdate" },
            },
          },
        },
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "200": { description: "Actualizado" },
          "400": { description: "id inválido (entero positivo) o tipo de producto inexistente/inactivo" },
          "404": { description: "No encontrado" },
        },
      },
      patch: {
        tags: ["Productos"],
        summary: "Actualizar producto (PATCH — parcial)",
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
              schema: { $ref: "#/components/schemas/ProductPatch" },
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
        tags: ["Productos"],
        summary: "Eliminar producto (físico)",
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
    "/api/productos/{id}/deactivate": {
      patch: {
        tags: ["Productos"],
        summary: "Eliminar producto (lógico)",
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
        },
      },
    },
  },
};
EOF
```

**PARCHE** counts / SeedersRunner / swagger registry: añadir `products` (default 15), `seedProducts`, `productsSwagger` (mismo patrón que ISS-06).

### Cierre del ISS

```bash
npm run dev
```

> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de continuar.

---

> **✅ GATE de la unidad ISS-07** — *este bloque no añade ningún criterio nuevo.*
>
> Las condiciones de cierre son exactamente las que define el ISS técnico de esta misma página:
>
> - 📋 **Criterios de aceptación** → [Criterios de aceptación](https://tecnogua.com/academic/site/backend2026/manual/08-ISS-07-product/#criterios-de-aceptacion-iss-07)
> - 🧩 **Cierre de la unidad** → [Cierre de la unidad](https://tecnogua.com/academic/site/backend2026/manual/08-ISS-07-product/#cierre-del-iss)
> - 🧠 **Autoevaluación** → [Evaluación del cuaderno](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-07-aprendizaje/#evaluacion)
>
> Con el GATE en verde queda habilitado **ISS-08 · Feature Sale + ProductSale**.
>
> **Navegación de la ruta:** **←** [ISS-07 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-07-aprendizaje/) · [↑ Ruta Express](https://tecnogua.com/academic/site/backend2026/) · **→** [ISS-08 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-08-aprendizaje/)
