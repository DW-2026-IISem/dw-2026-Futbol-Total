import {
  bearerSecurity,
  bearerSecurityScheme,
  forbiddenResponse,
  invalidIdResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

const securedResponses = (successDescription: string) => ({
  "400": invalidIdResponse,
  "401": unauthorizedResponse,
  "403": forbiddenResponse,
  "404": notFoundResponse,
  "409": { description: "Username o correo ya está en uso" },
  "500": { description: "Error interno" },
  "200": { description: successDescription },
});

const idParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "integer", minimum: 1 },
};

export const usersSwagger = {
  tags: [{ name: "Usuarios", description: "Gestión de identidades con JWT y RBAC" }],
  paths: {
    "/api/usuarios": {
      get: {
        tags: ["Usuarios"],
        summary: "Listar usuarios activos",
        security: bearerSecurity,
        responses: {
          ...securedResponses("Lista de usuarios activos sin contraseñas"),
          "200": {
            description: "Usuarios activos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    users: { type: "array", items: { $ref: "#/components/schemas/User" } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Usuarios"],
        summary: "Crear usuario",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UserCreate" } },
          },
        },
        responses: {
          ...securedResponses("Usuario creado sin incluir su contraseña"),
          "201": {
            description: "Usuario creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { user: { $ref: "#/components/schemas/User" } },
                },
              },
            },
          },
        },
      },
    },
    "/api/usuarios/{id}": {
      get: {
        tags: ["Usuarios"],
        summary: "Obtener usuario activo",
        security: bearerSecurity,
        parameters: [idParameter],
        responses: securedResponses("Usuario encontrado sin contraseña"),
      },
      put: {
        tags: ["Usuarios"],
        summary: "Actualizar usuario completo",
        security: bearerSecurity,
        parameters: [idParameter],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UserUpdate" } },
          },
        },
        responses: securedResponses("Usuario actualizado"),
      },
      patch: {
        tags: ["Usuarios"],
        summary: "Actualizar usuario parcialmente",
        security: bearerSecurity,
        parameters: [idParameter],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UserPatch" } },
          },
        },
        responses: securedResponses("Usuario actualizado"),
      },
      delete: {
        tags: ["Usuarios"],
        summary: "Eliminar usuario físicamente",
        security: bearerSecurity,
        parameters: [idParameter],
        responses: securedResponses("Usuario eliminado físicamente"),
      },
    },
    "/api/usuarios/{id}/deactivate": {
      patch: {
        tags: ["Usuarios"],
        summary: "Desactivar usuario lógicamente",
        security: bearerSecurity,
        parameters: [idParameter],
        responses: securedResponses("Usuario desactivado"),
      },
    },
    "/api/usuarios/{id}/password": {
      patch: {
        tags: ["Usuarios"],
        summary: "Cambiar contraseña",
        security: bearerSecurity,
        parameters: [idParameter],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UserChangePassword" } },
          },
        },
        responses: securedResponses("Contraseña cambiada"),
      },
    },
    "/api/usuarios/{id}/permisos": {
      get: {
        tags: ["Usuarios"],
        summary: "Consultar permisos efectivos",
        security: bearerSecurity,
        parameters: [idParameter],
        responses: securedResponses("Permisos efectivos del usuario"),
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          username: { type: "string" },
          email: { type: "string", format: "email" },
          avatar: { type: "string", nullable: true },
          status: { type: "string", enum: ["active", "inactive"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      UserCreate: {
        type: "object",
        required: ["username", "email", "password"],
        properties: {
          username: { type: "string", minLength: 3, maxLength: 80 },
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password", writeOnly: true },
          avatar: { type: "string", nullable: true },
          status: { type: "string", enum: ["active", "inactive"], default: "active" },
        },
      },
      UserUpdate: {
        type: "object",
        required: ["username", "email"],
        properties: {
          username: { type: "string", minLength: 3, maxLength: 80 },
          email: { type: "string", format: "email" },
          avatar: { type: "string", nullable: true },
        },
      },
      UserPatch: {
        type: "object",
        properties: {
          username: { type: "string", minLength: 3, maxLength: 80 },
          email: { type: "string", format: "email" },
          avatar: { type: "string", nullable: true },
        },
      },
      UserChangePassword: {
        type: "object",
        required: ["current_password", "new_password"],
        properties: {
          current_password: { type: "string", format: "password", writeOnly: true },
          new_password: { type: "string", format: "password", writeOnly: true },
          revoke_sessions: { type: "boolean", default: false },
        },
      },
      EffectivePermission: {
        type: "object",
        properties: {
          method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
          path: { type: "string" },
        },
      },
    },
    securitySchemes: bearerSecurityScheme,
  },
};
