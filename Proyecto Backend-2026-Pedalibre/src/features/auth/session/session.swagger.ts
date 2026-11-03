import {
  bearerSecurity,
  openSecurity,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

export const sessionSwagger = {
  tags: [
    {
      name: "Sesión",
      description: "Login, renovación, cierre, perfil y permisos (OPEN y JWT)",
    },
  ],
  paths: {
    "/api/sesion/login": {
      post: {
        tags: ["Sesión"],
        summary: "Iniciar sesión",
        description:
          "OPEN — valida usuario o correo y contraseña. Las credenciales inválidas producen una respuesta genérica.",
        security: openSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/Login" } },
          },
        },
        responses: {
          "200": { description: "Par de tokens" },
          "400": { description: "Faltan identifier o password" },
          "401": { description: "Credenciales inválidas o usuario inactivo" },
        },
      },
    },
    "/api/sesion/refresh": {
      post: {
        tags: ["Sesión"],
        summary: "Renovar tokens",
        description:
          "OPEN — rota el refresh token. La reutilización revoca su familia.",
        security: openSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshSession" },
            },
          },
        },
        responses: {
          "200": { description: "Par de tokens renovado" },
          "400": { description: "Falta refresh_token" },
          "401": { description: "Refresh token inválido, expirado o reutilizado" },
        },
      },
    },
    "/api/sesion/logout": {
      post: {
        tags: ["Sesión"],
        summary: "Cerrar sesión",
        description: "OPEN — revoca el refresh token enviado en el cuerpo.",
        security: openSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshSession" },
            },
          },
        },
        responses: {
          "200": { description: "Sesión cerrada" },
          "400": { description: "Falta refresh_token" },
        },
      },
    },
    "/api/sesion/perfil": {
      get: {
        tags: ["Sesión"],
        summary: "Consultar mi perfil",
        security: bearerSecurity,
        responses: {
          "200": { description: "Perfil público del usuario autenticado" },
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/permisos": {
      get: {
        tags: ["Sesión"],
        summary: "Consultar mis permisos efectivos",
        security: bearerSecurity,
        responses: {
          "200": { description: "Permisos efectivos del usuario autenticado" },
          "401": unauthorizedResponse,
        },
      },
    },
  },
  components: {
    schemas: {
      Login: {
        type: "object",
        required: ["identifier", "password"],
        properties: {
          identifier: { type: "string", description: "Username o correo" },
          password: { type: "string", format: "password" },
        },
      },
      RefreshSession: {
        type: "object",
        required: ["refresh_token"],
        properties: { refresh_token: { type: "string" } },
      },
      SessionTokens: {
        type: "object",
        properties: {
          access_token: { type: "string" },
          token_type: { type: "string", enum: ["Bearer"] },
          expires_in: { type: "integer" },
          refresh_token: { type: "string" },
          refresh_expires_in: { type: "integer" },
        },
      },
    },
  },
};
