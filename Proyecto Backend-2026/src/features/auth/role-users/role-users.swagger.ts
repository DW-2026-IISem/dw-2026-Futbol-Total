import {
  bearerSecurity,
  bearerSecurityScheme,
  forbiddenResponse,
  invalidIdResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

const roleUserResponses = (successDescription: string) => ({
  "400": invalidIdResponse,
  "401": unauthorizedResponse,
  "403": forbiddenResponse,
  "404": notFoundResponse,
  "409": { description: "La asignación ya está activa" },
  "500": { description: "Error interno" },
  "200": { description: successDescription },
});

const idParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "integer", minimum: 1 },
};

export const roleUsersSwagger = {
  tags: [{ name: "RoleUsers", description: "Asignación de roles con JWT y RBAC" }],
  paths: {
    "/api/asignaciones-rol": {
      get: {
        tags: ["RoleUsers"],
        summary: "Listar asignaciones activas",
        security: bearerSecurity,
        responses: {
          ...roleUserResponses("Asignaciones activas"),
          "200": {
            description: "Asignaciones activas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    assignments: {
                      type: "array",
                      items: { $ref: "#/components/schemas/RoleUser" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["RoleUsers"],
        summary: "Asignar un rol a un usuario",
        description:
          "Crea la asignación o reactiva una existente inactiva. Devuelve 409 si ya está activa.",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RoleUserCreate" },
            },
          },
        },
        responses: {
          ...roleUserResponses("Rol asignado al usuario"),
          "201": {
            description: "Rol asignado o reactivado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    assignment: { $ref: "#/components/schemas/RoleUser" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/asignaciones-rol/{id}": {
      get: {
        tags: ["RoleUsers"],
        summary: "Consultar una asignación activa",
        security: bearerSecurity,
        parameters: [idParameter],
        responses: roleUserResponses("Asignación encontrada"),
      },
    },
    "/api/asignaciones-rol/{id}/deactivate": {
      patch: {
        tags: ["RoleUsers"],
        summary: "Retirar un rol de un usuario",
        security: bearerSecurity,
        parameters: [idParameter],
        responses: roleUserResponses("Asignación desactivada"),
      },
    },
    "/api/asignaciones-rol/{id}/reactivate": {
      patch: {
        tags: ["RoleUsers"],
        summary: "Reactivar una asignación",
        security: bearerSecurity,
        parameters: [idParameter],
        responses: roleUserResponses("Asignación reactivada"),
      },
    },
  },
  components: {
    schemas: {
      RoleUser: {
        type: "object",
        properties: {
          id: { type: "integer" },
          user_id: { type: "integer" },
          role_id: { type: "integer" },
          status: { type: "string", enum: ["active", "inactive"] },
          user: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "integer" },
              username: { type: "string" },
              email: { type: "string", format: "email" },
            },
          },
          role: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
            },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      RoleUserCreate: {
        type: "object",
        required: ["user_id", "role_id"],
        properties: {
          user_id: { type: "integer", minimum: 1 },
          role_id: { type: "integer", minimum: 1 },
        },
      },
    },
    securitySchemes: bearerSecurityScheme,
  },
};
