> **🛠 Unidad ISS-08 · Feature Sale + ProductSale** — capa **🛠 CONSTRUIR**
>
> [🧠 Comprender este bloque →](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-08-aprendizaje/) · [📝 Evaluación](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-08-aprendizaje/#evaluacion) · [✅ GATE de la unidad](https://tecnogua.com/academic/site/backend2026/manual/09-ISS-08-sale-product-sale/#criterios-de-aceptacion-iss-08)
>
> | **Capa**         | **Página**                                                                                                                                 | **Para qué**                             |
> | :--------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------- |
> | 🧠 **Aprender**  | [Feature Sale + ProductSale](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-08-aprendizaje/)                               | comprender, explicar y relacionar        |
> | 🛠 **Construir** | esta página                                                                                                                                | ejecutar, programar y verificar          |
> | ✅ **GATE**       | [Condiciones de cierre](https://tecnogua.com/academic/site/backend2026/manual/09-ISS-08-sale-product-sale/#criterios-de-aceptacion-iss-08) | condición para pasar al bloque siguiente |
>
> **Esta es la guía ejecutable.** Sigue los pasos en orden. El cuerpo de abajo es el **ISS técnico verbatim**: comandos, rutas, versiones, PARCHEs, verificaciones y criterios, sin simplificar ni modernizar.

---

# Fase I: Business — ISS-08 — Feature Sale + feature ProductSale (ventas)

> **Contexto mínimo (autosuficiente).** Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que hay que saber antes de ejecutarlo. - **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript + Sequelize, **arquitectura por features**, Fase I **solo Business** (sin auth ni roles). - **Recorrido obligatorio de una petición:** `HTTP → Controller → Service → Repository → Model → Sequelize → BD`. Ninguna capa se salta a la siguiente. - **Diseño de datos** (columnas, tipos, FK `RESTRICT`, índices, transacciones): [`../bd-storelab.md`](https://tecnogua.com/academic/site/backend2026/bd-storelab/), **Fase I — Business**. - **Capas, convenciones y reglas transversales:** [`00-contexto.md`](https://tecnogua.com/academic/site/backend2026/manual/00-contexto/).
>
> | **Este ISS**        |                                                                                                                                                                                                                                 |
> | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | **Título**          | Feature Sale + feature ProductSale (ventas)                                                                                                                                                                                     |
> | **Feature / tabla** | `sales`, `product_sales` → `sales/`, `product-sales/`                                                                                                                                                                           |
> | **API**             | `/api/ventas`, `/api/detalle-ventas`                                                                                                                                                                                            |
> | **Depende de**      | [ISS-07 — Feature Product](https://tecnogua.com/academic/site/backend2026/manual/08-ISS-07-product/) · [ISS-03 — Feature Client (CRUD por capas)](https://tecnogua.com/academic/site/backend2026/manual/04-ISS-03-client-crud/) |
> | **Habilita**        | [Cierre del laboratorio](https://tecnogua.com/academic/site/backend2026/manual/10-cierre-business/)                                                                                                                             |

## Contenido de este ISS

- 13.1 Modelos Sale y feature ProductSale (`product-sales/`)
- 13.1b Associations ProductSale
- 13.2b DTO + Repository + Service + Controller ProductSale
- 13.3b Routes ProductSale (`/api/detalle-ventas`)
- 13.4b Seeder ProductSale
- 13.6b Swagger ProductSale
- 13.2 DTO + Repository + Service + Controller + routes
- 13.3 HTTP
- 13.4 Cableado
- 13.5 Relaciones Sale / ProductSale / Client / Product (**obligatorio**)
- 13.6 Seeder + Swagger Sale
- 13.7 Estado final de agregadores (reemplazar / alinear)

> **Orden de lectura de este ISS.** Primero se construye el **detalle** (`product-sales/`, sub-ítems con sufijo `b`: `13.1b`, `13.2b`, `13.3b`, `13.4b`, `13.6b`) y después la **cabecera** (`sales/`: `13.2 … 13.7`), porque la venta transaccional necesita antes la línea que mueve stock y recalcula totales. El número de sección se conserva igual que en el manual original; el sufijo `b` marca «segundo feature de este mismo ISS».

---

**Objetivo:** ventas con ítems N\:M vía feature propio `product-sales/` (tabla `product_sales`, API `/api/detalle-ventas`; detalle: `quantity`, `unit_price`, `line_total`); create transaccional de cabecera+ítems en `/api/ventas` con stock.
**Bloqueado por:** [ISS-07](https://tecnogua.com/academic/site/backend2026/manual/08-ISS-07-product/) (+ Client [ISS-03](https://tecnogua.com/academic/site/backend2026/manual/04-ISS-03-client-crud/)).
**API:** `/api/ventas` (cabecera) y `/api/detalle-ventas` (líneas) — **SIN AUTH**.

### Criterios de aceptación (ISS-08)

- [ ] Feature propio `src/features/business/product-sales/` (model, repository, service, controller, routes, seeder, swagger, http, associations)
- [ ] Rutas `/api/detalle-ventas` montadas en aggregators
- [ ] **13.1** Modelos `sale` + feature `product-sales/` (tabla `product_sales`)
- [ ] **13.2** DTOs (`dto/`) + Repository + Service + Controller de Sale y ProductSale en orden getAll, getOne, create, update PUT/PATCH, delete físico y lógico (el create de Sale sigue siendo transaccional: cliente activo, stock, totales)
- [ ] **13.3** Routes `/api/ventas` + `/api/detalle-ventas` + http/ en ese mismo orden
- [ ] **13.4** Seeders: `sales` (cabeceras) → `product_sales` (líneas); clave `product_sales` en SeedCounts; swagger registry
- [ ] **13.5** **Relaciones** Client↔Sale (`sales.associations`) y Sale↔ProductSale↔Product (`product-sales.associations`)
- [ ] **13.6** Swagger Sale + ProductSale
- [ ] **13.7** Estado final consolidado (config / routes / seeders / swagger)

```
mkdir -p src/features/business/sales/http
mkdir -p src/features/business/product-sales/http

```

---

## 13.1 Modelos Sale y feature ProductSale (`product-sales/`)

```
: > src/features/business/sales/sale.model.ts
cat >> src/features/business/sales/sale.model.ts << 'EOF'
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
      // Fail-safe: una fila insertada sin estado explícito NO queda visible en la API.
      // La vía de creación de la API siempre envía "active".
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

```
: > src/features/business/product-sales/product-sale.model.ts
cat >> src/features/business/product-sales/product-sale.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

/**
 * Detalle N:M Sale ↔ Product (tabla `product_sales`).
 * Opción A lab: feature propio `product-sales/`; nombre de tabla `product_sales`.
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
      // Fail-safe: una fila insertada sin estado explícito NO queda visible en la API.
      // La vía de creación de la API siempre envía "active".
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

```
: > src/features/business/product-sales/product-sales.associations.ts
cat >> src/features/business/product-sales/product-sales.associations.ts << 'EOF'
import { ProductSale } from "./product-sale.model";
import { Sale } from "../sales/sale.model";
import { Product } from "../products/product.model";

ProductSale.belongsTo(Sale, { foreignKey: "sale_id", as: "sale" });
ProductSale.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Sale.hasMany(ProductSale, { foreignKey: "sale_id", as: "items" });
Product.hasMany(ProductSale, { foreignKey: "product_id", as: "sale_items" });
EOF

```

## 13.2b DTO + Repository + Service + Controller ProductSale

Recordemos el flujo por capas del feature:

```
HTTP (routes) -> Controller -> Service -> Repository -> Model -> Sequelize -> BD

```

> **Orden canónico de locks (concurrencia).** Una línea de venta toca tres tablas, así que hay que bloquear las filas **siempre en el mismo orden**: `sales` -> `products` -> `product_sales`. Si cada flujo bloquea en un orden distinto, dos peticiones simultáneas se esperan en ciclo y InnoDB mata una con `Deadlock found when trying to get lock`.
>
> | **Problema**          | **Por qué pasa**                                                                                                                                             | **Cómo se evita**                                                    |
> | :-------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
> | Inversión de orden    | `create` bloquea `products` y luego inserta en `product_sales`; `update*`/`delete*` bloqueaban `product_sales` y luego `products`                            | Helper `lockLine()`: todos los flujos pasan por el mismo orden       |
> | *Upgrade* S->X por FK | El `INSERT`/`UPDATE` en `product_sales` deja un **S-lock** en la fila padre `sales` (chequeo de FK) y `recalcSaleTotals` pide luego un **X-lock** sobre ella | Bloquear `sales` con `FOR UPDATE` **antes** de tocar `product_sales` |
>
> `sale_id` y `product_id` son inmutables (el DTO de update solo expone `quantity` y `status`), por eso `lockLine()` los lee sin lock para saber qué filas padre bloquear primero.

**DTOs — carpeta `dto/` (un archivo por operación)**

```
mkdir -p src/features/business/product-sales/dto

```

**`dto/create-product-sale.dto.ts`**

```
: > src/features/business/product-sales/dto/create-product-sale.dto.ts
cat >> src/features/business/product-sales/dto/create-product-sale.dto.ts << 'EOF'
/** Datos de entrada de `POST /api/detalle-ventas`. */
export interface CreateProductSaleDto {
  sale_id: number;
  product_id: number;
  quantity: number;
  /** Opcional: por defecto `active`. Tras crearla, el estado sólo cambia con el borrado lógico. */
  status?: "active" | "inactive";
}
EOF

```

**`dto/update-product-sale.dto.ts`**

```
: > src/features/business/product-sales/dto/update-product-sale.dto.ts
cat >> src/features/business/product-sales/dto/update-product-sale.dto.ts << 'EOF'
/**
 * Datos de entrada de `PUT /api/detalle-ventas/:id` (reemplazo completo).
 *
 * `status` **no** está aquí a propósito: al desactivar una línea hay que
 * **restaurar stock** y recalcular la venta, y eso lo garantiza el borrado
 * lógico (`DELETE /api/detalle-ventas/:id/deactivate`). Permitir `status` por
 * PUT/PATCH dejaría el stock inconsistente.
 */
export interface UpdateProductSaleDto {
  quantity: number;
}
EOF

```

**`dto/patch-product-sale.dto.ts`**

```
: > src/features/business/product-sales/dto/patch-product-sale.dto.ts
cat >> src/features/business/product-sales/dto/patch-product-sale.dto.ts << 'EOF'
import { UpdateProductSaleDto } from "./update-product-sale.dto";

/** Datos de entrada de `PATCH /api/detalle-ventas/:id` (actualización parcial). */
export type PatchProductSaleDto = Partial<UpdateProductSaleDto>;
EOF

```

**`dto/product-sale-response.dto.ts`**

```
: > src/features/business/product-sales/dto/product-sale-response.dto.ts
cat >> src/features/business/product-sales/dto/product-sale-response.dto.ts << 'EOF'
import { ProductSale, ProductSaleI } from "../product-sale.model";

/**
 * Respuesta HTTP de una línea de venta. Lo usan `GET /api/detalle-ventas`,
 * `GET /api/detalle-ventas/:id` y el array `items` de una venta.
 *
 * Regla del DTO de respuesta: la API expone **sólo** lo que declara este tipo.
 * `ProductSale` no guarda campos internos, por eso el contrato coincide hoy con
 * el modelo. Si mañana aparece uno, la proyección se vuelve explícita aquí
 * (`Omit<ProductSaleI, "...">`) y el mapper lo omite.
 */
export type ProductSaleResponseDto = ProductSaleI;

/** Mapper modelo -> DTO de respuesta (objeto plano, sin métodos de Sequelize). */
export function toProductSaleResponse(productSale: ProductSale): ProductSaleResponseDto {
  return productSale.toJSON() as ProductSaleResponseDto;
}
EOF

```

**`dto/index.ts`**

```
: > src/features/business/product-sales/dto/index.ts
cat >> src/features/business/product-sales/dto/index.ts << 'EOF'
export * from "./create-product-sale.dto";
export * from "./update-product-sale.dto";
export * from "./patch-product-sale.dto";
export * from "./product-sale-response.dto";
EOF

```

- `product-sales.repository.ts` → acceso a `ProductSale` (líneas de venta).
- `product-sales.service.ts` → reglas de negocio: valida venta/producto activos, controla stock, restaura stock al borrar y **recalcula subtotal/total** de la venta; todo con `withTransaction`.
- `product-sales.controller.ts` → solo HTTP.

**Repository**

```
: > src/features/business/product-sales/product-sales.repository.ts
cat >> src/features/business/product-sales/product-sales.repository.ts << 'EOF'
import { CreationAttributes, Transaction } from "sequelize";
import { ProductSale, ProductSaleI } from "./product-sale.model";

/**
 * Capa Repository del feature ProductSales (tabla `product_sales`).
 *
 * Única responsable de hablar con Sequelize (el modelo `ProductSale`).
 */
export class ProductSalesRepository {
  /** Todas las líneas activas. */
  public async findAllActive(): Promise<ProductSale[]> {
    return ProductSale.findAll({ where: { status: "active" } });
  }

  /** Una línea por PK (o `null`). */
  public async findById(
    id: number,
    transaction?: Transaction
  ): Promise<ProductSale | null> {
    return ProductSale.findByPk(id, { transaction });
  }

  /** Una línea por PK bloqueando la fila (`SELECT ... FOR UPDATE`). */
  public async findByIdForUpdate(
    id: number,
    transaction: Transaction
  ): Promise<ProductSale | null> {
    return ProductSale.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
  }

  /** Líneas activas de una venta (para recalcular subtotal/total). */
  public async findActiveBySaleId(
    sale_id: number,
    transaction?: Transaction
  ): Promise<ProductSale[]> {
    return ProductSale.findAll({
      where: { sale_id, status: "active" },
      transaction,
    });
  }

  /** Inserta una línea. */
  public async create(
    data: CreationAttributes<ProductSale>,
    transaction?: Transaction
  ): Promise<ProductSale> {
    return ProductSale.create(data, { transaction });
  }

  /** Persiste cambios sobre una instancia existente. */
  public async update(
    productSale: ProductSale,
    data: Partial<ProductSaleI>,
    transaction?: Transaction
  ): Promise<ProductSale> {
    return productSale.update(data, { transaction });
  }

  /** Elimina físicamente una instancia. */
  public async delete(productSale: ProductSale, transaction?: Transaction): Promise<void> {
    await productSale.destroy({ transaction });
  }

  /** Elimina físicamente todas las líneas de una venta. */
  public async deleteBySaleId(sale_id: number, transaction?: Transaction): Promise<number> {
    return ProductSale.destroy({ where: { sale_id }, transaction });
  }

  /** Desactiva (borrado lógico) todas las líneas de una venta. */
  public async deactivateBySaleId(
    sale_id: number,
    transaction?: Transaction
  ): Promise<number> {
    const [affected] = await ProductSale.update(
      { status: "inactive" },
      { where: { sale_id }, transaction }
    );
    return affected;
  }
}
EOF

```

**Service**

```
: > src/features/business/product-sales/product-sales.service.ts
cat >> src/features/business/product-sales/product-sales.service.ts << 'EOF'
import { Transaction } from "sequelize";
import {
  CreateProductSaleDto,
  PatchProductSaleDto,
  ProductSaleResponseDto,
  UpdateProductSaleDto,
  toProductSaleResponse,
} from "./dto";
import { ProductSale } from "./product-sale.model";
import { ProductSalesRepository } from "./product-sales.repository";
import { SalesRepository } from "../sales/sales.repository";
import { ProductsRepository } from "../products/products.repository";
import { Product } from "../products/product.model";
import { AppError } from "../../../shared/errors/app-error";
import { withTransaction } from "../../../shared/database/with-transaction";

/**
 * Capa Service del feature ProductSales (tabla `product_sales`).
 *
 * Reglas de negocio de una línea de venta: valida venta y producto activos,
 * controla stock, mantiene el stock del producto y recalcula los totales de la
 * venta; todo dentro de una transacción.
 *
 * **Orden canónico de locks**: `sales` -> `products` -> `product_sales`. Todos
 * los flujos del feature lo respetan para evitar deadlocks de InnoDB.
 *
 * Entrada y salida se expresan con **DTOs** (carpeta `dto/`): el service nunca
 * devuelve la instancia de Sequelize, sino un objeto plano de respuesta.
 */
export class ProductSalesService {
  public constructor(
    private readonly repository: ProductSalesRepository = new ProductSalesRepository(),
    private readonly salesRepository: SalesRepository = new SalesRepository(),
    private readonly productsRepository: ProductsRepository = new ProductsRepository()
  ) {}

  // ================== READ ==================
  public async getAll(): Promise<ProductSaleResponseDto[]> {
    const productSales = await this.repository.findAllActive();
    return productSales.map((productSale) => toProductSaleResponse(productSale));
  }

  public async getOne(id: number): Promise<ProductSaleResponseDto> {
    return toProductSaleResponse(await this.findOrFail(id));
  }

  // ================== CREATE ==================
  /** Agrega una línea a una venta existente (ajusta stock y totales). */
  public async create(body: CreateProductSaleDto): Promise<ProductSaleResponseDto> {
    if (!body.sale_id || !body.product_id || !body.quantity || body.quantity < 1) {
      throw new AppError(400, "sale_id, product_id and quantity (>=1) are required");
    }

    return withTransaction(async (t) => {
      // Orden canónico de locks del feature: `sales` -> `products` -> `product_sales`.
      // Bloquear la venta primero evita el deadlock por *upgrade* S->X del FK:
      // el INSERT en `product_sales` dejaría un S-lock en la fila padre `sales`
      // y `recalcSaleTotals` pediría luego un X-lock sobre ella.
      const sale = await this.salesRepository.findByIdForUpdate(body.sale_id, t);
      if (!sale) {
        throw new AppError(404, "Sale not found");
      }
      if (sale.status !== "active") {
        throw new AppError(400, "Sale must be active");
      }

      const product = await this.productsRepository.findByIdForUpdate(body.product_id, t);
      if (!product) {
        throw new AppError(404, "Product not found");
      }
      if (product.status !== "active") {
        throw new AppError(400, "Product must be active");
      }
      if (product.quantity < body.quantity) {
        throw new AppError(
          400,
          `Insufficient stock (available: ${product.quantity}, requested: ${body.quantity})`
        );
      }

      const unit_price = Number(product.price);
      const line_total = unit_price * body.quantity;

      const productSale = await this.repository.create(
        {
          sale_id: body.sale_id,
          product_id: body.product_id,
          quantity: body.quantity,
          unit_price,
          line_total,
          status: body.status ?? "active",
        },
        t
      );

      await this.productsRepository.update(product, { quantity: product.quantity - body.quantity }, t);
      await this.recalcSaleTotals(body.sale_id, t);

      return toProductSaleResponse(productSale);
    });
  }

  // ================== UPDATE ==================
  public async updatePut(
    id: number,
    body: UpdateProductSaleDto
  ): Promise<ProductSaleResponseDto> {
    return withTransaction(async (t) => {
      const { productSale, product } = await this.lockLine(id, t);

      const newQty = Number(body.quantity);
      if (!newQty || newQty < 1) {
        throw new AppError(400, "quantity (>=1) is required");
      }
      if (!product) {
        throw new AppError(404, "Product not found");
      }

      await this.applyQuantityDelta(productSale, product, newQty, t);

      await this.repository.update(
        productSale,
        { quantity: newQty, line_total: Number(productSale.unit_price) * newQty },
        t
      );
      await this.recalcSaleTotals(productSale.sale_id, t);

      return toProductSaleResponse(productSale);
    });
  }

  public async updatePatch(
    id: number,
    body: PatchProductSaleDto
  ): Promise<ProductSaleResponseDto> {
    return withTransaction(async (t) => {
      const { productSale, product } = await this.lockLine(id, t);

      if (body.quantity !== undefined) {
        const newQty = Number(body.quantity);
        if (!newQty || newQty < 1) {
          throw new AppError(400, "quantity must be >= 1");
        }
        if (!product) {
          throw new AppError(404, "Product not found");
        }

        await this.applyQuantityDelta(productSale, product, newQty, t);
        await this.repository.update(
          productSale,
          { quantity: newQty, line_total: Number(productSale.unit_price) * newQty },
          t
        );
      }

      await this.recalcSaleTotals(productSale.sale_id, t);
      return toProductSaleResponse(productSale);
    });
  }

  // ================== DELETE ==================
  /** Eliminación física: restaura stock y recalcula totales de la venta. */
  public async deletePhysical(id: number): Promise<void> {
    await withTransaction(async (t) => {
      // `onlyActive: false` -> también permite purgar líneas ya desactivadas.
      const { productSale, product } = await this.lockLine(id, t, false);

      if (productSale.status === "active" && product) {
        await this.productsRepository.update(
          product,
          { quantity: product.quantity + productSale.quantity },
          t
        );
      }

      const sale_id = productSale.sale_id;
      await this.repository.delete(productSale, t);
      await this.recalcSaleTotals(sale_id, t);
    });
  }

  /** Eliminación lógica -> `status = inactive` (restaura stock y recalcula). */
  public async deleteLogical(id: number): Promise<ProductSaleResponseDto> {
    return withTransaction(async (t) => {
      const { productSale, product } = await this.lockLine(id, t);

      // `lockLine` ya garantiza que la línea está activa, así que se restaura stock.
      if (product) {
        await this.productsRepository.update(
          product,
          { quantity: product.quantity + productSale.quantity },
          t
        );
      }

      await this.repository.update(productSale, { status: "inactive" }, t);
      await this.recalcSaleTotals(productSale.sale_id, t);
      return toProductSaleResponse(productSale);
    });
  }

  // ================== HELPERS DE NEGOCIO ==================
  /**
   * Busca la línea por PK y falla con 404 si no existe.
   *
   * `onlyActive` (por defecto `true`) aplica la política de borrado lógico: una
   * línea `inactive` deja de ser visible para la API, igual que en `getAll`.
   */
  private async findOrFail(id: number, onlyActive = true): Promise<ProductSale> {
    const productSale = await this.repository.findById(id);
    if (!productSale || (onlyActive && productSale.status !== "active")) {
      throw new AppError(404, "Product sale not found");
    }
    return productSale;
  }

  /**
   * Bloquea la venta, el producto y la línea en el **orden canónico del feature**:
   * `sales` -> `products` -> `product_sales`.
   *
   * Bloquear en un orden distinto en cada flujo produce interbloqueos (deadlock
   * de InnoDB) cuando dos peticiones simultáneas tocan las mismas filas. Además,
   * bloquear `sales` antes de insertar/actualizar en `product_sales` evita el
   * *upgrade* S->X que provoca el FK cuando luego se recalcula el total de la venta.
   *
   * `sale_id` y `product_id` son inmutables (el DTO de update solo expone
   * `quantity`), por eso se leen sin lock para descubrirlos antes de bloquear
   * las filas padre. `onlyActive` decide si una línea desactivada cuenta como
   * inexistente (404) o no.
   */
  private async lockLine(
    id: number,
    t: Transaction,
    onlyActive = true
  ): Promise<{ productSale: ProductSale; product: Product | null }> {
    const snapshot = await this.repository.findById(id, t);
    if (!snapshot) {
      throw new AppError(404, "Product sale not found");
    }

    await this.salesRepository.findByIdForUpdate(snapshot.sale_id, t);

    const product = await this.productsRepository.findByIdForUpdate(snapshot.product_id, t);

    const productSale = await this.repository.findByIdForUpdate(id, t);
    if (!productSale || (onlyActive && productSale.status !== "active")) {
      throw new AppError(404, "Product sale not found");
    }

    return { productSale, product };
  }

  /**
   * Ajusta el stock del producto según la diferencia entre la cantidad nueva
   * y la anterior. Falla si no hay stock suficiente para un aumento.
   */
  private async applyQuantityDelta(
    productSale: ProductSale,
    product: Product,
    newQty: number,
    t: Transaction
  ): Promise<void> {
    const delta = newQty - productSale.quantity;
    if (delta > 0 && product.quantity < delta) {
      throw new AppError(
        400,
        `Insufficient stock (available: ${product.quantity}, requested_extra: ${delta})`
      );
    }

    if (delta !== 0) {
      await this.productsRepository.update(product, { quantity: product.quantity - delta }, t);
    }
  }

  /** Recalcula `subtotal` y `total` de la venta a partir de sus líneas activas. */
  private async recalcSaleTotals(sale_id: number, t: Transaction): Promise<void> {
    const items = await this.repository.findActiveBySaleId(sale_id, t);
    const subtotal = items.reduce((sum, row) => sum + Number(row.line_total), 0);

    const sale = await this.salesRepository.findById(sale_id, t);
    if (!sale) {
      return;
    }

    const total = subtotal + Number(sale.tax) - Number(sale.discounts);
    await this.salesRepository.update(sale, { subtotal, total }, t);
  }
}
EOF

```

**Controller**

```
: > src/features/business/product-sales/product-sales.controller.ts
cat >> src/features/business/product-sales/product-sales.controller.ts << 'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import {
  CreateProductSaleDto,
  PatchProductSaleDto,
  UpdateProductSaleDto,
} from "./dto";
import { ProductSalesService } from "./product-sales.service";

/**
 * Capa Controller del feature ProductSales.
 * Solo HTTP: lee `req`, llama al service y arma la respuesta.
 * El manejo de errores se delega en `run()` (ver `BaseController`).
 */
export class ProductSalesController extends BaseController {
  public constructor(
    private readonly service: ProductSalesService = new ProductSalesService()
  ) {
    super();
  }

  // ================== READ ==================
  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const product_sales = await this.service.getAll();
      res.status(200).json({ product_sales });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const product_sale = await this.service.getOne(this.paramId(req));
      res.status(200).json({ product_sale });
    });
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const product_sale = await this.service.create(
        req.body as CreateProductSaleDto
      );
      res.status(201).json({ product_sale });
    });
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const product_sale = await this.service.updatePut(
        this.paramId(req),
        req.body as UpdateProductSaleDto
      );
      res.status(200).json({ product_sale });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const product_sale = await this.service.updatePatch(
        this.paramId(req),
        req.body as PatchProductSaleDto
      );
      res.status(200).json({ product_sale });
    });
  }

  // ================== DELETE ==================
  /** Eliminación física (restaura stock). */
  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const id = this.paramId(req);
      await this.service.deletePhysical(id);
      res.status(200).json({ message: "Product sale permanently deleted", id });
    });
  }

  /** Eliminación lógica -> `status = inactive` (restaura stock). */
  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const product_sale = await this.service.deleteLogical(this.paramId(req));
      res.status(200).json({
        message: "Product sale deactivated (logical delete)",
        product_sale,
      });
    });
  }
}
EOF

