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
    "/api/sesion/registro": {
      post: {
        tags: ["Sesión"],
        summary: "Registrar cuenta de cliente",
        description:
          "OPEN — crea de forma atómica un usuario con rol CLIENTE y su ficha asociada. No acepta roles ni permisos del cliente.",
        security: openSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterClient" },
            },
          },
        },
        responses: {
          "201": { description: "Cuenta de cliente creada" },
          "400": { description: "Datos de registro inválidos" },
          "409": { description: "Usuario, correo o documento ya registrado" },
          "503": { description: "El rol CLIENTE no está configurado" },
        },
      },
    },
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
      RegisterClient: {
        type: "object",
        required: [
          "username",
          "email",
          "password",
          "first_name",
          "last_name",
          "document_type",
          "document_number",
        ],
        properties: {
          username: { type: "string", minLength: 3, maxLength: 100 },
          email: { type: "string", format: "email", maxLength: 150 },
          password: { type: "string", format: "password", minLength: 12, maxLength: 128 },
          first_name: { type: "string", maxLength: 100 },
          last_name: { type: "string", maxLength: 100 },
          document_type: { type: "string", maxLength: 30 },
          document_number: { type: "string", maxLength: 50 },
          phone: { type: "string", maxLength: 30, nullable: true },
        },
      },
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
