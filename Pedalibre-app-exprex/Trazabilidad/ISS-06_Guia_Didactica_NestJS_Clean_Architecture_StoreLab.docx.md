**ISS-06 · Sales y stock**

Guía didáctica detallada: caso transaccional, servicio de dominio y bloqueo

| Documento basado en backend-manual.md · líneas 2542–3267 |
| :---: |

StoreLab · NestJS 12 · Sequelize · Clean Architecture por feature

| ObjetivoEntender por qué una venta no es un simple INSERT: valida cliente y productos, aplica reduceStock, calcula totales y persiste venta \+ ítems \+ stock dentro de una transacción atómica. |
| :---- |

# **Mapa mental de capas**

| Capa | Carpeta | Responsabilidad | Regla |
| :---- | :---- | :---- | :---- |
| **🟢 domain** | domain/ | Entidades, puertos, excepciones y reglas | No conoce Nest, HTTP ni Sequelize |
| **🔵 application** | application/ | DTOs, mappers, casos de uso | Depende del dominio y orquesta |
| **🟠 infrastructure** | infrastructure/persistence/ | Modelos, repositorios, SQL/ORM | Implementa puertos del dominio |
| **🟣 presentation** | presentation/http/ | Controllers y borde HTTP | Delega; no ejecuta SQL |

| REGLA DE LA FLECHApresentation → application → domain   |   infrastructure → domain |
| :---- |

# **1\. Qué introduce ISS-06**

| NOVEDADESSale \+ ProductSale \+ SaleCalculator → CreateSaleUseCase → SaleRepository.transaction → locks \+ INSERT sale \+ INSERT items \+ UPDATE stock |
| :---- |

Este ISS agrega domain/services, dos entidades de dominio, un puerto de venta y una implementación de infraestructura que coordina varias tablas de forma atómica.

# **2\. Domain: Sale, ProductSale y SaleCalculator**

**product-sale.entity.ts**

| export class ProductSale {  readonly id: number | null;  readonly saleId: number | null;  readonly productId: number;  readonly quantity: number;  readonly unitPrice: number;  readonly total: number;} |
| :---- |

**sale.entity.ts**

| export class Sale {  readonly id: number | null;  readonly saleDate: Date;  readonly subtotal: number;  readonly tax: number;  readonly discounts: number;  readonly total: number;  readonly status: SaleStatus;  readonly clientId: number;  readonly items: ProductSale\[\];} |
| :---- |
| **AGREGADOSale contiene la cabecera de negocio y una colección de ProductSale como detalle** |

**sale-calculator.ts**

| export class SaleCalculator {  subtotal(items: SaleItemLike\[\]): number {    return items.reduce((sum, i) \=\> sum \+ i.quantity \* i.unitPrice, 0);  }  total(subtotal: number, tax: number, discounts: number): number {    return subtotal \+ tax \- discounts;  }} |
| :---- |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **SaleCalculator** | Regla de cálculo pura. | No conoce Nest, Sequelize ni tablas. |
| **subtotal** | Suma quantity \* unitPrice. | Puede probarse sin HTTP ni BD. |
| **total** | Aplica tax y discounts. | La fórmula vive en dominio, no en controller. |

**sale.repository.ts**

| export interface ISaleRepository {  create(sale: Sale): Promise\<Sale\>;  findById(id: number): Promise\<Sale | null\>;} |
| :---- |
| **Puerto mínimo**El manual define solo create y findById. No define list/update/delete para ventas. |

# **3\. DTO de venta: validación anidada**

**create-sale.dto.ts (resumen)**

| export class SaleItemDto {  productId\!: number;  quantity\!: number;  unitPrice?: number;}export class CreateSaleDto {  clientId\!: number;  items\!: SaleItemDto\[\];  tax?: number;  discounts?: number;} |
| :---- |
| **VALIDACIÓNJSON → CreateSaleDto → @ValidateNested(each) \+ @Type(() \=\> SaleItemDto) → items tipados** |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **@ArrayMinSize(1)** | Exige al menos un item. | Complementa EmptySaleException. |
| **@ValidateNested** | Valida cada item internamente. | No basta con que items sea un arreglo. |
| **@Type** | Permite que class-transformer construya SaleItemDto. | Hace efectiva la validación anidada. |
| **unitPrice opcional** | Permite usar el precio actual del producto. | El use-case decide el precio efectivo. |

# **4\. CreateSaleUseCase: orquestación de varias features**

**create-sale.use-case.ts**