```

## 13.3b Routes ProductSale (`/api/detalle-ventas`)

```
: > src/features/business/product-sales/product-sales.routes.ts
cat >> src/features/business/product-sales/product-sales.routes.ts << 'EOF'
import { Application } from "express";
import { ProductSalesController } from "./product-sales.controller";

export class ProductSalesRoutes {
  public productSalesController: ProductSalesController = new ProductSalesController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/detalle-ventas")
      .get(this.productSalesController.getAll.bind(this.productSalesController));

    // getOne
    app
      .route("/api/detalle-ventas/:id")
      .get(this.productSalesController.getOne.bind(this.productSalesController));

    // create
    app
      .route("/api/detalle-ventas")
      .post(this.productSalesController.create.bind(this.productSalesController));

    // update (PUT / PATCH)
    app
      .route("/api/detalle-ventas/:id")
      .put(this.productSalesController.updatePut.bind(this.productSalesController))
      .patch(this.productSalesController.updatePatch.bind(this.productSalesController));

    // delete físico
    app
      .route("/api/detalle-ventas/:id")
      .delete(this.productSalesController.deletePhysical.bind(this.productSalesController));

    // delete lógico
    app
      .route("/api/detalle-ventas/:id/deactivate")
      .patch(this.productSalesController.deleteLogical.bind(this.productSalesController));
  }
}
EOF

