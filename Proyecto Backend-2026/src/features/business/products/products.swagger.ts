export const productsSwagger = {
  tags: [
    {
      name: "Productos",
      description: "CRUD público de productos, sin autenticación.",
    },
  ],
  paths: {
    "/api/productos": {
      get: {
        tags: ["Productos"],
        summary: "Listar productos activos",
        responses: {
          "200": {
            description: "Lista de productos activos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    products: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Product" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Productos"],
        summary: "Crear producto",
        description: "El tipo de producto debe existir y estar activo.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductCreate" },
            },
          },
        },
        responses: {
          "201": { description: "Producto creado" },
          "400": { description: "El tipo de producto está inactivo" },
          "404": { description: "El tipo de producto no existe" },
        },
      },
    },
    "/api/productos/{id}": {
      get: {
        tags: ["Productos"],
        summary: "Obtener producto por ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": { description: "Producto encontrado" },
          "400": { description: "ID inválido" },
          "404": { description: "Producto no encontrado o inactivo" },
        },
      },
      put: {
        tags: ["Productos"],
        summary: "Reemplazar producto",
        description: "El tipo de producto debe existir y estar activo.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductUpdate" },
            },
          },
        },
        responses: {
          "200": { description: "Producto actualizado" },
          "400": { description: "ID inválido o tipo inactivo" },
          "404": { description: "Producto o tipo no encontrado" },
        },
      },
      patch: {
        tags: ["Productos"],
        summary: "Actualizar parcialmente un producto",
        description:
          "Si se cambia product_type_id, el tipo debe existir y estar activo.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductPatch" },
            },
          },
        },
        responses: {
          "200": { description: "Producto actualizado" },
          "400": { description: "ID inválido o tipo inactivo" },
          "404": { description: "Producto o tipo no encontrado" },
        },
      },
      delete: {
        tags: ["Productos"],
        summary: "Eliminar producto físicamente",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": { description: "Producto eliminado permanentemente" },
          "400": { description: "ID inválido" },
          "404": { description: "Producto no encontrado" },
        },
      },
    },
    "/api/productos/{id}/deactivate": {
      patch: {
        tags: ["Productos"],
        summary: "Desactivar producto",
        description: "Cambia status a inactive sin eliminar la fila.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": { description: "Producto desactivado" },
          "400": { description: "ID inválido" },
          "404": { description: "Producto no encontrado o inactivo" },
        },
      },
    },
  },
  components: {
    schemas: {
      Product: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Balón de fútbol" },
          brand: { type: "string", example: "Marca deportiva" },
          price: { type: "number", example: 25.5 },
          min_stock: { type: "integer", example: 5 },
          quantity: { type: "integer", example: 20 },
          product_type_id: { type: "integer", example: 1 },
          status: { type: "string", enum: ["active", "inactive"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductCreate: {
        type: "object",
        required: [
          "name",
          "brand",
          "price",
          "min_stock",
          "quantity",
          "product_type_id",
        ],
        properties: {
          name: { type: "string" },
          brand: { type: "string" },
          price: { type: "number" },
          min_stock: { type: "integer" },
          quantity: { type: "integer" },
          product_type_id: { type: "integer" },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            default: "active",
          },
        },
      },
      ProductUpdate: {
        type: "object",
        required: [
          "name",
          "brand",
          "price",
          "min_stock",
          "quantity",
          "product_type_id",
        ],
        properties: {
          name: { type: "string" },
          brand: { type: "string" },
          price: { type: "number" },
          min_stock: { type: "integer" },
          quantity: { type: "integer" },
          product_type_id: { type: "integer" },
        },
      },
      ProductPatch: {
        type: "object",
        properties: {
          name: { type: "string" },
          brand: { type: "string" },
          price: { type: "number" },
          min_stock: { type: "integer" },
          quantity: { type: "integer" },
          product_type_id: { type: "integer" },
        },
      },
    },
  },
};