| async execute(dto: CreateSaleDto): Promise\<Sale\> {  const client \= await this.clientRepo.findById(dto.clientId);  if (\!client) throw new ClientNotFoundException(dto.clientId);  if (\!dto.items || dto.items.length \=== 0\) throw new EmptySaleException();  const products \= new Map\<number, Product\>();  for (const it of dto.items) {    const product \= await this.productRepo.findById(it.productId);    if (\!product) throw new ProductNotFoundException(it.productId);    products.set(it.productId, product);  }  const items \= dto.items.map((it) \=\> {    const product \= products.get(it.productId)\!;    const unitPrice \= it.unitPrice ?? product.price;    product.reduceStock(it.quantity);    return new ProductSale({      productId: it.productId,      quantity: it.quantity,      unitPrice,      total: it.quantity \* unitPrice,    });  });  const subtotal \= this.calculator.subtotal(items);  const tax \= dto.tax ?? 0;  const discounts \= dto.discounts ?? 0;  const total \= this.calculator.total(subtotal, tax, discounts);  return this.saleRepo.create(new Sale({    clientId: dto.clientId, subtotal, tax, discounts, total,    status: 'completed', items,  }));} |
| :---- |
| **ORQUESTACIÓNcliente existe → productos existen → reduceStock en dominio → armar ProductSale → calcular → armar Sale → saleRepo.create** |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **CLIENT\_REPOSITORY** | Valida cliente usando puerto exportado por clients. | Sales no consulta ClientModel. |
| **PRODUCT\_REPOSITORY** | Carga productos como entidades. | Puede invocar reduceStock(). |
| **Map** | Evita repetir consultas al construir items. | Organiza productos por id. |
| **unitPrice ?? product.price** | El precio enviado puede sobrescribir el actual. | Es una decisión del manual. |
| **saleRepo.create** | Delega la atomicidad a infrastructure. | El use-case no controla transacciones SQL. |

# **5\. Infrastructure: transacción y locks**

**sale.repository.ts (núcleo transaccional)**

| return this.sequelize.transaction(async (t) \=\> {  const product \= await productRepo.findByPk(item.productId, {    lock: Transaction.LOCK.UPDATE,    transaction: t,  });  if (product.quantity \< item.quantity) {    throw new InsufficientStockException(...);  }  const created \= await saleRepo.create({ ... }, { transaction: t });  const ps \= await psRepo.create({ ... }, { transaction: t });  await product.update(    { quantity: product.quantity \- item.quantity },    { transaction: t },  );  return this.toDomain(created, persistedItems);}); |
| :---- |
| **ATOMICIDADBEGIN → FOR UPDATE productos → revalidar stock → INSERT sale → INSERT items → UPDATE stock → COMMIT | cualquier error → ROLLBACK** |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **sequelize.transaction** | Agrupa todo en una unidad atómica. | Evita venta sin descuento o stock descontado sin venta. |
| **LOCK.UPDATE** | Bloquea filas de producto. | Previene condiciones de carrera entre ventas concurrentes. |
| **re-verificar stock** | No confía solo en la lectura previa del use-case. | El stock pudo cambiar antes de adquirir el lock. |
| **transaction: t** | Hace que cada escritura pertenezca a la misma transacción. | Sin esto la atomicidad se rompe. |
| **toDomain** | Devuelve Sale \+ items de dominio. | Los modelos no salen de infrastructure. |

# **6\. GetSaleById**

**SaleRepository.findById**

| const found \= await saleRepo.findByPk(id);if (\!found) return null;const itemModels \= await psRepo.findAll({  where: { saleId: id },  order: \[\['id', 'ASC'\]\],});return this.toDomain(found, items); |
| :---- |
| **LECTURAsale id → SaleModel → ProductSaleModel\[\] → ProductSale\[\] → Sale** |

# **7\. Módulo y dependencia entre features**

**sales.module.ts**

| @Module({  imports: \[ClientsModule, ProductsModule\],  controllers: \[SalesController\],  providers: \[    CreateSaleUseCase,    GetSaleByIdUseCase,    { provide: SALE\_REPOSITORY, useClass: SaleRepository },  \],  exports: \[SALE\_REPOSITORY\],}) |
| :---- |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **ClientsModule** | Expone CLIENT\_REPOSITORY. | CreateSaleUseCase valida cliente. |
| **ProductsModule** | Expone PRODUCT\_REPOSITORY. | CreateSaleUseCase carga productos. |
| **SALE\_REPOSITORY binding** | Conecta puerto a SaleRepository. | El caso de uso depende del contrato. |

# **8\. Checklist ISS-06**

* domain/services creado  
* Sale y ProductSale  
* SaleCalculator puro  
* CreateSaleDto anidado  
* CreateSaleUseCase usa puertos  
* reduceStock aplicado  
* SaleModel y ProductSaleModel registrados  
* transaction \+ FOR UPDATE  
* revalidación de stock dentro de transacción  
* SalesModule importa ClientsModule y ProductsModule