```

## 13.4b Seeder ProductSale

```
: > src/features/business/product-sales/product-sales.seeder.ts
cat >> src/features/business/product-sales/product-sales.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { sequelize } from "../../../database/db";
import { ProductSale } from "./product-sale.model";
import { Sale } from "../sales/sale.model";
import { Product } from "../products/product.model";

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

      // El seeder escribe directo en la BD (no pasa por el controller/service), así que
      // replica la regla de `recalculateSaleTotals`: subtotal de líneas activas y
      // total = subtotal + tax - discounts.
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

```
: > src/features/business/product-sales/product-sales.swagger.ts
cat >> src/features/business/product-sales/product-sales.swagger.ts << 'EOF'
import {
  bearerSecurity,
  forbiddenResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

/**
 * Documentación OpenAPI del feature ProductSale (tabla product_sales).
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: todos los endpoints son **JWT + RBAC** (`authenticate` + `authorize`).
 * La modalidad se declara por operación: aquí heredan el `security` global del documento.
 */

export const productSalesSwagger = {
  tags: [
    {
      name: "DetalleVentas",
      description:
        "CRUD de líneas Sale↔Product (tabla product_sales) — **JWT + RBAC** (authenticate + authorize)",
    },
  ],
  paths: {
    "/api/detalle-ventas": {
      get: {
        tags: ["DetalleVentas"],
        summary: "Listar detalles de venta activos",
        description: "JWT + RBAC — retorna product_sales con status=active",
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
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
          "JWT + RBAC — valida venta/producto activos y stock; crea product_sale, reduce quantity y recalcula totales de la venta",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductSaleCreate" },
            },
          },
        },
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
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
          "400": { description: "id inválido (debe ser un entero positivo)" },
          "404": { description: "No encontrado" },
        },
      },
      put: {
        tags: ["DetalleVentas"],
        summary: "Actualizar cantidad de línea (PUT)",
        description: "JWT + RBAC — ajusta stock y recalcula totales",
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
              schema: { $ref: "#/components/schemas/ProductSaleUpdate" },
            },
          },
        },
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "200": { description: "Actualizado" },
          "400": { description: "id inválido (entero positivo) o stock insuficiente" },
          "404": { description: "No encontrado" },
        },
      },
      patch: {
        tags: ["DetalleVentas"],
        summary: "Actualizar línea (PATCH — parcial)",
        description: "JWT + RBAC — quantity",
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
              schema: { $ref: "#/components/schemas/ProductSalePatch" },
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
        tags: ["DetalleVentas"],
        summary: "Eliminar línea (físico)",
        description: "JWT + RBAC — restaura stock y recalcula (también si tiene borrado lógico)",
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
    "/api/detalle-ventas/{id}/deactivate": {
      patch: {
        tags: ["DetalleVentas"],
        summary: "Eliminar línea (lógico)",
        description: "JWT + RBAC — status = inactive; restaura stock y recalcula totales",
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
        },
      },
      ProductSalePatch: {
        type: "object",
        properties: {
          quantity: { type: "integer", minimum: 1 },
        },
      },
    },
  },
};
EOF

```

