# 🛠 Unidad ISS-12 · Features RoleUsers y ResourceRoles

[🧠 Comprender este bloque →](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-12-aprendizaje/) · [📝 Evaluación](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-12-aprendizaje/#evaluacion) · [✅ GATE de la unidad](https://tecnogua.com/academic/site/backend2026/manual/14-ISS-12-auth-role-users-resource-roles/#criterios-de-aceptacion-iss-12-consolidados)

| **Capa** | **Página** | **Para qué** |
| :--- | :--- | :--- |
| 🧠 **Aprender** | [Features RoleUsers y ResourceRoles](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-12-aprendizaje/) | comprender, explicar y relacionar |
| 🛠 **Construir** | esta página | ejecutar, programar y verificar |
| ✅ **GATE** | [Condiciones de cierre](https://tecnogua.com/academic/site/backend2026/manual/14-ISS-12-auth-role-users-resource-roles/#criterios-de-aceptacion-iss-12-consolidados) | condición para pasar al bloque siguiente |

**Esta es la guía ejecutable.** Sigue los pasos en orden. El cuerpo de abajo es el **ISS técnico verbatim**: comandos, rutas, versiones, PARCHEs, verificaciones y criterios, sin simplificar ni modernizar.

---

# Fase II: Auth con RBAC — ISS-12 — Features RoleUsers y ResourceRoles (asignar roles y conceder permisos)

> **Contexto mínimo (autosuficiente).** Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que hay que saber antes de ejecutarlo.
>
> - **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript + Sequelize, **arquitectura por features**.
> - **Ya construido:** Fase I, infraestructura y modelos ([ISS-09](https://tecnogua.com/academic/site/backend2026/manual/11-ISS-09-auth-base/)), [ISS-10 Users](https://tecnogua.com/academic/site/backend2026/manual/12-ISS-10-auth-users/) e [ISS-11 Roles/Resources](https://tecnogua.com/academic/site/backend2026/manual/13-ISS-11-auth-roles-resources/).
> - **Recorrido obligatorio de una petición:** `HTTP → Controller → Service → Repository → Model → Sequelize → BD`. Ninguna capa se salta a la siguiente.
> - **Diseño de datos (Fase II):** [`../bd-storelab.md`](https://tecnogua.com/academic/site/backend2026/bd-storelab/) §14.4 (`role_users`), §14.5 (`resource_roles`), §15 (por qué no hay `permissions`) y §16 (consulta de autorización efectiva).
> - **Capas, convenciones y reglas transversales:** [`00-contexto.md`](https://tecnogua.com/academic/site/backend2026/manual/00-contexto/).

| **Este ISS** | |
| :--- | :--- |
| **Título** | Features RoleUsers y ResourceRoles |
| **Feature / tablas** | `features/auth/role-users/` · `role_users` — `features/auth/resource-roles/` · `resource_roles` |
| **API** | `/api/asignaciones-rol…` y `/api/concesiones-rol…` (JWT + RBAC) |
| **Depende de** | [ISS-11 — Features Roles y Resources](https://tecnogua.com/academic/site/backend2026/manual/13-ISS-11-auth-roles-resources/) |
| **Habilita** | [ISS-13 — Middlewares de acceso](https://tecnogua.com/academic/site/backend2026/manual/15-ISS-13-auth-access/) |

## Contenido de este ISS

- 17.1 DTOs de RoleUsers
- 17.2 Repository, service, controller y rutas de RoleUsers
- 17.3 Seeder y swagger de RoleUsers
- 17.4 DTOs de ResourceRoles
- 17.5 Repository, service, controller y rutas de ResourceRoles
- 17.6 `reconcileRole` — la matriz determinista
- 17.7 Seeder de la matriz + swagger
- 17.8 Pruebas HTTP

---

**Objetivo:** construir las **dos tablas pivote** que convierten el modelo en autorización real:

```text
User   ──(RoleUser)────▶  Role   ──(ResourceRole)────▶  Resource
        «quién tiene        «qué agrupa»       «qué se concede»
         qué rol»
```

Son los métodos que **añaden permisos a los recursos** (el requisito explícito de la Fase II): sin estas dos features, `Role` y `Resource` serían catálogos inertes.

**Bloqueado por:** [ISS-11](https://tecnogua.com/academic/site/backend2026/manual/13-ISS-11-auth-roles-resources/).

### Criterios de aceptación (ISS-12) — consolidados

- [ ] **17.1** `role-users/dto/` (`create-role-user.dto.ts`, `role-user-response.dto.ts`, `index.ts`)
- [ ] **17.2** `role-users.{repository,service,controller,routes}.ts`; `POST /api/asignaciones-rol` **idempotente** (reactiva si existía inactiva)
- [ ] **17.3** `role-users.seeder.ts` (admin→ADMIN, seller→SELLER) y `role-users.swagger.ts`
- [ ] **17.4** `resource-roles/dto/` (`create-resource-role.dto.ts`, `list-resource-roles.dto.ts`, `resource-role-response.dto.ts`, `index.ts`)
- [ ] **17.5** `resource-roles.{repository,service,controller,routes}.ts`; `POST /api/concesiones-rol` idempotente y `/deactivate` · `/reactivate`
- [ ] **17.6** `ResourceRolesService.reconcileRole(roleId, resourceIds)` determinista (concede lo que falta, reactiva, retira lo que sobra)
- [ ] **17.7** `resource-roles.seeder.ts` construye la matriz (**ADMIN 58**, **SELLER 7**) y `resource-roles.swagger.ts`
- [ ] **17.8** archivos `.http` de ambos features
- [ ] `npx tsc --noEmit` OK

---

## 17.1 DTOs de RoleUsers

```bash
: > src/features/auth/role-users/dto/create-role-user.dto.ts
cat >> src/features/auth/role-users/dto/create-role-user.dto.ts << 'EOF'
/**
 * Datos de entrada de `POST /api/asignaciones-rol` — **asignar un rol a un usuario**.
 *
 * Es el primer eslabón de la autorización. Se envía la pareja de identificadores;
 * si la asignación ya existía inactiva, se **reactiva** en lugar de duplicarla
 * (la restricción única `(user_id, role_id)` lo garantiza).
 */
export interface CreateRoleUserDto {
  user_id: number;
  role_id: number;
}
EOF
```

```bash
: > src/features/auth/role-users/dto/role-user-response.dto.ts
cat >> src/features/auth/role-users/dto/role-user-response.dto.ts << 'EOF'
import { RoleUser, RoleUserI } from "../role-user.model";

/**
 * Respuesta HTTP de una asignación usuario-rol.
 *
 * Incluye, además de las claves foráneas, un resumen del usuario y del rol
 * (`user`, `role`) para que el consumidor no tenga que hacer dos peticiones
 * extra. La proyección del usuario **excluye la contraseña** por `attributes`
 * en el `include` del repository, no aquí: nunca sale de la base de datos.
 */
export interface RoleUserResponseDto extends RoleUserI {
  user?: { id: number; username: string; email: string } | null;
  role?: { id: number; name: string } | null;
}

/** Mapper modelo -> DTO de respuesta (objeto plano, con resúmenes si vienen). */
export function toRoleUserResponse(roleUser: RoleUser): RoleUserResponseDto {
  return roleUser.toJSON() as RoleUserResponseDto;
}
EOF

: > src/features/auth/role-users/dto/index.ts
cat >> src/features/auth/role-users/dto/index.ts << 'EOF'
export * from "./create-role-user.dto";
export * from "./role-user-response.dto";
EOF
```

## 17.2 RoleUsers — repository, service, controller y rutas

**Asignar un rol es un *upsert* lógico**, no un alta a ciegas:

| **Situación de `(user_id, role_id)`** | **Resultado** |
| :--- | :--- |
| No existe | se crea la fila `active` |
| Existe `active` | **409** (ya está asignado) |
| Existe `inactive` | se **reactiva** (no se duplica) |

No hay borrado físico: retirar un rol es `PATCH /:id/deactivate` y la auditoría de quién tuvo qué rol se conserva.

```bash
: > src/features/auth/role-users/role-users.repository.ts
cat >> src/features/auth/role-users/role-users.repository.ts << 'EOF'
import { CreationAttributes, Transaction } from "sequelize";
import { RoleUser } from "./role-user.model";
import { Role } from "../roles/role.model";
import { User } from "../users/user.model";

/** `include` reutilizable: resumen del usuario (sin contraseña) y del rol. */
const SUMMARIES = [
  { model: User, as: "user", attributes: ["id", "username", "email"] },
  { model: Role, as: "role", attributes: ["id", "name"] },
];

/**
 * Capa Repository del feature RoleUsers (tabla `role_users`).
 * Única que habla con Sequelize. La proyección del usuario excluye `password`.
 */
export class RoleUsersRepository {
  /** Asignaciones activas (con resumen de usuario y rol). */
  public async findAllActive(): Promise<RoleUser[]> {
    return RoleUser.findAll({ where: { status: "active" }, include: SUMMARIES });
  }

  /** Una asignación por PK (o `null`). */
  public async findById(id: number, transaction?: Transaction): Promise<RoleUser | null> {
    return RoleUser.findByPk(id, { include: SUMMARIES, transaction });
  }

  /**
   * La asignación de un usuario a un rol, sea cual sea su estado.
   *
   * Permite la semántica *create-or-reactivate*: si ya existe inactiva, se
   * reactiva en lugar de chocar con la restricción única `(user_id, role_id)`.
   */
  public async findByUserAndRole(userId: number, roleId: number): Promise<RoleUser | null> {
    return RoleUser.findOne({ where: { user_id: userId, role_id: roleId } });
  }

  /** Inserta una asignación. */
  public async create(data: CreationAttributes<RoleUser>): Promise<RoleUser> {
    return RoleUser.create(data);
  }

  /** Persiste cambios sobre una instancia existente. */
  public async update(roleUser: RoleUser, data: Partial<RoleUser>): Promise<RoleUser> {
    return roleUser.update(data);
  }
}
EOF
```

```bash
: > src/features/auth/role-users/role-users.service.ts
cat >> src/features/auth/role-users/role-users.service.ts << 'EOF'
import {
  CreateRoleUserDto,
  RoleUserResponseDto,
  toRoleUserResponse,
} from "./dto";
import { RoleUsersRepository } from "./role-users.repository";
import { RoleUser } from "./role-user.model";
import { UsersRepository } from "../users/users.repository";
import { RolesRepository } from "../roles/roles.repository";
import { AppError } from "../../../shared/errors/app-error";

/**
 * Capa Service del feature RoleUsers — **asignaciones usuario ↔ rol**.
 *
 * Aquí empieza la administración de la autorización. Reglas de negocio:
 *  - Solo se asigna un rol **activo** a un usuario **activo** (un eslabón
 *    inactivo rompería la cadena y el permiso no se concedería de todos modos).
 *  - Asignar es **idempotente**: si la pareja ya existía desactivada, se
 *    reactiva; si ya estaba activa, se informa 409 sin duplicar filas.
 *  - Retirar es un borrado lógico: preserva la auditoría y es reversible.
 *
 * El efecto es inmediato: la próxima petición del usuario vuelve a consultar la
 * cadena RBAC y ya ve (o deja de ver) el permiso. No hay caché que invalidar.
 */
export class RoleUsersService {
  public constructor(
    private readonly repository: RoleUsersRepository = new RoleUsersRepository(),
    private readonly usersRepository: UsersRepository = new UsersRepository(),
    private readonly rolesRepository: RolesRepository = new RolesRepository()
  ) {}

  // ================== READ ==================
  public async getAll(): Promise<RoleUserResponseDto[]> {
    const assignments = await this.repository.findAllActive();
    return assignments.map((assignment) => toRoleUserResponse(assignment));
  }

  public async getOne(id: number): Promise<RoleUserResponseDto> {
    return toRoleUserResponse(await this.findOrFail(id));
  }

  // ================== CREATE (asignar) ==================
  /** Asigna un rol a un usuario (o reactiva la asignación existente). */
  public async assign(body: CreateRoleUserDto): Promise<RoleUserResponseDto> {
    if (!body.user_id || !body.role_id) {
      throw new AppError(400, "user_id and role_id are required");
    }

    await this.assertUserActive(body.user_id);
    await this.assertRoleActive(body.role_id);

    const existing = await this.repository.findByUserAndRole(body.user_id, body.role_id);
    if (existing) {
      if (existing.status === "active") {
        throw new AppError(409, "Role is already assigned to this user");
      }
      const reactivated = await this.repository.update(existing, { status: "active" });
      return toRoleUserResponse(await this.reload(reactivated.id));
    }

    const created = await this.repository.create({
      user_id: body.user_id,
      role_id: body.role_id,
      status: "active",
    });
    return toRoleUserResponse(await this.reload(created.id));
  }

  // ================== STATE (retirar / reactivar) ==================
  /** Retirar el rol -> `status = inactive`. El usuario pierde los permisos del rol. */
  public async deactivate(id: number): Promise<RoleUserResponseDto> {
    const assignment = await this.findOrFail(id);
    await this.repository.update(assignment, { status: "inactive" });
    return toRoleUserResponse(await this.reload(assignment.id));
  }

  /** Reactivar la asignación. */
  public async reactivate(id: number): Promise<RoleUserResponseDto> {
    const assignment = await this.findOrFail(id, false);
    if (assignment.status === "active") {
      throw new AppError(409, "Assignment is already active");
    }
    await this.repository.update(assignment, { status: "active" });
    return toRoleUserResponse(await this.reload(assignment.id));
  }

  // ================== HELPERS ==================
  private async findOrFail(id: number, onlyActive = true): Promise<RoleUser> {
    const assignment = await this.repository.findById(id);
    if (!assignment || (onlyActive && assignment.status !== "active")) {
      throw new AppError(404, "Role assignment not found");
    }
    return assignment;
  }

  /** Recarga con los `include` de resumen (el `findById` ya los trae). */
  private async reload(id: number): Promise<RoleUser> {
    const assignment = await this.repository.findById(id);
    if (!assignment) {
      throw new AppError(404, "Role assignment not found");
    }
    return assignment;
  }

  private async assertUserActive(userId: number): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user || user.status !== "active") {
      throw new AppError(404, "User not found or inactive");
    }
  }

  private async assertRoleActive(roleId: number): Promise<void> {
    const role = await this.rolesRepository.findById(roleId);
    if (!role || role.status !== "active") {
      throw new AppError(404, "Role not found or inactive");
    }
  }
}
EOF
```

```bash
: > src/features/auth/role-users/role-users.controller.ts
cat >> src/features/auth/role-users/role-users.controller.ts << 'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import { CreateRoleUserDto } from "./dto";
import { RoleUsersService } from "./role-users.service";

/**
 * Capa Controller del feature RoleUsers.
 *
 * Orden de operaciones (el mismo patrón del proyecto):
 * getAll → getOne → assign (create) → deactivate → reactivate.
 * No expone borrado físico: la revocación es lógica para preservar auditoría.
 */
export class RoleUsersController extends BaseController {
  public constructor(
    private readonly service: RoleUsersService = new RoleUsersService()
  ) {
    super();
  }

  // ================== READ ==================
  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const assignments = await this.service.getAll();
      res.status(200).json({ assignments });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const assignment = await this.service.getOne(this.paramId(req));
      res.status(200).json({ assignment });
    });
  }

  // ================== CREATE (asignar) ==================
  public async assign(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const assignment = await this.service.assign(req.body as CreateRoleUserDto);
      res.status(201).json({ assignment });
    });
  }

  // ================== STATE ==================
  /** Retirar el rol (borrado lógico). */
  public async deactivate(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const assignment = await this.service.deactivate(this.paramId(req));
      res.status(200).json({ message: "Role assignment deactivated", assignment });
    });
  }

  /** Reactivar la asignación. */
  public async reactivate(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const assignment = await this.service.reactivate(this.paramId(req));
      res.status(200).json({ message: "Role assignment reactivated", assignment });
    });
  }
}
EOF
```

```bash
: > src/features/auth/role-users/role-users.routes.ts
cat >> src/features/auth/role-users/role-users.routes.ts << 'EOF'
import { Application } from "express";
import { RoleUsersController } from "./role-users.controller";
import { authenticate, authorize } from "../access";

/**
 * Rutas del feature RoleUsers — **modalidad 3 (JWT + RBAC)**.
 *
 * Es la vía administrativa para **asignar un rol a un usuario**:
 * `POST /api/asignaciones-rol` con `{ user_id, role_id }`.
 *
 * No hay borrado físico: retirar un rol es un borrado lógico (`/deactivate`) y
 * es reversible (`/reactivate`). La auditoría de quién tuvo qué rol se conserva.
 */
export class RoleUsersRoutes {
  public roleUsersController: RoleUsersController = new RoleUsersController();

  public routes(app: Application): void {
    app.route("/api/asignaciones-rol").get(
      authenticate,
      authorize,
      this.roleUsersController.getAll.bind(this.roleUsersController)
    );

    app.route("/api/asignaciones-rol/:id").get(
      authenticate,
      authorize,
      this.roleUsersController.getOne.bind(this.roleUsersController)
    );

    app.route("/api/asignaciones-rol").post(
      authenticate,
      authorize,
      this.roleUsersController.assign.bind(this.roleUsersController)
    );

    app.route("/api/asignaciones-rol/:id/deactivate").patch(
      authenticate,
      authorize,
      this.roleUsersController.deactivate.bind(this.roleUsersController)
    );

    app.route("/api/asignaciones-rol/:id/reactivate").patch(
      authenticate,
      authorize,
      this.roleUsersController.reactivate.bind(this.roleUsersController)
    );
  }
}
EOF
```

## 17.3 RoleUsers — seeder y swagger

```bash
: > src/features/auth/role-users/role-users.seeder.ts
cat >> src/features/auth/role-users/role-users.seeder.ts << 'EOF'
import { RoleUser } from "./role-user.model";
import { Role } from "../roles/role.model";
import { User } from "../users/user.model";

export const SEED_ROLE_USERS = [
  { username: "admin", roleName: "ADMIN" },
  { username: "seller", roleName: "SELLER" },
] as const;

export async function seedRoleUsers(): Promise<number> {
  let created = 0;

  for (const item of SEED_ROLE_USERS) {
    const user = await User.findOne({ where: { username: item.username } });
    const role = await Role.findOne({ where: { name: item.roleName } });

    if (!user || !role) {
      console.log(
        `⏭️  role_users: falta ${item.username} o ${item.roleName}, se omite esa asignación`
      );
      continue;
    }

    const [assignment, wasCreated] = await RoleUser.findOrCreate({
      where: { user_id: user.id, role_id: role.id },
      defaults: { user_id: user.id, role_id: role.id, status: "active" },
    });

    if (wasCreated) {
      created++;
      continue;
    }
    if (assignment.status !== "active") {
      await assignment.update({ status: "active" });
    }
  }

  console.log(
    `✅ role_users: asignaciones reconciliadas (${SEED_ROLE_USERS.length}, ${created} nuevas)`
  );
  return created;
}
EOF
```

```bash
: > src/features/auth/role-users/role-users.swagger.ts
cat >> src/features/auth/role-users/role-users.swagger.ts << 'EOF'
import {
  bearerSecurity,
  forbiddenResponse,
  invalidIdResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

export const roleUsersSwagger = {
  tags: [
    {
      name: "Asignaciones usuario-rol",
      description:
        "Asignar / retirar / reactivar el rol de un usuario (`role_users`) — **JWT + RBAC**",
    },
  ],
  paths: {
    "/api/asignaciones-rol": {
      get: {
        tags: ["Asignaciones usuario-rol"],
        summary: "Listar asignaciones activas",
        description:
          "JWT + RBAC — recurso `GET /api/asignaciones-rol`. Incluye un resumen del usuario (sin `password`) y del rol.",
        security: bearerSecurity,
        responses: {
          "200": { description: "Lista de asignaciones (`{ assignments: [...] }`)" },
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
        },
      },
      post: {
        tags: ["Asignaciones usuario-rol"],
        summary: "Asignar rol a usuario",
        description:
          "JWT + RBAC — recurso `POST /api/asignaciones-rol`. " +
          "Cuerpo: `{ user_id, role_id }`. Es idempotente: si la pareja existía desactivada, se reactiva. " +
          "El usuario y el rol deben estar activos.",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RoleUserCreate" } },
          },
        },
        responses: {
          "201": { description: "Asignación creada (`{ assignment }`)" },
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": { description: "Usuario o rol inexistente o inactivo" },
          "409": { description: "El rol ya está asignado a ese usuario" },
        },
      },
    },
    "/api/asignaciones-rol/{id}": {
      get: {
        tags: ["Asignaciones usuario-rol"],
        summary: "Obtener asignación por id",
        description: "JWT + RBAC — recurso `GET /api/asignaciones-rol/:id`.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Asignación (`{ assignment }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/asignaciones-rol/{id}/deactivate": {
      patch: {
        tags: ["Asignaciones usuario-rol"],
        summary: "Retirar rol a usuario (borrado lógico)",
        description:
          "JWT + RBAC — recurso `PATCH /api/asignaciones-rol/:id/deactivate`. " +
          "Rompe el eslabón `role_users` -> el usuario pierde los permisos de ese rol de inmediato (403).",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Asignación desactivada (`{ message, assignment }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/asignaciones-rol/{id}/reactivate": {
      patch: {
        tags: ["Asignaciones usuario-rol"],
        summary: "Reactivar asignación",
        description:
          "JWT + RBAC — recurso `PATCH /api/asignaciones-rol/:id/reactivate`. Reversible: vuelve a conceder los permisos del rol.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Asignación reactivada (`{ message, assignment }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
          "409": { description: "La asignación ya estaba activa" },
        },
      },
    },
  },
  components: {
    schemas: {
      RoleUser: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          user_id: { type: "integer", example: 1 },
          role_id: { type: "integer", example: 1 },
          status: { type: "string", enum: ["active", "inactive"], example: "active" },
          user: {
            type: "object",
            properties: {
              id: { type: "integer" },
              username: { type: "string" },
              email: { type: "string", format: "email" },
            },
          },
          role: {
            type: "object",
            properties: { id: { type: "integer" }, name: { type: "string" } },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      RoleUserCreate: {
        type: "object",
        required: ["user_id", "role_id"],
        properties: {
          user_id: { type: "integer", example: 2 },
          role_id: { type: "integer", example: 2 },
        },
      },
    },
  },
};
EOF
```

## 17.4 DTOs de ResourceRoles

```bash
: > src/features/auth/resource-roles/dto/create-resource-role.dto.ts
cat >> src/features/auth/resource-roles/dto/create-resource-role.dto.ts << 'EOF'
export interface CreateResourceRoleDto {
  role_id: number;
  resource_id: number;
}
EOF

: > src/features/auth/resource-roles/dto/list-resource-roles.dto.ts
cat >> src/features/auth/resource-roles/dto/list-resource-roles.dto.ts << 'EOF'
export interface ListResourceRolesDto {
  role_id?: number;
  resource_id?: number;
}
EOF

: > src/features/auth/resource-roles/dto/resource-role-response.dto.ts
cat >> src/features/auth/resource-roles/dto/resource-role-response.dto.ts << 'EOF'
import { ResourceRole, ResourceRoleI } from "../resource-role.model";

export interface ResourceRoleResponseDto extends ResourceRoleI {
  role?: { id: number; name: string } | null;
  resource?: {
    id: number;
    method: string;
    path: string;
    description: string | null;
  } | null;
}

export function toResourceRoleResponse(resourceRole: ResourceRole): ResourceRoleResponseDto {
  return resourceRole.toJSON() as ResourceRoleResponseDto;
}

export interface EffectivePermissionDto {
  resource_id: number;
  method: string;
  path: string;
  description: string | null;
  role_id: number;
  role_name: string;
}
EOF

: > src/features/auth/resource-roles/dto/index.ts
cat >> src/features/auth/resource-roles/dto/index.ts << 'EOF'
export * from "./create-resource-role.dto";
export * from "./list-resource-roles.dto";
export * from "./resource-role-response.dto";
EOF
```

El DTO de listado admite dos filtros que se usan para auditar la matriz desde ambos lados:

- `?role_id=` — «¿qué concede este rol?»
- `?resource_id=` — «¿qué roles conceden este recurso?»

## 17.5 ResourceRoles — repository, service, controller y rutas

`POST /api/concesiones-rol` con `{ role_id, resource_id }` **materializa el permiso**. Misma semántica idempotente que en RoleUsers.

```bash
: > src/features/auth/resource-roles/resource-roles.repository.ts
cat >> src/features/auth/resource-roles/resource-roles.repository.ts << 'EOF'
import { CreationAttributes, Op, Transaction } from "sequelize";
import { ResourceRole } from "./resource-role.model";
import { Role } from "../roles/role.model";
import { Resource } from "../resources/resource.model";
import { RoleUser } from "../role-users/role-user.model";
import { EffectivePermissionDto } from "./dto";

const SUMMARIES = [
  { model: Role, as: "role", attributes: ["id", "name"] },
  {
    model: Resource,
    as: "resource",
    attributes: ["id", "method", "path", "description"],
  },
];

export class ResourceRolesRepository {
  public async findAllActive(): Promise<ResourceRole[]> {
    return ResourceRole.findAll({ where: { status: "active" }, include: SUMMARIES });
  }

  public async findAllActiveFiltered(filters: {
    role_id?: number;
    resource_id?: number;
  }): Promise<ResourceRole[]> {
    const where: Record<string, unknown> = { status: "active" };
    if (filters.role_id) where.role_id = filters.role_id;
    if (filters.resource_id) where.resource_id = filters.resource_id;

    return ResourceRole.findAll({ where, include: SUMMARIES, order: [["id", "ASC"]] });
  }

  public async findById(id: number, transaction?: Transaction): Promise<ResourceRole | null> {
    return ResourceRole.findByPk(id, { include: SUMMARIES, transaction });
  }

  public async findByRoleAndResource(
    roleId: number,
    resourceId: number
  ): Promise<ResourceRole | null> {
    return ResourceRole.findOne({
      where: { role_id: roleId, resource_id: resourceId },
    });
  }

  public async findAllByRole(roleId: number, transaction?: Transaction): Promise<ResourceRole[]> {
    return ResourceRole.findAll({ where: { role_id: roleId }, transaction });
  }

  public async create(
    data: CreationAttributes<ResourceRole>,
    transaction?: Transaction
  ): Promise<ResourceRole> {
    return ResourceRole.create(data, { transaction });
  }

  public async update(
    resourceRole: ResourceRole,
    data: Partial<ResourceRole>,
    transaction?: Transaction
  ): Promise<ResourceRole> {
    return resourceRole.update(data, { transaction });
  }

  public async findEffectiveForUser(userId: number): Promise<EffectivePermissionDto[]> {
    const rows = await ResourceRole.findAll({
      where: { status: "active" },
      attributes: ["id"],
      include: [
        {
          model: Role,
          as: "role",
          required: true,
          attributes: ["id", "name"],
          where: { status: "active" },
          include: [
            {
              model: RoleUser,
              as: "role_users",
              required: true,
              attributes: [],
              where: { status: "active", user_id: userId },
            },
          ],
        },
        {
          model: Resource,
          as: "resource",
          required: true,
          attributes: ["id", "method", "path", "description"],
          where: { status: "active" },
        },
      ],
      order: [["id", "ASC"]],
    });

    return rows.map((row) => {
      const plain = row.toJSON() as unknown as {
        role: { id: number; name: string };
        resource: { id: number; method: string; path: string; description: string | null };
      };
      return {
        resource_id: plain.resource.id,
        method: plain.resource.method,
        path: plain.resource.path,
        description: plain.resource.description,
        role_id: plain.role.id,
        role_name: plain.role.name,
      };
    });
  }

  public async countActiveByRole(roleId: number): Promise<number> {
    return ResourceRole.count({ where: { role_id: roleId, status: "active" } });
  }

  public async countActive(): Promise<number> {
    return ResourceRole.count({ where: { status: "active" } });
  }

  public async countActiveByResources(resourceIds: number[]): Promise<number> {
    if (resourceIds.length === 0) return 0;
    return ResourceRole.count({
      where: { resource_id: { [Op.in]: resourceIds }, status: "active" },
    });
  }
}
EOF
```

```bash
: > src/features/auth/resource-roles/resource-roles.service.ts
cat >> src/features/auth/resource-roles/resource-roles.service.ts << 'EOF'
import {
  CreateResourceRoleDto,
  EffectivePermissionDto,
  ListResourceRolesDto,
  ResourceRoleResponseDto,
  toResourceRoleResponse,
} from "./dto";
import { ResourceRolesRepository } from "./resource-roles.repository";
import { ResourceRole } from "./resource-role.model";
import { RolesRepository } from "../roles/roles.repository";
import { ResourcesRepository } from "../resources/resources.repository";
import { AppError } from "../../../shared/errors/app-error";
import { withTransaction } from "../../../shared/database/with-transaction";

export interface ReconcileResult {
  role_id: number;
  activated: number;
  deactivated: number;
  total_active: number;
}

export class ResourceRolesService {
  public constructor(
    private readonly repository: ResourceRolesRepository = new ResourceRolesRepository(),
    private readonly rolesRepository: RolesRepository = new RolesRepository(),
    private readonly resourcesRepository: ResourcesRepository = new ResourcesRepository()
  ) {}

  public async getAll(filters: ListResourceRolesDto = {}): Promise<ResourceRoleResponseDto[]> {
    const grants = await this.repository.findAllActiveFiltered({
      role_id: filters.role_id,
      resource_id: filters.resource_id,
    });
    return grants.map((grant) => toResourceRoleResponse(grant));
  }

  public async getOne(id: number): Promise<ResourceRoleResponseDto> {
    return toResourceRoleResponse(await this.findOrFail(id));
  }

  public async findEffectiveForUser(userId: number): Promise<EffectivePermissionDto[]> {
    return this.repository.findEffectiveForUser(userId);
  }

  public async grant(body: CreateResourceRoleDto): Promise<ResourceRoleResponseDto> {
    if (!body.role_id || !body.resource_id) {
      throw new AppError(400, "role_id and resource_id are required");
    }

    const role = await this.rolesRepository.findById(body.role_id);
    if (!role || role.status !== "active") {
      throw new AppError(404, "Role not found or inactive");
    }
    const resource = await this.resourcesRepository.findById(body.resource_id);
    if (!resource || resource.status !== "active") {
      throw new AppError(404, "Resource not found or inactive");
    }

    const existing = await this.repository.findByRoleAndResource(body.role_id, body.resource_id);
    if (existing) {
      if (existing.status === "active") {
        throw new AppError(409, "Role already has this resource granted");
      }
      const reactivated = await this.repository.update(existing, { status: "active" });
      return toResourceRoleResponse(await this.reload(reactivated.id));
    }

    const created = await this.repository.create({
      role_id: body.role_id,
      resource_id: body.resource_id,
      status: "active",
    });
    return toResourceRoleResponse(await this.reload(created.id));
  }

  public async deactivate(id: number): Promise<ResourceRoleResponseDto> {
    const grant = await this.findOrFail(id);
    await this.repository.update(grant, { status: "inactive" });
    return toResourceRoleResponse(await this.reload(grant.id));
  }

  public async reactivate(id: number): Promise<ResourceRoleResponseDto> {
    const grant = await this.findOrFail(id, false);
    if (grant.status === "active") {
      throw new AppError(409, "Grant is already active");
    }
    await this.repository.update(grant, { status: "active" });
    return toResourceRoleResponse(await this.reload(grant.id));
  }

  public async reconcileRole(roleId: number, resourceIds: number[]): Promise<ReconcileResult> {
    const role = await this.rolesRepository.findById(roleId);
    if (!role) {
      throw new AppError(404, "Role not found");
    }

    const wanted = new Set(resourceIds);

    return withTransaction(async (t) => {
      const existing = await this.repository.findAllByRole(roleId, t);
      const byResource = new Map(existing.map((row) => [row.resource_id, row]));

      let activated = 0;
      let deactivated = 0;

      for (const resourceId of wanted) {
        const row = byResource.get(resourceId);
        if (!row) {
          await this.repository.create(
            { role_id: roleId, resource_id: resourceId, status: "active" },
            t
          );
          activated++;
          continue;
        }
        if (row.status !== "active") {
          await this.repository.update(row, { status: "active" }, t);
          activated++;
        }
      }

      for (const row of existing) {
        if (wanted.has(row.resource_id)) continue;
        if (row.status === "active") {
          await this.repository.update(row, { status: "inactive" }, t);
          deactivated++;
        }
      }

      return {
        role_id: roleId,
        activated,
        deactivated,
        total_active: wanted.size,
      };
    });
  }

  private async findOrFail(id: number, onlyActive = true): Promise<ResourceRole> {
    const grant = await this.repository.findById(id);
    if (!grant || (onlyActive && grant.status !== "active")) {
      throw new AppError(404, "Grant not found");
    }
    return grant;
  }

  private async reload(id: number): Promise<ResourceRole> {
    const grant = await this.repository.findById(id);
    if (!grant) {
      throw new AppError(404, "Grant not found");
    }
    return grant;
  }
}
EOF
```

```bash
: > src/features/auth/resource-roles/resource-roles.controller.ts
cat >> src/features/auth/resource-roles/resource-roles.controller.ts << 'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import { CreateResourceRoleDto } from "./dto";
import { ResourceRolesService } from "./resource-roles.service";

export class ResourceRolesController extends BaseController {
  public constructor(
    private readonly service: ResourceRolesService = new ResourceRolesService()
  ) {
    super();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const grants = await this.service.getAll({
        role_id: toOptionalNumber(req.query.role_id),
        resource_id: toOptionalNumber(req.query.resource_id),
      });
      res.status(200).json({ grants });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const grant = await this.service.getOne(this.paramId(req));
      res.status(200).json({ grant });
    });
  }

  public async grant(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const grant = await this.service.grant(req.body as CreateResourceRoleDto);
      res.status(201).json({ message: "Resource granted to role", grant });
    });
  }

  public async deactivate(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const grant = await this.service.deactivate(this.paramId(req));
      res.status(200).json({ message: "Grant deactivated (permission revoked)", grant });
    });
  }

  public async reactivate(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const grant = await this.service.reactivate(this.paramId(req));
      res.status(200).json({ message: "Grant reactivated", grant });
    });
  }
}

