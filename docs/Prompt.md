# Prompts de IA por issue

Estos son los prompts operativos definidos en `docs/Guion_IA_Desarrollo_Software.md`. Usa un único prompt, el del issue en curso y el modo que corresponda. No mezcles varios issues en una misma solicitud.

## ISS-01 — Modo agente

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-01, no del backend entero.

Implementa los AC de trazabilidad/ISS-01.md siguiendo docs/Prompt.md (Clean Architecture, solo Business).

Contexto del directorio: ya tiene .git/, docs/ y trazabilidad/. NO los borres ni los modifiques.
Genera el proyecto NestJS con npm en un directorio temporal
(nest new backend-nest-ia --skip-git --package-manager npm) y mueve su contenido a la raíz del workspace,
fusionando .gitignore (debe incluir node_modules/, dist/, .env).

Crea el árbol src/config, src/common, src/infrastructure/database, src/features/business (con business.module.ts stub).
En main.ts: setGlobalPrefix('api'), enableCors({ origin: 'http://localhost:4200', credentials: true }), ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
listen(process.env.PORT ?? 3002). Endpoint GET /api/health → 200 { "status": "ok" }.
Crea scripts/free-port.js y los scripts npm free:port y start:dev (free:port && nest start --watch).

Prohibido: Sequelize, base de datos, .env de BD, Auth, Users, JWT Token, login. NO adelantes ISS-02.

Al final entrega tres listas: archivos tocados; cómo verifico cada AC (comandos exactos); qué quedó fuera de alcance.
```

## ISS-01 — Modo chat IA

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-01, no del backend entero.
NO edites archivos: responde SOLO con comandos de terminal listos para copiar y pegar.

Implementa los AC de trazabilidad/ISS-01.md siguiendo docs/Prompt.md (Clean Architecture, solo Business).

Contexto del directorio: la raíz del workspace ya tiene .git/, docs/ y trazabilidad/. NO los borres ni los modifiques.

Entrega, en este orden:
1. Los comandos para generar el proyecto NestJS SIN tocar .git/docs/trazabilidad: genera en un directorio temporal
	(`nest new backend-nest-ia --skip-git --package-manager npm`) y mueve su contenido a la raíz del workspace
	(con `rsync -a` o `mv`), fusionando .gitignore para que incluya node_modules/, dist/, .env.
2. Los `mkdir -p …` de las carpetas CA que falten: src/config, src/common, src/infrastructure/database, src/features/business.
3. Un comando `cat > <ruta> <<'EOF_ISS_01' … EOF_ISS_01` por cada archivo a crear o modificar, con el contenido COMPLETO
	(nada de «aquí va lo mismo que antes»). Mínimo: src/main.ts (setGlobalPrefix('api'),
	ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }), listen(process.env.PORT ?? 3002),
	endpoint GET /api/health → 200 { "status": "ok" }), src/app.module.ts, src/features/business/business.module.ts (stub),
	scripts/free-port.js, package.json (scripts free:port y start:dev = free:port && nest start --watch) y
	.gitignore (node_modules/, dist/, .env).
4. Al final, tres listas: archivos tocados (solo código directo); cómo verificar cada AC (comandos exactos); qué quedó fuera de alcance.

Prohibido: Sequelize, base de datos, .env de BD, Auth, Users, JWT Token, login. NO adelantes ISS-02.
NO toques docs/ ni trazabilidad/.
```

## ISS-02 — Modo agente

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-02, no del backend entero.

Implementa los AC de trazabilidad/ISS-02.md siguiendo docs/Prompt.md (secciones 2, 3, 7 y 8).