### HTTP ProductSale get

```
: > src/features/business/product-sales/http/product-sales.get.http
cat >> src/features/business/product-sales/http/product-sales.get.http << 'EOF'
### Feature ProductSale — GET
### Modalidad JWT + RBAC (SELLER NO tiene concedido `GET /api/detalle-ventas`).
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

# @name getProductSales
GET {{baseUrl}}/api/detalle-ventas
Authorization: Bearer {{token}}

###

# @name getProductSale
GET {{baseUrl}}/api/detalle-ventas/1
Authorization: Bearer {{token}}

### 403 — el SELLER no tiene concedido este recurso
GET {{baseUrl}}/api/detalle-ventas
Authorization: Bearer {{sellerToken}}

### 401 — sin token
GET {{baseUrl}}/api/detalle-ventas
EOF

```

### HTTP ProductSale create

```
: > src/features/business/product-sales/http/product-sales.create.http
cat >> src/features/business/product-sales/http/product-sales.create.http << 'EOF'
### Feature ProductSale — CREATE
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

# @name createProductSale
POST {{baseUrl}}/api/detalle-ventas
Authorization: Bearer {{token}}
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

```
: > src/features/business/product-sales/http/product-sales.update.http
cat >> src/features/business/product-sales/http/product-sales.update.http << 'EOF'
### Feature ProductSale — UPDATE
### Modalidad JWT + RBAC. Al desactivar hay que restaurar stock, y eso lo hace
### PATCH {{baseUrl}}/api/detalle-ventas/1/deactivate (no un PUT/PATCH normal).
@baseUrl = http://localhost:4000

