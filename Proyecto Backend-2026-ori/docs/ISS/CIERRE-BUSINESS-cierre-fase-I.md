> **🛠 Unidad CIERRE-BUSINESS · Cierre Fase I — Business (sin Auth)** — capa **🛠 CONSTRUIR**
>
> [🧠 Comprender este bloque →](https://tecnogua.com/academic/site/backend2026/aprendizaje/CIERRE-BUSINESS-aprendizaje/) · [📝 Evaluación](https://tecnogua.com/academic/site/backend2026/aprendizaje/CIERRE-BUSINESS-aprendizaje/#evaluacion) · [✅ GATE de la unidad](https://tecnogua.com/academic/site/backend2026/manual/10-cierre-business/#dod-del-laboratorio-business-sin-auth)
>
> | **Capa**         | **Página**                                                                                                                               | **Para qué**                             |
> | :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------- |
> | 🧠 **Aprender**  | [Cierre Fase I — Business (sin Auth)](https://tecnogua.com/academic/site/backend2026/aprendizaje/CIERRE-BUSINESS-aprendizaje/)           | comprender, explicar y relacionar        |
> | 🛠 **Construir** | esta página                                                                                                                              | ejecutar, programar y verificar          |
> | ✅ **GATE**       | [Condiciones de cierre](https://tecnogua.com/academic/site/backend2026/manual/10-cierre-business/#dod-del-laboratorio-business-sin-auth) | condición para pasar al bloque siguiente |
>
> **Esta es la guía ejecutable.** Sigue los pasos en orden. El cuerpo de abajo es el **ISS técnico verbatim**: comandos, rutas, versiones, PARCHEs, verificaciones y criterios, sin simplificar ni modernizar.

---

# Fase I: Business — Cierre del laboratorio (business SIN AUTH)

> **Contexto mínimo (autosuficiente).** Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que hay que saber antes de ejecutarlo. - **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript + Sequelize, **arquitectura por features**, Fase I **solo Business** (sin auth ni roles). - **Recorrido obligatorio de una petición:** `HTTP → Controller → Service → Repository → Model → Sequelize → BD`. Ninguna capa se salta a la siguiente. - **Diseño de datos** (columnas, tipos, FK `RESTRICT`, índices, transacciones): [`../bd-storelab.md`](https://tecnogua.com/academic/site/backend2026/bd-storelab/), **Fase I — Business**. - **Capas, convenciones y reglas transversales:** [`00-contexto.md`](https://tecnogua.com/academic/site/backend2026/manual/00-contexto/).
>
> | **Este ISS**        |                                                                                                                           |
> | :------------------ | :------------------------------------------------------------------------------------------------------------------------ |
> | **Título**          | Cierre del laboratorio (business SIN AUTH)                                                                                |
> | **Feature / tabla** | las 5 tablas                                                                                                              |
> | **API**             | todas                                                                                                                     |
> | **Depende de**      | [ISS-08 — Feature Sale + ProductSale](https://tecnogua.com/academic/site/backend2026/manual/09-ISS-08-sale-product-sale/) |
> | **Habilita**        | [ISS-09 — Base de seguridad y modelos Auth](https://tecnogua.com/academic/site/backend2026/manual/11-ISS-09-auth-base/)   |
>
> **Nota de Fase II.** Este cierre describe el estado al terminar **ISS-08** (business **sin auth**). Después, la **Fase II** (ISS-09 … ISS-15) protege **todas** estas rutas con `authenticate` + `authorize` y añade identidades, RBAC y sesiones. La actualización de las rutas de negocio está en [ISS-13](https://tecnogua.com/academic/site/backend2026/manual/15-ISS-13-auth-access/) y el estado final del backend en el [cierre de Fase II](https://tecnogua.com/academic/site/backend2026/manual/18-cierre-auth/).

## Contenido de este ISS

- DoD del laboratorio (business SIN AUTH)
- Norma de nombres (carpeta, clase, tabla, FK)
- Cómo repetir el patrón (otra entidad)
- Referencia rápida de paquetes
- Fuentes

---

## DoD del laboratorio (business SIN AUTH)

Al cerrar ISS-08 el backend está **completo para este lab**:

- [ ] 5 features (carpeta en plural): `clients`, `product-types`, `products`, `sales`, `product-sales`
- [ ] Cada feature con sus **4 capas**: `*.controller.ts` → `*.service.ts` → `*.repository.ts` → `*.model.ts`
- [ ] Cada feature con su **DTO**: carpeta `dto/` (un archivo por operación + `index.ts`)
- [ ] 5 tablas: `clients`, `product_types`, `products`, `sales`, `product_sales`
- [ ] APIs: `/api/clientes`, `/api/tipos-producto`, `/api/productos`, `/api/ventas`, `/api/detalle-ventas`
- [ ] SeedersRunner + Swagger `/api/docs`
- [ ] **Sin** autenticación ni autorización (todas las rutas SIN AUTH)
- [ ] `npx tsc --noEmit` OK

Consulta de campos/tablas (opcional): |[`bd-storelab.md`](https://tecnogua.com/academic/site/backend2026/bd-storelab/).

```
app-storelab-express/
├── src/
│   ├── config/index.ts
│   ├── database/
│   │   ├── db.ts
│   │   └── seeders/{counts,index}.ts
│   ├── features/
│   │   └── business/
│   │       ├── clients/
│   │       │   ├── client.model.ts          # Model (singular)
│   │       │   ├── dto/                     # DTOs (contrato de la API)
│   │       │   │   ├── create-client.dto.ts
│   │       │   │   ├── update-client.dto.ts
│   │       │   │   ├── patch-client.dto.ts
│   │       │   │   ├── client-response.dto.ts
│   │       │   │   └── index.ts
│   │       │   ├── clients.repository.ts    # Repository
│   │       │   ├── clients.service.ts       # Service
│   │       │   ├── clients.controller.ts    # Controller
│   │       │   ├── clients.routes.ts        # HTTP
│   │       │   └── http/ clients.seeder.ts clients.swagger.ts
│   │       ├── product-types/    # mismas 4 capas + http + seeder + swagger
│   │       ├── products/         # + products.associations.ts
│   │       ├── sales/            # cabecera + sales.associations.ts
│   │       └── product-sales/    # pivote product_sales + associations
│   ├── routes/index.ts
│   ├── shared/
│   │   ├── database/with-transaction.ts
│   │   ├── errors/app-error.ts
│   │   └── http/base-controller.ts
│   ├── swagger/index.ts
│   └── server.ts
└── …

```

| **Método** | **Ruta**               | **Nota**                        |
| :--------- | :--------------------- | :------------------------------ |
| \*         | `/api/clientes…`       | SIN AUTH (ISS-03)               |
| \*         | `/api/tipos-producto…` | SIN AUTH (ISS-06)               |
| \*         | `/api/productos…`      | SIN AUTH (ISS-07)               |
| \*         | `/api/ventas…`         | SIN AUTH (ISS-08)               |
| \*         | `/api/detalle-ventas…` | SIN AUTH (ISS-08 · ProductSale) |
| GET        | `/api/docs`            | Swagger UI                      |
| GET        | `/api/docs.json`       | OpenAPI JSON                    |

## Norma de nombres (carpeta, clase, tabla, FK)

| **Pieza**                    | **Norma**                                 | **Ejemplo**                                                               |
| :--------------------------- | :---------------------------------------- | :------------------------------------------------------------------------ |
| Carpeta feature              | kebab-case **plural**                     | `product-types/`, `product-sales/`                                        |
| Archivos de capa             | plural + sufijo                           | `products.repository.ts`, `products.service.ts`, `products.controller.ts` |
| Modelo / interfaz            | singular                                  | `product.model.ts` → `Product`, `ProductI`                                |
| DTO                          | carpeta `dto/` + un archivo por operación | `dto/create-product.dto.ts` → `CreateProductDto`                          |
| Clase                        | PascalCase singular                       | `Client`, `ProductType`, `Sale`, `ProductSale`                            |
| Tabla BD                     | snake_case plural (compuestos con `_`)    | `clients`, `product_types`, `product_sales`                               |
| FK                           | singular de la tabla referenciada + `_id` | `client_id`, `product_type_id`, `sale_id`, `product_id`                   |
| Columnas de negocio          | snake_case                                | `min_stock`, `sale_date`, `unit_price`, `line_total`                      |
| SeedCounts / JSON compuestos | snake_case                                | `product_types`, `product_sales`, `product_type`                          |

No uses camelCase en tablas (`productTypes` ❌ → `product_types` ✅).

En `*.associations.ts`:

```
Sale.belongsTo(Client, { foreignKey: "client_id", as: "client" });
Client.hasMany(Sale, { foreignKey: "client_id", as: "sales" });
ProductSale.belongsTo(Sale, { foreignKey: "sale_id", as: "sale" });
Sale.hasMany(ProductSale, { foreignKey: "sale_id", as: "items" });
Product.hasMany(ProductSale, { foreignKey: "product_id", as: "sale_items" });

```

Con BD limpia, `sequelize.sync` crea FKs snake_case desde modelos/`*.associations.ts`. Opcional: `DB_SYNC_FORCE=true npm run dev` recrea tablas.

## Cómo repetir el patrón (otra entidad)

```
ISS-n-A    modelo + DTO + esqueletos repository/service/controller/routes + cableado
ISS-n-B…E  CRUD en orden: getAll, getOne, create, update PUT/PATCH, delete físico/lógico
           (cada paso toca las 3 capas: repository -> service -> controller) + http
ISS-n-F    seeder + PARCHE counts/runner
ISS-n-G    swagger + PARCHE registry
ISS-n-R    si hay FK `tabla_singular_id`: associations.ts + PARCHE config

```

> Regla de oro del lab: `routes -> controller -> service -> repository -> model`. Ninguna capa se salta a la siguiente ni consulta el modelo directamente. El **DTO** es el contrato que cruza `routes`/`controller`/`service`; el `repository` y el `model` no lo conocen.

---

## Referencia rápida de paquetes

```
npm install express@^5.2.1 cors@^2.8.6 dotenv@^17.4.2 morgan@^1.12.1 \
  sequelize@^6.37.8 mysql2@^3.24.4 pg@^8.23.0 pg-hstore@^2.3.4 \
  tedious@^20.0.0 oracledb@^7.0.1 bcryptjs@^3.0.3 \
  swagger-ui-express@^5.0.1

npm install -D typescript@~5.9.2 ts-node@^10.9.2 nodemon@^3.1.14 \
  @types/node@^22.20.3 @types/express@^5.0.6 \
  @types/cors@^2.8.19 @types/morgan@^1.9.10 \
  @types/sequelize@^6.12.0 @types/bcryptjs@^3.0.0 \
  @types/swagger-ui-express@^4.1.8 \
  @faker-js/faker@^10.6.0

```

---

## Fuentes

- **Este manual** es la única guía de construcción (ISS, `cat >>`, **PARCHE**).
- [`bd-storelab.md`](https://tecnogua.com/academic/site/backend2026/bd-storelab/) — **solo consulta**: entidades **business** y sus campos (no es un paso de construcción).

---

> **✅ GATE de la unidad CIERRE-BUSINESS** — *este bloque no añade ningún criterio nuevo.*
>
> Las condiciones de cierre son exactamente las que define el ISS técnico de esta misma página:
>
> - 📋 **DoD del laboratorio** → [DoD del laboratorio](https://tecnogua.com/academic/site/backend2026/manual/10-cierre-business/#dod-del-laboratorio-business-sin-auth)
> - 🧠 **Autoevaluación** → [Evaluación del cuaderno](https://tecnogua.com/academic/site/backend2026/aprendizaje/CIERRE-BUSINESS-aprendizaje/#evaluacion)
>
> Con el GATE en verde queda habilitado **ISS-09 · Auth base (seguridad y modelos)**.
>
> **Navegación de la ruta:** **←** [CIERRE-BUSINESS · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/CIERRE-BUSINESS-aprendizaje/) · [↑ Ruta Express](https://tecnogua.com/academic/site/backend2026/) · **→** [ISS-09 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-09-aprendizaje/)
