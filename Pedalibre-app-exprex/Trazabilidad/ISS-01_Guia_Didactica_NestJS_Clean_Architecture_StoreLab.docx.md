**ISS-01**

**Esqueleto NestJS arrancable**

Guía didáctica para aprender NestJS \+ Clean Architecture por feature

| 1Prepararraíz del proyecto | 2ConfigurarESM \+ tooling | 3InstalarORM \+ utilidades | 4Diseñarcarpetas por feature |
| :---: | :---: | :---: | :---: |

| META | Objetivo de este primer archivoEntender qué construye ISS-01, por qué cada comando existe y cómo prepara el terreno para Clean Architecture sin crear todavía lógica de negocio. |
| :---: | :---- |

Base: backend-manual.md (ISS-01) \+ explicacion-backend-capas.md (ISS-01).

# **1\. Antes de tocar código: qué significa ISS-01**

ISS-01 no construye todavía clientes, productos ni ventas. Su trabajo es preparar un proyecto NestJS que pueda arrancar, compilarse y quedar organizado para que las features posteriores entren en una estructura limpia.

| LO QUE SÍ HACE ISS-01Crea el proyecto NestJS, lo convierte a ESM, instala dependencias, define tooling, prepara variables de entorno y crea el árbol de carpetas. | LO QUE TODAVÍA NO HACENo conecta la base de datos, no crea ClientModel, no implementa repositorios, no crea controllers de negocio y no aplica reglas de clients. |
| :---- | :---- |

| CLAVE | Idea mentalPiensa en ISS-01 como construir la casa vacía: paredes, habitaciones, electricidad y nombres de los espacios. En ISS-02 conectaremos servicios transversales. En ISS-03 entra la primera feature real: clients. |
| :---: | :---- |

## **1.1 ¿Dónde está Clean Architecture en ISS-01 si aún no hay negocio?**

La arquitectura aparece primero como una decisión de organización. Se crean los “cajones” que luego contendrán domain, application, infrastructure y presentation para cada feature. Todavía están vacíos; eso es correcto.

| Capa futura | Carpeta | Responsabilidad | ¿Hay código de negocio en ISS-01? |
| :---- | :---- | :---- | :---- |
| **domain** | domain/ | Entidades, puertos, excepciones | No |
| **application** | application/ | DTO, mappers, use-cases | No |
| **infrastructure** | infrastructure/persistence/ | Modelos ORM, repositorios, seeders | No |
| **presentation** | presentation/http/ | Controllers HTTP | No |

| 3.1 | Crear la carpeta del proyectoPrimero creamos el contenedor físico donde vivirá todo el backend. |
| :---: | :---- |

| mkdir \-p back-fullchmod \-R 777 back-fullcd back-full |
| :---- |

## **¿Qué hace cada línea?**

| Comando | Qué significa | Qué debes recordar |
| :---- | :---- | :---- |
| **mkdir \-p back-full** | Crea la carpeta. \-p evita error si ya existe. | Todavía no es NestJS; solo prepara el directorio. |
| **chmod \-R 777 back-full** | Da lectura, escritura y ejecución a todos de forma recursiva. | El manual lo usa para laboratorio. No es una recomendación de producción. |
| **cd back-full** | Entra a la carpeta. | Los siguientes comandos asumen que estás aquí. |

| CHECK | Punto de controlSi ejecutas pwd, debes estar dentro de .../back-full antes de lanzar nest new. |
| :---: | :---- |

| 3.2 | Crear el scaffold con Nest CLINest genera la estructura mínima y las dependencias base del framework. |
| :---: | :---- |

| nest new . \--package-manager npm \--skip-git \--no-observe |
| :---- |

## **Desarmemos el comando**

| Parte | Explicación |
| :---- | :---- |
| **nest new .** | Crea un proyecto NestJS en la carpeta actual. El punto “.” evita crear otra subcarpeta. |
| **\--package-manager npm** | Usa npm sin preguntar. |
| **\--skip-git** | Evita que Nest inicialice un repositorio Git automáticamente. |
| **\--no-observe** | En Nest 12 evita el prompt de observabilidad indicado por el manual. |

Después de este comando aparecen archivos como package.json, tsconfig.json, nest-cli.json, src/main.ts, src/app.module.ts, src/app.controller.ts, src/app.service.ts y test/. Ese contenido todavía corresponde al “hola mundo” de Nest.

| OJO | No confundas framework con capaNestJS es el contenedor y mecanismo de ensamblaje. “Nest” no es una de las cuatro capas. Más adelante, domain no deberá depender de NestJS. |
| :---: | :---- |

| 3.3 | Convertir el proyecto a ESM y definir scriptsAquí modificamos package.json sin destruir las dependencias que nest new ya instaló. |
| :---: | :---- |