# @name loginAdmin
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin123!"
}

@token = {{loginAdmin.response.body.$.access_token}}

# @name updateProductSalePut
PUT {{baseUrl}}/api/detalle-ventas/1
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "quantity": 3
}

###

# @name updateProductSalePatch
PATCH {{baseUrl}}/api/detalle-ventas/1
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "quantity": 1
}
EOF

```

### HTTP ProductSale delete

##

```
: > src/features/business/product-sales/http/product-sales.delete.http
cat >> src/features/business/product-sales/http/product-sales.delete.http << 'EOF'
### Feature ProductSale — DELETE
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

# @name deleteProductSalePhysical
DELETE {{baseUrl}}/api/detalle-ventas/1
Authorization: Bearer {{token}}

###

# @name deleteProductSaleLogical
PATCH {{baseUrl}}/api/detalle-ventas/1/deactivate
Authorization: Bearer {{token}}
EOF

```

## 13.2 DTO + Repository + Service + Controller + routes

Recordemos el flujo por capas del feature:

```
HTTP (routes) -> Controller -> Service -> Repository -> Model -> Sequelize -> BD

```

**DTOs — carpeta `dto/` (un archivo por operación)**

```
mkdir -p src/features/business/sales/dto

```

**`dto/create-sale.dto.ts`**

```
: > src/features/business/sales/dto/create-sale.dto.ts
cat >> src/features/business/sales/dto/create-sale.dto.ts << 'EOF'
/** Una línea (producto + cantidad) dentro del `POST /api/ventas`. */
export interface SaleItemDto {
  product_id: number;
  quantity: number;
}

/** Datos de entrada de `POST /api/ventas` (cabecera + líneas, transaccional). */
export interface CreateSaleDto {
  client_id: number;
  tax?: number;
  discounts?: number;
  sale_date?: Date | string;
  /** Opcional: por defecto `active`. Tras crearla, el estado sólo cambia con el borrado lógico. */
  status?: "active" | "inactive";
  items: SaleItemDto[];
}
EOF

```

**`dto/update-sale.dto.ts`**

```
: > src/features/business/sales/dto/update-sale.dto.ts
cat >> src/features/business/sales/dto/update-sale.dto.ts << 'EOF'
/**
 * Datos de entrada de `PUT /api/ventas/:id` (reemplazo de la cabecera).
 *
 * Semántica de PUT: `tax` y `discounts` que no lleguen valen `0` (la cabecera
 * se reemplaza). En `PATCH` los omitidos se conservan. `subtotal` y `total` no
 * aparecen porque son derivados y los calcula el service.
 *
 * `status` **no** está aquí a propósito: la venta se desactiva (junto con sus
 * líneas) con `DELETE /api/ventas/:id/deactivate`.
 */
export interface UpdateSaleDto {
  /** Si no se envía, el service conserva el cliente actual. */
  client_id?: number;
  /** Si no se envía, se asume 0. */
  tax?: number;
  /** Si no se envía, se asume 0. */
  discounts?: number;
  sale_date?: Date | string;
}
EOF

```

**`dto/patch-sale.dto.ts`**

```
: > src/features/business/sales/dto/patch-sale.dto.ts
cat >> src/features/business/sales/dto/patch-sale.dto.ts << 'EOF'
import { UpdateSaleDto } from "./update-sale.dto";

/**
 * Datos de entrada de `PATCH /api/ventas/:id` (actualización parcial).
 *
 * Nota: `total` y `subtotal` **no** están aquí a propósito; son derivados y
 * los calcula el service a partir de las líneas.
 */
export type PatchSaleDto = Partial<UpdateSaleDto>;
EOF

```

**`dto/sale-response.dto.ts`**

```
: > src/features/business/sales/dto/sale-response.dto.ts
cat >> src/features/business/sales/dto/sale-response.dto.ts << 'EOF'
import { Sale, SaleI } from "../sale.model";
import { ProductSaleResponseDto } from "../../product-sales/dto";

/**
 * Respuesta HTTP de una venta. Lo usan `GET /api/ventas`,
 * `GET /api/ventas/:id` y la salida de update/delete lógico.
 *
 * `items` es opcional porque la venta puede leerse con o sin sus líneas
 * (el repository decide el `include`); cuando viaja, cada línea ya es un
 * `ProductSaleResponseDto`, nunca una instancia de Sequelize.
 */
export type SaleResponseDto = SaleI & { items?: ProductSaleResponseDto[] };

/** Salida de `POST /api/ventas`: la cabecera creada y sus líneas. */
export interface CreateSaleResultDto {
  sale: SaleResponseDto;
  items: ProductSaleResponseDto[];
}

/** Mapper modelo -> DTO de respuesta (objeto plano, sin métodos de Sequelize). */
export function toSaleResponse(sale: Sale): SaleResponseDto {
  return sale.toJSON() as SaleResponseDto;
}
EOF

```

**`dto/index.ts`**

```
: > src/features/business/sales/dto/index.ts
cat >> src/features/business/sales/dto/index.ts << 'EOF'
export * from "./create-sale.dto";
export * from "./update-sale.dto";
export * from "./patch-sale.dto";
export * from "./sale-response.dto";
EOF

```

- `sales.repository.ts` → acceso a `Sale` (con líneas incluidas para lecturas).
- `sales.service.ts` → reglas de negocio de la venta: al menos un ítem, cliente/productos activos, stock, subtotal/total y transacción.
- `sales.controller.ts` → solo HTTP.

**Repository**

```
: > src/features/business/sales/sales.repository.ts
cat >> src/features/business/sales/sales.repository.ts << 'EOF'
import { CreationAttributes, Transaction } from "sequelize";
import { Sale, SaleI } from "./sale.model";
import { ProductSale } from "../product-sales/product-sale.model";

/**
 * Capa Repository del feature Sales.
 *
 * Única responsable de hablar con Sequelize (el modelo `Sale`).
 * Incluye la hidratación de líneas (`ProductSale`) para las lecturas.
 */
export class SalesRepository {
  /** Ventas activas con sus líneas. */
  public async findAllActiveWithItems(): Promise<Sale[]> {
    return Sale.findAll({
      where: { status: "active" },
      include: [{ model: ProductSale, as: "items" }],
    });
  }

  /**
   * Una venta con sus líneas (o `null`), sin filtrar por `status`.
   *
   * El filtro de borrado lógico es una regla de negocio y vive en el service;
   * por eso este método no lo aplica y lo reutilizan tanto las lecturas
   * (que sí lo exigen) como la purga (`deletePhysical`).
   */
  public async findWithItemsById(id: number, transaction?: Transaction): Promise<Sale | null> {
    return Sale.findByPk(id, {
      include: [{ model: ProductSale, as: "items" }],
      transaction,
    });
  }

  /** Una venta por PK sin líneas (o `null`). */
  public async findById(id: number, transaction?: Transaction): Promise<Sale | null> {
    return Sale.findByPk(id, { transaction });
  }

  /** Una venta por PK bloqueando la fila (`SELECT ... FOR UPDATE`). */
  public async findByIdForUpdate(id: number, transaction: Transaction): Promise<Sale | null> {
    return Sale.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
  }

  /** Inserta la cabecera de una venta. */
  public async create(
    data: CreationAttributes<Sale>,
    transaction?: Transaction
  ): Promise<Sale> {
    return Sale.create(data, { transaction });
  }

  /** Persiste cambios sobre una instancia existente. */
  public async update(
    sale: Sale,
    data: Partial<SaleI>,
    transaction?: Transaction
  ): Promise<Sale> {
    return sale.update(data, { transaction });
  }

  /** Elimina físicamente una instancia. */
  public async delete(sale: Sale, transaction?: Transaction): Promise<void> {
    await sale.destroy({ transaction });
  }
}
EOF

