import {
  bearerSecurity,
  bearerSecurityScheme,
  forbiddenResponse,
  invalidIdResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

const roleResponses = (successDescription: string) => ({
  "400": invalidIdResponse,
  "401": unauthorizedResponse,
  "403": forbiddenResponse,
  "404": notFoundResponse,
  "409": { description: "El nombre del rol ya está en uso" },
  "500": { description: "Error interno" },
  "200": { description: successDescription },
});

const idParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "integer", minimum: 1 },
};

export const rolesSwagger = {
  tags: [{ name: "Roles", description: "Gestión de roles con JWT y RBAC" }],
  paths: {
    "/api/roles": {
      get: {
        tags: ["Roles"],
        summary: "Listar roles activos",
        security: bearerSecurity,
        responses: {
          ...roleResponses("Roles activos"),
          "200": {
            description: "Roles activos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    roles: { type: "array", items: { $ref: "#/components/schemas/Role" } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Roles"],
        summary: "Crear rol",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RoleCreate" } },
          },
        },
        responses: {
          ...roleResponses("Rol creado"),
          "201": {
            description: "Rol creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { role: { $ref: "#/components/schemas/Role" } },
                },
              },
            },
          },
        },
      },
    },
    "/api/roles/{id}": {
      get: {
        tags: ["Roles"],
        summary: "Obtener rol activo",
        security: bearerSecurity,
        parameters: [idParameter],
        responses: roleResponses("Rol encontrado"),
      },
      put: {
        tags: ["Roles"],
        summary: "Actualizar rol completo",
        security: bearerSecurity,
        parameters: [idParameter],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RoleUpdate" } },
          },
        },
        responses: roleResponses("Rol actualizado"),
      },
      patch: {
        tags: ["Roles"],
        summary: "Actualizar rol parcialmente",
        security: bearerSecurity,
        parameters: [idParameter],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RolePatch" } },
          },
        },
        responses: roleResponses("Rol actualizado"),
      },
      delete: {
        tags: ["Roles"],
        summary: "Eliminar rol físicamente",
        security: bearerSecurity,
        parameters: [idParameter],
        responses: roleResponses("Rol eliminado físicamente"),
      },
    },
    "/api/roles/{id}/deactivate": {
      patch: {
        tags: ["Roles"],
        summary: "Desactivar rol lógicamente",
        security: bearerSecurity,
        parameters: [idParameter],
        responses: roleResponses("Rol desactivado"),
      },
    },
  },
  components: {
    schemas: {
      Role: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string", maxLength: 80 },
          description: { type: "string", nullable: true, maxLength: 255 },
          status: { type: "string", enum: ["active", "inactive"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      RoleCreate: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 80 },
          description: { type: "string", nullable: true, maxLength: 255 },
          status: { type: "string", enum: ["active", "inactive"], default: "active" },
        },
      },
      RoleUpdate: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 80 },
          description: { type: "string", nullable: true, maxLength: 255 },
        },
      },
      RolePatch: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 80 },
          description: { type: "string", nullable: true, maxLength: 255 },
        },
      },
    },
    securitySchemes: bearerSecurityScheme,
  },
};