function toOptionalNumber(value: unknown): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) return undefined;
  return Number(raw);
}
EOF
```

```bash
: > src/features/auth/resource-roles/resource-roles.routes.ts
cat >> src/features/auth/resource-roles/resource-roles.routes.ts << 'EOF'
import { Application } from "express";
import { ResourceRolesController } from "./resource-roles.controller";
import { authenticate, authorize } from "../access";

export class ResourceRolesRoutes {
  public resourceRolesController: ResourceRolesController = new ResourceRolesController();

  public routes(app: Application): void {
    app.route("/api/concesiones-rol").get(
      authenticate,
      authorize,
      this.resourceRolesController.getAll.bind(this.resourceRolesController)
    );

    app.route("/api/concesiones-rol/:id").get(
      authenticate,
      authorize,
      this.resourceRolesController.getOne.bind(this.resourceRolesController)
    );

    app.route("/api/concesiones-rol").post(
      authenticate,
      authorize,
      this.resourceRolesController.grant.bind(this.resourceRolesController)
    );

    app.route("/api/concesiones-rol/:id/deactivate").patch(
      authenticate,
      authorize,
      this.resourceRolesController.deactivate.bind(this.resourceRolesController)
    );

    app.route("/api/concesiones-rol/:id/reactivate").patch(
      authenticate,
      authorize,
      this.resourceRolesController.reactivate.bind(this.resourceRolesController)
    );
  }
}
EOF
```

## 17.6 `reconcileRole` — la matriz determinista

`reconcileRole(roleId, resourceIds)` es el método que hace que un seeder (o un proceso de despliegue) pueda **declarar** los permisos de un rol en lugar de mutarlos a mano:

| **Recurso en la lista** | **Fila previa** | **Acción** |
| :--- | :--- | :--- |
| sí | no existe | **concede** |
| sí | `inactive` | **reactiva** |
| sí | `active` | no toca |
| no | `active` | **retira** (borrado lógico) |

Es **total y determinista**: al terminar, el conjunto de concesiones activas del rol es **exactamente** la lista recibida. Por eso el rol `SELLER` nunca acumula permisos por accidente al reejecutar el seeder.

```text
reconcileRole(ADMIN,  RESOURCE_CATALOG)  → 58 activas
reconcileRole(SELLER, SELLER_RESOURCES)  →  7 activas
```

## 17.7 Seeder de la matriz y swagger

```bash
: > src/features/auth/resource-roles/resource-roles.seeder.ts
cat >> src/features/auth/resource-roles/resource-roles.seeder.ts << 'EOF'
import { Resource } from "../resources/resource.model";
import { Role } from "../roles/role.model";
import { RESOURCE_CATALOG, SELLER_RESOURCES } from "../resources/resource-catalog";
import { ResourceRolesService } from "./resource-roles.service";

