import { RESOURCE_CATALOG } from "../auth/resources/resource-catalog";

const businessResources = RESOURCE_CATALOG.filter((resource) =>
  [
    "/api/clientes",
    "/api/stations",
    "/api/bicycles",
    "/api/docking-points",
    "/api/rates",
    "/api/reservations",
    "/api/rentals",
    "/api/rental-events",
    "/api/bicycle-dockings",
    "/api/penalties",
    "/api/maintenances",
    "/api/payments",
  ].some((prefix) => resource.path.startsWith(prefix)),
);

const paths: Record<string, Record<string, unknown>> = {};
for (const resource of businessResources) {
  const path = resource.path.replace(/:id/g, "{id}");
  const method = resource.method.toLowerCase();
  paths[path] ??= {};
  paths[path][method] = {
    tags: ["PedalLibre"],
    summary: resource.description,
    security: [{ bearerAuth: [] }],
    responses: {
      "200": { description: "Operación completada" },
      "201": { description: "Registro creado" },
      "400": { description: "Datos de entrada inválidos" },
      "401": { description: "No autenticado" },
      "403": { description: "Permiso insuficiente" },
      "404": { description: "Registro no encontrado" },
      "409": { description: "Conflicto de disponibilidad o integridad" },
    },
  };
}

export const pedalibreSwagger = {
  tags: [
    {
      name: "PedalLibre",
      description: "Estaciones, flota, reservas, alquileres, tarifas y mantenimiento",
    },
  ],
  paths,
  components: {
    schemas: {
      PedalLibreRecord: {
        type: "object",
        additionalProperties: true,
        description: "Atributos de la entidad descritos por el esquema MySQL PedalLibre.",
      },
    },
  },
};