El manual usa un pequeño script de Node para leer el package.json existente, cambiar algunas propiedades y volverlo a escribir. Esto es importante porque reemplazar todo el archivo borraría dependencias base de Nest.

| node \--input-type=module \<\<'EOF\_app-backend-manual'import { readFileSync, writeFileSync } from 'node:fs';const pkg \= JSON.parse(readFileSync('package.json', 'utf8'));pkg.name \= 'backend-nest-ia';pkg.type \= 'module';pkg.scripts \= {  build: 'nest build',  start: 'nest start',  'start:dev': 'npm run free:port && nest start \--watch',  'start:prod': 'node dist/main',  lint: 'oxlint src/ test/',  format: 'prettier \--write "src/\*\*/\*.ts" "test/\*\*/\*.ts"',  test: 'vitest run',  'test:watch': 'vitest',  'test:cov': 'vitest run \--coverage',  'test:e2e': 'vitest run \--config ./vitest.config.e2e.ts',  'free:port': 'node scripts/free-port.js',};writeFileSync('package.json', JSON.stringify(pkg, null, 2\) \+ '\\n');EOF\_app-backend-manual |
| :---- |

## **¿Qué significa ESM aquí?**

| CommonJSEs el sistema de módulos que Nest genera por defecto según el manual. | ESMEl proyecto se marcará con "type": "module" y usará resolución NodeNext; los imports relativos se escribirán con .js. |
| :---- | :---- |

| REGLA | Regla que debes memorizarEn este proyecto: package.json tiene "type": "module" y los imports relativos del código TypeScript terminan en .js, por ejemplo: import { AppModule } from "./app.module.js". |
| :---: | :---- |

## **3.3.1 ¿Para qué sirve cada script de package.json?**

| Script | Intención |
| :---- | :---- |
| **npm run build** | Compila con Nest. |
| **npm start** | Arranca la aplicación con Nest. |
| **npm run start:dev** | Libera el puerto y arranca en modo watch. |
| **npm run start:prod** | Ejecuta dist/main después de compilar. |
| **npm run lint** | Revisa problemas con oxlint. |
| **npm run format** | Aplica Prettier sobre src y test. |
| **npm test** | Ejecuta Vitest una vez. |
| **npm run test:watch** | Vitest permanece observando cambios. |
| **npm run test:cov** | Ejecuta pruebas y calcula cobertura. |
| **npm run test:e2e** | Pruebas end-to-end con configuración específica. |

| 3.4 | Instalar dependencias adicionalesAquí aparece una decisión arquitectónica importante: se elige Sequelize como ORM. |
| :---: | :---- |

**Dependencias de ejecución**

| npm install @nestjs/swagger \\  sequelize sequelize-typescript mysql2 pg oracledb tedious \\  class-validator class-transformer dotenv |
| :---- |

**Dependencias de desarrollo**

| npm install \-D @types/supertest \\  vitest @vitest/coverage-v8 vite-tsconfig-paths supertest \\  oxlint source-map-support |
| :---- |

## **La distinción más importante: ORM ≠ motor de base de datos**

| ORM: Sequelizesequelize \+ sequelize-typescript. Es la librería que el código usará para mapear objetos/modelos y operar persistencia. | Drivers del motormysql2, pg, oracledb y tedious permiten conectarse a motores diferentes. DB\_DIALECT elegirá el motor activo después. |
| :---- | :---- |

| ORM | ArquitecturaLa elección de Sequelize ocurre aquí como dependencia técnica, pero domain y application no deberían importar Sequelize. En ISS-02 se cableará la conexión; en ISS-03 aparecerá ClientModel dentro de infrastructure. |
| :---: | :---- |

| Paquete | Para qué está en el proyecto |
| :---- | :---- |
| **@nestjs/swagger** | OpenAPI / Swagger |
| **sequelize \+ sequelize-typescript** | ORM y decoradores @Table / @Column |
| **mysql2 / pg / oracledb / tedious** | Drivers de motores |
| **class-validator** | Validación declarativa |
| **class-transformer** | Conversión de objetos |
| **dotenv** | Carga .env |
| **vitest** | Pruebas |
| **supertest** | Cliente HTTP para e2e |
| **oxlint** | Lint |
| **source-map-support** | Stack traces |

| 3.5 | Configurar TypeScript y toolingEstos archivos definen cómo se compila, formatea, analiza y construye el proyecto. |
| :---: | :---- |

## **3.5.1 tsconfig.json \- reglas de TypeScript**

