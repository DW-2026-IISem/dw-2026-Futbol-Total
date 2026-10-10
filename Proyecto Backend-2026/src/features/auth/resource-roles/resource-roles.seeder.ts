import { Resource } from "../resources/resource.model";
import { Role } from "../roles/role.model";
import {
  RESOURCE_CATALOG,
  SELLER_RESOURCES,
} from "../resources/resource-catalog";
import { ResourceRolesService } from "./resource-roles.service";

export async function seedResourceRoles(): Promise<number> {
  const service = new ResourceRolesService();
  const resources = await Resource.findAll({ where: { status: "active" } });
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

  const admin = await Role.findOne({
    where: { name: "ADMIN", status: "active" },
  });
  if (!admin) {
    console.warn("resource_roles: no existe el rol ADMIN activo; se omite");
  } else {
    const result = await service.reconcileRole(
      admin.id,
      idsFor(RESOURCE_CATALOG),
    );
    console.log(
      `resource_roles: ADMIN -> ${result.total_active} recursos ` +
        `(${result.activated} altas, ${result.deactivated} bajas)`,
    );
    total += result.total_active;
  }

  const seller = await Role.findOne({
    where: { name: "SELLER", status: "active" },
  });
  if (!seller) {
    console.warn("resource_roles: no existe el rol SELLER activo; se omite");
  } else {
    const result = await service.reconcileRole(
      seller.id,
      idsFor(SELLER_RESOURCES),
    );
    console.log(
      `resource_roles: SELLER -> ${result.total_active} recursos ` +
        `(${result.activated} altas, ${result.deactivated} bajas)`,
    );
    total += result.total_active;
  }

  return total;
}