Entorno: src/config/environment con validación al arrancar (class-validator sobre process.env) que exige SOLO las
variables del bloque del DB_DIALECT activo y falla con un mensaje "Error de configuración: …" que nombra la variable faltante.
Sequelize: src/infrastructure/database/sequelize/sequelize.factory.ts multi-dialecto (mysql | postgres | mssql | oracle)
con ALL_MODELS = [] y sequelize.sync({ alter: false }); sequelize.module.ts global cuyo useFactory inyecta el namespace
tipado envConfig.KEY (NO ConfigService) para que la validación ocurra ANTES de intentar conectar.
Common: src/common/exceptions (ApplicationException con statusCode; EntityNotFoundException 404, DomainException 400,
BusinessRuleException 409), src/common/filters/global-exception.filter.ts que lee ese statusCode,
src/common/interceptors/{logging,timeout,response}.interceptor.ts. ResponseInterceptor envuelve toda respuesta exitosa en
{ statusCode, message, data, timestamp }. Todo registrado en main.ts.
Escribe .env.example Y actualiza el .env local con el contrato de docs/Prompt.md §8
(DB_DIALECT + bloques DB_MYSQL_*, DB_POSTGRES_*, DB_MSSQL_*, DB_ORACLE_*). NO uses DB_HOST / DB_USERNAME genéricos.
Instala los drivers: mysql2, pg, tedious, oracledb.

Prohibido: force: true, alter: true, modelos de negocio, Clients, Auth, Users, JWT Token. NO adelantes ISS-03.
NO toques docs/ ni trazabilidad/. NO commitees .env.

Al final entrega tres listas: archivos tocados; cómo verifico cada AC (comandos exactos); qué quedó fuera de alcance.
```

## ISS-02 — Modo chat IA

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-02, no del backend entero.
NO edites archivos: responde SOLO con comandos de terminal listos para copiar y pegar.

Implementa los AC de trazabilidad/ISS-02.md siguiendo docs/Prompt.md (secciones 2, 3, 7 y 8).

Entorno: src/config/environment con validación al arrancar (class-validator sobre process.env) que exige SOLO las
variables del bloque del DB_DIALECT activo y falla con "Error de configuración: …" nombrando la variable faltante.
Sequelize: src/infrastructure/database/sequelize/sequelize.factory.ts multi-dialecto (mysql | postgres | mssql | oracle)
con ALL_MODELS = [] y sequelize.sync({ alter: false }); sequelize.module.ts global cuyo useFactory inyecta el namespace
tipado envConfig.KEY (NO ConfigService) para que la validación ocurra ANTES de intentar conectar.
Common: src/common/exceptions (ApplicationException con statusCode; EntityNotFoundException 404, DomainException 400,
BusinessRuleException 409), src/common/filters/global-exception.filter.ts que lee ese statusCode,
src/common/interceptors/{logging,timeout,response}.interceptor.ts. ResponseInterceptor envuelve toda respuesta exitosa en
{ statusCode, message, data, timestamp }. Todo registrado en main.ts.
Escribe .env.example Y actualiza el .env local con el contrato de docs/Prompt.md §8
(DB_DIALECT + bloques DB_MYSQL_*, DB_POSTGRES_*, DB_MSSQL_*, DB_ORACLE_*). NO uses DB_HOST / DB_USERNAME genéricos.

Entrega, en este orden:
1. Los `mkdir -p …` de las carpetas nuevas.
2. Un comando `cat > <ruta> <<'EOF_ISS_02' … EOF_ISS_02` por cada archivo a crear o modificar, con el contenido COMPLETO.
3. Los comandos de instalación de los paquetes nuevos (mysql2, pg, tedious, oracledb) y el comando de arranque.
4. Al final, tres listas: archivos tocados (solo código directo; sin node_modules/); cómo verificar cada AC; qué quedó fuera de alcance.

Prohibido: force: true, alter: true, modelos de negocio, Clients, Auth, Users, JWT Token. NO adelantes ISS-03.
NO toques docs/ ni trazabilidad/. NO commitees .env (usa .env.example como plantilla).
```

## ISS-03 — Modo agente

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-03, no del backend entero.

Implementa los AC de trazabilidad/ISS-03.md siguiendo docs/Prompt.md (arquitectura §2, campos §4, HTTP §5).

