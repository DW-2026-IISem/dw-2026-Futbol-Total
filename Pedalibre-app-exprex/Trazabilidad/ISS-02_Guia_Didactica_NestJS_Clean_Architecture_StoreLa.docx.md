**ISS-02**

**Entorno Sequelize y common**

Guía didáctica: configuración transversal, errores, interceptores, ORM y arranque

| 1Configurarenv tipado | 2Protegererrores comunes | 3Observarinterceptores | 4ConectarSequelize | 5Arrancarhealth \+ main |
| :---: | :---: | :---: | :---: | :---: |

| META | Objetivo de esta guíaComprender con rigor cómo NestJS recibe configuración, construye providers globales, conecta Sequelize y aplica políticas transversales antes de que exista una feature de negocio. |
| :---: | :---- |

# **1\. Mapa mental de ISS-02**

ISS-02 sigue sin implementar clients. Su función es construir los servicios transversales que todas las features usarán: configuración de entorno, manejo uniforme de errores, interceptores, conexión ORM y arranque mínimo.

| TRANSVERSALconfig/, common/, infrastructure/database/, health/, main.ts y app.module.ts. Son piezas compartidas por todas las features. | FEATUREdomain/application/infrastructure/presentation de clients todavía no se programa aquí. Eso empieza en ISS-03. |
| :---- | :---- |

| CLAVE | Regla claveTransversal no significa “mezclar todo”. Significa que la responsabilidad se comparte entre features. Cada pieza transversal sigue teniendo una responsabilidad única. |
| :---: | :---- |

## **1.1 Flujo de arranque completo**

| Orden | Pieza | Qué ocurre |
| :---- | :---- | :---- |
| 1 | main.ts | NestFactory crea la aplicación a partir de AppModule. |
| 2 | AppModule | Importa EnvironmentModule y SequelizeModule. |
| 3 | EnvironmentModule | Carga .env y publica ENV\_CONFIG. |
| 4 | SequelizeModule | Recibe ENV\_CONFIG, crea Sequelize y autentica. |
| 5 | HealthController | Queda disponible cuando el arranque terminó. |
| 6 | Pipes/filtros/interceptores | Se aplican globalmente a las peticiones HTTP. |

| 1 | 4.1 Configuración de entornoLa app debe saber qué variables necesita y fallar temprano si faltan. |
| :---: | :---- |

## **2\. env.interface.ts — el contrato tipado**

**src/config/environment/env.interface.ts**

| export type DbDialect \= 'mysql' | 'postgres' | 'mssql' | 'oracle';export interface IDbBlock {  host: string;  port: number;  username: string;  password: string;  name: string;  connectString?: string;}export interface IEnvConfig {  port: number;  nodeEnv: string;  dbDialect: DbDialect;  mysql: IDbBlock;  postgres: IDbBlock;  mssql: IDbBlock;  oracle: IDbBlock;} |
| :---- |
| **ESQUEMA DE LECTURATipos admitidos → bloque común de conexión → configuración completa** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **DbDialect** | Restringe el dialecto a mysql | postgres | mssql | oracle. | Es una regla de tipos: evita que el resto del código trate cualquier texto como motor válido. |
| **IDbBlock** | Agrupa host, puerto, usuario, contraseña, nombre y connectString. | Representa los datos mínimos que necesita un adaptador de persistencia para conectarse. |
| **IEnvConfig** | Reúne puerto HTTP, entorno, dialecto y un bloque por motor. | Es el contrato interno que consumirá el resto de la capa transversal; no lee archivos ni abre conexiones. |

Este archivo no lee .env y no conoce Sequelize. Solo describe la forma interna de la configuración. Esa separación permite que otras piezas trabajen con un objeto estable en lugar de leer process.env por todas partes.

| Elemento de código | Qué significa | Por qué importa |
| :---- | :---- | :---- |
| DbDialect | Unión de literales: solo acepta los cuatro motores declarados. | Evita strings arbitrarios en el resto del sistema. |
| IDbBlock | Agrupa host, puerto, usuario, contraseña y nombre de base. | Todos los motores exponen un bloque con la misma forma. |
| connectString? | Campo opcional pensado para motores que lo necesiten, especialmente Oracle. | Evita crear una interfaz distinta por motor. |
| IEnvConfig | Objeto final que circulará por la aplicación. | Centraliza configuración y reduce acoplamiento a process.env. |