| {  "compilerOptions": {    "module": "nodenext",    "moduleResolution": "nodenext",    "resolvePackageJsonExports": true,    "esModuleInterop": true,    "isolatedModules": true,    "declaration": true,    "removeComments": true,    "emitDecoratorMetadata": true,    "experimentalDecorators": true,    "allowSyntheticDefaultImports": true,    "target": "ES2023",    "sourceMap": true,    "outDir": "./dist",    "incremental": true,    "skipLibCheck": true,    "strict": true,    "strictPropertyInitialization": false,    "types": \["vitest/globals", "node"\]  }} |
| :---- |

| Opción | Lectura para principiante |
| :---- | :---- |
| **module / moduleResolution \= nodenext** | Alinean TypeScript con el modelo ESM/Node del proyecto. |
| **emitDecoratorMetadata** | Emite metadatos usados por decoradores/inyección. |
| **experimentalDecorators** | Permite decoradores de Nest y sequelize-typescript. |
| **target \= ES2023** | Código de salida moderno. |
| **outDir \= ./dist** | La compilación se genera en dist/. |
| **strict \= true** | TypeScript aplica comprobaciones estrictas. |
| **sourceMap \= true** | Relaciona errores compilados con el código fuente. |

## **3.5.2 Los otros archivos de tooling**

| FILE | tsconfig.build.jsonDefine qué entra al build: src/; excluye test, dist y spec. |
| :---: | :---- |

| FILE | nest-cli.jsonIndica sourceRoot \= src y limpia dist al compilar. |
| :---: | :---- |

| FILE | .prettierrcFormatea con comillas simples y trailing comma. |
| :---: | :---- |

| FILE | oxlint.jsonConfigura reglas del linter. |
| :---: | :---- |

| FILE | .gitignoreEvita versionar node\_modules, dist, .env, logs y artefactos. |
| :---: | :---- |

| 3.6 | Script auxiliar y variables de entornoTodavía no abrimos una conexión a BD; solo dejamos preparado el contrato de configuración. |
| :---: | :---- |

## **3.6.1 scripts/free-port.js**