export async function seedResourceRoles(): Promise<number> {
  const service = new ResourceRolesService();

  const resources = await Resource.findAll({ where: { status: "active" } });
  const idByOperation = new Map(
    resources.map((resource) => [`${resource.method} ${resource.path}`, resource.id])
  );

  const idsFor = (catalog: ReadonlyArray<{ method: string; path: string }>): number[] =>
    catalog
      .map((item) => idByOperation.get(`${item.method} ${item.path}`))
      .filter((id): id is number => typeof id === "number");

  let total = 0;

  const admin = await Role.findOne({ where: { name: "ADMIN" } });
  if (admin) {
    const result = await service.reconcileRole(admin.id, idsFor(RESOURCE_CATALOG));
    console.log(
      `✅ resource_roles: ADMIN -> ${result.total_active} recursos ` +
        `(${result.activated} altas, ${result.deactivated} bajas)`
    );
    total += result.total_active;
  }

  const seller = await Role.findOne({ where: { name: "SELLER" } });
  if (seller) {
    const result = await service.reconcileRole(seller.id, idsFor(SELLER_RESOURCES));
    console.log(
      `✅ resource_roles: SELLER -> ${result.total_active} recursos ` +
        `(${result.activated} altas, ${result.deactivated} bajas)`
    );
    total += result.total_active;
  }

  return total;
}
EOF
```

```bash
: > src/features/auth/resource-roles/resource-roles.swagger.ts
cat >> src/features/auth/resource-roles/resource-roles.swagger.ts << 'EOF'
import {
  bearerSecurity,
  forbiddenResponse,
  invalidIdResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

export const resourceRolesSwagger = {
  tags: [
    {
      name: "Concesiones rol-recurso",
      description:
        "Conceder / retirar / reactivar recursos a un rol: **el permiso** — **JWT + RBAC**",
    },
  ],
  paths: {
    "/api/concesiones-rol": {
      get: {
        tags: ["Concesiones rol-recurso"],
        summary: "Listar concesiones activas",
        description:
          "JWT + RBAC — recurso `GET /api/concesiones-rol`. " +
          "Filtros opcionales: `?role_id=` (permisos de un rol) y `?resource_id=` (roles que conceden un recurso).",
        security: bearerSecurity,
        parameters: [
          { name: "role_id", in: "query", required: false, schema: { type: "integer" } },
          { name: "resource_id", in: "query", required: false, schema: { type: "integer" } },
        ],
        responses: {
          "200": { description: "Lista de concesiones (`{ grants: [...] }`)" },
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
        },
      },
      post: {
        tags: ["Concesiones rol-recurso"],
        summary: "Conceder recurso a rol (crear permiso)",
        description:
          "JWT + RBAC — recurso `POST /api/concesiones-rol`. " +
          "Cuerpo: `{ role_id, resource_id }`. Idempotente: si la concesión existía retirada, se reactiva. " +
          "Efecto inmediato y sin despliegue: la siguiente petición del usuario ya consulta la nueva matriz.",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ResourceRoleCreate" } },
          },
        },
        responses: {
          "201": { description: "Permiso concedido (`{ message, grant }`)" },
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": { description: "Rol o recurso inexistente o inactivo" },
          "409": { description: "El rol ya tiene concedido ese recurso" },
        },
      },
    },
    "/api/concesiones-rol/{id}": {
      get: {
        tags: ["Concesiones rol-recurso"],
        summary: "Obtener concesión por id",
        description: "JWT + RBAC — recurso `GET /api/concesiones-rol/:id`.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Concesión (`{ grant }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/concesiones-rol/{id}/deactivate": {
      patch: {
        tags: ["Concesiones rol-recurso"],
        summary: "Retirar permiso (borrado lógico)",
        description:
          "JWT + RBAC — recurso `PATCH /api/concesiones-rol/:id/deactivate`. " +
          "Solo se pierde esa operación; el resto de permisos del rol siguen vigentes.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Permiso retirado (`{ message, grant }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/concesiones-rol/{id}/reactivate": {
      patch: {
        tags: ["Concesiones rol-recurso"],
        summary: "Reactivar permiso",
        description: "JWT + RBAC — recurso `PATCH /api/concesiones-rol/:id/reactivate`.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Permiso reactivado (`{ message, grant }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
          "409": { description: "La concesión ya estaba activa" },
        },
      },
    },
  },
  components: {
    schemas: {
      ResourceRole: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          role_id: { type: "integer", example: 2 },
          resource_id: { type: "integer", example: 25 },
          status: { type: "string", enum: ["active", "inactive"], example: "active" },
          role: {
            type: "object",
            properties: { id: { type: "integer" }, name: { type: "string", example: "SELLER" } },
          },
          resource: {
            type: "object",
            properties: {
              id: { type: "integer" },
              method: { type: "string", example: "POST" },
              path: { type: "string", example: "/api/ventas" },
              description: { type: "string", nullable: true },
            },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ResourceRoleCreate: {
        type: "object",
        required: ["role_id", "resource_id"],
        properties: {
          role_id: { type: "integer", example: 2 },
          resource_id: { type: "integer", example: 25 },
        },
      },
    },
  },
};
EOF
```

## 17.8 Pruebas HTTP

```http
### Feature RoleUsers — ASIGNAR ROL A USUARIO (modalidad JWT + RBAC)
### Primer eslabón de la cadena: sin asignación activa NO hay permisos.
@baseUrl = http://localhost:4000

# @name loginAdmin
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin123!"
}

@token = {{loginAdmin.response.body.$.access_token}}

### getAll — asignaciones activas (con resumen de usuario y rol)
GET {{baseUrl}}/api/asignaciones-rol
Authorization: Bearer {{token}}

### getOne
GET {{baseUrl}}/api/asignaciones-rol/1
Authorization: Bearer {{token}}

### ASIGNAR — `POST /api/asignaciones-rol` con { user_id, role_id }
### (seller = user_id 2 recibe ADMIN = role_id 1; no lo tiene todavía -> 201)
# @name assignCreate
POST {{baseUrl}}/api/asignaciones-rol
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "user_id": 2,
  "role_id": 1
}

@assignmentId = {{assignCreate.response.body.$.assignment.id}}

### 409 — ese rol ya está asignado a ese usuario (la tupla es única)
POST {{baseUrl}}/api/asignaciones-rol
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "user_id": 2,
  "role_id": 1
}

