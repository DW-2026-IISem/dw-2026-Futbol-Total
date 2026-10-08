export const clientsSwagger = {
  tags: [
    {
      name: "Clientes",
      description: "CRUD de clientes del negocio. Documentado sin autenticación para el laboratorio.",
    },
  ],
  paths: {
    "/api/clientes": {
      get: {
        tags: ["Clientes"],
        summary: "Listar clientes activos",
        description: "Devuelve los clientes con `status = active`.",
        responses: {
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
        description: "Crea un cliente con los datos recibidos.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ClientCreate" },
            },
          },
        },
        responses: {
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
        description: "Retorna un cliente activo por identificador.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Identificador numérico positivo.",
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
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
          "400": { description: "id inválido" },
          "404": { description: "No existe o está inactivo" },
        },
      },
      put: {
        tags: ["Clientes"],
        summary: "Actualizar cliente completo",
        description: "Reemplaza los datos del cliente en la ruta indicada.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Identificador numérico positivo.",
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
        responses: {
          "200": { description: "Cliente actualizado" },
          "400": { description: "id inválido" },
          "404": { description: "No encontrado" },
        },
      },
      patch: {
        tags: ["Clientes"],
        summary: "Actualizar cliente parcialmente",
        description: "Actualiza solo los campos recibidos.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Identificador numérico positivo.",
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
        responses: {
          "200": { description: "Cliente actualizado" },
          "400": { description: "id inválido" },
          "404": { description: "No encontrado" },
        },
      },
      delete: {
        tags: ["Clientes"],
        summary: "Eliminar cliente físicamente",
        description: "Borra la fila del cliente de la base de datos.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Identificador numérico positivo.",
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": { description: "Cliente eliminado" },
          "400": { description: "id inválido" },
          "404": { description: "No encontrado" },
        },
      },
    },
    "/api/clientes/{id}/deactivate": {
      patch: {
        tags: ["Clientes"],
        summary: "Desactivar cliente (borrado lógico)",
        description: "Cambia el estado a `inactive` sin eliminar la fila.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Identificador numérico positivo.",
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": { description: "Cliente desactivado" },
          "400": { description: "id inválido" },
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
