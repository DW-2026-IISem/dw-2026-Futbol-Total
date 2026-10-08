export const productTypesSwagger = {
  tags: [
    {
      name: "TiposProducto",
      description:
        "CRUD de tipos de producto. Endpoints públicos, sin autenticación.",
    },
  ],
  paths: {
    "/api/tipos-producto": {
      get: {
        tags: ["TiposProducto"],
        summary: "Listar tipos de producto activos",
        description: "Devuelve los tipos de producto con `status = active`.",
        responses: {
          "200": {
            description: "Lista de tipos de producto",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    product_types: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ProductType" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["TiposProducto"],
        summary: "Crear tipo de producto",
        description: "Crea un tipo de producto. Endpoint público, sin autenticación.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductTypeCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Tipo de producto creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    product_type: { $ref: "#/components/schemas/ProductType" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/tipos-producto/{id}": {
      get: {
        tags: ["TiposProducto"],
        summary: "Obtener tipo de producto por id",
        description:
          "Devuelve un tipo activo por identificador; responde 404 si no existe o está inactivo.",
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
            description: "Tipo de producto encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    product_type: { $ref: "#/components/schemas/ProductType" },
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
        tags: ["TiposProducto"],
        summary: "Actualizar tipo de producto completo",
        description: "Reemplaza los datos editables del tipo de producto.",
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
              schema: { $ref: "#/components/schemas/ProductTypeUpdate" },
            },
          },
        },
        responses: {
          "200": { description: "Tipo de producto actualizado" },
          "400": { description: "id inválido" },
          "404": { description: "No encontrado o inactivo" },
        },
      },
      patch: {
        tags: ["TiposProducto"],
        summary: "Actualizar tipo de producto parcialmente",
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
              schema: { $ref: "#/components/schemas/ProductTypePatch" },
            },
          },
        },
        responses: {
          "200": { description: "Tipo de producto actualizado" },
          "400": { description: "id inválido" },
          "404": { description: "No encontrado o inactivo" },
        },
      },
      delete: {
        tags: ["TiposProducto"],
        summary: "Eliminar tipo de producto físicamente",
        description: "Elimina permanentemente la fila del tipo de producto.",
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
          "200": { description: "Tipo de producto eliminado" },
          "400": { description: "id inválido" },
          "404": { description: "No encontrado" },
        },
      },
    },
    "/api/tipos-producto/{id}/deactivate": {
      patch: {
        tags: ["TiposProducto"],
        summary: "Desactivar tipo de producto",
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
          "200": { description: "Tipo de producto desactivado" },
          "400": { description: "id inválido" },
          "404": { description: "No encontrado o inactivo" },
        },
      },
    },
  },
  components: {
    schemas: {
      ProductType: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Electrónica" },
          description: {
            type: "string",
            example: "Dispositivos y accesorios",
            nullable: true,
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            example: "active",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductTypeCreate: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          description: { type: "string", nullable: true },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            default: "active",
          },
        },
      },
      ProductTypeUpdate: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          description: { type: "string", nullable: true },
        },
      },
      ProductTypePatch: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string", nullable: true },
        },
      },
    },
  },
};
