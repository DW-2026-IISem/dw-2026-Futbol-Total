# 🛠 Unidad ISS-11 · Features Roles y Resources

[🧠 Comprender este bloque →](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-11-aprendizaje/) · [📝 Evaluación](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-11-aprendizaje/#evaluacion) · [✅ GATE de la unidad](https://tecnogua.com/academic/site/backend2026/manual/13-ISS-11-auth-roles-resources/#criterios-de-aceptacion-iss-11-consolidados)

---

# Fase II: Auth con RBAC — ISS-11 — Features Roles y Resources (catálogo de autorización)

> **Contexto mínimo (autosuficiente).** Proyecto `app-storelab-express-ii` — Express 5 + TypeScript + Sequelize, arquitectura por features. Ya construido: Fase I (Business), infraestructura de seguridad y modelos (ISS-09) y feature Users (ISS-10). Recorrido obligatorio: `HTTP → Controller → Service → Repository → Model → Sequelize → BD`.

## Objetivo

Construir los **dos extremos del permiso**:

- `Role` — el **sujeto** de la autorización.
- `Resource` — el **objeto**, un par `(method, path)`.

Este ISS crea el CRUD administrativo de ambos y el **catálogo semilla de los 58 recursos del sistema**. Las concesiones son el ISS-12.

## Criterios de aceptación (ISS-11) — consolidados

- [ ] **16.1** `features/auth/roles/dto/` completo (`create`, `update`, `patch`, `role-response`, `index`)
- [ ] **16.2** `roles.repository.ts`, `roles.service.ts`, `roles.controller.ts`, `roles.routes.ts` (JWT + RBAC)
- [ ] **16.3** `roles.seeder.ts` (ADMIN, SELLER, idempotente) y `roles.swagger.ts`
- [ ] **16.4** `features/auth/resources/dto/` + `resource-catalog.ts` con **58** recursos
- [ ] **16.5** `resources.repository.ts`, `resources.service.ts`, `resources.controller.ts`, `resources.routes.ts` (JWT + RBAC)
- [ ] **16.6** `resources.seeder.ts` (carga el catálogo) y `resources.swagger.ts`
- [ ] **16.7** archivos `.http` de ambos features
- [ ] `npx tsc --noEmit` OK

---

## 16.1 Feature Roles — DTOs

```text
: > src/features/auth/roles/dto/create-role.dto.ts
cat >> src/features/auth/roles/dto/create-role.dto.ts << 'EOF'
/**
 * Datos de entrada de `POST /api/roles`.
 * `name` se normaliza a MAYÚSCULAS en el modelo.
 */
export interface CreateRoleDto {
  name: string;
  description?: string | null;
  status?: "active" | "inactive";
}
EOF
```

```text
: > src/features/auth/roles/dto/update-role.dto.ts
cat >> src/features/auth/roles/dto/update-role.dto.ts << 'EOF'
/**
 * Datos de entrada de `PUT /api/roles/:id` (reemplazo completo).
 * `status` no está aquí: el estado solo cambia con el borrado lógico.
 */
export interface UpdateRoleDto {
  name: string;
  description?: string | null;
}
EOF
```

```text
: > src/features/auth/roles/dto/patch-role.dto.ts
cat >> src/features/auth/roles/dto/patch-role.dto.ts << 'EOF'
import { UpdateRoleDto } from "./update-role.dto";

/** Datos de entrada de `PATCH /api/roles/:id` (actualización parcial). */
export type PatchRoleDto = Partial<UpdateRoleDto>;
EOF
```

```text
: > src/features/auth/roles/dto/role-response.dto.ts
cat >> src/features/auth/roles/dto/role-response.dto.ts << 'EOF'
import { Role, RoleI } from "../role.model";

/** Respuesta HTTP de un rol. Sin campos internos: el DTO coincide con el modelo. */
export type RoleResponseDto = RoleI;

/** Mapper modelo -> DTO de respuesta (objeto plano). */
export function toRoleResponse(role: Role): RoleResponseDto {
  return role.toJSON() as RoleI;
}
EOF
```

```text
: > src/features/auth/roles/dto/index.ts
cat >> src/features/auth/roles/dto/index.ts << 'EOF'
export * from "./create-role.dto";
export * from "./update-role.dto";
export * from "./patch-role.dto";
export * from "./role-response.dto";
EOF
```

> Un rol se identifica por `name` (UK). **El nombre no autoriza nada**: crear un rol `AUDITOR` no le concede ningún recurso; el rol nace **sin permisos**.

## 16.2 Feature Roles — repository, service, controller y rutas

La implementación sigue la cadena obligatoria:

`HTTP → Controller → Service → Repository → Model → Sequelize → BD`

- `RolesRepository`: acceso exclusivo al modelo `Role`.
- `RolesService`: reglas de negocio, unicidad de nombre y borrado lógico.
- `RolesController`: capa HTTP.
- `RolesRoutes`: todas las operaciones usan **JWT + RBAC**.

### Repository

```typescript
import { CreationAttributes, Transaction } from "sequelize";
import { Role } from "./role.model";

export class RolesRepository {
  public async findAllActive(): Promise<Role[]> {
    return Role.findAll({ where: { status: "active" } });
  }

  public async findById(id: number, transaction?: Transaction): Promise<Role | null> {
    return Role.findByPk(id, { transaction });
  }

  public async findByName(name: string): Promise<Role | null> {
    return Role.findOne({ where: { name: name.trim().toUpperCase() } });
  }

  public async create(data: CreationAttributes<Role>): Promise<Role> {
    return Role.create(data);
  }

  public async update(role: Role, data: Partial<Role>): Promise<Role> {
    return role.update(data);
  }

  public async delete(role: Role): Promise<void> {
    await role.destroy();
  }
}
```

### Service

```typescript
import {
  CreateRoleDto,
  PatchRoleDto,
  RoleResponseDto,
  UpdateRoleDto,
  toRoleResponse,
} from "./dto";
import { RolesRepository } from "./roles.repository";
import { Role } from "./role.model";
import { AppError } from "../../../shared/errors/app-error";

export class RolesService {
  public constructor(
    private readonly repository: RolesRepository = new RolesRepository()
  ) {}

  public async getAll(): Promise<RoleResponseDto[]> {
    const roles = await this.repository.findAllActive();
    return roles.map((role) => toRoleResponse(role));
  }

  public async getOne(id: number): Promise<RoleResponseDto> {
    return toRoleResponse(await this.findOrFail(id));
  }

  public async create(body: CreateRoleDto): Promise<RoleResponseDto> {
    if (!body.name) {
      throw new AppError(400, "name is required");
    }
    await this.assertNameAvailable(body.name);

    const role = await this.repository.create({
      name: body.name,
      description: body.description ?? null,
      status: body.status ?? "active",
    });
    return toRoleResponse(role);
  }

  public async updatePut(id: number, body: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.findOrFail(id);
    await this.assertNameAvailable(body.name, id);

    await this.repository.update(role, {
      name: body.name,
      description: body.description ?? null,
    });
    return toRoleResponse(role);
  }

  public async updatePatch(id: number, body: PatchRoleDto): Promise<RoleResponseDto> {
    const role = await this.findOrFail(id);

    if (body.name) {
      await this.assertNameAvailable(body.name, id);
    }

    await this.repository.update(role, body);
    return toRoleResponse(role);
  }

  public async deletePhysical(id: number): Promise<void> {
    const role = await this.findOrFail(id, false);
    await this.repository.delete(role);
  }

  public async deleteLogical(id: number): Promise<RoleResponseDto> {
    const role = await this.findOrFail(id);
    await this.repository.update(role, { status: "inactive" });
    return toRoleResponse(role);
  }

  private async findOrFail(id: number, onlyActive = true): Promise<Role> {
    const role = await this.repository.findById(id);
    if (!role || (onlyActive && role.status !== "active")) {
      throw new AppError(404, "Role not found");
    }
    return role;
  }

  private async assertNameAvailable(name: string, excludeId?: number): Promise<void> {
    const existing = await this.repository.findByName(name);
    if (existing && existing.id !== excludeId) {
      throw new AppError(409, "Role name already in use");
    }
  }
}
```

### Controller

```typescript
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import { CreateRoleDto, PatchRoleDto, UpdateRoleDto } from "./dto";
import { RolesService } from "./roles.service";

export class RolesController extends BaseController {
  public constructor(
    private readonly service: RolesService = new RolesService()
  ) {
    super();
  }

  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const roles = await this.service.getAll();
      res.status(200).json({ roles });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const role = await this.service.getOne(this.paramId(req));
      res.status(200).json({ role });
    });
  }

  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const role = await this.service.create(req.body as CreateRoleDto);
      res.status(201).json({ role });
    });
  }

  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const role = await this.service.updatePut(
        this.paramId(req),
        req.body as UpdateRoleDto
      );
      res.status(200).json({ role });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const role = await this.service.updatePatch(
        this.paramId(req),
        req.body as PatchRoleDto
      );
      res.status(200).json({ role });
    });
  }

  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const id = this.paramId(req);
      await this.service.deletePhysical(id);
      res.status(200).json({ message: "Role permanently deleted", id });
    });
  }

  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const role = await this.service.deleteLogical(this.paramId(req));
      res.status(200).json({ message: "Role deactivated (logical delete)", role });
    });
  }
}
```

### Routes

```typescript
import { Application } from "express";
import { RolesController } from "./roles.controller";
import { authenticate, authorize } from "../access";

export class RolesRoutes {
  public rolesController: RolesController = new RolesController();

  public routes(app: Application): void {
    app
      .route("/api/roles")
      .get(authenticate, authorize, this.rolesController.getAll.bind(this.rolesController));

    app
      .route("/api/roles/:id")
      .get(authenticate, authorize, this.rolesController.getOne.bind(this.rolesController));

    app
      .route("/api/roles")
      .post(authenticate, authorize, this.rolesController.create.bind(this.rolesController));

    app
      .route("/api/roles/:id")
      .put(authenticate, authorize, this.rolesController.updatePut.bind(this.rolesController))
      .patch(authenticate, authorize, this.rolesController.updatePatch.bind(this.rolesController));

    app
      .route("/api/roles/:id")
      .delete(
        authenticate,
        authorize,
        this.rolesController.deletePhysical.bind(this.rolesController)
      );

    app
      .route("/api/roles/:id/deactivate")
      .patch(authenticate, authorize, this.rolesController.deleteLogical.bind(this.rolesController));
  }
}
```

## 16.3 Feature Roles — seeder y swagger

Roles semilla:

- `ADMIN`
- `SELLER`

El seeder es determinista e idempotente mediante `findOrCreate`; si un rol existente está inactivo, se reactiva.

```typescript
import { Role } from "./role.model";

export const SEED_ROLES = [
  { name: "ADMIN", description: "Administración del sistema: gestiona usuarios, roles y permisos" },
  { name: "SELLER", description: "Operación de ventas: consulta catálogo y registra ventas" },
] as const;

export async function seedRoles(): Promise<number> {
  let created = 0;

  for (const item of SEED_ROLES) {
    const [role, wasCreated] = await Role.findOrCreate({
      where: { name: item.name },
      defaults: { name: item.name, description: item.description, status: "active" },
    });

    if (wasCreated) {
      created++;
      continue;
    }
    if (role.status !== "active") {
      await role.update({ status: "active" });
    }
  }

  console.log(`✅ roles: catálogo reconciliado (${SEED_ROLES.length} roles, ${created} nuevos)`);
  return created;
}
```

La documentación Swagger define todas las rutas de Roles con **JWT + RBAC**, incluyendo respuestas 401, 403, 404 y validación de conflictos 409.

## 16.4 Feature Resources — DTOs y catálogo semilla

Los DTOs de Resources definen:

```typescript
export interface CreateResourceDto {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description?: string | null;
  status?: "active" | "inactive";
}
```

`UpdateResourceDto` usa `method`, `path` y `description`; `PatchResourceDto` es parcial; `ResourceResponseDto` corresponde al modelo mediante `toResourceResponse`.

### Catálogo de 58 recursos

El catálogo es la fuente única para sembrar `resources` y derivar las concesiones de roles.

| Grupo | Recursos |
|---|---:|
| Clientes | 7 |
| Tipos de producto | 7 |
| Productos | 7 |
| Ventas | 3 |
| Detalle de ventas | 1 |
| Usuarios (+ cambio de contraseña + permisos) | 9 |
| Roles | 7 |
| Recursos | 7 |
| Asignaciones usuario-rol | 5 |
| Concesiones rol-recurso | 5 |
| **Total** | **58** |

Los 7 recursos marcados para `SELLER` son:

- `GET /api/clientes`
- `GET /api/clientes/:id`
- `GET /api/productos`
- `GET /api/productos/:id`
- `GET /api/ventas`
- `GET /api/ventas/:id`
- `POST /api/ventas`

Las operaciones de sesión `/api/sesion/*` y `/api/sesiones/*` no son recursos RBAC.

El catálogo completo se define en `src/features/auth/resources/resource-catalog.ts` con `RESOURCE_CATALOG` y `SELLER_RESOURCES`.

## 16.5 Feature Resources — repository, service, controller y rutas

La capa Repository trabaja exclusivamente con `Resource`; la capa Service aplica la regla de unicidad `(method, path)` y devuelve **409** cuando ya existe; Controller maneja HTTP; Routes usa **JWT + RBAC**.

Rutas:

- `GET /api/recursos`
- `GET /api/recursos/:id`
- `POST /api/recursos`
- `PUT /api/recursos/:id`
- `PATCH /api/recursos/:id`
- `DELETE /api/recursos/:id`
- `PATCH /api/recursos/:id/deactivate`

`POST /api/recursos` con un `(method, path)` existente → **409**, por la restricción `UQ(method, path)`.

## 16.6 Feature Resources — seeder y swagger

El seeder es idempotente y reconciliador: usa `findOrCreate` por `(method, path)` y reactiva filas inactivas.

```typescript
import { Resource } from "./resource.model";
import { RESOURCE_CATALOG } from "./resource-catalog";

export async function seedResources(): Promise<number> {
  let created = 0;

  for (const item of RESOURCE_CATALOG) {
    const [resource, wasCreated] = await Resource.findOrCreate({
      where: { method: item.method, path: item.path },
      defaults: {
        method: item.method,
        path: item.path,
        description: item.description,
        status: "active",
      },
    });

    if (wasCreated) {
      created++;
      continue;
    }
    if (resource.status !== "active") {
      await resource.update({ status: "active" });
    }
  }

  console.log(
    `✅ resources: catálogo reconciliado (${RESOURCE_CATALOG.length} recursos, ${created} nuevos)`
  );
  return created;
}
```

Swagger documenta las rutas de Resources con **JWT + RBAC**, esquemas `Resource`, `ResourceCreate`, `ResourceUpdate` y `ResourcePatch`.

## 16.7 Pruebas HTTP

Archivos:

- `src/features/auth/roles/http/roles.get.http`
- `src/features/auth/resources/http/resources.get.http`

Las pruebas incluyen login como `admin` y `seller`, CRUD de Roles, validación de 403 para SELLER, CRUD de Resources, conflicto 409 por duplicado y desactivación lógica.

## Verificación

```bash
npx tsc --noEmit
npm run db:seed
```

```sql
SELECT COUNT(*) FROM resources;   -- 58
SELECT COUNT(*) FROM roles;       -- 2
SELECT name, status FROM roles;   -- ADMIN, SELLER
```

## DoD del ISS-11

- [ ] Todos los criterios de aceptación (16.1 … 16.7) cumplidos
- [ ] `resources` tiene **58** filas y `UQ(method, path)` impide duplicados (409)
- [ ] Los roles se crean **sin** permisos; concederlos es el ISS-12
- [ ] `npx tsc --noEmit` sin errores y `npm run db:seed` idempotente

---

> **✅ GATE de la unidad ISS-11**
>
> Las condiciones de cierre son exactamente las que define el ISS técnico:
>
> - Criterios de aceptación 16.1 … 16.7
> - DoD del ISS-11
> - Autoevaluación del cuaderno
>
> Con el GATE en verde queda habilitado **ISS-12 · Features RoleUsers y ResourceRoles**.
