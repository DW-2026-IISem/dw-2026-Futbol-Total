# 🛠 Unidad ISS-05 · Swagger / OpenAPI — capa 🛠 CONSTRUIR

> [🧠 Comprender este bloque →](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-05-aprendizaje/) · [📝 Evaluación](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-05-aprendizaje/#evaluacion) · [✅ GATE de la unidad](https://tecnogua.com/academic/site/backend2026/manual/06-ISS-05-swagger/#criterios-de-aceptacion-iss-05-consolidados)
>
> | **Capa**         | **Página**                                                                                                                                    | **Para qué**                             |
> | :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------- |
> | 🧠 **Aprender**  | [Swagger / OpenAPI](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-05-aprendizaje/)                                           | comprender, explicar y relacionar        |
> | 🛠 **Construir** | esta página                                                                                                                                   | ejecutar, programar y verificar          |
> | ✅ **GATE**       | [Condiciones de cierre](https://tecnogua.com/academic/site/backend2026/manual/06-ISS-05-swagger/#criterios-de-aceptacion-iss-05-consolidados) | condición para pasar al bloque siguiente |
>
> **Esta es la guía ejecutable.** Sigue los pasos en orden. El cuerpo de abajo es el **ISS técnico verbatim**: comandos, rutas, versiones, PARCHEs, verificaciones y criterios, sin simplificar ni modernizar.

---

# Fase I: Business — ISS-05 — Swagger / OpenAPI (feature + registry)

> **Contexto mínimo (autosuficiente).** Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que hay que saber antes de ejecutarlo. - **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript + Sequelize, **arquitectura por features**, Fase I **solo Business** (sin auth ni roles). - **Recorrido obligatorio de una petición:** `HTTP → Controller → Service → Repository → Model → Sequelize → BD`. Ninguna capa se salta a la siguiente. - **Diseño de datos** (columnas, tipos, FK `RESTRICT`, índices, transacciones): [`../bd-storelab.md`](https://tecnogua.com/academic/site/backend2026/bd-storelab/), **Fase I — Business**. - **Capas, convenciones y reglas transversales:** [`00-contexto.md`](https://tecnogua.com/academic/site/backend2026/manual/00-contexto/).
>
> | **Este ISS**        |                                                                                                                          |
> | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
> | **Título**          | Swagger / OpenAPI (feature + registry)                                                                                   |
> | **Feature / tabla** | `clients` (swagger)                                                                                                      |
> | **API**             | `/api/docs`, `/api/docs.json`                                                                                            |
> | **Depende de**      | [ISS-03 — Feature Client (CRUD por capas)](https://tecnogua.com/academic/site/backend2026/manual/04-ISS-03-client-crud/) |
> | **Habilita**        | [ISS-06 — Feature ProductType](https://tecnogua.com/academic/site/backend2026/manual/07-ISS-06-product-type/)            |

## Contenido de este ISS

- 10.1 OpenAPI dentro del feature Client
- 10.2 Registry externo + montaje en Config

---

**Objetivo:** documentar el API del feature Client en OpenAPI 3 y montar Swagger UI desde un **registry externo** (mismo patrón que seeders).
**Bloqueado por:** ISS-03-E (rutas CRUD definidas) — en [ISS-03](https://tecnogua.com/academic/site/backend2026/manual/04-ISS-03-client-crud/).

### Criterios de aceptación (ISS-05) — consolidados

- [ ] **10.1** Existe `features/business/clients/clients.swagger.ts` con tags, paths y schemas de Client (leyenda **SIN AUTH**)
- [ ] **10.2** Existe `src/swagger/index.ts` que agrega módulos de features y monta UI
- [ ] `App` llama `setupSwagger` (método `docs()`)
- [ ] `GET /api/docs` muestra Swagger UI
- [ ] `GET /api/docs.json` devuelve el documento OpenAPI

**Diseño**

| **Pieza**        | **Ubicación**                                      | **Rol**                                |
| :--------------- | :------------------------------------------------- | :------------------------------------- |
| Docs del feature | `src/features/business/clients/clients.swagger.ts` | Paths + schemas Client                 |
| Registry         | `src/swagger/index.ts`                             | Fusiona features + `setupSwagger(app)` |
| UI               | `/api/docs`                                        | Swagger UI                             |
| Spec             | `/api/docs.json`                                   | OpenAPI JSON                           |

---

## 10.1 OpenAPI dentro del feature Client

**Criterios**

- [ ] Exporta `clientsSwagger` con `tags`, `paths`, `components.schemas`
- [ ] Endpoints documentados como **SIN AUTH**

```bash
# Paquetes (una vez)
npm install swagger-ui-express@^5.0.1
npm install -D @types/swagger-ui-express@^4.1.8

```

Archivo **nuevo**:

```bash
: > src/features/business/clients/clients.swagger.ts
cat >> src/features/business/clients/clients.swagger.ts << 'EOF'
import {
  bearerSecurity,
  forbiddenResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

/**
 * Documentación OpenAPI del feature Client.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: todos los endpoints son **JWT + RBAC** (`authenticate` + `authorize`).
 * La modalidad se declara por operación: aquí heredan el `security` global del documento.
 */

export const clientsSwagger = {
  tags: [
    {
      name: "Clientes",
      description: "CRUD de clientes — **JWT + RBAC** (authenticate + authorize)",
    },
  ],
  paths: {
    "/api/clientes": {
      get: {
        tags: ["Clientes"],
        summary: "Listar clientes activos",
        description: "JWT + RBAC — retorna clientes con status=active (sin password)",
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "200": {
            description: "Lista de clientes",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    clients: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Client" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Clientes"],
        summary: "Crear cliente",
        description: "JWT + RBAC",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ClientCreate" },
            },
          },
        },
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "201": {
            description: "Cliente creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    client: { $ref: "#/components/schemas/Client" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/clientes/{id}": {
      get: {
        tags: ["Clientes"],
        summary: "Obtener cliente por id",
        description: "JWT + RBAC — 404 si no existe o tiene borrado lógico",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "id numérico (> 0). Si no lo es, la API responde 400.",
            schema: { type: "integer", minimum: 1 },
          },
        ],
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "200": {
            description: "Cliente encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    client: { $ref: "#/components/schemas/Client" },
                  },
                },
              },
            },
          },
          "400": { description: "id inválido (debe ser un entero positivo)" },
          "404": { description: "No encontrado" },
        },
      },
      put: {
        tags: ["Clientes"],
        summary: "Actualizar cliente (PUT — reemplazo)",
        description: "JWT + RBAC",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "id numérico (> 0). Si no lo es, la API responde 400.",
            schema: { type: "integer", minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ClientUpdate" },
            },
          },
        },
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "200": { description: "Actualizado" },
          "400": { description: "id inválido (debe ser un entero positivo)" },
          "404": { description: "No encontrado" },
        },
      },
      patch: {
        tags: ["Clientes"],
        summary: "Actualizar cliente (PATCH — parcial)",
        description: "JWT + RBAC",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "id numérico (> 0). Si no lo es, la API responde 400.",
            schema: { type: "integer", minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ClientPatch" },
            },
          },
        },
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "200": { description: "Actualizado" },
          "400": { description: "id inválido (debe ser un entero positivo)" },
          "404": { description: "No encontrado" },
        },
      },
      delete: {
        tags: ["Clientes"],
        summary: "Eliminar cliente (físico)",
        description: "JWT + RBAC — borra la fila (también si tiene borrado lógico)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "id numérico (> 0). Si no lo es, la API responde 400.",
            schema: { type: "integer", minimum: 1 },
          },
        ],
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "200": { description: "Eliminado" },
          "400": { description: "id inválido (debe ser un entero positivo)" },
          "404": { description: "No encontrado" },
        },
      },
    },
    "/api/clientes/{id}/deactivate": {
      patch: {
        tags: ["Clientes"],
        summary: "Eliminar cliente (lógico)",
        description: "JWT + RBAC — status = inactive",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "id numérico (> 0). Si no lo es, la API responde 400.",
            schema: { type: "integer", minimum: 1 },
          },
        ],
        security: bearerSecurity,
        responses: {
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "200": { description: "Desactivado" },
          "400": { description: "id inválido (debe ser un entero positivo)" },
          "404": { description: "No encontrado" },
        },
      },
    },
  },
  components: {
    schemas: {
      Client: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Ana Pérez" },
          address: { type: "string", example: "Calle 10 #20-30" },
          phone: { type: "string", example: "3001234567" },
          email: { type: "string", format: "email", example: "ana@example.com" },
          status: { type: "string", enum: ["active", "inactive"], example: "active" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ClientCreate: {
        type: "object",
        required: ["name", "phone", "email", "password"],
        properties: {
          name: { type: "string" },
          address: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
          status: { type: "string", enum: ["active", "inactive"], default: "active" },
        },
      },
      ClientUpdate: {
        type: "object",
        required: ["name", "phone", "email"],
        properties: {
          name: { type: "string" },
          address: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
        },
      },
      ClientPatch: {
        type: "object",
        properties: {
          name: { type: "string" },
          address: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
        },
      },
    },
  },
};
EOF
```

---

## 10.2 Registry externo + montaje en Config

**Criterios**

- [ ] `buildOpenApiDocument()` fusiona módulos de features
- [ ] `setupSwagger(app)` monta `/api/docs` y `/api/docs.json`
- [ ] `config` invoca `setupSwagger` (método `docs()`)

```bash
mkdir -p src/swagger
```

Archivo **nuevo**:

```bash
: > src/swagger/index.ts
cat >> src/swagger/index.ts << 'EOF'
import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import { clientsSwagger } from "../features/business/clients/clients.swagger";

export type FeatureSwaggerModule = {
  tags: unknown[];
  paths: Record<string, unknown>;
  components?: { schemas?: Record<string, unknown> };
};

/**
 * Registry externo: importa la documentación OpenAPI de cada feature
 * (mismo patrón que SeedersRunner).
 */
const featureSwaggerModules: FeatureSwaggerModule[] = [
  clientsSwagger,
  // productsSwagger,
  // userSwagger,
];

export function buildOpenApiDocument() {
  const tags: unknown[] = [];
  const paths: Record<string, unknown> = {};
  const schemas: Record<string, unknown> = {};

  for (const mod of featureSwaggerModules) {
    tags.push(...mod.tags);
    Object.assign(paths, mod.paths);
    if (mod.components?.schemas) {
      Object.assign(schemas, mod.components.schemas);
    }
  }

  return {
    openapi: "3.0.3",
    info: {
      title: "StoreLab API",
      version: "1.0.0",
      description:
        "API StoreLab (Express + Sequelize). Los endpoints de Client están documentados como **SIN AUTH** Todas las rutas business son **SIN AUTH** en este lab.",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: "Local",
      },
    ],
    tags,
    paths,
    components: { schemas },
  };
}

/** Monta Swagger UI y el JSON OpenAPI */
export function setupSwagger(app: Application): void {
  const document = buildOpenApiDocument();
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(document));
  app.get("/api/docs.json", (_req, res) => {
    res.json(document);
  });
  console.log("📘 Swagger UI: /api/docs  |  OpenAPI JSON: /api/docs.json");
}
EOF
```

**PARCHE** — `src/config/index.ts` **ya existe**.

1. **Debajo de** `import { Routes } from "../routes/index";` (o **debajo de** los imports de BD/modelo), **añadir**:

```ts
import { setupSwagger } from "../swagger/index";
```

1. **Dentro del** `constructor`, **debajo de** `this.routes();`, **añadir**:

```ts
    this.docs();
```

1. **Dentro de** la clase `App`, **debajo de** el método `routes()` y **encima de** `dbConnection()`, **añadir**:

```ts
  private docs(): void {
    setupSwagger(this.app);
  }
```

### Verificación ISS-05

```bash
curl -s http://localhost:4000/api/docs.json | head
```

> Con el servidor del cierre: abrir `http://localhost:4000/api/docs`.

**Al agregar otra entidad (patrón):**

1. Archivo **nuevo** `features/.../<plural>.swagger.ts` con `: >` + `cat >>`.
2. **PARCHE** `src/swagger/index.ts`: **debajo de** `import { clientsSwagger } ...`, **añadir** el import; **dentro de** `featureSwaggerModules`, **debajo de** `clientsSwagger,`, **añadir** el módulo nuevo.

### Cierre del ISS

```bash
npm run dev
```

> El servidor debe arrancar sin error. Abrir `http://localhost:4000/api/docs`. Detenerlo con Ctrl+C antes de continuar.

---

> **✅ GATE de la unidad ISS-05** — *este bloque no añade ningún criterio nuevo.*
>
> Las condiciones de cierre son exactamente las que define el ISS técnico de esta misma página:
>
> - 📋 **Criterios de aceptación** → [Criterios de aceptación](https://tecnogua.com/academic/site/backend2026/manual/06-ISS-05-swagger/#criterios-de-aceptacion-iss-05-consolidados)
> - 🧩 **Cierre de la unidad** → [Cierre de la unidad](https://tecnogua.com/academic/site/backend2026/manual/06-ISS-05-swagger/#cierre-del-iss)
> - 🧠 **Autoevaluación** → [Evaluación del cuaderno](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-05-aprendizaje/#evaluacion)
>
> Con el GATE en verde queda habilitado **ISS-06 · Feature ProductType**.
>
> **Navegación de la ruta:** **←** [ISS-05 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-05-aprendizaje/) · [↑ Ruta Express](https://tecnogua.com/academic/site/backend2026/) · **→** [ISS-06 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-06-aprendizaje/)