Feature src/features/business/clients con las cuatro capas. Entidad Client PURA (sin Sequelize ni NestJS).
IClientRepository en domain/interfaces; ClientRepository (Sequelize) y ClientModel (tabla clients) en infrastructure;
registra ClientModel en ALL_MODELS. Use-cases CreateClient, ListClients, GetClientById.
CreateClientDto: name requerido; email opcional con formato; phone y address opcionales.
Controller: GET /api/clients, GET /api/clients/:id, POST /api/clients. Swagger.
Errores: DTO inválido → 400 (ValidationPipe); id inexistente → 404; email duplicado → 409 (excepción de dominio mapeada por el filtro).
Seeder idempotente (findOrCreate por email) con al menos un cliente, ejecutado al arrancar. ClientsModule en BusinessModule.

Prohibido: Auth, Users, JWT Token, guards; entidad que extienda Model; force: true. NO adelantes ISS-04 (ProductTypes).
NO toques docs/ ni trazabilidad/.

Al final entrega tres listas: archivos tocados; cómo verifico cada AC (comandos curl exactos y SQL de conteo); qué quedó fuera de alcance.
```

## ISS-03 — Modo chat IA

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-03, no del backend entero.
NO edites archivos: responde SOLO con comandos de terminal listos para copiar y pegar.

Implementa los AC de trazabilidad/ISS-03.md siguiendo docs/Prompt.md (arquitectura §2, campos §4, HTTP §5).

Feature src/features/business/clients con las cuatro capas. Entidad Client PURA (sin Sequelize ni NestJS).
IClientRepository en domain/interfaces; ClientRepository (Sequelize) y ClientModel (tabla clients) en infrastructure;
registra ClientModel en ALL_MODELS. Use-cases CreateClient, ListClients, GetClientById.
CreateClientDto: name requerido; email opcional con formato; phone y address opcionales.
Controller: GET /api/clients, GET /api/clients/:id, POST /api/clients. Swagger.
Errores: DTO inválido → 400; id inexistente → 404; email duplicado → 409.
Seeder idempotente (findOrCreate por email) con al menos un cliente, ejecutado al arrancar. ClientsModule en BusinessModule.

Entrega, en este orden:
1. Los `mkdir -p …` de las carpetas de la feature (application, domain, infrastructure, presentation y sus subcarpetas).
2. Un comando `cat > <ruta> <<'EOF_ISS_03' … EOF_ISS_03` por cada archivo a crear o modificar, con el contenido COMPLETO.
3. Al final, tres listas: archivos tocados (solo código directo); cómo verificar cada AC (curl y SQL exactos); qué quedó fuera de alcance.

Prohibido: Auth, Users, JWT Token, guards; entidad que extienda Model; force: true. NO adelantes ISS-04 (ProductTypes).
NO toques docs/ ni trazabilidad/.
```

## ISS-04 — Modo agente

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-04, no del backend entero.

Implementa los AC de trazabilidad/ISS-04.md siguiendo docs/Prompt.md y el MISMO patrón de src/features/business/clients.

Feature src/features/business/product-types: entidad ProductType PURA (id, name requerido y único, description?, status);
IProductTypeRepository; ProductTypeModel (tabla product_types) en ALL_MODELS; use-cases CreateProductType, ListProductTypes,
GetProductTypeById; CreateProductTypeDto; controller GET /api/product-types, GET /api/product-types/:id, POST /api/product-types; Swagger.
Errores: 400 DTO inválido; 404 id inexistente; 409 name duplicado.
Seeder idempotente (findOrCreate por name) con al menos un tipo. Módulo en BusinessModule.

Prohibido: Auth, Users, JWT Token, guards; entidad que extienda Model; force: true. NO adelantes ISS-05 (Products).
NO toques docs/ ni trazabilidad/.

