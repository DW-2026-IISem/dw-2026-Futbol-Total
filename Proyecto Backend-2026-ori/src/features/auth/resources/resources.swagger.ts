import {
  bearerSecurity,
  bearerSecurityScheme,
  forbiddenResponse,
  invalidIdResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

const resourceResponses = (successDescription: string) => ({
  "400": invalidIdResponse,
  "401": unauthorizedResponse,
  "403": forbiddenResponse,
  "404": notFoundResponse,
  "409": { description: "La operación (method, path) ya está registrada" },
  "500": { description: "Error interno" },
  "200": { description: successDescription },
});

const idParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "integer", minimum: 1 },
};

export const resourcesSwagger = {
  tags: [{ name: "Resources", description: "Catálogo de recursos con JWT y RBAC" }],
  paths: {
    "/api/recursos": {
      get: {
        tags: ["Resources"],
        summary: "Listar recursos activos",
        security: bearerSecurity,
        responses: {
          ...resourceResponses("Recursos activos"),
          "200": {
            description: "Recursos activos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    resources: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Resource" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Resources"],
        summary: "Crear recurso",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResourceCreate" },
            },
          },
        },
        responses: {
          ...resourceResponses("Recurso creado"),
          "201": {
            description: "Recurso creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    resource: { $ref: "#/components/schemas/Resource" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/recursos/{id}": {
      get: {
        tags: ["Resources"],
        summary: "Obtener recurso activo",
        security: bearerSecurity,
        parameters: [idParameter],
        responses: resourceResponses("Recurso encontrado"),
      },
      put: {
        tags: ["Resources"],
        summary: "Actualizar recurso completo",
        security: bearerSecurity,
        parameters: [idParameter],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResourceUpdate" },
            },
          },
        },
        responses: resourceResponses("Recurso actualizado"),
      },
      patch: {
        tags: ["Resources"],
        summary: "Actualizar recurso parcialmente",
        security: bearerSecurity,
        parameters: [idParameter],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResourcePatch" },
            },
          },
        },
        responses: resourceResponses("Recurso actualizado"),
      },
      delete: {
        tags: ["Resources"],
        summary: "Eliminar recurso físicamente",
        security: bearerSecurity,
        parameters: [idParameter],
        responses: resourceResponses("Recurso eliminado físicamente"),
      },
    },
    "/api/recursos/{id}/deactivate": {
      patch: {
        tags: ["Resources"],
        summary: "Desactivar recurso lógicamente",
        security: bearerSecurity,
        parameters: [idParameter],
        responses: resourceResponses("Recurso desactivado"),
      },
    },
  },
  components: {
    schemas: {
      Resource: {
        type: "object",
        properties: {
          id: { type: "integer" },
          method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
          path: { type: "string", maxLength: 255 },
          description: { type: "string", nullable: true, maxLength: 255 },
          status: { type: "string", enum: ["active", "inactive"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ResourceCreate: {
        type: "object",
        required: ["method", "path"],
        properties: {
          method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
          path: { type: "string", minLength: 1, maxLength: 255 },
          description: { type: "string", nullable: true, maxLength: 255 },
          status: { type: "string", enum: ["active", "inactive"], default: "active" },
        },
      },
      ResourceUpdate: {
        type: "object",
        required: ["method", "path"],
        properties: {
          method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
          path: { type: "string", minLength: 1, maxLength: 255 },
          description: { type: "string", nullable: true, maxLength: 255 },
        },
      },
      ResourcePatch: {
        type: "object",
        properties: {
          method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
          path: { type: "string", minLength: 1, maxLength: 255 },
          description: { type: "string", nullable: true, maxLength: 255 },
        },
      },
    },
    securitySchemes: bearerSecurityScheme,
  },
};
