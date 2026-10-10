export type ResourceMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ResourceCatalogEntry {
  method: ResourceMethod;
  path: string;
  description: string;
}

function crudResources(
  name: string,
  basePath: string,
): ResourceCatalogEntry[] {
  return [
    { method: "GET", path: basePath, description: `Listar ${name}` },
    { method: "POST", path: basePath, description: `Crear ${name}` },
    { method: "GET", path: `${basePath}/:id`, description: `Consultar ${name}` },
    { method: "PUT", path: `${basePath}/:id`, description: `Reemplazar ${name}` },
    { method: "PATCH", path: `${basePath}/:id`, description: `Actualizar ${name}` },
    { method: "DELETE", path: `${basePath}/:id`, description: `Eliminar ${name}` },
    {
      method: "PATCH",
      path: `${basePath}/:id/deactivate`,
      description: `Desactivar ${name}`,
    },
  ];
}

export const RESOURCE_CATALOG: ResourceCatalogEntry[] = [
  ...crudResources("clientes", "/api/clientes"),
  ...crudResources("tipos de producto", "/api/tipos-producto"),
  ...crudResources("productos", "/api/productos"),
  { method: "GET", path: "/api/ventas", description: "Listar ventas" },
  { method: "GET", path: "/api/ventas/:id", description: "Consultar venta" },
  { method: "POST", path: "/api/ventas", description: "Registrar venta" },
  {
    method: "POST",
    path: "/api/detalle-ventas",
    description: "Agregar detalle de venta",
  },
  { method: "GET", path: "/api/usuarios", description: "Listar usuarios" },
  { method: "POST", path: "/api/usuarios", description: "Crear usuario" },
  { method: "GET", path: "/api/usuarios/:id", description: "Consultar usuario" },
  { method: "PUT", path: "/api/usuarios/:id", description: "Reemplazar usuario" },
  { method: "PATCH", path: "/api/usuarios/:id", description: "Actualizar usuario" },
  { method: "DELETE", path: "/api/usuarios/:id", description: "Eliminar usuario" },
  {
    method: "PATCH",
    path: "/api/usuarios/:id/deactivate",
    description: "Desactivar usuario",
  },
  {
    method: "PATCH",
    path: "/api/usuarios/:id/password",
    description: "Cambiar contraseña",
  },
  {
    method: "GET",
    path: "/api/usuarios/:id/permisos",
    description: "Consultar permisos efectivos",
  },
  ...crudResources("roles", "/api/roles"),
  ...crudResources("recursos", "/api/recursos"),
  {
    method: "GET",
    path: "/api/asignaciones-rol",
    description: "Listar asignaciones de roles",
  },
  {
    method: "GET",
    path: "/api/asignaciones-rol/:id",
    description: "Consultar asignación de rol",
  },
  {
    method: "POST",
    path: "/api/asignaciones-rol",
    description: "Asignar rol a usuario",
  },
  {
    method: "PATCH",
    path: "/api/asignaciones-rol/:id/deactivate",
    description: "Retirar rol de usuario",
  },
  {
    method: "PATCH",
    path: "/api/asignaciones-rol/:id/reactivate",
    description: "Reactivar asignación de rol",
  },
  {
    method: "GET",
    path: "/api/concesiones-rol",
    description: "Listar concesiones de recursos",
  },
  {
    method: "GET",
    path: "/api/concesiones-rol/:id",
    description: "Consultar concesión de recurso",
  },
  {
    method: "POST",
    path: "/api/concesiones-rol",
    description: "Conceder recurso a rol",
  },
  {
    method: "PATCH",
    path: "/api/concesiones-rol/:id/deactivate",
    description: "Retirar recurso de rol",
  },
  {
    method: "PATCH",
    path: "/api/concesiones-rol/:id/reactivate",
    description: "Reactivar concesión de recurso",
  },
];

if (RESOURCE_CATALOG.length !== 58) {
  throw new Error(`El catálogo RBAC debe contener exactamente 58 recursos, recibió ${RESOURCE_CATALOG.length}`);
}

export const SELLER_RESOURCES = [
  { method: "GET", path: "/api/clientes" },
  { method: "GET", path: "/api/clientes/:id" },
  { method: "GET", path: "/api/productos" },
  { method: "GET", path: "/api/productos/:id" },
  { method: "GET", path: "/api/ventas" },
  { method: "GET", path: "/api/ventas/:id" },
  { method: "POST", path: "/api/ventas" },
] as const satisfies ReadonlyArray<Pick<ResourceCatalogEntry, "method" | "path">>;