Al final entrega tres listas: archivos tocados; cómo verifico cada AC; qué quedó fuera de alcance.
```

## ISS-04 — Modo chat IA

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-04, no del backend entero.
NO edites archivos: responde SOLO con comandos de terminal listos para copiar y pegar.

Implementa los AC de trazabilidad/ISS-04.md siguiendo docs/Prompt.md y el MISMO patrón de src/features/business/clients.

Feature src/features/business/product-types: entidad ProductType PURA (id, name requerido y único, description?, status);
IProductTypeRepository; ProductTypeModel (tabla product_types) en ALL_MODELS; use-cases CreateProductType, ListProductTypes,
GetProductTypeById; CreateProductTypeDto; controller GET /api/product-types, GET /api/product-types/:id, POST /api/product-types; Swagger.
Errores: 400 DTO inválido; 404 id inexistente; 409 name duplicado.
Seeder idempotente (findOrCreate por name) con al menos un tipo. Módulo en BusinessModule.

Entrega, en este orden:
1. Los `mkdir -p …` de las carpetas de la feature.
2. Un comando `cat > <ruta> <<'EOF_ISS_04' … EOF_ISS_04` por cada archivo a crear o modificar, con el contenido COMPLETO.
3. Al final, tres listas: archivos tocados (solo código directo); cómo verificar cada AC; qué quedó fuera de alcance.

Prohibido: Auth, Users, JWT Token, guards; entidad que extienda Model; force: true. NO adelantes ISS-05 (Products).
NO toques docs/ ni trazabilidad/.
```

## ISS-05 — Modo agente

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-05, no del backend entero.

Implementa los AC de trazabilidad/ISS-05.md siguiendo docs/Prompt.md y el patrón de clients/product-types.

Feature src/features/business/products: entidad Product PURA (id, name, brand, price, minStock, quantity, productTypeId, status)
con método reduceStock(n) que lanza InsufficientStockException si quantity - n < 0. IProductRepository; ProductNotFoundException, ProductTypeInactiveException (409).
ProductModel (tabla products) con @ForeignKey/@BelongsTo a ProductTypeModel, en ALL_MODELS. La relación vive SOLO en el model.
CreateProductDto: name requerido; price > 0; quantity ≥ 0 y minStock ≥ 0 (default 0); productTypeId requerido.
Use-case CreateProduct verifica que productTypeId exista usando IProductTypeRepository (→ 404 si no existe; → 409 si está inactivo). ListProducts, GetProductById.
Controller GET /api/products, GET /api/products/:id, POST /api/products (la respuesta incluye quantity). Swagger.
Seeder idempotente que crea al menos un producto con un tipo existente; debe ejecutarse DESPUÉS del seeder de product-types.
ProductsModule importa ProductTypesModule (para el repositorio) y se registra en BusinessModule.

Prohibido: Auth, JWT Token, guards; entidad que extienda Model; force: true. NO adelantes ISS-06 (Sales).
NO toques docs/ ni trazabilidad/.

Al final entrega tres listas: archivos tocados; cómo verifico cada AC; qué quedó fuera de alcance.
```

## ISS-05 — Modo chat IA

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-05, no del backend entero.
NO edites archivos: responde SOLO con comandos de terminal listos para copiar y pegar.

Implementa los AC de trazabilidad/ISS-05.md siguiendo docs/Prompt.md y el patrón de clients/product-types.

Feature src/features/business/products: entidad Product PURA (id, name, brand, price, minStock, quantity, productTypeId, status)
con método reduceStock(n) que lanza InsufficientStockException si quantity - n < 0. IProductRepository; ProductNotFoundException, ProductTypeInactiveException (409).
ProductModel (tabla products) con @ForeignKey/@BelongsTo a ProductTypeModel, en ALL_MODELS. La relación vive SOLO en el model.
CreateProductDto: name requerido; price > 0; quantity ≥ 0 y minStock ≥ 0 (default 0); productTypeId requerido.
Use-case CreateProduct verifica que productTypeId exista usando IProductTypeRepository (→ 404 si no existe; → 409 si está inactivo). ListProducts, GetProductById.
Controller GET /api/products, GET /api/products/:id, POST /api/products (la respuesta incluye quantity). Swagger.
Seeder idempotente que crea al menos un producto con un tipo existente; debe ejecutarse DESPUÉS del seeder de product-types.
ProductsModule importa ProductTypesModule (para el repositorio) y se registra en BusinessModule.

Entrega, en este orden:
1. Los `mkdir -p …` de las carpetas de la feature.
2. Un comando `cat > <ruta> <<'EOF_ISS_05' … EOF_ISS_05` por cada archivo a crear o modificar, con el contenido COMPLETO.
3. Al final, tres listas: archivos tocados (solo código directo); cómo verificar cada AC; qué quedó fuera de alcance.

Prohibido: Auth, JWT Token, guards; entidad que extienda Model; force: true. NO adelantes ISS-06 (Sales).
NO toques docs/ ni trazabilidad/.
```