```

**Service**

> `SalesService` orquesta **cuatro** repositories (`SalesRepository`, `ProductSalesRepository`, `ProductsRepository`, `ClientsRepository`) dentro de una sola transacción (`withTransaction`): es el ejemplo canónico de *unit of work* del lab.

```
: > src/features/business/sales/sales.service.ts
cat >> src/features/business/sales/sales.service.ts << 'EOF'
import { Transaction } from "sequelize";
import {
  CreateSaleDto,
  CreateSaleResultDto,
  PatchSaleDto,
  SaleResponseDto,
  UpdateSaleDto,
  toSaleResponse,
} from "./dto";
import { toProductSaleResponse } from "../product-sales/dto";
import { SalesRepository } from "./sales.repository";
import { ProductSalesRepository } from "../product-sales/product-sales.repository";
import { ProductsRepository } from "../products/products.repository";
import { ClientsRepository } from "../clients/clients.repository";
import { Product } from "../products/product.model";
import { ProductSale } from "../product-sales/product-sale.model";
import { Sale } from "./sale.model";
import { AppError } from "../../../shared/errors/app-error";
import { withTransaction } from "../../../shared/database/with-transaction";

/** Línea calculada en memoria antes de persistir la venta (tipo interno, no DTO). */
type SaleLine = {
  product_id: number;
  quantity: number;
  unit_price: number;
  line_total: number;
  product: Product;
};

/**
 * Capa Service del feature Sales.
 *
 * Reglas de negocio de una venta: exige al menos una línea, valida cliente y
 * productos activos, controla stock, calcula subtotal/total y garantiza
 * atomicidad con una transacción (unit of work).
 *
 * Persistencia delegada en los repositories de Sales, ProductSales, Products y
 * Clients. Entrada y salida se expresan con **DTOs** (carpeta `dto/`): nunca se
 * devuelve una instancia de Sequelize.
 */
export class SalesService {
  public constructor(
    private readonly repository: SalesRepository = new SalesRepository(),
    private readonly productSalesRepository: ProductSalesRepository = new ProductSalesRepository(),
    private readonly productsRepository: ProductsRepository = new ProductsRepository(),
    private readonly clientsRepository: ClientsRepository = new ClientsRepository()
  ) {}

  // ================== READ ==================
  public async getAll(): Promise<SaleResponseDto[]> {
    const sales = await this.repository.findAllActiveWithItems();
    return sales.map((sale) => toSaleResponse(sale));
  }

  public async getOne(id: number): Promise<SaleResponseDto> {
    return toSaleResponse(await this.findOrFail(id));
  }

  // ================== CREATE ==================
  /** Crea la venta completa (cabecera + líneas) en una sola transacción. */
  public async create(body: CreateSaleDto): Promise<CreateSaleResultDto> {
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      throw new AppError(400, "Sale requires at least one item");
    }

    return withTransaction(async (t) => {
      await this.assertActiveClient(body.client_id, t);

      const lineRows: SaleLine[] = [];
      let subtotal = 0;

      // Orden canónico de locks: se bloquean los productos de menor a mayor
      // `product_id`. Si dos ventas simultáneas traen los mismos productos en
      // distinto orden, bloquear en orden ascendente evita el deadlock.
      const orderedItems = [...body.items].sort(
        (a, b) => Number(a.product_id) - Number(b.product_id)
      );

      for (const item of orderedItems) {
        const product = await this.productsRepository.findByIdForUpdate(item.product_id, t);
        if (!product) {
          throw new AppError(404, `Product not found: ${item.product_id}`);
        }
        if (product.status !== "active") {
          throw new AppError(400, `Product must be active: ${item.product_id}`);
        }
        if (product.quantity < item.quantity) {
          throw new AppError(
            400,
            `Insufficient stock for product ${item.product_id} (available: ${product.quantity}, requested: ${item.quantity})`
          );
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

      const sale = await this.repository.create(
        {
          sale_date: body.sale_date ?? new Date(),
          subtotal,
          tax,
          discounts,
          total,
          client_id: body.client_id,
          status: body.status ?? "active",
        },
        t
      );

      const items: ProductSale[] = [];
      for (const line of lineRows) {
        const productSale = await this.productSalesRepository.create(
          {
            sale_id: sale.id,
            product_id: line.product_id,
            quantity: line.quantity,
            unit_price: line.unit_price,
            line_total: line.line_total,
            status: "active",
          },
          t
        );
        await this.productsRepository.update(
          line.product,
          { quantity: line.product.quantity - line.quantity },
          t
        );
        items.push(productSale);
      }

      return {
        sale: toSaleResponse(sale),
        items: items.map((item) => toProductSaleResponse(item)),
      };
    });
  }

  // ================== UPDATE ==================
  /** PUT: reemplaza la cabecera (las líneas se gestionan en ProductSales). */
  public async updatePut(id: number, body: UpdateSaleDto): Promise<SaleResponseDto> {
    const sale = await this.findOrFail(id);

    if (body.client_id !== undefined) {
      await this.assertActiveClient(body.client_id);
    }

    const tax = Number(body.tax ?? 0);
    const discounts = Number(body.discounts ?? 0);
    const total = Number(sale.subtotal) + tax - discounts;

    await this.repository.update(sale, {
      sale_date: body.sale_date ?? sale.sale_date,
      tax,
      discounts,
      total,
      client_id: body.client_id ?? sale.client_id,
    });

    return toSaleResponse(sale);
  }

  /** PATCH: cambia sólo lo que llega (lo omitido se conserva). */
  public async updatePatch(id: number, body: PatchSaleDto): Promise<SaleResponseDto> {
    const sale = await this.findOrFail(id);

    if (body.client_id !== undefined) {
      await this.assertActiveClient(body.client_id);
    }

    const tax = body.tax !== undefined ? Number(body.tax) : Number(sale.tax);
    const discounts =
      body.discounts !== undefined ? Number(body.discounts) : Number(sale.discounts);
    const needsRecalc = body.tax !== undefined || body.discounts !== undefined;

    // Sólo se aplican los campos del DTO: `total` y `subtotal` siempre los
    // calcula el service, nunca llegan desde el cliente.
    await this.repository.update(sale, {
      sale_date: body.sale_date ?? sale.sale_date,
      client_id: body.client_id ?? sale.client_id,
      tax,
      discounts,
      total: needsRecalc ? Number(sale.subtotal) + tax - discounts : Number(sale.total),
    });

    return toSaleResponse(sale);
  }

  // ================== DELETE ==================
  /** Eliminación física: restaura stock de las líneas activas, líneas y venta. */
  public async deletePhysical(id: number): Promise<void> {
    await withTransaction(async (t) => {
      // Sin filtro de `status`: purga también ventas con borrado lógico.
      // Bloquear la fila de la venta primero respeta el orden canónico del
      // feature: `sales` -> `products` -> `product_sales`.
      const sale = await this.repository.findByIdForUpdate(id, t);
      if (!sale) {
        throw new AppError(404, "Sale not found");
      }

      await this.releaseStockOfActiveLines(id, t);
      await this.productSalesRepository.deleteBySaleId(id, t);
      await this.repository.delete(sale, t);
    });
  }

  /** Eliminación lógica -> `status = inactive` (venta + líneas, restaurando stock). */
  public async deleteLogical(id: number): Promise<SaleResponseDto> {
    return withTransaction(async (t) => {
      const sale = await this.findOrFail(id, t);

      await this.repository.findByIdForUpdate(id, t);
      await this.releaseStockOfActiveLines(id, t);

      await this.repository.update(sale, { status: "inactive" }, t);
      await this.productSalesRepository.deactivateBySaleId(id, t);

      // Relectura para que la respuesta muestre las líneas ya desactivadas.
      const updated = await this.repository.findWithItemsById(id, t);
      return toSaleResponse(updated ?? sale);
    });
  }

  // ================== HELPERS DE NEGOCIO ==================
  /**
   * Devuelve al stock el `quantity` de cada **línea activa** de la venta.
   *
   * Borrar o desactivar una venta equivale a borrar/desactivar sus líneas, así
   * que el stock se restaura igual que en `ProductSalesService`. Las líneas ya
   * inactivas no se tocan: su stock volvió cuando se desactivaron.
   *
   * Los productos se bloquean en orden ascendente de `product_id`, el mismo
   * orden que usa `create`, para que dos transacciones que tocan los mismos
   * productos no se interbloqueen. Es seguro leer las líneas antes de bloquear
   * los productos porque ya se tiene el X-lock de la fila `sales`, y todos los
   * flujos que modifican líneas bloquean antes esa fila.
   */
  private async releaseStockOfActiveLines(sale_id: number, t: Transaction): Promise<void> {
    const lines = await this.productSalesRepository.findActiveBySaleId(sale_id, t);
    const ordered = [...lines].sort((a, b) => a.product_id - b.product_id);

    for (const line of ordered) {
      const product = await this.productsRepository.findByIdForUpdate(line.product_id, t);
      if (!product) {
        continue;
      }
      await this.productsRepository.update(
        product,
        { quantity: product.quantity + line.quantity },
        t
      );
    }
  }

  /**
   * Busca la venta con sus líneas y falla con 404 si no existe o si tiene
   * borrado lógico.
   *
   * Es el único punto donde se aplica la **política de borrado lógico** del
   * feature, así que `getOne`, `updatePut`, `updatePatch` y `deleteLogical`
   * quedan automáticamente consistentes con el filtro de `getAll`.
   *
   * Dos diferencias con los demás features (deliberadas):
   *  - la venta se lee **con sus líneas** (`findWithItemsById`), así que el
   *    segundo parámetro es la `transaction`, no el flag `onlyActive`;
   *  - `deletePhysical` no lo usa: necesita un `SELECT ... FOR UPDATE` propio,
   *    porque debe poder purgar también ventas con borrado lógico.
   */
  private async findOrFail(id: number, transaction?: Transaction): Promise<Sale> {
    const sale = await this.repository.findWithItemsById(id, transaction);
    if (!sale || sale.status !== "active") {
      throw new AppError(404, "Sale not found");
    }
    return sale;
  }

  /** Regla: el cliente de la venta debe existir y estar activo. */
  private async assertActiveClient(
    client_id: number,
    transaction?: Transaction
  ): Promise<void> {
    const client = await this.clientsRepository.findById(client_id, transaction);
    if (!client) {
      throw new AppError(404, "Client not found");
    }
    if (client.status !== "active") {
      throw new AppError(400, "Client must be active");
    }
  }
}
EOF

```

**Controller**

```
: > src/features/business/sales/sales.controller.ts
cat >> src/features/business/sales/sales.controller.ts << 'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import { CreateSaleDto, PatchSaleDto, UpdateSaleDto } from "./dto";
import { SalesService } from "./sales.service";

/**
 * Capa Controller del feature Sales.
 * Solo HTTP: lee `req`, llama al service y arma la respuesta.
 * El manejo de errores se delega en `run()` (ver `BaseController`).
 */
export class SalesController extends BaseController {
  public constructor(private readonly service: SalesService = new SalesService()) {
    super();
  }

