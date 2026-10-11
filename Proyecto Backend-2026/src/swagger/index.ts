import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import { clientsSwagger } from "../features/business/clients/clients.swagger";
import { productTypesSwagger } from "../features/business/product-types/product-types.swagger";
import { productsSwagger } from "../features/business/products/products.swagger";
import { productSalesSwagger } from "../features/business/product-sales/product-sales.swagger";
import { salesSwagger } from "../features/business/sales/sales.swagger";
import { usersSwagger } from "../features/auth/users/users.swagger";
import { rolesSwagger } from "../features/auth/roles/roles.swagger";
import { resourcesSwagger } from "../features/auth/resources/resources.swagger";
import { roleUsersSwagger } from "../features/auth/role-users/role-users.swagger";
import { resourceRolesSwagger } from "../features/auth/resource-roles/resource-roles.swagger";
import { refreshTokensSwagger } from "../features/auth/refresh-tokens/refresh-tokens.swagger";
import { sessionSwagger } from "../features/auth/session/session.swagger";
import {
  bearerSecurityScheme,
  forbiddenResponse,
  unauthorizedResponse,
} from "../shared/http/swagger-security";

export type FeatureSwaggerModule = {
  tags: unknown[];
  paths: Record<string, unknown>;
  components?: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
  };
};

const featureSwaggerModules: FeatureSwaggerModule[] = [
  clientsSwagger,
  productTypesSwagger,
  productsSwagger,
  salesSwagger,
  productSalesSwagger,
  usersSwagger,
  rolesSwagger,
  resourcesSwagger,
  roleUsersSwagger,
  resourceRolesSwagger,
  refreshTokensSwagger,
  sessionSwagger,
];

export function buildOpenApiDocument() {
  const tags: unknown[] = [];
  const paths: Record<string, unknown> = {};
  const schemas: Record<string, unknown> = {};
  const securitySchemes: Record<string, unknown> = {};

  for (const mod of featureSwaggerModules) {
    tags.push(...mod.tags);
    Object.assign(paths, mod.paths);
    if (mod.components?.schemas) {
      Object.assign(schemas, mod.components.schemas);
    }
    if (mod.components?.securitySchemes) {
      Object.assign(securitySchemes, mod.components.securitySchemes);
    }
  }

  return {
    openapi: "3.0.3",
    info: {
      title: "Pedalibre API",
      version: "1.0.0",
      description:
        "API del backend de Pedalibre con documentación OpenAPI, autenticación JWT y autorización RBAC.",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3002}`,
        description: "Servidor local",
      },
    ],
    tags,
    paths,
    security: [{ bearerAuth: [] }],
    components: {
      schemas,
      securitySchemes: {
        ...securitySchemes,
        ...bearerSecurityScheme,
      },
      responses: {
        Unauthorized: unauthorizedResponse,
        Forbidden: forbiddenResponse,
      },
    },
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