## ISS-06 — Modo agente

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-06, no del backend entero.

Implementa los AC de trazabilidad/ISS-06.md siguiendo docs/Prompt.md. Sales + ProductSale es UN solo agregado.

Dominio: entidades PURAS Sale (id, saleDate, subtotal, tax, discounts, total, status, clientId, items) y
ProductSale (id, saleId, productId, quantity, unitPrice, total); servicio SaleCalculator
(subtotal = Σ quantity × unitPrice; total = subtotal + tax − discounts); ISaleRepository; SaleNotFoundException, EmptySaleException.
Reutiliza Product.reduceStock e InsufficientStockException de products.
Aplicación: CreateSaleDto (clientId requerido; items[] con @ArrayMinSize(1) y @ValidateNested de { productId, quantity > 0,
unitPrice? > 0 }; si unitPrice no viene se usa el precio actual del producto; tax, discounts ≥ 0 opcionales).
Use-case CreateSale: verifica cliente (IClientRepository → 404), carga productos (IProductRepository → 404),
llama product.reduceStock(qty) para TODOS los ítems antes de escribir nada (→ 409), calcula totales y persiste
Sale + ProductSale + products.quantity DENTRO DE UNA SOLA transacción Sequelize (sequelize.transaction(async t => ...),
con lock: t.LOCK.UPDATE por producto y re-verificación del stock bajo bloqueo); cualquier error → rollback.
Infraestructura: SaleModel (sales) y ProductSaleModel (product_sales) en ALL_MODELS; SaleRepository (Sequelize) que abre la transacción.
Presentación: POST /api/sales (201), GET /api/sales/:id (200 con items). Errores: 400 items vacíos; 404 cliente/producto; 409 stock.

Prohibido: Auth, Users, JWT Token, login, userId «para saber quién vende»; entidad que extienda Model; force: true.
NO adelantes ISS-07. NO toques docs/ ni trazabilidad/.

