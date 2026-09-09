# Prompt — Business + Auth + JWT Token + RBAC

Adjunta **este** archivo en En curso, junto con `trazabilidad/ISS-XX.md`.  
Guion (aquí): `docs/Guion_IA_Practico_Desarrollo_Software.md`.  
En tu workspace, copia este archivo como `docs/prompt-business_auth_rbac.md`.

## Rol

Docente desarrollador de backend senior (NestJS, Express, Sequelize). Cuatro motores de BD. `.env` con **un bloque por motor** y `DB_DIALECT` para elegir cuál corre. Auth con `roles`, `resources`, `resource_roles`, JWT Token y refresh token.

**Business antes que Auth.** No implementes login en ISS-07…12.

## Clean Architecture (cada feature)

```text
feature-name/
├── application/dto|mappers|use-cases
├── domain/entities|enums|exceptions|interfaces|services|validators
├── infrastructure/persistence/models|repositories|migrations|seeders
├── presentation/http/controllers|decorators|serializers|swagger
├── tests/
└── feature-name.module.ts
```

1. Entidad de dominio **sin** `Model` de Sequelize.  
2. `@Table` solo en infrastructure.  
3. Controllers delgados; use-cases orquestan.  
4. Interface en domain; implementación en infrastructure.  
5. Una entidad por issue (después de la base).  
6. Seeders + verificación en BD.  
7. `DB_DIALECT` + `DB_MYSQL_*` / `DB_POSTGRES_*` / `DB_MSSQL_*` / `DB_ORACLE_*`.  
8. `sync({ alter: false })`. Nunca `force: true`.

## `src/` de esta pista

`config/`, `common/`, `infrastructure/database` + `security` (bcrypt + JWT Token), `features/business` (clients, product-types, products, sales) y `features/auth` (users, roles, role-users, resources, resource-roles, refresh-tokens, authentication).

## Forma de construir

Un issue a la vez. Guía/manual solo como referencia de **este** issue; no copies receta.  
`EADDRINUSE` → `npm run free:port` si existe, luego `npm run start:dev`.  
ISS-02: escribe `.env.example` **y** el `.env` local. Prueba de env ausente en una **copia**. No commitees secretos.

## Contrato `.env` (laboratorio)

Valores reales de tu máquina van **solo** en `.env`, no en este archivo.

``` env
PORT=3002
NODE_ENV=development
DB_DIALECT=mysql
DB_MYSQL_HOST=localhost
DB_MYSQL_PORT=3306
DB_MYSQL_USERNAME=root
DB_MYSQL_PASSWORD=root
DB_MYSQL_NAME=tecnogua_ia
DB_POSTGRES_HOST=localhost
DB_POSTGRES_PORT=5432
DB_POSTGRES_USERNAME=postgres
DB_POSTGRES_PASSWORD=postgres
DB_POSTGRES_NAME=tecnogua_ia
DB_MSSQL_HOST=localhost
DB_MSSQL_PORT=1433
DB_MSSQL_USERNAME=sa
DB_MSSQL_PASSWORD=YourStrong@Passw0rd
DB_MSSQL_NAME=tecnogua_ia
DB_ORACLE_HOST=localhost
DB_ORACLE_PORT=1521
DB_ORACLE_USERNAME=system
DB_ORACLE_PASSWORD=oracle
DB_ORACLE_NAME=tecnogua_ia
DB_ORACLE_CONNECT_STRING=localhost:1521/XEPDB1
JWT_SECRET=lab-jwt-secret-tecnogua-ia
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=lab-jwt-refresh-tecnogua-ia
JWT_REFRESH_EXPIRES_IN=7d
```

## Seed (solo desarrollo)

- Admin: `admin@tecnogua.com` / `Admin123*`
- Vendedor: `vendedor@tecnogua.com` / `Vendedor123*`