  // ================== READ ==================
  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const sales = await this.service.getAll();
      res.status(200).json({ sales });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const sale = await this.service.getOne(this.paramId(req));
      res.status(200).json({ sale });
    });
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const { sale, items } = await this.service.create(req.body as CreateSaleDto);
      res.status(201).json({ sale, items });
    });
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const sale = await this.service.updatePut(
        this.paramId(req),
        req.body as UpdateSaleDto
      );
      res.status(200).json({ sale });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const sale = await this.service.updatePatch(
        this.paramId(req),
        req.body as PatchSaleDto
      );
      res.status(200).json({ sale });
    });
  }

  // ================== DELETE ==================
  /** Eliminación física (venta + líneas). */
  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const id = this.paramId(req);
      await this.service.deletePhysical(id);
      res.status(200).json({ message: "Sale permanently deleted", id });
    });
  }

  /** Eliminación lógica -> `status = inactive` (venta + líneas). */
  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const sale = await this.service.deleteLogical(this.paramId(req));
      res.status(200).json({
        message: "Sale deactivated (logical delete)",
        sale,
      });
    });
  }
}
EOF

```

```
: > src/features/business/sales/sales.routes.ts
cat >> src/features/business/sales/sales.routes.ts << 'EOF'
import { Application } from "express";
import { SalesController } from "./sales.controller";

export class SalesRoutes {
  public salesController: SalesController = new SalesController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/ventas")
      .get(this.salesController.getAll.bind(this.salesController));

    // getOne
    app
      .route("/api/ventas/:id")
      .get(this.salesController.getOne.bind(this.salesController));

    // create
    app
      .route("/api/ventas")
      .post(this.salesController.create.bind(this.salesController));

    // update (PUT / PATCH)
    app
      .route("/api/ventas/:id")
      .put(this.salesController.updatePut.bind(this.salesController))
      .patch(this.salesController.updatePatch.bind(this.salesController));

    // delete físico
    app
      .route("/api/ventas/:id")
      .delete(this.salesController.deletePhysical.bind(this.salesController));

    // delete lógico
    app
      .route("/api/ventas/:id/deactivate")
      .patch(this.salesController.deleteLogical.bind(this.salesController));
  }
}
EOF

```

---

## 13.3 HTTP

```
: > src/features/business/sales/http/sales.get.http
cat >> src/features/business/sales/http/sales.get.http << 'EOF'
### Feature Sale — GET ALL / GET ONE
### Modalidad JWT + RBAC (SELLER tiene concedidas ambas lecturas de ventas).
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

# @name getAllSales
GET {{baseUrl}}/api/ventas
Authorization: Bearer {{token}}

###

# @name getOneSale
GET {{baseUrl}}/api/ventas/{{id}}
Authorization: Bearer {{token}}

### 200 — SELLER también tiene concedido `GET /api/ventas`
GET {{baseUrl}}/api/ventas
Authorization: Bearer {{sellerToken}}

### 401 — sin token
GET {{baseUrl}}/api/ventas
EOF

```

```
: > src/features/business/sales/http/sales.create.http
cat >> src/features/business/sales/http/sales.create.http << 'EOF'
### Feature Sale — CREATE
### Modalidad JWT + RBAC. `POST /api/ventas` la tiene concedida SELLER y ADMIN.
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

### CREATE — admin
# @name createSale
POST {{baseUrl}}/api/ventas
Authorization: Bearer {{token}}
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

### CREATE — seller (también tiene la concesión) -> 201
POST {{baseUrl}}/api/ventas
Authorization: Bearer {{sellerToken}}
Content-Type: application/json

{
  "client_id": 1,
  "tax": 19,
  "discounts": 0,
  "items": [
    { "product_id": 1, "quantity": 1 }
  ]
}
EOF

```

```
: > src/features/business/sales/http/sales.update.http
cat >> src/features/business/sales/http/sales.update.http << 'EOF'
### Feature Sale — UPDATE (PUT) / UPDATE (PATCH) — solo cabecera
### Modalidad JWT + RBAC. `status` no se envía: la venta se desactiva (con sus
### líneas) con PATCH {{baseUrl}}/api/ventas/{{id}}/deactivate.
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

# @name updateSalePut
PUT {{baseUrl}}/api/ventas/{{id}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "client_id": 1,
  "tax": 20,
  "discounts": 10,
  "sale_date": "2026-09-16T12:00:00.000Z"
}

###

# @name updateSalePatch
PATCH {{baseUrl}}/api/ventas/{{id}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "tax": 15,
  "discounts": 0
}
EOF

```

```
: > src/features/business/sales/http/sales.delete.http
cat >> src/features/business/sales/http/sales.delete.http << 'EOF'
### Feature Sale — DELETE físico / DELETE lógico (status = inactive)
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

# @name deleteSalePhysical
DELETE {{baseUrl}}/api/ventas/{{id}}
Authorization: Bearer {{token}}

###

# @name deleteSaleLogical
PATCH {{baseUrl}}/api/ventas/{{id}}/deactivate
Authorization: Bearer {{token}}
EOF

```

---

## 13.4 Cableado

**PARCHE** — `src/routes/index.ts`: import + `salesRoutes`.

**PARCHE** — `src/config/index.ts`:

- **Debajo de** import product.model, **añadir**:

```
import "../features/business/sales/sale.model";
import "../features/business/product-sales/product-sale.model";

