**ISS-03**

**Feature clients**

Guía didáctica: primera feature completa con Clean Architecture por feature

| 1Definirdomain | 2Orquestarapplication | 3Persistirinfrastructure | 4Exponerpresentation | 5Ensamblarmodule \+ App |
| :---: | :---: | :---: | :---: | :---: |

| META | Objetivo de esta guíaEntender con rigor cómo una petición de clients atraviesa las cuatro capas, cómo se aplica inversión de dependencias y por qué Client, DTO, Model y respuesta son representaciones diferentes. |
| :---: | :---- |

# **1\. ISS-03 es el patrón que se repetirá**

ISS-03 implementa la primera feature real del backend: clients. Aquí sí aparecen las cuatro capas completas. La intención pedagógica es que comprendas el patrón; product-types, products y sales repetirán la misma lógica estructural con reglas distintas.

**Árbol de la feature**

| src/features/business/clients/├── domain/│   ├── entities/client.entity.ts│   ├── interfaces/client.repository.ts│   └── exceptions/├── application/│   ├── dto/create-client.dto.ts│   ├── mappers/client.mapper.ts│   └── use-cases/├── infrastructure/persistence/│   ├── models/client.model.ts│   ├── repositories/client.repository.ts│   └── seeders/client.seeder.ts├── presentation/http/controllers/clients.controller.ts└── clients.module.ts |
| :---- |

| REGLA | Regla de dependenciaspresentation → application → domain. infrastructure implementa contratos de domain. Domain no importa Nest, Sequelize ni HTTP. |
| :---: | :---- |

## **1.1 Cuatro representaciones de “cliente”**

| Representación | Capa | Pregunta que responde |
| :---- | :---- | :---- |
| Client | domain | ¿Qué es un cliente para el negocio? |
| CreateClientDto | application/borde HTTP | ¿Qué forma de entrada acepto? |
| ClientModel | infrastructure | ¿Cómo se representa una fila en la tabla? |
| toResponse(...) | application/mapper | ¿Qué objeto expongo hacia HTTP? |

| CLAVE | No son duplicadosSeparar representaciones evita que una decisión del ORM o del JSON HTTP gobierne la entidad de negocio. |
| :---: | :---- |

| 1 | 5.1 DomainNúcleo puro: entidad, puerto y excepciones específicas. |
| :---: | :---- |

## **2\. client.entity.ts — entidad de negocio**

**src/features/business/clients/domain/entities/client.entity.ts**

| export type ClientStatus \= 'active' | 'inactive';export interface ClientProps {  id?: number | null;  name: string;  email?: string | null;  phone?: string | null;  address?: string | null;  status?: ClientStatus;}export class Client {  readonly id: number | null;  readonly name: string;  readonly email: string | null;  readonly phone: string | null;  readonly address: string | null;  readonly status: ClientStatus;  constructor(props: ClientProps) {    this.id \= props.id ?? null;    this.name \= props.name;    this.email \= props.email ?? null;    this.phone \= props.phone ?? null;    this.address \= props.address ?? null;    this.status \= props.status ?? 'active';  }} |
| :---- |
| **ESQUEMA DE LECTURAClientProps → constructor Client → entidad de dominio → consumida por application e infrastructure** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **ClientStatus** | Limita status a active | inactive. | El lenguaje del dominio queda explícito. |
| **ClientProps** | Describe datos permitidos al construir Client. | Separa el molde de creación del estado interno. |
| **readonly** | Impide reasignaciones directas. | Favorece cambios de negocio intencionales. |
| **constructor** | Normaliza null y active por defecto. | Mantiene invariantes básicas sin conocer HTTP/ORM. |

| Elemento de código | Qué significa | Por qué importa |
| :---- | :---- | :---- |
| ClientStatus | Limita status a active/inactive. | Expresa lenguaje de dominio y evita valores arbitrarios. |
| ClientProps | Molde de construcción. name es requerido; otros pueden faltar. | Separa parámetros del constructor de la clase. |
| readonly | Evita mutaciones directas después de construir. | Favorece cambios explícitos mediante nuevas instancias. |
| ?? null | Normaliza undefined a null. | La entidad maneja una representación consistente. |
| ?? 'active' | Define estado inicial por defecto. | La decisión pertenece al significado del cliente, no al controller. |

