**ISS-05 · Feature products**

Guía didáctica detallada: FK a product-types y regla de stock

| Documento basado en backend-manual.md · líneas 1934–2541 |
| :---: |

StoreLab · NestJS 12 · Sequelize · Clean Architecture por feature

| ObjetivoComprender una feature que ya no es aislada: products depende del puerto de product-types para validar la FK y contiene una regla de dominio real: reduceStock(). |
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

# **1\. Qué cambia respecto a clients/product-types**

Products introduce dos ideas nuevas: una dependencia de negocio entre features y una regla de dominio con comportamiento. El alta debe verificar que productTypeId exista y esté activo.

| DEPENDENCIA ENTRE FEATURESCreateProductUseCase → PRODUCT\_TYPE\_REPOSITORY → ProductTypesModule | y → PRODUCT\_REPOSITORY → ProductRepository |
| :---- |

# **2\. Domain: Product y reduceStock()**

**product.entity.ts**

| export class Product {  readonly id: number | null;  readonly name: string;  readonly brand: string | null;  readonly price: number;  readonly minStock: number;  quantity: number;  readonly productTypeId: number;  readonly status: ProductStatus;  reduceStock(n: number): void {    if (n \< 0\) {      throw new InsufficientStockException(this.id, this.quantity, n);    }    if (this.quantity \- n \< 0\) {      throw new InsufficientStockException(this.id, this.quantity, n);    }    this.quantity \-= n;  }} |
| :---- |
| **REGLApedido de reducción → Product.reduceStock(n) → valida → muta quantity o lanza 409** |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **quantity mutable** | Es el único campo no readonly en la entidad del manual. | La venta necesita descontar stock mediante comportamiento de dominio. |
| **n \< 0** | Protege contra reducciones negativas. | Evita una operación incoherente. |
| **quantity \- n \< 0** | Impide stock negativo. | La regla se expresa antes del SQL. |
| **InsufficientStockException** | BusinessRuleException 409\. | La regla tiene nombre y puede reutilizarse. |

**product.repository.ts**

| export interface IProductRepository {  create(product: Product): Promise\<Product\>;  findAll(page: number, limit: number): Promise\<{ items: Product\[\]; total: number }\>;  findById(id: number): Promise\<Product | null\>;  count(): Promise\<number\>;} |
| :---- |
| **Observación**ISS-05 todavía no añade update/delete al puerto. La persistencia de descuento de stock durante una venta será resuelta transaccionalmente por SaleRepository en ISS-06. |

# **3\. Application: DTO y validación cruzada**

**create-product.dto.ts (resumen)**

| export class CreateProductDto {  name\!: string;  brand?: string;  price\!: number;  minStock?: number;  quantity?: number;  productTypeId\!: number;} |
| :---- |

**CreateProductUseCase**

| async execute(dto: CreateProductDto): Promise\<Product\> {  const type \= await this.typeRepo.findById(dto.productTypeId);  if (\!type) {    throw new ProductTypeNotFoundException(dto.productTypeId);  }  if (type.status \!== 'active') {    throw new ProductTypeInactiveException(dto.productTypeId);  }  return this.productRepo.create(ProductMapper.toEntity(dto));} |
| :---- |
| **CASO DE USODTO → buscar tipo → 404 si no existe → 409 si inactive → mapper → productRepo.create** |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **PRODUCT\_TYPE\_REPOSITORY** | Puerto exportado por otra feature. | Products depende del contrato de product-types, no de su modelo. |
| **type.status** | Aplica regla de negocio transversal entre features. | No basta con una FK válida: debe estar activo. |
| **ProductMapper** | Defaults minStock/quantity a 0 y status active. | Centraliza traducción DTO→entidad. |

# **4\. Infrastructure: FK real**

**Fragmento de product.model.ts**

| @ForeignKey(() \=\> ProductTypeModel)@Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false })declare productTypeId: number;@BelongsTo(() \=\> ProductTypeModel)productType?: ProductTypeModel; |
| :---- |
| **FKProduct.productTypeId (dominio) ↔ ProductModel.productTypeId (persistencia) → product\_types.id** |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **@ForeignKey** | Declara la columna FK. | Es detalle de infraestructura. |
| **@BelongsTo** | Declara la asociación ORM. | No convierte ProductTypeModel en parte del dominio. |
| **ProductTypeModel import** | Solo aparece en infrastructure. | La regla de dependencias se conserva. |

**product.repository.ts**

| async create(product: Product): Promise\<Product\> { /\* INSERT \*/ }async findAll(page: number, limit: number) { /\* SELECT \+ count \*/ }async findById(id: number): Promise\<Product | null\> { /\* PK \*/ }private toDomain(m: ProductModel): Product { /\* Number(price) \+ entidad \*/ } |
| :---- |
| **Conversión DECIMAL**Sequelize puede entregar DECIMAL como string según dialecto/driver; el repositorio convierte con Number(m.price) antes de devolver Product. |

# **5\. Seeder y módulo**

**product.seeder.ts**

| const { items: types } \= await this.typeRepo.findAll(1, 100);const activeType \= types.find((t) \=\> t.status \=== 'active');if (\!activeType || activeType.id \=== null) return;// luego evita duplicar por nombre y crea el producto demo |
| :---- |
| **ORDEN DE DATOSPrimero debe existir un product-type activo → luego puede sembrarse Product** |

**products.module.ts**

| @Module({  imports: \[ProductTypesModule\],  controllers: \[ProductsController\],  providers: \[    CreateProductUseCase,    ListProductsUseCase,    GetProductByIdUseCase,    ProductSeeder,    { provide: PRODUCT\_REPOSITORY, useClass: ProductRepository },  \],  exports: \[PRODUCT\_REPOSITORY, ProductSeeder\],}) |
| :---- |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **imports: \[ProductTypesModule\]** | Hace visibles los exports de ProductTypesModule. | Necesario para inyectar PRODUCT\_TYPE\_REPOSITORY. |
| **exports PRODUCT\_REPOSITORY** | ISS-06 sales lo necesitará. | Prepara integración entre features. |
| **ProductSeeder** | También se exporta. | ISS-07 lo ejecutará desde SeedersRunner. |

# **6\. Checklist ISS-05**

* Product con reduceStock  
* Excepciones de stock y tipo inactivo  
* DTO numérico validado  
* CreateProductUseCase valida FK y status  
* ProductModel con ForeignKey/BelongsTo  
* ProductModel registrado en ALL\_MODELS  
* Repositorio convierte DECIMAL  
* Seeder depende de tipo activo  
* ProductsModule importa ProductTypesModule  
* Controller con POST/GET/GET:id