```

- **Dentro de** `routes()`, **añadir** `this.routePrv.salesRoutes.routes(this.app);`

---

## 13.5 Relaciones Sale / ProductSale / Client / Product (**obligatorio**)

> Norma FK: `client_id`, `sale_id`, `product_id` (singular de la tabla referenciada + `_id`).

```
: > src/features/business/sales/sales.associations.ts
cat >> src/features/business/sales/sales.associations.ts << 'EOF'
import { Sale } from "./sale.model";
import { Client } from "../clients/client.model";

Sale.belongsTo(Client, { foreignKey: "client_id", as: "client" });
Client.hasMany(Sale, { foreignKey: "client_id", as: "sales" });
EOF

```

**PARCHE** — `src/config/index.ts` **ya existe**.

**Debajo de** `import "../features/business/products/products.associations";`, **añadir**:

```
import "../features/business/sales/sales.associations";

```

Relaciones registradas:

- `Sale.belongsTo(Client)` / `Client.hasMany(Sale)` — en `sales.associations.ts`
- `ProductSale.belongsTo(Sale|Product)` / `Sale.hasMany(items)` / `Product.hasMany(sale_items)` — en `product-sales.associations.ts`

**PARCHE** — también importar side-effect:

```
import "../features/business/product-sales/product-sales.associations";

```

### Verificación venta

```
curl -s -X POST http://localhost:4000/api/ventas -H 'Content-Type: application/json' \
  -d '{"client_id":1,"tax":0,"discounts":0,"items":[{"product_id":1,"quantity":2}],"status":"active"}'
curl -s http://localhost:4000/api/ventas
curl -s http://localhost:4000/api/detalle-ventas

```

---

## 13.6 Seeder + Swagger Sale

```
: > src/features/business/sales/sales.seeder.ts
cat >> src/features/business/sales/sales.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { Sale } from "./sale.model";
import { Client } from "../clients/client.model";

/**
 * Seeder del feature Sale (cabeceras).
 * Las líneas `product_sales` las inserta `product-sales.seeder.ts`.
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
      // Misma regla que `recalculateSaleTotals` (product-sales.service) para una
      // venta sin ítems (`subtotal = 0`). El seeder de líneas la recalcula luego.
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

```
: > src/features/business/sales/sales.swagger.ts
cat >> src/features/business/sales/sales.swagger.ts << 'EOF'
import {
  bearerSecurity,
  forbiddenResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

/**
 * Documentación OpenAPI del feature Sale.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: todos los endpoints son **JWT + RBAC** (`authenticate` + `authorize`).
 * La modalidad se declara por operación: aquí heredan el `security` global del documento.
 */

export const salesSwagger = {
  tags: [
    {
      name: "Ventas",
      description: "CRUD de ventas — **JWT + RBAC** (authenticate + authorize)",
    },
  ],
  paths: {
    "/api/ventas": {
      get: {
        tags: ["Ventas"],
        summary: "Listar ventas activas",
        description: "JWT + RBAC — retorna ventas con status=active e items (ProductSale)",
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
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
          "JWT + RBAC — valida cliente/productos activos y stock; crea Sale + ProductSale y reduce quantity",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SaleCreate" },
            },
          },
        },
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
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
        description: "JWT + RBAC — incluye items; 404 si no existe o tiene borrado lógico",
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
          "400": { description: "id inválido (debe ser un entero positivo)" },
          "404": { description: "No encontrado" },
        },
      },
      put: {
        tags: ["Ventas"],
        summary: "Actualizar cabecera de venta (PUT)",
        description:
          "JWT + RBAC — solo tax, discounts, client_id, sale_date, status; recalcula total; no reescribe items",
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
              schema: { $ref: "#/components/schemas/SaleUpdate" },
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
        tags: ["Ventas"],
        summary: "Actualizar cabecera de venta (PATCH)",
        description: "JWT + RBAC — parcial; recalcula total si cambian tax/discounts",
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
              schema: { $ref: "#/components/schemas/SalePatch" },
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
        tags: ["Ventas"],
        summary: "Eliminar venta (físico)",
        description: "JWT + RBAC — restaura stock de las líneas activas, borra product_sales y luego la venta (transacción; también si tiene borrado lógico)",
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
    "/api/ventas/{id}/deactivate": {
      patch: {
        tags: ["Ventas"],
        summary: "Eliminar venta (lógico)",
        description: "JWT + RBAC — status = inactive en venta e items, restaurando stock",
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
      // ProductSale schema vive en product-sales.swagger.ts (feature propio)
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
        },
      },
      SalePatch: {
        type: "object",
        properties: {
          sale_date: { type: "string", format: "date-time" },
          tax: { type: "number" },
          discounts: { type: "number" },
          client_id: { type: "integer" },
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

```
: > src/routes/index.ts
cat >> src/routes/index.ts << 'EOF'
import { ClientsRoutes } from "../features/business/clients/clients.routes";
import { ProductTypesRoutes } from "../features/business/product-types/product-types.routes";
import { ProductsRoutes } from "../features/business/products/products.routes";
import { SalesRoutes } from "../features/business/sales/sales.routes";
import { ProductSalesRoutes } from "../features/business/product-sales/product-sales.routes";

export class Routes {
  public clientsRoutes: ClientsRoutes = new ClientsRoutes();
  public productTypesRoutes: ProductTypesRoutes = new ProductTypesRoutes();
  public productsRoutes: ProductsRoutes = new ProductsRoutes();
  public salesRoutes: SalesRoutes = new SalesRoutes();
  public productSalesRoutes: ProductSalesRoutes = new ProductSalesRoutes();
}
EOF

```

### `src/database/seeders/counts.ts`

```
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

```
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
import { seedClients } from "../../features/business/clients/clients.seeder";
import { seedProductTypes } from "../../features/business/product-types/product-types.seeder";
import { seedProducts } from "../../features/business/products/products.seeder";
import { seedSales } from "../../features/business/sales/sales.seeder";
import { seedProductSales } from "../../features/business/product-sales/product-sales.seeder";
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
 * Ubicación de cada seeder: `src/features/.../<plural>.seeder.ts`
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

```
: > src/swagger/index.ts
cat >> src/swagger/index.ts << 'EOF'
import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import { clientsSwagger } from "../features/business/clients/clients.swagger";
import { productTypesSwagger } from "../features/business/product-types/product-types.swagger";
import { productsSwagger } from "../features/business/products/products.swagger";
import { salesSwagger } from "../features/business/sales/sales.swagger";
import { productSalesSwagger } from "../features/business/product-sales/product-sales.swagger";

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

```
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

**PARCHE** — `src/config/index.ts`: al cerrar ISS-08 el bloque de imports de modelos/asociaciones y `routes()` debe quedar como en el repo (models client→product-type→product→sale→product-sale; associations product + sale + product-sale; `routes()` registra las **5** features business).

### Verificación ISS-08 / business completo

```
npx tsc --noEmit
npm run db:seed
curl -s http://localhost:4000/api/tipos-producto | head
curl -s http://localhost:4000/api/productos | head
curl -s http://localhost:4000/api/ventas | head
curl -s http://localhost:4000/api/detalle-ventas | head

```

### Cierre del ISS

```
npm run dev

```

> Swagger: `http://localhost:4000/api/docs`. El servidor debe arrancar sin error.

---

> **✅ GATE de la unidad ISS-08** — *este bloque no añade ningún criterio nuevo.*
>
> Las condiciones de cierre son exactamente las que define el ISS técnico de esta misma página:
>
> - 📋 **Criterios de aceptación** → [Criterios de aceptación](https://tecnogua.com/academic/site/backend2026/manual/09-ISS-08-sale-product-sale/#criterios-de-aceptacion-iss-08)
> - 🧩 **Cierre de la unidad** → [Cierre de la unidad](https://tecnogua.com/academic/site/backend2026/manual/09-ISS-08-sale-product-sale/#cierre-del-iss)
> - 🧠 **Autoevaluación** → [Evaluación del cuaderno](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-08-aprendizaje/#evaluacion)
>
> Con el GATE en verde queda habilitado **CIERRE-BUSINESS · Cierre Fase I — Business (sin Auth)**.
>
> **Navegación de la ruta:** **←** [ISS-08 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-08-aprendizaje/) · [↑ Ruta Express](https://tecnogua.com/academic/site/backend2026/) · **→** [CIERRE-BUSINESS · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/CIERRE-BUSINESS-aprendizaje/)