| import { execSync } from 'node:child\_process';const port \= process.env.PORT ?? 3002;const label \= \`\[free-port\]\`;function findAndKill(p) {  const commands \= \[\`lsof \-ti tcp:\${p}\`, \`fuser \${p}/tcp 2\>/dev/null\`\];  for (const cmd of commands) {    try {      const out \= execSync(cmd, { encoding: 'utf8' }).trim();      if (\!out) continue;      for (const pid of out.split(/\\s+/).filter(Boolean)) {        try {          execSync(\`kill \-9 \${pid}\`, { stdio: 'ignore' });          console.log(\`\${label} liberado: mató PID \${pid} en el puerto \${p}\`);        } catch { /\* ya no existe \*/ }      }      return;    } catch { /\* comando no disponible o puerto libre \*/ }  }  console.log(\`\${label} puerto \${p} libre\`);}findAndKill(port); |
| :---- |

Este script se ejecuta antes de start:dev. Busca un proceso usando el puerto y lo termina para que Nest pueda arrancar. En el manual, el puerto por defecto es 3002\.

| FLUJO | Conexión con package.jsonstart:dev \= npm run free:port && nest start \--watch. Primero libera el puerto; solo si ese paso termina, inicia Nest en modo observación. |
| :---: | :---- |

## **3.6.2 .env.example y .env**

| PORT=3002NODE\_ENV=developmentDB\_DIALECT=mysqlDB\_MYSQL\_HOST=\<IP\_HOST\_DOCKER\>DB\_MYSQL\_PORT=3306DB\_MYSQL\_USERNAME=adminDB\_MYSQL\_PASSWORD=\<PASSWORD\>DB\_MYSQL\_NAME=tecnogua\_ia |
| :---- |

| cp .env.example .env |
| :---- |

| .env.examplePlantilla compartible: enseña qué variables necesita el proyecto, sin poner credenciales reales. | .envCopia local que sí contiene los valores del entorno. Está ignorada por Git. |
| :---- | :---- |

| LIMITE | Todavía no hay conexiónISS-01 solo prepara variables. La validación y apertura de la base de datos corresponden a ISS-02. |
| :---: | :---- |

| 3.7 | Crear la estructura de carpetasAquí se ve por primera vez, físicamente, la arquitectura por feature. |
| :---: | :---- |

| mkdir \-p src/common/exceptions src/common/filters src/common/interceptorsmkdir \-p src/config/environmentmkdir \-p src/infrastructure/database/sequelize src/infrastructure/database/seedersmkdir \-p src/healthmkdir \-p src/features/businessfor f in clients product-types products sales; do  mkdir \-p "src/features/business/\$f/domain/entities" \\           "src/features/business/\$f/domain/interfaces" \\           "src/features/business/\$f/domain/exceptions" \\           "src/features/business/\$f/application/dto" \\           "src/features/business/\$f/application/mappers" \\           "src/features/business/\$f/application/use-cases" \\           "src/features/business/\$f/infrastructure/persistence/models" \\           "src/features/business/\$f/infrastructure/persistence/repositories" \\           "src/features/business/\$f/infrastructure/persistence/seeders" \\           "src/features/business/\$f/presentation/http/controllers"done |
| :---- |

## **Cómo leer el árbol resultante**

| src/├── common/                         \# transversal├── config/environment/             \# transversal├── infrastructure/database/        \# transversal: conexión ORM├── health/                         \# transversal└── features/business/    ├── clients/    │   ├── domain/    │   │   ├── entities/    │   │   ├── interfaces/    │   │   └── exceptions/    │   ├── application/    │   │   ├── dto/    │   │   ├── mappers/    │   │   └── use-cases/    │   ├── infrastructure/persistence/    │   │   ├── models/    │   │   ├── repositories/    │   │   └── seeders/    │   └── presentation/http/controllers/    ├── product-types/  \# mismo patrón    ├── products/       \# mismo patrón    └── sales/          \# mismo patrón |
| :---- |

| FEATURE | Por feature, no por capa globalNo tendrás un único src/domain/ con todo el negocio. Cada feature (clients, products, etc.) contiene sus propias cuatro capas. Eso mantiene juntas las piezas que cambian por el mismo motivo. |
| :---: | :---- |

## **3.7.1 Transversal vs feature**

| TRANSVERSALconfig · common · database · healthSirve a todas las features. | FEATUREclients · product-types · products · salesCada una tendrá domain \+ application \+ infrastructure \+ presentation. |
| :---- | :---- |
|  |  |

ISS-01 crea ambos tipos de espacios, pero sin implementar todavía la lógica interna de las features.

# **4\. ¿Cómo sé que entendí y terminé ISS-01?**

No basta con ejecutar comandos. Antes de avanzar, debes poder explicar qué cambió y qué todavía no existe.

| ✓ | Comprobación | Qué debes poder decir |
| :---- | :---- | :---- |
| **□** | **Carpeta creada** | Estás dentro de back-full. |
| **□** | **Scaffold Nest generado** | Existen package.json, src/main.ts, src/app.module.ts, etc. |
| **□** | **ESM activado** | package.json contiene "type": "module". |
| **□** | **Dependencias instaladas** | Sequelize, drivers, validación, Swagger y herramientas de pruebas están en package.json. |
| **□** | **TypeScript configurado** | module/moduleResolution son nodenext; decoradores están habilitados. |
| **□** | **Variables preparadas** | .env.example existe y se copió a .env. |
| **□** | **Árbol por feature creado** | clients, product-types, products y sales tienen los cajones de cuatro capas. |
| **□** | **Límite entendido** | Todavía no hay conexión Sequelize ni feature clients implementada. |

## **4.1 Mapa final de ISS-01**

| 1carpeta | → | 2Nest scaffold | → | 3ESM \+ deps | → | 4carpetas Clean |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |

# **5\. Errores típicos de principiante en este segmento**

| ERROR | Reemplazar package.json completoPierdes dependencias que nest new ya instaló. El manual lo modifica, no lo pisa. |
| :---: | :---- |

| ERROR | Pensar que Sequelize ya está conectadoEn ISS-01 solo se instala. La conexión llega en ISS-02. |
| :---: | :---- |

| ERROR | Creer que mysql2 es el ORMmysql2 es driver de MySQL. Sequelize es el ORM. |
| :---: | :---- |

| ERROR | Crear lógica dentro de las carpetas vacíasISS-01 solo prepara la estructura. La primera feature se implementa en ISS-03. |
| :---: | :---- |

| ERROR | Confundir NestModule con capaNest organiza e inyecta componentes; no sustituye domain/application/infrastructure/presentation. |
| :---: | :---- |

| ERROR | Olvidar .js en imports relativos ESMEl proyecto seguirá la convención ESM descrita por el manual. |
| :---: | :---- |

# **6\. Preguntas de autoevaluación**

* ¿Por qué nest new . usa un punto y no un nombre de carpeta?  
* ¿Qué problema evita modificar package.json en lugar de reemplazarlo?  
* ¿Cuál es la diferencia entre Sequelize y mysql2 / pg / oracledb / tedious?  
* ¿Por qué "type": "module" se relaciona con imports relativos terminados en .js?  
* ¿Qué carpetas son transversales y cuáles pertenecen a cada feature?  
* ¿Qué cosas todavía NO deberían existir al terminar ISS-01?

| FIN | Criterio para avanzarSi puedes responder estas seis preguntas con tus propias palabras y reconocer cada carpeta del árbol, estás listo para estudiar ISS-02. No desarrollamos ISS-02 en este archivo. |
| :---: | :---- |