### 404 — usuario o rol inexistente/inactivo
POST {{baseUrl}}/api/asignaciones-rol
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "user_id": 9999,
  "role_id": 2
}

### RETIRAR ROL (borrado lógico) — el usuario pierde los permisos de ese rol de inmediato
PATCH {{baseUrl}}/api/asignaciones-rol/{{assignmentId}}/deactivate
Authorization: Bearer {{token}}

### Comprobación del efecto: los permisos efectivos cambian sin reiniciar nada
GET {{baseUrl}}/api/usuarios/2/permisos
Authorization: Bearer {{token}}

### REACTIVAR asignación (reversible, la auditoría se conserva)
PATCH {{baseUrl}}/api/asignaciones-rol/{{assignmentId}}/reactivate
Authorization: Bearer {{token}}
```

```http
### Feature ResourceRoles — CONCEDER / RETIRAR PERMISOS (modalidad JWT + RBAC)
### Aquí se ve el principio de diseño: NO existe entidad `Permission`.
### El permiso es la tupla (rol, recurso) materializada en `resource_roles`.
### resource_id 3 = `POST /api/clientes` (3.ª entrada del catálogo semilla).
@baseUrl = http://localhost:4000

# @name loginAdmin
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin123!"
}

# @name loginSeller
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "seller",
  "password": "Seller123!"
}