Al final entrega tres listas: archivos tocados; cómo verifico cada AC (incluye el caso de dos ítems con rollback); qué quedó fuera de alcance.
```

## ISS-06 — Modo chat IA

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-06, no del backend entero.
NO edites archivos: responde SOLO con comandos de terminal listos para copiar y pegar.

Implementa los AC de trazabilidad/ISS-06.md siguiendo docs/Prompt.md. Sales + ProductSale es UN solo agregado.

Dominio: entidades PURAS Sale (id, saleDate, subtotal, tax, discounts, total, status, clientId, items) y
ProductSale (id, saleId, productId, quantity, unitPrice, total); servicio SaleCalculator
(subtotal = Σ quantity × unitPrice; total = subtotal + tax − discounts); ISaleRepository; SaleNotFoundException, EmptySaleException.
Reutiliza Product.reduceStock e InsufficientStockException de products.
Aplicación: CreateSaleDto (clientId requerido; items[] con @ArrayMinSize(1) y @ValidateNested de { productId, quantity > 0,
unitPrice? > 0 }; si unitPrice no viene se usa el precio actual del producto; tax, discounts ≥ 0 opcionales).
Use-case CreateSale: verifica cliente (IClientRepository → 404), carga productos (IProductRepository → 404),
llama product.reduceStock(qty) para TODOS los ítems antes de escribir nada (→ 409), calcula totales y persiste
Sale + ProductSale + products.quantity DENTRO DE UNA SOLA transacción Sequelize (sequelize.transaction, con lock por producto
y re-verificación del stock bajo bloqueo); cualquier error → rollback.
Infraestructura: SaleModel (sales) y ProductSaleModel (product_sales) en ALL_MODELS; SaleRepository que abre la transacción.
Presentación: POST /api/sales (201), GET /api/sales/:id (200 con items). Errores: 400 items vacíos; 404 cliente/producto; 409 stock.

Entrega, en este orden:
1. Los `mkdir -p …` de las carpetas de la feature.
2. Un comando `cat > <ruta> <<'EOF_ISS_06' … EOF_ISS_06` por cada archivo a crear o modificar, con el contenido COMPLETO.
3. Al final, tres listas: archivos tocados (solo código directo); cómo verificar cada AC (incluye el caso de dos ítems con rollback); qué quedó fuera de alcance.

Prohibido: Auth, Users, JWT Token, login, userId «para saber quién vende»; entidad que extienda Model; force: true.
NO adelantes ISS-07. NO toques docs/ ni trazabilidad/.
```

## ISS-07 — Modo agente

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-07, no del backend entero.

Implementa los AC de trazabilidad/ISS-07.md siguiendo docs/Prompt.md.

Seeders: orquestador en src/infrastructure/database/seeders que ejecute en orden clients → product-types → products,
idempotente en conjunto (arrancar dos veces deja los mismos conteos). Sales no se siembra.
README.md: reemplaza el boilerplate de Nest por: descripción, requisitos, creación de la BD, configuración de .env (referencia a .env.example),
arranque, endpoints, Swagger (/api/docs) y el libreto de la demo (cliente → tipo → producto quantity 5 → venta 2 → quantity 3 → venta 10 → 409).
Swagger en /api/docs con los cuatro recursos.
Verifica y reporta que NO existe src/features/auth ni src/config/jwt y que package.json no tiene @nestjs/jwt, passport, passport-jwt ni bcrypt.

Prohibido: Auth nuevo, demo de login, force: true. NO toques docs/ ni trazabilidad/.

Al final entrega tres listas: archivos tocados; cómo verifico cada AC; qué quedó fuera de alcance.
```

## ISS-07 — Modo chat IA

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-07, no del backend entero.
NO edites archivos: responde SOLO con comandos de terminal listos para copiar y pegar.

Implementa los AC de trazabilidad/ISS-07.md siguiendo docs/Prompt.md.

Seeders: orquestador en src/infrastructure/database/seeders que ejecute en orden clients → product-types → products,
idempotente en conjunto (arrancar dos veces deja los mismos conteos). Sales no se siembra.
README.md: reemplaza el boilerplate de Nest por: descripción, requisitos, creación de la BD, configuración de .env
(referencia a .env.example), arranque, endpoints, Swagger (/api/docs) y el libreto de la demo
(cliente → tipo → producto quantity 5 → venta 2 → quantity 3 → venta 10 → 409).
Swagger en /api/docs con los cuatro recursos.
Verifica y reporta que NO existe src/features/auth ni src/config/jwt y que package.json no tiene @nestjs/jwt, passport, passport-jwt ni bcrypt.

Entrega, en este orden:
1. Los `mkdir -p …` de las carpetas nuevas.
2. Un comando `cat > <ruta> <<'EOF_ISS_07' … EOF_ISS_07` por cada archivo a crear o modificar, con el contenido COMPLETO.
3. Al final, tres listas: archivos tocados (solo código directo); cómo verifico cada AC; qué quedó fuera de alcance.

Prohibido: Auth nuevo, demo de login, force: true. NO toques docs/ ni trazabilidad/.
```
