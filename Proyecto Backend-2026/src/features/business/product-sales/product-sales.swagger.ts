export const productSalesSwagger = {
  tags: [
    {
      name: "DetalleVentas",
      description: "CRUD público de líneas de venta, sin autenticación.",
    },
  ],
  paths: {
    "/api/detalle-ventas": {
      get: {
        tags: ["DetalleVentas"],
        summary: "Listar líneas de venta activas",
        responses: {
          "200": {
            description: "Líneas de venta activas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    product_sales: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ProductSale" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["DetalleVentas"],
        summary: "Agregar una línea a una venta",
        description:
          "Valida venta, producto y stock; ajusta el inventario y recalcula los totales.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductSaleCreate" },
            },
          },
        },
        responses: {
          "201": { description: "Línea de venta creada" },
          "400": { description: "Validación de estado, cantidad o stock" },
          "404": { description: "Venta o producto no encontrado" },
        },
      },
    },
    "/api/detalle-ventas/{id}": {
      get: {
        tags: ["DetalleVentas"],
        summary: "Obtener línea de venta por ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": { description: "Línea encontrada" },
          "400": { description: "ID inválido" },
          "404": { description: "Línea no encontrada o inactiva" },
        },
      },
      put: {
        tags: ["DetalleVentas"],
        summary: "Reemplazar cantidad de línea",
        description: "Ajusta el stock y recalcula los totales de la venta.",
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
              schema: { $ref: "#/components/schemas/ProductSaleUpdate" },
            },
          },
        },
        responses: {
          "200": { description: "Línea actualizada" },
          "400": { description: "ID inválido o stock insuficiente" },
          "404": { description: "Línea no encontrada" },
        },
      },
      patch: {
        tags: ["DetalleVentas"],
        summary: "Actualizar parcialmente una línea",
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
              schema: { $ref: "#/components/schemas/ProductSalePatch" },
            },
          },
        },
        responses: {
          "200": { description: "Línea actualizada" },
          "400": { description: "ID inválido o stock insuficiente" },
          "404": { description: "Línea no encontrada" },
        },
      },
      delete: {
        tags: ["DetalleVentas"],
        summary: "Eliminar línea físicamente",
        description: "Elimina la línea, restaura el stock y recalcula los totales.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": { description: "Línea eliminada permanentemente" },
          "400": { description: "ID inválido" },
          "404": { description: "Línea no encontrada" },
        },
      },
    },
    "/api/detalle-ventas/{id}/deactivate": {
      patch: {
        tags: ["DetalleVentas"],
        summary: "Desactivar línea de venta",
        description: "Desactiva la línea, restaura el stock y recalcula los totales.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": { description: "Línea desactivada" },
          "400": { description: "ID inválido" },
          "404": { description: "Línea no encontrada o inactiva" },
        },
      },
    },
  },
  components: {
    schemas: {
      ProductSale: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          sale_id: { type: "integer", example: 1 },
          product_id: { type: "integer", example: 1 },
          quantity: { type: "integer", example: 2 },
          unit_price: { type: "number", example: 100 },
          line_total: { type: "number", example: 200 },
          status: { type: "string", enum: ["active", "inactive"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductSaleCreate: {
        type: "object",
        required: ["sale_id", "product_id", "quantity"],
        properties: {
          sale_id: { type: "integer" },
          product_id: { type: "integer" },
          quantity: { type: "integer", minimum: 1 },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            default: "active",
          },
        },
      },
      ProductSaleUpdate: {
        type: "object",
        required: ["quantity"],
        properties: {
          quantity: { type: "integer", minimum: 1 },
        },
      },
      ProductSalePatch: {
        type: "object",
        properties: {
          quantity: { type: "integer", minimum: 1 },
        },
      },
    },
  },
};
