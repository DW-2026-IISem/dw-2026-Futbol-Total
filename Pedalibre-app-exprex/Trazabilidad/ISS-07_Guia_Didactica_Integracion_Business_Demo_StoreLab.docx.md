**ISS-07 · Integración business y demo**

Guía didáctica detallada: módulo agregador, seeders, pruebas y demo

| Documento basado en backend-manual.md · líneas 3268–3464 |
| :---: |

StoreLab · NestJS 12 · Sequelize · Clean Architecture por feature

| ObjetivoCerrar el backend de negocio: sustituir imports dispersos por BusinessModule, ejecutar seeders en orden y verificar el sistema con Vitest/e2e y llamadas reales. |
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

# **1\. BusinessModule: agregador de features**

**business.module.ts**

| @Module({  imports: \[ClientsModule, ProductTypesModule, ProductsModule, SalesModule\],  exports: \[ClientsModule, ProductTypesModule, ProductsModule, SalesModule\],})export class BusinessModule {} |
| :---- |
| **AGREGACIÓNAppModule → BusinessModule → {Clients, ProductTypes, Products, Sales}** |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **imports** | Carga las cuatro features. | Centraliza composición de negocio. |
| **exports** | Reexpone las features. | Permite que el módulo agregador sea la única entrada del dominio business. |
| **sin providers propios** | BusinessModule no contiene lógica. | Es ensamblaje, no una nueva capa. |

# **2\. SeedersRunner: orden de arranque**

**seeders.runner.ts**

| export class SeedersRunner implements OnApplicationBootstrap {  constructor(    private readonly clientSeeder: ClientSeeder,    private readonly productTypeSeeder: ProductTypeSeeder,    private readonly productSeeder: ProductSeeder,  ) {}  async onApplicationBootstrap(): Promise\<void\> {    await this.clientSeeder.seed();    await this.productTypeSeeder.seed();    await this.productSeeder.seed();  }} |
| :---- |
| **ORDENApplication bootstrap → ClientSeeder → ProductTypeSeeder → ProductSeeder** |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **OnApplicationBootstrap** | Hook de Nest ejecutado después de inicializar la app. | Garantiza que providers y conexión ya existen. |
| **await secuencial** | Conserva orden. | ProductSeeder necesita un tipo de producto activo. |
| **Idempotencia** | Cada seeder comprueba existencia. | Reiniciar la app no debe duplicar demos. |

# **3\. AppModule final**

**app.module.ts**

| @Module({  imports: \[EnvironmentModule, SequelizeModule, BusinessModule\],  controllers: \[HealthController\],  providers: \[SeedersRunner\],})export class AppModule {} |
| :---- |
| **GRAFO FINALEnvironmentModule → SequelizeModule → BusinessModule → SeedersRunner \+ HealthController** |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **BusinessModule** | Reemplaza imports individuales de las cuatro features. | Reduce acoplamiento del módulo raíz. |
| **SeedersRunner provider** | Nest lo construye y ejecuta su hook. | Integra datos demo con el ciclo de vida. |
| **Environment \+ Sequelize** | Siguen transversales. | Negocio no se mezcla con configuración/DB. |

# **4\. Vitest unit/e2e config**

**vitest.config.e2e.ts**

| export default defineConfig({  plugins: \[tsconfigPaths()\],  test: {    globals: true,    root: './',    include: \['\*\*/\*.e2e-spec.ts'\],  },}); |
| :---- |

| Bloque / función | Qué hace | Por qué importa en la arquitectura |
| :---- | :---- | :---- |
| **tsconfigPaths** | Resuelve paths/imports según tsconfig. | Evita divergencia entre build y tests. |
| **include e2e** | Separa pruebas e2e de unitarias. | Permite scripts independientes. |
| **globals** | Habilita describe/it/expect globales. | Simplifica specs. |

**test/app.e2e-spec.ts**

| beforeAll(async () \=\> {  const moduleFixture \= await Test.createTestingModule({    imports: \[AppModule\],  }).compile();  app \= moduleFixture.createNestApplication();  app.setGlobalPrefix('api');  await app.init();});it('GET /api/health', async () \=\> {  const res \= await request(app.getHttpServer()).get('/api/health').expect(200);  expect(res.body).toEqual({ status: 'ok' });}); |
| :---- |
| **Detalle importante del manual**Este e2e no ejecuta main.ts, por eso no instala ResponseInterceptor, filtros ni otros globals definidos allí. Verifica AppModule real y necesita .env \+ BD. |

# **5\. Demo funcional**

**Arranque y lectura**

| npm run start:devcurl http://localhost:3002/api/healthcurl 'http://localhost:3002/api/clients?page=1\&limit=10'curl 'http://localhost:3002/api/product-types?page=1\&limit=10'curl 'http://localhost:3002/api/products?page=1\&limit=10' |
| :---- |
| **DEMOarranque → conectar BD → ejecutar seeders → consultar IDs reales → crear venta con clientId/productId reales** |
| **No asumir IDs**El manual indica anotar los id devueltos por los GET. Los seeders pueden haber corrido antes, por lo que no se debe suponer id=1. |

# **6\. Qué debe demostrar ISS-07**

* Las cuatro features quedan conectadas a través de BusinessModule.  
* Los seeders se ejecutan en orden y son idempotentes.  
* AppModule se simplifica: Environment \+ Sequelize \+ Business.  
* El health e2e levanta AppModule real.  
* Los GET permiten descubrir ids reales.  
* La venta integra clients \+ products y descuenta stock.  
* El sistema completo conserva las fronteras de Clean Architecture.