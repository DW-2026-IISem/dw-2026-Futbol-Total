export const salesSwagger = {
  tags: [
    {
      name: "Ventas",
      description: "CRUD público de ventas, sin autenticación.",
    },
  ],
  paths: {
    "/api/ventas": {
      get: {
        tags: ["Ventas"],
        summary: "Listar ventas activas con sus líneas",
        responses: {
          "200": {
            description: "Ventas activas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    sales: {
                      type: "array",
                      items: { $ref: "#/components/schemas/SaleWithItems" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Ventas"],
        summary: "Crear venta y sus líneas en una transacción",
        description:
          "Valida cliente, productos y stock; calcula importes y descuenta existencias.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SaleCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Venta creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    sale: { $ref: "#/components/schemas/Sale" },
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ProductSale" },
                    },
                  },
                },
              },
            },
          },
          "400": { description: "Validación de cliente, líneas o stock" },
          "404": { description: "Cliente o producto no encontrado" },
        },
      },
    },
    "/api/ventas/{id}": {
      get: {
        tags: ["Ventas"],
        summary: "Obtener venta activa por ID, con sus líneas",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": {
            description: "Venta encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    sale: { $ref: "#/components/schemas/SaleWithItems" },
                  },
                },
              },
            },
          },
          "400": { description: "ID inválido" },
          "404": { description: "Venta no encontrada" },
        },
      },
      put: {
        tags: ["Ventas"],
        summary: "Reemplazar campos de la cabecera de venta",
        description:
          "Actualiza client_id, sale_date, tax y discounts; el total se recalcula. Las líneas se gestionan por ProductSale.",
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
              schema: { $ref: "#/components/schemas/SaleUpdate" },
            },
          },
        },
        responses: {
          "200": { description: "Cabecera actualizada" },
          "400": { description: "ID o valores inválidos" },
          "404": { description: "Venta o cliente no encontrado" },
        },
      },
      patch: {
        tags: ["Ventas"],
        summary: "Actualizar parcialmente la cabecera de venta",
        description: "Recalcula el total si cambian tax o discounts.",
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
              schema: { $ref: "#/components/schemas/SalePatch" },
            },
          },
        },
        responses: {
          "200": { description: "Cabecera actualizada" },
          "400": { description: "ID o valores inválidos" },
          "404": { description: "Venta o cliente no encontrado" },
        },
      },
      delete: {
        tags: ["Ventas"],
        summary: "Eliminar venta físicamente",
        description:
          "Elimina sus líneas y la cabecera, y restaura el stock de las líneas activas.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": { description: "Venta eliminada" },
          "400": { description: "ID inválido" },
          "404": { description: "Venta no encontrada" },
        },
      },
    },
    "/api/ventas/{id}/deactivate": {
      patch: {
        tags: ["Ventas"],
        summary: "Desactivar venta y sus líneas",
        description:
          "Realiza el borrado lógico y restaura el stock de las líneas activas.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": { description: "Venta desactivada" },
          "400": { description: "ID inválido" },
          "404": { description: "Venta no encontrada" },
        },
      },
    },
  },
  components: {
    schemas: {
      Sale: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          sale_date: { type: "string", format: "date-time" },
          subtotal: { type: "number", example: 200 },
          tax: { type: "number", example: 19 },
          discounts: { type: "number", example: 5 },
          total: { type: "number", example: 214 },
          client_id: { type: "integer", example: 1 },
          status: { type: "string", enum: ["active", "inactive"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      SaleWithItems: {
        allOf: [
          { $ref: "#/components/schemas/Sale" },
          {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/ProductSale" },
              },
            },
          },
        ],
      },
      SaleCreate: {
        type: "object",
        required: ["client_id", "items"],
        properties: {
          client_id: { type: "integer", minimum: 1 },
          tax: { type: "number", minimum: 0, default: 0 },
          discounts: { type: "number", minimum: 0, default: 0 },
          sale_date: { type: "string", format: "date-time" },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            default: "active",
          },
          items: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["product_id", "quantity"],
              properties: {
                product_id: { type: "integer", minimum: 1 },
                quantity: { type: "integer", minimum: 1 },
              },
            },
          },
        },
      },
      SaleUpdate: {
        type: "object",
        properties: {
          sale_date: { type: "string", format: "date-time" },
          tax: { type: "number", minimum: 0 },
          discounts: { type: "number", minimum: 0 },
          client_id: { type: "integer", minimum: 1 },
        },
      },
      SalePatch: {
        type: "object",
        properties: {
          sale_date: { type: "string", format: "date-time" },
          tax: { type: "number", minimum: 0 },
          discounts: { type: "number", minimum: 0 },
          client_id: { type: "integer", minimum: 1 },
        },
      },
    },
  },
};
