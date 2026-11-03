import {
  bearerSecurity,
  bearerSecurityScheme,
  forbiddenResponse,
  invalidIdResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

const grantResponses = (description: string) => ({
  "400": invalidIdResponse,
  "401": unauthorizedResponse,
  "403": forbiddenResponse,
  "404": notFoundResponse,
  "409": { description: "La concesión ya existe o está activa" },
  "500": { description: "Error interno" },
  "200": { description },
});

const idParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "integer", minimum: 1 },
};

export const resourceRolesSwagger = {
  tags: [
    {
      name: "ResourceRoles",
      description: "Concesiones de recursos a roles protegidas con JWT y RBAC",
    },
  ],
  paths: {
    "/api/concesiones-rol": {
      get: {
        tags: ["ResourceRoles"],
        summary: "Listar concesiones activas",
        security: bearerSecurity,
        parameters: [
          {
            name: "role_id",
            in: "query",
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "resource_id",
            in: "query",
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          ...grantResponses("Concesiones activas"),
          "200": {
            description: "Concesiones activas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    grants: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ResourceRole" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["ResourceRoles"],
        summary: "Conceder recurso a rol",
        description:
          "La concesión es idempotente: reactiva una concesión inactiva y responde 409 si ya está activa.",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResourceRoleCreate" },
            },
          },
        },
        responses: {
          ...grantResponses("Concesión creada o reactivada"),
          "201": {
            description: "Recurso concedido al rol",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    grant: { $ref: "#/components/schemas/ResourceRole" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/concesiones-rol/{id}": {
      get: {
        tags: ["ResourceRoles"],
        summary: "Consultar concesión",
        security: bearerSecurity,
        parameters: [idParameter],
        responses: grantResponses("Concesión encontrada"),
      },
    },
    "/api/concesiones-rol/{id}/deactivate": {
      patch: {
        tags: ["ResourceRoles"],
        summary: "Retirar concesión",
        security: bearerSecurity,
        parameters: [idParameter],
        responses: grantResponses("Concesión desactivada"),
      },
    },
    "/api/concesiones-rol/{id}/reactivate": {
      patch: {
        tags: ["ResourceRoles"],
        summary: "Reactivar concesión",
        security: bearerSecurity,
        parameters: [idParameter],
        responses: grantResponses("Concesión reactivada"),
      },
    },
  },
  components: {
    schemas: {
      ResourceRole: {
        type: "object",
        properties: {
          id: { type: "integer" },
          role_id: { type: "integer" },
          resource_id: { type: "integer" },
          status: { type: "string", enum: ["active", "inactive"] },
          role: {
            anyOf: [
              { $ref: "#/components/schemas/RoleSummary" },
              { type: "null" },
            ],
          },
          resource: {
            anyOf: [
              { $ref: "#/components/schemas/ResourceSummary" },
              { type: "null" },
            ],
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ResourceRoleCreate: {
        type: "object",
        required: ["role_id", "resource_id"],
        properties: {
          role_id: { type: "integer", minimum: 1 },
          resource_id: { type: "integer", minimum: 1 },
        },
      },
      RoleSummary: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
        },
      },
      ResourceSummary: {
        type: "object",
        properties: {
          id: { type: "integer" },
          method: { type: "string" },
          path: { type: "string" },
          description: { type: "string", nullable: true },
        },
      },
    },
    securitySchemes: bearerSecurityScheme,
  },
};