| TIPO | Qué debes recordarUna interface de TypeScript desaparece en runtime. Sirve al compilador y al desarrollador. La validación real de variables ocurre en env.validation.ts. |
| :---: | :---- |

## **3\. env.validation.ts — validar antes de arrancar**

**src/config/environment/env.validation.ts (fragmento representativo)**

| const DIALECTS \= \['mysql', 'postgres', 'mssql', 'oracle'\];export class EnvVariables {  @IsIn(DIALECTS, {    message: 'DB\_DIALECT debe ser mysql | postgres | mssql | oracle',  })  DB\_DIALECT\!: string;  @ValidateIf((o) \=\> o.DB\_DIALECT \=== 'mysql')  @IsNotEmpty({ message: 'DB\_MYSQL\_HOST es requerida (DB\_DIALECT=mysql)' })  DB\_MYSQL\_HOST?: string;  // ... mismo patrón para username/name y los demás motores}export function validateEnv(raw: Record\<string, unknown\>): EnvVariables {  const config \= plainToInstance(EnvVariables, raw);  const errors \= validateSync(config, { whitelist: false, forbidNonWhitelisted: false });  if (errors.length \> 0\) {    const messages \= errors      .map((e) \=\> Object.values(e.constraints ?? {}).join('; '))      .join(' | ');    throw new Error(\`Error de configuración: \${messages}\`);  }  return config;} |
| :---- |
| **ESQUEMA DE LECTURAprocess.env (texto) → EnvVariables → decoradores → validateSync() → error temprano o configuración válida** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **DIALECTS** | Lista blanca de dialectos permitidos. | Centraliza los valores válidos usados por @IsIn. |
| **@ValidateIf** | Activa una validación solo cuando el motor correspondiente está seleccionado. | Permite tener variables de cuatro motores sin exigir las cuatro configuraciones al mismo tiempo. |
| **validateSync()** | Ejecuta las reglas de class-validator de forma inmediata. | Si algo esencial falta, la aplicación falla al arrancar y no varias capas después. |
| **constraints** | Extrae mensajes concretos de las reglas que fallaron. | Convierte una estructura técnica de errores en un mensaje de configuración legible. |

| Elemento de código | Qué significa | Por qué importa |
| :---- | :---- | :---- |
| plainToInstance | Convierte el objeto plano process.env en una instancia de EnvVariables. | Los decoradores de class-validator operan sobre esa instancia. |
| @IsIn(DIALECTS) | Restringe DB\_DIALECT a valores permitidos. | La app falla si se pide un motor no soportado. |
| @ValidateIf(...) | Activa reglas solo para el motor seleccionado. | No obliga a definir variables de PostgreSQL cuando usas MySQL. |
| validateSync | Valida de forma síncrona durante el arranque. | El fallo aparece antes de aceptar tráfico. |
| throw new Error | Detiene el bootstrap con un mensaje consolidado. | “Fail fast”: una app mal configurada no debe quedar medio viva. |

| NO | Error de principianteLeer process.env directamente desde controllers, repositorios o use-cases. Eso reparte la configuración por todo el código y hace más difícil probar o cambiar el entorno. |
| :---: | :---- |

## **4\. db-env.ts — seleccionar un solo bloque activo**

**src/config/environment/db-env.ts**

| export function getDbBlock(cfg: IEnvConfig): IDbBlock {  switch (cfg.dbDialect) {    case 'mysql': return cfg.mysql;    case 'postgres': return cfg.postgres;    case 'mssql': return cfg.mssql;    case 'oracle': return cfg.oracle;    default:      throw new Error(\`Dialecto no soportado: \${String(cfg.dbDialect)}\`);  }} |
| :---- |
| **ESQUEMA DE LECTURAIEnvConfig → mirar dbDialect → escoger motor → devolver un único IDbBlock** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **getDbBlock()** | Recibe la configuración global y selecciona el bloque del motor activo. | Evita repetir if/switch de dialecto en factory, repositorios u otros servicios. |
| **switch** | Concentra la bifurcación tecnológica en un punto. | La decisión sobre el motor queda localizada en configuración/infraestructura. |
| **default** | Falla ante un dialecto no soportado. | Mantiene la función defensiva aunque la validación previa deba impedir ese caso. |

Este switch concentra una decisión que de otro modo se repetiría en varias partes. El resto del código pide “el bloque activo” sin preguntar diez veces qué motor está configurado.

| MAPA | Patrón mentalUna sola decisión en un solo lugar. Si mañana agregas otro motor, sabes dónde extender el selector. |
| :---: | :---- |

## **5\. env.config.ts — de variables crudas a objeto de aplicación**

**src/config/environment/env.config.ts**

| export const ENV\_CONFIG \= Symbol('ENV\_CONFIG');function toBlock(prefix: string, raw: Record\<string, unknown\>, defaultPort: number): IDbBlock {  return {    host: String(raw\[\`DB\_\${prefix}\_HOST\`\] ?? 'localhost'),    port: Number(raw\[\`DB\_\${prefix}\_PORT\`\] ?? defaultPort),    username: String(raw\[\`DB\_\${prefix}\_USERNAME\`\] ?? ''),    password: String(raw\[\`DB\_\${prefix}\_PASSWORD\`\] ?? ''),    name: String(raw\[\`DB\_\${prefix}\_NAME\`\] ?? ''),    connectString: raw\[\`DB\_\${prefix}\_CONNECT\_STRING\`\]      ? String(raw\[\`DB\_\${prefix}\_CONNECT\_STRING\`\])      : undefined,  };}export function loadEnvConfig(): IEnvConfig {  loadDotenv();  const raw \= process.env as Record\<string, unknown\>;  validateEnv(raw);  const dialect \= String(raw.DB\_DIALECT) as DbDialect;  return {    port: Number(raw.PORT ?? 3002),    nodeEnv: String(raw.NODE\_ENV ?? 'development'),    dbDialect: dialect,    mysql: toBlock('MYSQL', raw, 3306),    postgres: toBlock('POSTGRES', raw, 5432),    mssql: toBlock('MSSQL', raw, 1433),    oracle: toBlock('ORACLE', raw, 1521),  };} |
| :---- |
| **ESQUEMA DE LECTURA.env → dotenv → process.env → validateEnv() → toBlock() → IEnvConfig → token ENV\_CONFIG** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **ENV\_CONFIG** | Symbol usado como token de inyección. | Una interface TypeScript no existe en runtime; Nest necesita una identidad real. |
| **toBlock()** | Convierte variables con prefijo DB\_\* en IDbBlock. | Evita duplicar la misma conversión para cada motor. |
| **loadDotenv()** | Carga .env dentro de process.env. | Es la frontera de lectura del entorno. |
| **loadEnvConfig()** | Valida y construye IEnvConfig. | Entrega al resto de la app una configuración coherente y tipada. |

| Elemento de código | Qué significa | Por qué importa |
| :---- | :---- | :---- |
| ENV\_CONFIG \= Symbol(...) | Token único de inyección. | Evita depender de un nombre de clase concreto. |
| loadDotenv() | Carga .env en process.env. | Hace disponibles variables locales en desarrollo. |
| validateEnv(raw) | Valida antes de construir el objeto tipado. | No se propaga configuración inválida. |
| toBlock(...) | Normaliza cada motor a IDbBlock. | Reduce duplicación y conserva puertos por defecto. |
| return IEnvConfig | Produce la configuración interna final. | A partir de aquí otras piezas consumen un objeto estable. |

## **6\. environment.module.ts — publicar configuración con DI**

**src/config/environment/environment.module.ts**

| @Global()@Module({  providers: \[    {      provide: envConfig.KEY,      useFactory: () \=\> loadEnvConfig(),    },  \],  exports: \[envConfig.KEY\],})export class EnvironmentModule {} |
| :---- |
| **ESQUEMA DE LECTURANest crea EnvironmentModule → useFactory() → loadEnvConfig() → publica ENV\_CONFIG → otros providers lo inyectan** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **@Global()** | Hace que los providers exportados estén disponibles globalmente. | Es adecuado para configuración transversal compartida. |
| **provide** | Declara el token que Nest guardará en su contenedor DI. | La dependencia se solicita por token, no construyendo el objeto manualmente. |
| **useFactory** | Define cómo crear el valor asociado al token. | Permite ejecutar loadEnvConfig() al construir el grafo. |
| **exports** | Expone ENV\_CONFIG fuera del módulo. | Sin exportarlo, otros módulos no podrían inyectarlo. |

| Elemento de código | Qué significa | Por qué importa |
| :---- | :---- | :---- |
| @Global() | Hace que el provider exportado quede disponible globalmente tras importar el módulo una vez. | Evita importar EnvironmentModule en cada feature. |
| provide: envConfig.KEY | Declara el token solicitado por otros providers. | Separa consumidor de implementación. |
| useFactory | Nest llama una función para construir el valor. | Permite cargar y validar al arrancar. |
| exports | Expone el token fuera del módulo. | Sin export, otros módulos no podrían inyectarlo. |

## **7\. index.ts — barrel de exportación**

**src/config/environment/index.ts**

| export \* from './env.interface.js';export \* from './env.validation.js';export \* from './db-env.js';export \* from './env.config.js';export \* from './environment.module.js'; |
| :---- |
| **ESQUEMA DE LECTURAArchivos internos → index.ts → punto único de exportación** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **export \*** | Reexporta símbolos de otro archivo. | Reduce imports largos y centraliza la superficie pública. |
| **index.ts** | Actúa como barrel. | Organiza imports; no agrega lógica ni una nueva capa. |

El barrel no agrega lógica. Solo crea un punto cómodo de exportación. Es una herramienta de organización, no una capa.

| 2 | 4.2–4.3 Excepciones y filtro globalSeparar el significado del error de la forma HTTP con la que se responde. |
| :---: | :---- |

## **8\. Jerarquía de excepciones transversales**

**src/common/exceptions/\***

| export class ApplicationException extends Error {  constructor(public readonly statusCode: number, message: string) {    super(message);    this.name \= this.constructor.name;  }}export class BusinessRuleException extends ApplicationException {  constructor(message: string) { super(409, message); }}export class DomainException extends ApplicationException {  constructor(message: string) { super(400, message); }}export class EntityNotFoundException extends ApplicationException {  constructor(message \= 'Entidad no encontrada') { super(404, message); }} |
| :---- |
| **ESQUEMA DE LECTURAError específico → hereda ApplicationException → statusCode \+ message → filtro global → HTTP** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **ApplicationException** | Base común con statusCode y mensaje. | Separa la semántica del error de la respuesta HTTP concreta. |
| **BusinessRuleException** | Especializa conflictos de regla con 409\. | Las features pueden heredarla para errores como email duplicado. |
| **DomainException** | Representa dato/regla inválida con 400\. | Permite expresar fallos sin manipular Response. |
| **EntityNotFoundException** | Representa ausencia de entidad con 404\. | Las features especializan el mensaje manteniendo la política transversal. |

| Clase | Código | Uso conceptual |
| :---- | :---- | :---- |
| ApplicationException | variable | Base común que transporta mensaje \+ statusCode. |
| BusinessRuleException | 409 | Conflicto con regla de negocio: duplicado, stock, estado. |
| DomainException | 400 | Dato o transición de negocio inválida. |
| EntityNotFoundException | 404 | Entidad solicitada no existe. |

| CAPAS | ImportanteEl dominio de una feature puede crear una excepción específica como ClientNotFoundException heredando de EntityNotFoundException. La feature nombra el problema; common define la política HTTP transversal. |
| :---: | :---- |

## **9\. global-exception.filter.ts — una salida uniforme**

**src/common/filters/global-exception.filter.ts (estructura esencial)**

| @Catch()export class GlobalExceptionFilter implements ExceptionFilter {  catch(exception: unknown, host: ArgumentsHost): void {    const ctx \= host.switchToHttp();    const res \= ctx.getResponse\<Response\>();    const req \= ctx.getRequest\<Request\>();    let status \= HttpStatus.INTERNAL\_SERVER\_ERROR;    let message: string | string\[\] \= 'Error interno del servidor';    if (exception instanceof ApplicationException) {      status \= exception.statusCode;      message \= exception.message;    } else if (exception instanceof HttpException) {      status \= exception.getStatus();      const body \= exception.getResponse();      // extrae message    } else if (exception instanceof Error) {      message \= exception.message;    }    res.status(status).json({      statusCode: status,      message: Array.isArray(message) ? message.join('; ') : message,      timestamp: new Date().toISOString(),      path: req.url,    });  }} |
| :---- |
| **ESQUEMA DE LECTURAExcepción → @Catch() → clasificar tipo → calcular status/message → JSON uniforme** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **@Catch()** | Registra un filtro capaz de capturar excepciones. | Es una pieza transversal de salida de errores. |
| **switchToHttp()** | Obtiene request y response del contexto HTTP. | El filtro sí conoce HTTP porque traduce errores al transporte. |
| **ApplicationException** | Recupera statusCode de errores propios. | Respeta la jerarquía definida en common. |
| **HttpException** | Integra errores nativos de Nest. | Pipes y framework terminan en el mismo formato. |
| **res.status().json()** | Materializa la respuesta HTTP. | La traducción a HTTP queda aquí, no en domain/application. |

| Elemento de código | Qué significa | Por qué importa |
| :---- | :---- | :---- |
| @Catch() | Captura cualquier excepción no manejada por otro filtro. | Centraliza la traducción de errores. |
| switchToHttp() | Accede al contexto HTTP de Nest. | Permite leer Request y Response. |
| ApplicationException | Reconoce errores propios del proyecto. | Usa el statusCode definido por la jerarquía. |
| HttpException | Reconoce errores nativos de Nest, por ejemplo ValidationPipe. | Unifica errores del framework con los propios. |
| Error genérico | Cae en 500 por defecto. | Evita respuestas inconsistentes. |
| json uniforme | statusCode, message, timestamp, path. | El frontend recibe una forma predecible. |

| 3 | 4.4 InterceptoresCódigo que se ejecuta alrededor del handler sin contaminar el caso de uso. |
| :---: | :---- |

## **10\. ResponseInterceptor — envelope de éxito**

**response.interceptor.ts — núcleo**

| return next.handle().pipe(  map((data) \=\> ({    statusCode: res.statusCode,    message: 'OK',    data: data ?? null,    timestamp: new Date().toISOString(),  })),); |
| :---- |
| **ESQUEMA DE LECTURAController devuelve data → next.handle() → map() → envelope → cliente HTTP** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **next.handle()** | Representa la ejecución del siguiente handler. | El interceptor lo envuelve sin sustituirlo. |
| **map()** | Transforma solo resultados exitosos. | Añade el envelope sin tocar los casos de uso. |
| **data ?? null** | Evita data undefined. | Mantiene una forma estable de respuesta. |

next.handle() representa la ejecución real del controller. map transforma únicamente la respuesta exitosa. Si el handler lanza una excepción, esta ruta no genera el envelope de éxito; el filtro global se encarga del error.

## **11\. LoggingInterceptor — observabilidad**

**logging.interceptor.ts — núcleo**

| const start \= Date.now();return next.handle().pipe(  tap(() \=\> {    const ms \= Date.now() \- start;    this.logger.log(\`\${req.method} \${req.url} → \${ms}ms\`);  }),); |
| :---- |
| **ESQUEMA DE LECTURAGuardar tiempo → ejecutar handler → tap() → calcular ms → Logger** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **Date.now()** | Captura el instante inicial. | Permite medir duración sin contaminar negocio. |
| **tap()** | Observa el flujo sin cambiarlo. | Adecuado para logging y métricas. |
| **Logger** | Registra método, URL y duración. | La observabilidad queda transversal. |

tap observa el flujo sin modificar el valor. La responsabilidad es medir y registrar, no decidir negocio.

## **12\. TimeoutInterceptor — límite temporal**

**timeout.interceptor.ts — núcleo**

| return next.handle().pipe(  timeout(5000),  catchError((err) \=\>    throwError(() \=\>      err instanceof TimeoutError ? new RequestTimeoutException() : err,    ),  ),); |
| :---- |
| **ESQUEMA DE LECTURAHandler → timeout(5000) → TimeoutError → RequestTimeoutException → filtro global** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **timeout(5000)** | Impone máximo de 5 segundos. | Protege ante handlers excesivamente lentos. |
| **catchError()** | Intercepta el error observable. | Traduce solo timeout y deja pasar otros errores. |
| **RequestTimeoutException** | Excepción HTTP de Nest para timeout. | Luego el filtro global la serializa. |

Si el flujo tarda más de 5 segundos, RxJS genera TimeoutError. El interceptor lo traduce a RequestTimeoutException de Nest. De nuevo: política técnica transversal, no regla de clients.

| MAPA | Cómo distinguir filtro e interceptorInterceptor: envuelve ejecución antes/después. Filtro: actúa cuando ya existe una excepción. Pipe: transforma/valida parámetros antes de entrar al handler. |
| :---: | :---- |

| 4 | 4.5 Persistencia SequelizeEl ORM se conecta aquí, antes de que existan modelos de negocio registrados. |
| :---: | :---- |

## **13\. sequelize.factory.ts — fabricar una instancia Sequelize**

**src/infrastructure/database/sequelize/sequelize.factory.ts**

| export const ALL\_MODELS: any\[\] \= \[\];export function sequelizeFactory(cfg: IEnvConfig): Sequelize {  const block \= getDbBlock(cfg);  const options: Record\<string, unknown\> \= {    dialect: cfg.dbDialect,    host: block.host,    port: block.port,    username: block.username,    password: block.password,    database: block.name,    models: ALL\_MODELS,    logging: false,  };  if (cfg.dbDialect \=== 'oracle' && block.connectString) {    options.connectString \= block.connectString;  }  return new Sequelize(options);} |
| :---- |
| **ESQUEMA DE LECTURAIEnvConfig → getDbBlock() → opciones Sequelize → new Sequelize(); ALL\_MODELS vacío en ISS-02** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **ALL\_MODELS** | Lista de modelos ORM registrados. | ISS-02 aún no tiene features; se llenará desde ISS-03. |
| **sequelizeFactory()** | Construye la instancia Sequelize desde configuración. | Centraliza la creación del adaptador de BD. |
| **options** | Traduce IEnvConfig al formato Sequelize. | Encapsula el detalle ORM dentro de infraestructura. |
| **connectString** | Añade detalle específico de Oracle. | Las diferencias tecnológicas se localizan aquí. |

| Elemento de código | Qué significa | Por qué importa |
| :---- | :---- | :---- |
| ALL\_MODELS \= \[\] | En ISS-02 aún no hay modelos de feature. | Permite autenticar conexión sin registrar ClientModel todavía. |
| getDbBlock(cfg) | Selecciona el bloque del motor activo. | La factoría no repite el switch. |
| options | Traduce IEnvConfig a opciones de Sequelize. | Aquí vive el detalle tecnológico del ORM. |
| logging: false | Desactiva SQL verboso del ORM. | Decisión de infraestructura. |
| new Sequelize(options) | Crea la instancia, pero todavía no la comparte. | El módulo será quien la publique como provider. |

| ORM | Frontera arquitectónicaSequelize pertenece a infraestructura. Domain y application nunca deben importar Sequelize. |
| :---: | :---- |

## **14\. sequelize.module.ts — provider global de conexión**

**src/infrastructure/database/sequelize/sequelize.module.ts**

| export const SEQUELIZE \= 'SEQUELIZE';@Global()@Module({  providers: \[    {      provide: SEQUELIZE,      inject: \[envConfig.KEY\],      useFactory: async (cfg: IEnvConfig) \=\> {        const sequelize \= sequelizeFactory(cfg);        await sequelize.authenticate();        await sequelize.sync({ alter: false });        return sequelize;      },    },  \],  exports: \[SEQUELIZE\],})export class SequelizeModule {} |
| :---- |
| **ESQUEMA DE LECTURANest crea EnvironmentModule → useFactory() → loadEnvConfig() → publica ENV\_CONFIG → otros providers lo inyectan** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **@Global()** | Hace que los providers exportados estén disponibles globalmente. | Es adecuado para configuración transversal compartida. |
| **provide** | Declara el token que Nest guardará en su contenedor DI. | La dependencia se solicita por token, no construyendo el objeto manualmente. |
| **useFactory** | Define cómo crear el valor asociado al token. | Permite ejecutar loadEnvConfig() al construir el grafo. |
| **exports** | Expone ENV\_CONFIG fuera del módulo. | Sin exportarlo, otros módulos no podrían inyectarlo. |

| Elemento de código | Qué significa | Por qué importa |
| :---- | :---- | :---- |
| SEQUELIZE | Token con el que otros providers pedirán la conexión. | Evita hacer new Sequelize() en repositorios/controllers. |
| inject: \[envConfig.KEY\] | Declara dependencia del provider de configuración. | Nest resuelve el orden automáticamente. |
| useFactory async | Construye el provider con lógica asíncrona. | Permite esperar conexión antes de terminar bootstrap. |
| authenticate() | Prueba credenciales/conectividad. | Si falla, la app no queda escuchando como si todo estuviera bien. |
| sync({ alter:false }) | Sincroniza modelos registrados sin alterar columnas automáticamente. | En ISS-02 ALL\_MODELS está vacío; en ISS-03 entra ClientModel. |
| exports: \[SEQUELIZE\] | Hace inyectable la conexión fuera del módulo. | Los repositorios de features la usarán después. |

| 5 | 4.6 Health y arranqueComponer todos los servicios transversales en una aplicación HTTP mínima. |
| :---: | :---- |

## **15\. health.controller.ts — una ruta técnica**

**src/health/health.controller.ts**

| @Controller('health')export class HealthController {  @Get()  check() {    return { status: 'ok' };  }} |
| :---- |
| **ESQUEMA DE LECTURAGET /api/health → HealthController.check() → { status: 'ok' }** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **@Controller('health')** | Define el prefijo local de la ruta. | Con el prefijo global api termina en /api/health. |
| **@Get()** | Mapea el verbo GET. | Expone una comprobación técnica mínima. |
| **check()** | Devuelve un objeto simple. | No consulta negocio; confirma que el proceso HTTP arrancó. |

Con el prefijo global /api, esta ruta termina siendo GET /api/health. No es una feature de negocio; sirve para comprobar que el proceso HTTP está vivo. Si Sequelize falla durante bootstrap, la ruta ni siquiera llega a estar disponible.

## **16\. main.ts — bootstrap de Nest**

**src/main.ts — estructura**

| async function bootstrap() {  const app \= await NestFactory.create(AppModule);  app.setGlobalPrefix('api');  app.enableCors({ origin: 'http://localhost:4200', credentials: true });  app.useGlobalPipes(new ValidationPipe({    whitelist: true,    forbidNonWhitelisted: true,    transform: true,  }));  app.useGlobalFilters(new GlobalExceptionFilter());  app.useGlobalInterceptors(    new ResponseInterceptor(),    new LoggingInterceptor(),    new TimeoutInterceptor(),  );  // Swagger...  await app.listen(process.env.PORT ?? 3002);}await bootstrap(); |
| :---- |
| **ESQUEMA DE LECTURAAppModule → NestFactory.create() → prefijo/CORS/pipes/filtro/interceptores → Swagger → listen()** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **NestFactory.create()** | Crea la aplicación y el grafo raíz. | Es el arranque real de Nest. |
| **setGlobalPrefix** | Anteponer /api a todas las rutas. | Uniforma el contrato HTTP. |
| **ValidationPipe** | Valida y transforma DTOs globalmente. | Evita repetir validación en controllers. |
| **useGlobalFilters** | Registra el traductor de errores. | Todos los fallos siguen el mismo formato. |
| **useGlobalInterceptors** | Instala envelope, logging y timeout. | Políticas transversales rodean handlers. |
| **SwaggerModule** | Genera documentación OpenAPI. | Documenta sin mezclar reglas de negocio. |
| **listen()** | Abre el puerto HTTP. | Ocurre después de construir correctamente los módulos. |

| Elemento de código | Qué significa | Por qué importa |
| :---- | :---- | :---- |
| NestFactory.create(AppModule) | Crea el contenedor de la aplicación a partir del módulo raíz. | Dispara resolución de imports y providers. |
| setGlobalPrefix('api') | Prefija todas las rutas. | health se vuelve /api/health; clients será /api/clients. |
| enableCors | Permite peticiones del frontend Angular local. | Política de borde HTTP. |
| ValidationPipe | Valida DTOs y transforma valores. | Se aplicará automáticamente a features posteriores. |
| useGlobalFilters | Registra el filtro uniforme. | Todos los errores pasan por la misma política. |
| useGlobalInterceptors | Registra envelope, logging y timeout. | Todos los handlers comparten comportamiento transversal. |
| SwaggerModule | Genera documentación OpenAPI. | Describe la API sin meter lógica en domain. |
| listen | Empieza a aceptar conexiones. | Ocurre después de que AppModule resolvió sus providers. |

## **17\. app.module.ts — composición mínima**

**src/app.module.ts — ISS-02**

| @Module({  imports: \[EnvironmentModule, SequelizeModule\],  controllers: \[HealthController\],  providers: \[\],})export class AppModule {} |
| :---- |
| **ESQUEMA DE LECTURAAppModule → EnvironmentModule \+ SequelizeModule → HealthController → aplicación mínima ISS-02** |

| Bloque / función | Qué hace | Cómo leerlo dentro de la arquitectura |
| :---- | :---- | :---- |
| **imports** | Incluye módulos que aportan providers. | Conecta configuración y BD al grafo raíz. |
| **controllers** | Registra HealthController. | Nest crea rutas solo de controllers cargados. |
| **providers: \[\]** | No hay providers propios del módulo raíz. | Las features de negocio aún no se incorporan. |

AppModule es el punto de ensamblaje raíz. En ISS-02 solo importa configuración y base de datos, y registra HealthController. Todavía no existe ClientsModule aquí.

| DI | Orden mentalAppModule no ejecuta manualmente EnvironmentModule y después SequelizeModule. Nest construye un grafo de dependencias y resuelve providers según lo que cada uno inyecta. |
| :---: | :---- |

# **18\. Árbol resultante al terminar ISS-02**

**Mapa transversal**

| src/├── config/environment/│   ├── env.interface.ts│   ├── env.validation.ts│   ├── db-env.ts│   ├── env.config.ts│   ├── environment.module.ts│   └── index.ts├── common/│   ├── exceptions/│   ├── filters/global-exception.filter.ts│   └── interceptors/├── infrastructure/database/sequelize/│   ├── sequelize.factory.ts│   └── sequelize.module.ts├── health/health.controller.ts├── main.ts└── app.module.ts |
| :---- |

## **19\. Qué NO debe ocurrir**

* Un controller haciendo new Sequelize().  
* Un use-case leyendo process.env.  
* Una excepción de negocio construyendo directamente res.status(...).  
* Cada feature creando su propia conexión a la base de datos.  
* Reglas de negocio dentro de interceptores o filtros.

## **20\. Checklist de cierre ISS-02**

| Comprobación | Debe ocurrir |
| :---- | :---- |
| Variables válidas | La app arranca. |
| DB\_DIALECT inválido | El arranque falla con mensaje claro. |
| Credenciales BD inválidas | authenticate() impide terminar bootstrap. |
| GET /api/health | Devuelve envelope de éxito. |
| Error HTTP | Tiene statusCode/message/timestamp/path. |
| SQL/ORM | Solo aparece en infrastructure/database, no en domain/application. |

## **21\. Autoevaluación antes de ISS-03**

* ¿Por qué env.interface.ts no valida nada en runtime?  
* ¿Qué diferencia hay entre token ENV\_CONFIG y la clase EnvironmentModule?  
* ¿Por qué SequelizeModule usa inject \+ useFactory?  
* ¿Qué diferencia hay entre interceptor, filtro y pipe?  
* ¿Por qué ALL\_MODELS está vacío en ISS-02?  
* ¿Qué pasaría si ClientsRepository hiciera new Sequelize() por su cuenta?

| SIGUE | Puente a ISS-03Ahora la “casa” transversal está lista. ISS-03 agrega la primera feature completa y demostrará cómo una feature usa estas piezas sin mezclarlas con su negocio. |
| :---: | :---- |

