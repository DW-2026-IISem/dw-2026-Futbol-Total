import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import { clientsSwagger } from "../features/business/clients/clients.swagger";

export type FeatureSwaggerModule = {
  tags: unknown[];
  paths: Record<string, unknown>;
  components?: { schemas?: Record<string, unknown> };
};

const featureSwaggerModules: FeatureSwaggerModule[] = [clientsSwagger];

export function buildOpenApiDocument() {
  const tags: unknown[] = [];
  const paths: Record<string, unknown> = {};
  const schemas: Record<string, unknown> = {};

  for (const mod of featureSwaggerModules) {
    tags.push(...mod.tags);
    Object.assign(paths, mod.paths);
    if (mod.components?.schemas) {
      Object.assign(schemas, mod.components.schemas);
    }
  }

  return {
    openapi: "3.0.3",
    info: {
      title: "Pedalibre API",
      version: "1.0.0",
      description:
        "API del backend de Pedalibre con documentación OpenAPI. Los endpoints del negocio se registran sin autenticación en este laboratorio.",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: "Servidor local",
      },
    ],
    tags,
    paths,
    components: { schemas },
  };
}

export function setupSwagger(app: Application): void {
  const document = buildOpenApiDocument();
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(document));
  app.get("/api/docs.json", (_req, res) => {
    res.json(document);
  });
  console.log("📘 Swagger UI: /api/docs | OpenAPI JSON: /api/docs.json");
}
