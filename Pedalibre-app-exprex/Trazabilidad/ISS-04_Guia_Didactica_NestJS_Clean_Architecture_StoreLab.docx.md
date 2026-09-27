**ISS-04 · Feature product-types**

Guía didáctica detallada: segunda feature con unicidad por name

| Documento basado en backend-manual.md · líneas 1466–1933 |
| :---: |

StoreLab · NestJS 12 · Sequelize · Clean Architecture por feature

| ObjetivoComprender cómo se repite el patrón aprendido con clients, cambiando el lenguaje de negocio: ahora la regla distintiva es la unicidad de name. |
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

# **1\. ¿Qué construye ISS-04?**

Se crea la feature product-types completa: entidad y puerto de dominio, excepciones, DTO, mapper, tres casos de uso, modelo Sequelize, repositorio, seeder, controller, módulo y registro temporal en AppModule.

| VISIÓN GLOBALProductTypesController → casos de uso → IProductTypeRepository ← ProductTypeRepository → ProductTypeModel → product\_types |
| :---- |

# **2\. Domain: ProductType y su contrato**

**product-type.entity.ts**

| export type ProductTypeStatus \= 'active' | 'inactive';export interface ProductTypeProps {  id?: number | null;  name: string;  description?: string | null;  status?: ProductTypeStatus;}export class ProductType {  readonly id: number | null;  readonly name: string;  readonly description: string | null;  readonly status: ProductTypeStatus;  constructor(props: ProductTypeProps) {    this.id \= props.id ?? null;    this.name \= props.name;    this.description \= props.description ?? null;    this.status \= props.status ?? 'active';  }} |
| :---- |
| **LECTURAProductTypeProps → constructor → ProductType con status active por defecto** |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **ProductTypeStatus** | Restringe el estado a active/inactive. | El dominio define el vocabulario válido. |
| **readonly** | Evita mutaciones accidentales de la entidad. | Los cambios futuros deben ser explícitos. |
| **status ?? 'active'** | Da de alta el tipo por defecto. | La entidad nace en estado coherente. |

**product-type.repository.ts**

| export const PRODUCT\_TYPE\_REPOSITORY \= 'IProductTypeRepository';export interface IProductTypeRepository {  create(productType: ProductType): Promise\<ProductType\>;  findAll(page: number, limit: number): Promise\<{ items: ProductType\[\]; total: number }\>;  findById(id: number): Promise\<ProductType | null\>;  findByName(name: string): Promise\<ProductType | null\>;  count(): Promise\<number\>;} |
| :---- |
| **PUERTOApplication pide operaciones → IProductTypeRepository → infraestructura decide cómo hacerlas** |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **findByName** | Permite verificar la unicidad por name. | La regla se decide en application sin importar Sequelize. |
| **PRODUCT\_TYPE\_REPOSITORY** | Token de DI de Nest. | Une el puerto con ProductTypeRepository en el módulo. |
| **Promise\<ProductType\>** | Devuelve dominio, no ProductTypeModel. | Evita filtrar el ORM hacia arriba. |

**Excepciones de la feature**