@token = {{loginAdmin.response.body.$.access_token}}
@sellerToken = {{loginSeller.response.body.$.access_token}}
@sellerRoleId = 2

### getAll — concesiones activas (ADMIN 58 + SELLER 7 = 65)
GET {{baseUrl}}/api/concesiones-rol
Authorization: Bearer {{token}}

### Filtro: permisos de un rol (?role_id=)
GET {{baseUrl}}/api/concesiones-rol?role_id={{sellerRoleId}}
Authorization: Bearer {{token}}

### Filtro inverso: qué roles conceden un recurso (?resource_id=)
GET {{baseUrl}}/api/concesiones-rol?resource_id=1
Authorization: Bearer {{token}}

### getOne
GET {{baseUrl}}/api/concesiones-rol/1
Authorization: Bearer {{token}}

### ESTADO INICIAL — SELLER no puede crear clientes -> 403 (deny by default)
POST {{baseUrl}}/api/clientes
Authorization: Bearer {{sellerToken}}
Content-Type: application/json

{
  "name": "Prueba RBAC",
  "phone": "3000000000",
  "email": "rbac.demo@example.com",
  "password": "x"
}

### CONCEDER — `POST /api/concesiones-rol` con { role_id: 2 (SELLER), resource_id: 3 (POST /api/clientes) }
# @name grantCreate
POST {{baseUrl}}/api/concesiones-rol
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "role_id": 2,
  "resource_id": 3
}