| PURO | Pureza del dominioEste archivo no tiene @Table, @Column, @Controller ni @Injectable. Si ves imports de Nest o Sequelize aquí, rompiste la frontera. |
| :---: | :---- |

## **3\. client.repository.ts — el puerto**

**src/features/business/clients/domain/interfaces/client.repository.ts**

| export const CLIENT\_REPOSITORY \= 'IClientRepository';export interface IClientRepository {  create(client: Client): Promise\<Client\>;  findAll(page: number, limit: number): Promise\<{ items: Client\[\]; total: number }\>;  findById(id: number): Promise\<Client | null\>;  findByEmail(email: string): Promise\<Client | null\>;  count(): Promise\<number\>;} |
| :---- |
| **ESQUEMA DE LECTURAApplication necesita persistencia → IClientRepository → token CLIENT\_REPOSITORY → ClientRepository implementa** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **IClientRepository** | Define operaciones que clients necesita. | Es el puerto: QUÉ, no CÓMO. |
| **CLIENT\_REPOSITORY** | Token de runtime para DI. | La interface desaparece al compilar. |
| **Promise\<Client\>** | El contrato devuelve entidades de dominio. | Evita filtrar ClientModel hacia application. |

El puerto declara QUÉ necesita el negocio de la persistencia, pero no CÓMO se hace. No dice Sequelize, SQL, tabla ni motor.

| Elemento de código | Qué significa | Por qué importa |
| :---- | :---- | :---- |
| CLIENT\_REPOSITORY | Token de runtime usado por Nest para inyección. | Las interfaces TypeScript desaparecen al ejecutar; el token permanece. |
| IClientRepository | Contrato de capacidades. | Application puede depender del contrato sin conocer implementación. |
| Promise\<Client\> | Devuelve entidad de dominio. | No filtra ClientModel hacia arriba. |
| findByEmail | Capacidad necesaria para regla de unicidad. | El use-case decide qué hacer con el resultado; el repo solo consulta. |

| DIP | Inversión de dependenciasApplication “mira” hacia el puerto de domain. Infrastructure también “mira” hacia domain para implementarlo. El detalle externo depende del contrato interno, no al revés. |
| :---: | :---- |

## **4\. Excepciones específicas de clients**

**domain/exceptions/\***