| export class ProductTypeNotFoundException extends EntityNotFoundException {  constructor(id: number) {    super(\`Tipo de producto con id \${id} no encontrado\`);  }}export class ProductTypeNameAlreadyExistsException extends BusinessRuleException {  constructor(name: string) {    super(\`Ya existe un tipo de producto con el nombre \${name}\`);  }} |
| :---- |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **ProductTypeNotFoundException** | Especializa 404 para product-types. | El caso de uso habla en lenguaje del negocio. |
| **ProductTypeNameAlreadyExistsException** | Especializa 409 por nombre repetido. | La unicidad no se resuelve en el controller. |

# **3\. Application: entrada, traducción y casos de uso**

**create-product-type.dto.ts**

| export class CreateProductTypeDto {  @IsString()  @IsNotEmpty({ message: 'name es requerido' })  @MaxLength(100)  name\!: string;  @IsOptional()  @IsString()  @MaxLength(255)  description?: string;} |
| :---- |
| **BORDE HTTPJSON → ValidationPipe → CreateProductTypeDto → CreateProductTypeUseCase** |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **@IsNotEmpty** | Impide name vacío. | Es validación de forma, no de unicidad. |
| **@MaxLength** | Alinea el contrato HTTP con límites razonables. | Evita entradas inválidas antes del caso de uso. |
| **@IsOptional description** | Permite omitir descripción. | El mapper la normaliza a null. |

**product-type.mapper.ts**

| export class ProductTypeMapper {  static toEntity(dto: CreateProductTypeDto): ProductType {    return new ProductType({      name: dto.name,      description: dto.description ?? null,      status: 'active',    });  }  static toResponse(pt: ProductType) {    return { id: pt.id, name: pt.name, description: pt.description, status: pt.status };  }} |
| :---- |
| **TRADUCCIÓNCreateProductTypeDto → toEntity() → ProductType | ProductType → toResponse() → JSON** |

**CreateProductTypeUseCase**

| async execute(dto: CreateProductTypeDto): Promise\<ProductType\> {  const existing \= await this.repo.findByName(dto.name);  if (existing) {    throw new ProductTypeNameAlreadyExistsException(dto.name);  }  return this.repo.create(ProductTypeMapper.toEntity(dto));} |
| :---- |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **findByName(dto.name)** | Pregunta por el nombre antes de crear. | La regla de unicidad vive en application. |
| **throw 409** | Detiene la operación si ya existe. | No se delega el conflicto al controller. |
| **repo.create** | Persiste por el puerto. | El caso de uso no conoce SQL. |

**GetProductTypeByIdUseCase \+ ListProductTypesUseCase**

| async execute(id: number): Promise\<ProductType\> {  const pt \= await this.repo.findById(id);  if (\!pt) throw new ProductTypeNotFoundException(id);  return pt;}async execute(page: number, limit: number) {  const { items, total } \= await this.repo.findAll(page, limit);  return {    items: items.map(ProductTypeMapper.toResponse),    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },  };} |
| :---- |
| **LECTURAGET :id → findById → 404 o entidad   |   GET lista → findAll → map → meta** |

# **4\. Infrastructure: tabla, repositorio y seeder**

**product-type.model.ts**

| @Table({ tableName: 'product\_types', timestamps: true })export class ProductTypeModel extends Model {  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })  declare id: number;  @Column({ type: DataType.STRING(100), allowNull: false, unique: true })  declare name: string;  @Column({ type: DataType.STRING(255), allowNull: true })  declare description: string | null;  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'active' })  declare status: string;} |
| :---- |
| **PERSISTENCIAProductTypeModel ↔ tabla product\_types; unique(name) refuerza la regla a nivel de BD** |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **@Table** | Asocia el model con product\_types. | Es detalle de infrastructure. |
| **unique: true** | Refuerza la unicidad física de name. | Application sigue haciendo la comprobación de negocio. |
| **defaultValue active** | Alinea persistencia con la entidad. | Hay coherencia entre dominio y BD. |

**product-type.repository.ts**

| async create(pt: ProductType): Promise\<ProductType\> { /\* INSERT \+ toDomain \*/ }async findAll(page: number, limit: number) { /\* findAndCountAll \*/ }async findById(id: number): Promise\<ProductType | null\> { /\* findByPk \*/ }async findByName(name: string): Promise\<ProductType | null\> { /\* findOne \*/ }private toDomain(m: ProductTypeModel): ProductType { /\* Model → entidad \*/ } |
| :---- |
| **ADAPTADORIProductTypeRepository ← ProductTypeRepository → Sequelize → ProductTypeModel → BD → toDomain()** |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **create** | Traduce entidad a columnas y hace INSERT. | SQL queda confinado en infrastructure. |
| **findAndCountAll** | Lista y cuenta en una sola operación ORM. | Application recibe items \+ total. |
| **toDomain** | Convierte ProductTypeModel en ProductType. | El ORM no se filtra a application. |

**product-type.seeder.ts**

| async seed(): Promise\<void\> {  const name \= 'Bebidas';  const existing \= await this.repo.findByName(name);  if (existing) return;  await this.repo.create(    new ProductType({ name, description: 'Bebidas y refrescos', status: 'active' }),  );} |
| :---- |
| **Idempotencia**El seeder pregunta antes de insertar. Ejecutar la app varias veces no debe duplicar el tipo demo. |

# **5\. Presentation y módulo**

**product-types.controller.ts**

| @Controller('product-types')export class ProductTypesController {  @Post() create(@Body() dto: CreateProductTypeDto) { /\* use-case \+ toResponse \*/ }  @Get() list(@Query('page') page='1', @Query('limit') limit='10') { /\* use-case \*/ }  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { /\* use-case \*/ }} |
| :---- |
| **HTTPPOST/GET → controller → use-case. El controller no usa ProductTypeModel ni Sequelize.** |

**product-types.module.ts**

| @Module({  controllers: \[ProductTypesController\],  providers: \[    CreateProductTypeUseCase,    ListProductTypesUseCase,    GetProductTypeByIdUseCase,    ProductTypeSeeder,    { provide: PRODUCT\_TYPE\_REPOSITORY, useClass: ProductTypeRepository },  \],  exports: \[PRODUCT\_TYPE\_REPOSITORY, ProductTypeSeeder\],})export class ProductTypesModule {} |
| :---- |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **providers** | Registra casos de uso, seeder y adaptador. | Nest puede construir el grafo de dependencias. |
| **provide/useClass** | Liga el puerto con el repositorio. | Aquí se materializa inversión de dependencias. |
| **exports** | Expone puerto y seeder. | ISS-05 y ISS-07 podrán reutilizarlos. |

# **6\. Checklist ISS-04**

* Entidad ProductType pura  
* Puerto con findByName  
* 409 por nombre duplicado  
* DTO y mapper  
* Create/GetOne/GetAll  
* ProductTypeModel registrado en ALL\_MODELS  
* Repositorio devuelve dominio  
* Seeder idempotente  
* Controller delgado  
* ProductTypesModule y AppModule cargados