@grantId = {{grantCreate.response.body.$.grant.id}}

### EFECTO INMEDIATO — el mismo seller ahora sí puede (201), sin reiniciar el servidor
POST {{baseUrl}}/api/clientes
Authorization: Bearer {{sellerToken}}
Content-Type: application/json

{
  "name": "Prueba RBAC 2",
  "phone": "3000000001",
  "email": "rbac.demo2@example.com",
  "password": "x"
}

### RETIRAR EL PERMISO (borrado lógico) — solo se pierde esa operación
PATCH {{baseUrl}}/api/concesiones-rol/{{grantId}}/deactivate
Authorization: Bearer {{token}}

### El seller vuelve a 403
POST {{baseUrl}}/api/clientes
Authorization: Bearer {{sellerToken}}
Content-Type: application/json

{
  "name": "Prueba RBAC 3",
  "phone": "3000000002",
  "email": "rbac.demo3@example.com",
  "password": "x"
}

### REACTIVAR EL PERMISO (reversible, la auditoría se conserva)
PATCH {{baseUrl}}/api/concesiones-rol/{{grantId}}/reactivate
Authorization: Bearer {{token}}

### 403 — el propio SELLER no puede administrar la matriz de permisos
GET {{baseUrl}}/api/concesiones-rol
Authorization: Bearer {{sellerToken}}
```

El archivo de concesiones demuestra el **efecto inmediato**: un `POST` concede `POST /api/clientes` al rol `SELLER`, y la siguiente petición del mismo usuario deja de recibir 403 **sin reiniciar el servidor**. La autorización se resuelve por datos en cada petición.

### Verificación

```bash
npx tsc --noEmit
npm run db:seed
```

```sql
SELECT COUNT(*) FROM role_users;      -- 2 (admin→ADMIN, seller→SELLER)
SELECT COUNT(*) FROM resource_roles;  -- 65 (ADMIN 58 + SELLER 7)
```

### DoD del ISS-12

- [ ] Todos los criterios de aceptación (17.1 … 17.8) cumplidos
- [ ] Reasignar un rol ya activo → **409**; sobre uno inactivo → **reactiva**
- [ ] Reejecutar `npm run db:seed` deja `resource_roles` en **65** filas activas exactas
- [ ] `npx tsc --noEmit` sin errores y `npm run dev` arranca

---

> **✅ GATE de la unidad ISS-12** — *este bloque no añade ningún criterio nuevo.*
>
> Las condiciones de cierre son exactamente las que define el ISS técnico de esta misma página:
>
> - 📋 **Criterios de aceptación** → [Criterios de aceptación](https://tecnogua.com/academic/site/backend2026/manual/14-ISS-12-auth-role-users-resource-roles/#criterios-de-aceptacion-iss-12-consolidados)
> - 🧩 **Cierre de la unidad** → [Cierre de la unidad](https://tecnogua.com/academic/site/backend2026/manual/14-ISS-12-auth-role-users-resource-roles/#dod-del-iss-12)
> - 🧠 **Autoevaluación** → [Evaluación del cuaderno](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-12-aprendizaje/#evaluacion)
>
> Con el GATE en verde queda habilitado **ISS-13 · Middlewares de acceso y las 3 modalidades**.
>
> **Navegación de la ruta:** **←** [ISS-12 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-12-aprendizaje/) · [↑ Ruta Express](https://tecnogua.com/academic/site/backend2026/) · **→** [ISS-13 · 🧠 Aprender](https://tecnogua.com/academic/site/backend2026/aprendizaje/ISS-13-aprendizaje/)
