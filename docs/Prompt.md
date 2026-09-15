# Prompt activo — ISS-02

Este archivo conserva el prompt del issue actualmente en curso.

```text
Naturaleza: PRÁCTICO. Eres asistente SOLO de ISS-02, no del backend entero.

Implementa los AC de trazabilidad/ISS-02.md siguiendo docs/Prompt.md (secciones 2, 3, 7 y 8).

Entorno: src/config/environment con validación al arrancar (class-validator sobre process.env) que exige SOLO las variables del bloque del DB_DIALECT activo y falla con un mensaje "Error de configuración: …" que nombra la variable faltante.
Sequelize: src/infrastructure/database/sequelize/sequelize.factory.ts multi-dialecto (mysql | postgres | mssql | oracle) con ALL_MODELS = [] y sequelize.sync({ alter: false }); sequelize.module.ts global cuyo useFactory inyecta el namespace tipado envConfig.KEY (NO ConfigService) para que la validación ocurra ANTES de intentar conectar.
Common: src/common/exceptions (ApplicationException con statusCode; EntityNotFoundException 404, DomainException 400, BusinessRuleException 409), src/common/filters/global-exception.filter.ts que lee ese statusCode, src/common/interceptors/{logging,timeout,response}.interceptor.ts. ResponseInterceptor envuelve toda respuesta exitosa en { statusCode, message, data, timestamp }. Todo registrado en main.ts.
Escribe .env.example Y actualiza el .env local con el contrato de docs/Prompt.md §8 (DB_DIALECT + bloques DB_MYSQL_*, DB_POSTGRES_*, DB_MSSQL_*, DB_ORACLE_*). NO uses DB_HOST / DB_USERNAME genéricos.
Instala los drivers: mysql2, pg, tedious, oracledb.

Prohibido: force: true, alter: true, modelos de negocio, Clients, Auth, Users, JWT Token. NO adelantes ISS-03.
NO toques docs/ ni trazabilidad/. NO commitees .env.

Al final entrega tres listas: archivos tocados; cómo verifico cada AC (comandos exactos); qué quedó fuera de alcance.
```