| export class ClientNotFoundException extends EntityNotFoundException {  constructor(id: number) {    super(\`Cliente con id \${id} no encontrado\`);  }}export class ClientEmailAlreadyExistsException extends BusinessRuleException {  constructor(email: string) {    super(\`Ya existe un cliente con el email \${email}\`);  }} |
| :---- |
| **ESQUEMA DE LECTURASituación de clients → excepción específica → base transversal → filtro global → 404/409** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **ClientNotFoundException** | Nombra la ausencia en lenguaje clients. | Reutiliza la política 404 de ISS-02. |
| **ClientEmailAlreadyExistsException** | Nombra la unicidad de email. | Expresa negocio sin SQL ni Response. |
| **super(...)** | Entrega el mensaje a la clase base. | La jerarquía conserva el status asociado. |

La feature nombra el problema en lenguaje de clients. Las clases transversales de ISS-02 ya aportan 404 y 409\. Así se reutiliza política HTTP sin meter Response dentro del dominio.

| 2 | 5.2 ApplicationCasos de uso, DTO y mapper: el verbo del sistema. |
| :---: | :---- |

## **5\. create-client.dto.ts — forma de entrada**

**application/dto/create-client.dto.ts**

| export class CreateClientDto {  @ApiProperty({ example: 'Ana María Pérez' })  @IsString()  @IsNotEmpty({ message: 'name es requerido' })  @MaxLength(150)  name\!: string;  @ApiPropertyOptional({ example: 'ana@demo.com' })  @IsOptional()  @IsEmail({}, { message: 'email debe ser un correo válido' })  @MaxLength(150)  email?: string;  // phone, address...} |
| :---- |
| **ESQUEMA DE LECTURAJSON HTTP → ValidationPipe → decoradores DTO → objeto válido → CreateClientUseCase** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **@ApiProperty** | Metadatos para Swagger. | Documenta; no valida por sí solo. |
| **@IsString/@IsNotEmpty** | Valida forma de name. | Es validación de entrada. |
| **@IsEmail** | Valida sintaxis del correo. | No comprueba unicidad. |
| **@IsOptional** | Permite omitir campos. | Define el contrato HTTP opcional. |

| VALIDACIÓN DE FORMA¿El JSON tiene name? ¿email tiene forma de email? ¿se excede longitud? Esto lo resuelven decoradores \+ ValidationPipe. | REGLA DE NEGOCIO¿El email ya pertenece a otro cliente? Eso requiere consultar un repositorio y lo decide el use-case. |
| :---- | :---- |

| NO | DTO ≠ entidadEl DTO describe una entrada HTTP. Client representa negocio. Que hoy tengan campos similares no los convierte en la misma responsabilidad. |
| :---: | :---- |

## **6\. client.mapper.ts — traducir entre idiomas**

**application/mappers/client.mapper.ts**

| export class ClientMapper {  static toEntity(dto: CreateClientDto): Client {    return new Client({      name: dto.name,      email: dto.email ?? null,      phone: dto.phone ?? null,      address: dto.address ?? null,      status: 'active',    });  }  static toResponse(client: Client) {    return {      id: client.id,      name: client.name,      email: client.email,      phone: client.phone,      address: client.address,      status: client.status,    };  }} |
| :---- |
| **ESQUEMA DE LECTURACreateClientDto → toEntity() → Client → caso de uso/repositorio → Client → toResponse() → JSON** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **toEntity()** | Traduce DTO a entidad. | Evita construcción manual en controller. |
| **status: 'active'** | Fija estado inicial. | Hace explícita la decisión de alta. |
| **toResponse()** | Proyecta Client a objeto plano. | Controla qué se expone al exterior. |

El mapper evita que el controller construya entidades manualmente y evita exponer la entidad sin una decisión explícita de salida.

## **7\. CreateClientUseCase — crear**

**application/use-cases/create-client.use-case.ts**

| @Injectable()export class CreateClientUseCase {  constructor(    @Inject(CLIENT\_REPOSITORY)    private readonly clientRepository: IClientRepository,  ) {}  async execute(dto: CreateClientDto): Promise\<Client\> {    if (dto.email) {      const existing \= await this.clientRepository.findByEmail(dto.email);      if (existing) {        throw new ClientEmailAlreadyExistsException(dto.email);      }    }    return this.clientRepository.create(ClientMapper.toEntity(dto));  }} |
| :---- |
| **ESQUEMA DE LECTURADTO → findByEmail() → existe: 409 | no existe: mapper → create() → Client** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **@Injectable()** | Permite a Nest construir el caso de uso. | La lógica depende del puerto, no del ORM. |
| **@Inject(CLIENT\_REPOSITORY)** | Solicita implementación por token. | Es inversión de dependencias. |
| **findByEmail()** | Consulta mediante el puerto. | Application orquesta la regla de unicidad. |
| **throw ...Exception** | Detiene el flujo si falla la regla. | El filtro global la convierte en 409\. |
| **create(...)** | Persiste por contrato. | El use-case no conoce el INSERT Sequelize. |

| Elemento de código | Qué significa | Por qué importa |
| :---- | :---- | :---- |
| @Injectable() | Permite que Nest construya la clase como provider. | El use-case puede recibir dependencias. |
| @Inject(CLIENT\_REPOSITORY) | Solicita el token, no ClientRepository. | Mantiene application desacoplada de infraestructura. |
| IClientRepository | Tipo para desarrollo/compilación. | Expresa contrato sin acoplar a clase concreta. |
| findByEmail | Consulta necesaria para la regla. | El repo informa; el use-case decide 409\. |
| ClientMapper.toEntity | Convierte input a entidad. | Controller no construye Client. |
| repository.create | Persiste a través del puerto. | Application no ejecuta SQL. |

## **8\. GetClientByIdUseCase — obtener o 404**

**get-client-by-id.use-case.ts — núcleo**

| async execute(id: number): Promise\<Client\> {  const client \= await this.clientRepository.findById(id);  if (\!client) {    throw new ClientNotFoundException(id);  }  return client;} |
| :---- |
| **ESQUEMA DE LECTURAid → findById() → null ? ClientNotFoundException : Client** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **findById()** | Pide una entidad o null. | Infrastructure decide cómo buscar. |
| **if (\!client)** | Traduce ausencia a regla del caso de uso. | Para GET por id significa 404\. |
| **return client** | Entrega dominio. | Presentation no recibe ClientModel. |

El repositorio puede devolver null porque “no encontrar” es un resultado técnico posible. El caso de uso convierte ese resultado en una decisión de aplicación: para este verbo, no encontrar significa 404\.

## **9\. ListClientsUseCase — paginar y preparar salida**

**list-clients.use-case.ts — núcleo**

| async execute(page: number, limit: number) {  const { items, total } \= await this.clientRepository.findAll(page, limit);  return {    items: items.map(ClientMapper.toResponse),    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },  };} |
| :---- |
| **ESQUEMA DE LECTURApage \+ limit → findAll() → {items,total} → toResponse → meta** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **findAll()** | Solicita una página al puerto. | No conoce OFFSET/LIMIT SQL. |
| **map(toResponse)** | Convierte entidades a salida. | No expone el ORM. |
| **totalPages** | Calcula metadatos. | Es composición de application. |

Aquí application compone la respuesta funcional: lista transformada y metadatos de paginación. Sigue sin saber qué query SQL ejecutó infraestructura.

| 3 | 5.3 InfrastructureSequelize, tabla, consultas y adaptación hacia el dominio. |
| :---: | :---- |

## **10\. client.model.ts — representación ORM**

**infrastructure/persistence/models/client.model.ts**

| @Table({ tableName: 'clients', timestamps: true })export class ClientModel extends Model {  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })  declare id: number;  @Column({ type: DataType.STRING(150), allowNull: false })  declare name: string;  @Column({ type: DataType.STRING(150), allowNull: true, unique: true })  declare email: string | null;  // phone, address, status...} |
| :---- |
| **ESQUEMA DE LECTURATabla clients ↔ ClientModel ↔ decoradores Sequelize; repository.toDomain() → Client** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **@Table** | Asocia clase ORM con tabla clients. | Pertenece solo a infrastructure. |
| **extends Model** | Habilita API Sequelize. | Convierte la clase en representación ORM. |
| **@Column** | Describe columnas y restricciones. | Mapea persistencia física. |
| **declare** | Declara propiedades TypeScript sin inicializarlas. | Sequelize las materializa en runtime. |

ClientModel sí conoce Sequelize porque su responsabilidad es describir persistencia. Esta clase puede cambiar si cambia el ORM; Client no debería cambiar por eso.

| ClientLenguaje de negocio. Sin decoradores ORM. Puede existir aunque no haya base de datos. | ClientModelLenguaje de persistencia. @Table/@Column. Representa una fila y metadatos de Sequelize. |
| :---- | :---- |

## **11\. Registrar ClientModel en ALL\_MODELS**

**src/infrastructure/database/sequelize/sequelize.factory.ts — cambio ISS-03**

| import { ClientModel } from '../../../features/business/clients/infrastructure/persistence/models/client.model.js';export const ALL\_MODELS: any\[\] \= \[  ClientModel,\]; |
| :---- |
| **ESQUEMA DE LECTURAISS-02 ALL\_MODELS=\[\] → importar ClientModel → ALL\_MODELS=\[ClientModel\] → Sequelize registra el modelo** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **import ClientModel** | Hace visible el modelo a la factoría. | Integra feature con infraestructura global. |
| **ALL\_MODELS** | Lista pasada a Sequelize. | Sin registro, el ORM no conoce el modelo. |
| **sequelizeFactory** | Sigue siendo único constructor ORM. | La feature no crea otra conexión. |

ISS-02 dejó ALL\_MODELS vacío. ISS-03 agrega ClientModel. Ese es el punto donde la infraestructura transversal conoce qué modelos debe registrar el ORM.

## **12\. ClientRepository — adaptador concreto**

**infrastructure/persistence/repositories/client.repository.ts — fragmento**

| @Injectable()export class ClientRepository implements IClientRepository {  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}  private get repo() {    return this.sequelize.getRepository(ClientModel);  }  async create(client: Client): Promise\<Client\> {    const created \= await this.repo.create({      name: client.name,      email: client.email,      phone: client.phone,      address: client.address,      status: client.status,    });    return this.toDomain(created);  }  private toDomain(m: ClientModel): Client {    return new Client({      id: m.id,      name: m.name,      email: m.email ?? null,      phone: m.phone ?? null,      address: m.address ?? null,      status: (m.status as ClientStatus) ?? 'active',    });  }} |
| :---- |
| **ESQUEMA DE LECTURAUse-case → puerto → ClientRepository → SEQUELIZE → ClientModel → BD → toDomain() → Client** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **implements IClientRepository** | Obliga a cumplir el puerto. | Infrastructure se adapta a domain. |
| **@Inject(SEQUELIZE)** | Recibe conexión global. | Evita conexiones por feature. |
| **getRepository(ClientModel)** | Obtiene acceso ORM a clients. | El detalle ORM queda encerrado aquí. |
| **create/findAll/findById/findByEmail** | Implementan persistencia concreta. | Aquí sí viven consultas Sequelize. |
| **toDomain()** | Convierte modelo ORM a entidad. | Impide que ClientModel suba a application. |

| Elemento de código | Qué significa | Por qué importa |
| :---- | :---- | :---- |
| implements IClientRepository | La clase promete cumplir el puerto. | El compilador verifica métodos requeridos. |
| @Inject(SEQUELIZE) | Recibe la conexión global de ISS-02. | No crea una conexión nueva. |
| getRepository(ClientModel) | Obtiene operaciones ORM para la tabla clients. | Detalle tecnológico queda encerrado aquí. |
| repo.create / findByPk / findOne | Ejecutan persistencia/consultas. | SQL/ORM vive en infraestructura. |
| toDomain | Convierte fila ORM a Client. | Hacia arriba no sale ClientModel. |

| NO | Puerta anti-acoplamientoSi CreateClientUseCase importa ClientModel, perdiste Clean Architecture. El único camino permitido es use-case → IClientRepository ← ClientRepository. |
| :---: | :---- |

## **13\. ClientSeeder — datos de laboratorio**

**infrastructure/persistence/seeders/client.seeder.ts — núcleo**

| async seed(): Promise\<void\> {  const email \= 'demo.cliente@tecnogua.edu.co';  const existing \= await this.clientRepository.findByEmail(email);  if (existing) {    this.logger.log('Seeder clients: ya existía el cliente demo (idempotente)');    return;  }  await this.clientRepository.create(new Client({    name: 'Cliente Demo',    email,    phone: '3001234567',    address: 'Riohacha, La Guajira',    status: 'active',  }));} |
| :---- |
| **ESQUEMA DE LECTURASeeder → findByEmail(demo) → existe: terminar | no existe: new Client → port.create()** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **findByEmail()** | Comprueba existencia. | Hace el seeder idempotente. |
| **return** | Corta si ya existe. | Evita duplicados al reejecutar. |
| **new Client** | Construye dominio. | No crea ClientModel directamente. |
| **create()** | Persiste vía puerto. | Respeta la misma abstracción. |

El seeder reutiliza el puerto y la entidad, y se diseña idempotente: ejecutarlo dos veces no duplica el registro demo. Es infraestructura de inicialización, no un caso de uso expuesto al usuario.

| 4 | 5.4 PresentationLa puerta HTTP: recibe, delega y devuelve. No decide persistencia. |
| :---: | :---- |

## **14\. ClientsController — rutas HTTP**

**presentation/http/controllers/clients.controller.ts**

| @ApiTags('clients')@Controller('clients')export class ClientsController {  constructor(    private readonly createClient: CreateClientUseCase,    private readonly listClients: ListClientsUseCase,    private readonly getClient: GetClientByIdUseCase,  ) {}  @Post()  @HttpCode(201)  async create(@Body() dto: CreateClientDto) {    const client \= await this.createClient.execute(dto);    return ClientMapper.toResponse(client);  }  @Get()  async list(@Query('page') page \= '1', @Query('limit') limit \= '10') {    return this.listClients.execute(Number(page), Number(limit));  }  @Get(':id')  async findOne(@Param('id', ParseIntPipe) id: number) {    const client \= await this.getClient.execute(id);    return ClientMapper.toResponse(client);  }} |
| :---- |
| **ESQUEMA DE LECTURAHTTP → ClientsController → DTO/params/query → use-case → mapper → interceptor de respuesta** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **@Controller('clients')** | Agrupa rutas bajo /clients. | Con prefijo global: /api/clients. |
| **constructor** | Inyecta use-cases. | Presentation depende de application. |
| **@Post()** | Recibe DTO y delega crear. | No consulta email ni INSERT. |
| **@Get()** | Lee query params y delega listar. | La lógica funcional queda en application. |
| **@Get(':id')** | Usa ParseIntPipe para id. | Id inválido falla antes del use-case. |
| **toResponse()** | Prepara salida. | Nunca devuelve ClientModel. |

| Elemento de código | Qué significa | Por qué importa |
| :---- | :---- | :---- |
| @Controller('clients') | Base de rutas /clients. Con prefijo global: /api/clients. | El prefijo /api lo configuró main.ts. |
| constructor use-cases | Inyecta casos de uso, no repositorio. | Presentation depende de application. |
| @Body DTO | ValidationPipe valida antes de execute. | Forma inválida puede terminar en 400 sin llegar a SQL. |
| @Param ParseIntPipe | Convierte/valida id numérico. | Id inválido se corta en presentation. |
| execute(...) | Delega la intención. | Controller no busca email ni ejecuta Sequelize. |
| toResponse | Traduce entidad a salida. | Evita exponer estructura interna accidentalmente. |

| HTTP | Controller delgadoUn buen controller sabe de HTTP y de casos de uso. No sabe cómo se consulta la tabla ni dónde vive la regla de email duplicado. |
| :---: | :---- |

| 5 | 5.5–5.6 EnsamblajeConectar el puerto con la implementación y colgar la feature en la aplicación. |
| :---: | :---- |

## **15\. clients.module.ts — wiring de Nest**

**src/features/business/clients/clients.module.ts**

| @Module({  controllers: \[ClientsController\],  providers: \[    CreateClientUseCase,    ListClientsUseCase,    GetClientByIdUseCase,    ClientSeeder,    { provide: CLIENT\_REPOSITORY, useClass: ClientRepository },  \],  exports: \[CLIENT\_REPOSITORY, ClientSeeder\],})export class ClientsModule {} |
| :---- |
| **ESQUEMA DE LECTURAClientsModule → controller \+ use-cases \+ seeder → CLIENT\_REPOSITORY ↔ ClientRepository → exports** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **controllers** | Declara puertas HTTP. | Sin registro no hay rutas. |
| **providers** | Registra casos de uso y seeder. | Nest puede construirlos por DI. |
| **provide/useClass** | Liga puerto con implementación. | Aquí se materializa DIP. |
| **exports** | Expone puerto/seeder. | Facilita integración posterior. |

| Elemento de código | Qué significa | Por qué importa |
| :---- | :---- | :---- |
| controllers | Registra la puerta HTTP de la feature. | Nest descubre rutas dentro de este módulo. |
| providers use-cases | Permite inyectarlos en el controller. | Nest controla construcción/ciclo de vida. |
| provide/useClass | Cuando alguien pida CLIENT\_REPOSITORY, entrega ClientRepository. | Esta línea materializa inversión de dependencias. |
| exports | Hace disponibles puerto/seeder fuera del módulo. | Útil para integración y seeders posteriores. |

## **16\. AppModule — registrar la feature**

**src/app.module.ts — versión ISS-03**

| @Module({  imports: \[EnvironmentModule, SequelizeModule, ClientsModule\],  controllers: \[HealthController\],  providers: \[\],})export class AppModule {} |
| :---- |
| **ESQUEMA DE LECTURAAppModule → transversal \+ ClientsModule → Nest descubre rutas/providers de clients** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **ClientsModule** | Incorpora la feature al grafo raíz. | Las carpetas por sí solas no se ejecutan. |
| **EnvironmentModule** | Aporta configuración global. | Mantiene transversal separada. |
| **SequelizeModule** | Aporta conexión ORM global. | ClientRepository recibe SEQUELIZE por DI. |
| **HealthController** | Permanece técnico/transversal. | Negocio y salud del proceso no se mezclan. |

Sin ClientsModule en imports, las carpetas existen pero Nest no carga el módulo: no hay rutas de clients. La arquitectura de carpetas no sustituye el ensamblaje del framework.

# **17\. Flujo runtime completo: POST /api/clients**

| Paso | Capa/archivo | Qué ocurre |
| :---- | :---- | :---- |
| 1 | main.ts / ValidationPipe | Valida CreateClientDto. |
| 2 | ClientsController | Recibe HTTP y llama createClient.execute(dto). |
| 3 | CreateClientUseCase | Comprueba email por medio del puerto. |
| 4 | IClientRepository | Define findByEmail/create; no ejecuta SQL. |
| 5 | ClientRepository | Usa Sequelize y ClientModel para SELECT/INSERT. |
| 6 | toDomain | Convierte fila ORM a Client. |
| 7 | ClientMapper.toResponse | Prepara objeto de salida. |
| 8 | ResponseInterceptor | Envuelve en {statusCode,message,data,timestamp}. |

| 409 | Si el email ya existeEl use-case lanza ClientEmailAlreadyExistsException → filtro global → 409\. No se ejecuta INSERT. |
| :---: | :---- |

## **18\. Flujo GET /api/clients/:id**

| Momento | Responsable | Resultado |
| :---- | :---- | :---- |
| id \= abc | ParseIntPipe | 400 antes del use-case. |
| id numérico | GetClientByIdUseCase | Pide findById al puerto. |
| no existe | Use-case \+ ClientNotFoundException | 404; no controller-if. |
| existe | Repo → toDomain → mapper | 200 con cliente en envelope. |

## **19\. Orden de escritura vs orden de ejecución**

| AL IMPLEMENTARPiensa de adentro hacia afuera: domain → infrastructure → application → DTO → presentation → módulo. Primero contrato y núcleo; después puerta HTTP. | EN RUNTIMELa petición entra desde afuera: HTTP → presentation → application → puerto/domain → infrastructure; luego el resultado regresa hacia afuera. |
| :---- | :---- |

# **20\. Errores típicos que rompen las capas**

| Error | Por qué rompe la arquitectura | Corrección |
| :---- | :---- | :---- |
| Controller hace repo.create | Presentation toca persistencia. | Controller llama use-case. |
| Use-case importa ClientModel | Application depende del ORM. | Depender de IClientRepository. |
| Client usa @Table | Domain conoce Sequelize. | Mantener Client puro; usar ClientModel aparte. |
| Repo devuelve ClientModel | Se filtra detalle ORM hacia arriba. | Convertir con toDomain. |
| ClientsModule no registra token | Nest no sabe qué implementar para IClientRepository. | provide CLIENT\_REPOSITORY → useClass ClientRepository. |
| No registrar ClientModel | Sequelize no conoce tabla/modelo. | Añadirlo a ALL\_MODELS. |

## **21\. Checklist de cierre ISS-03**

| Comprobación | Esperado |
| :---- | :---- |
| POST /api/clients | 201 con data.id; 400 por forma; 409 por email duplicado. |
| GET /api/clients/:id | 200 si existe; 400 id inválido; 404 si no existe. |
| GET /api/clients | Lista paginada con meta. |
| domain | Sin imports de Nest/Sequelize/HTTP. |
| application | No importa ClientModel. |
| infrastructure | Implementa puerto y convierte Model ↔ Client. |
| presentation | No abre BD ni decide unicidad. |
| module | Liga token a repositorio concreto. |

## **22\. Autoevaluación antes de repetir el patrón**

* ¿Por qué Client y ClientModel no deben ser la misma clase?  
* ¿Por qué la interface IClientRepository necesita además un token CLIENT\_REPOSITORY?  
* ¿Quién decide que email duplicado produce 409: repositorio o caso de uso?  
* ¿Qué capa convierte una fila Sequelize en Client?  
* ¿Qué pasaría si ClientsController inyectara ClientRepository directamente?  
* ¿Qué parte debes cambiar si reemplazas Sequelize por otro ORM?  
* ¿Qué se mantiene igual si cambia MySQL por PostgreSQL manteniendo Sequelize?

| CLAVE | Idea finalMemoriza responsabilidades, no archivos: domain define significado y contratos; application orquesta; infrastructure adapta tecnología; presentation abre HTTP; el módulo conecta las piezas. |
| :---: | :---- |

