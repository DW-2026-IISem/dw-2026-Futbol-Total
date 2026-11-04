import { sequelize, testConnection } from "../../../database/db";
import { Resource } from "../resources/resource.model";
import { Role } from "../roles/role.model";
import { ResourceRole } from "./resource-role.model";

const roles = ["ADMIN", "CLIENTE"] as const;
const operations = [
  { method: "GET", path: "/api/rentals" },
  { method: "GET", path: "/api/penalties" },
] as const;

export async function grantActivityPermissions(): Promise<void> {
  for (const roleName of roles) {
    const role = await Role.findOne({
      where: { name: roleName, is_active: true },
    });
    if (!role) throw new Error(`No existe el rol activo ${roleName}.`);

    for (const operation of operations) {
      const resource = await Resource.findOne({
        where: { ...operation, is_active: true },
      });
      if (!resource) {
        throw new Error(
          `No existe el recurso activo ${operation.method} ${operation.path}.`,
        );
      }

      const [grant, created] = await ResourceRole.findOrCreate({
        where: { role_id: role.id, resource_id: resource.id },
        defaults: {
          role_id: role.id,
          resource_id: resource.id,
          is_allowed: true,
        },
      });
      if (!created && !grant.is_allowed) {
        await grant.update({ is_allowed: true });
      }
    }

    console.log(
      `Permisos de actividad habilitados para ${roleName}: ` +
        operations.map(({ method, path }) => `${method} ${path}`).join(", "),
    );
  }
}

if (require.main === module) {
  testConnection()
    .then(async (connected) => {
      if (!connected) throw new Error("No hay conexión a la base de datos.");
      await grantActivityPermissions();
    })
    .then(async () => {
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (error: unknown) => {
      console.error("No se pudieron sincronizar los permisos de actividad:", error);
      await sequelize.close();
      process.exit(1);
    });
}
