import { Resource } from "../resources/resource.model";
import { Role } from "../roles/role.model";
import { RESOURCE_CATALOG } from "../resources/resource-catalog";
import { ResourceRolesService } from "./resource-roles.service";
export async function seedResourceRoles(): Promise<number> {
  const service = new ResourceRolesService();
  const resources = await Resource.findAll({ where: { is_active: true } });
  const idByOperation = new Map(
    resources.map((resource) => [
      `${resource.method} ${resource.path}`,
      resource.id,
    ]),
  );
  const idsFor = (
    catalog: ReadonlyArray<{ method: string; path: string }>,
  ): number[] =>
    catalog.map((item) => {
      const id = idByOperation.get(`${item.method} ${item.path}`);
      if (id === undefined) {
        throw new Error(
          `No existe un recurso activo para ${item.method} ${item.path}`,
        );
      }
      return id;
    });

  let total = 0;

  const roleGrants: Record<string, (item: (typeof RESOURCE_CATALOG)[number]) => boolean> = {
    ADMIN: () => true,
    OPERACIONES: ({ method, path }) =>
      ["/api/clientes", "/api/stations", "/api/bicycles", "/api/docking-points", "/api/rates", "/api/reservations", "/api/rentals", "/api/rental-events", "/api/bicycle-dockings", "/api/payments", "/api/penalties"].some((prefix) => path.startsWith(prefix)) &&
      (method === "GET" ||
        (method === "POST" && ["/api/reservations", "/api/rentals/start", "/api/rentals/finish", "/api/bicycle-dockings/dock"].includes(path)) ||
        (method === "PATCH" && path.includes("/undock"))),
    MANTENIMIENTO: ({ method, path }) =>
      (method === "GET" && ["/api/stations", "/api/bicycles", "/api/docking-points", "/api/bicycle-dockings", "/api/maintenances"].some((prefix) => path.startsWith(prefix))) ||
      path === "/api/maintenances" && method === "POST" ||
      path.startsWith("/api/maintenances/") && method === "PATCH",
    SOPORTE: ({ method, path }) =>
      method === "GET" && ["/api/clientes", "/api/stations", "/api/bicycles", "/api/docking-points", "/api/rates", "/api/reservations", "/api/rentals", "/api/rental-events", "/api/bicycle-dockings", "/api/penalties", "/api/maintenances", "/api/payments"].some((prefix) => path.startsWith(prefix)),
    CLIENTE: ({ method, path }) =>
      (method === "GET" && (path === "/api/bicycles/available" || path.startsWith("/api/reservations"))) ||
      (method === "GET" && ["/api/rentals", "/api/penalties"].some((prefix) => path.startsWith(prefix))) ||
      (method === "POST" && path === "/api/reservations"),
  };

  for (const [roleName, allows] of Object.entries(roleGrants)) {
    const role = await Role.findOne({
      where: { name: roleName, is_active: true },
    });
    if (!role) {
      console.warn(`resource_roles: no existe el rol ${roleName} activo; se omite`);
      continue;
    }
    const resourcesForRole = RESOURCE_CATALOG.filter(allows);
    const result = await service.reconcileRole(role.id, idsFor(resourcesForRole));
    total += result.total_active;
    console.log(
      `resource_roles: ${roleName} -> ${result.total_active} recursos ` +
        `(${result.activated} altas, ${result.deactivated} bajas)`,
    );
  }

  return total;
}
