import dotenv from "dotenv";
import { sequelize, testConnection } from "../db";
import "../../features/business/clients/client.model";
import "../../features/business/pedalibre.models";
import "../../features/business/pedalibre.associations";
import "../../features/auth/users/user.model";
import "../../features/auth/roles/role.model";
import "../../features/auth/resources/resource.model";
import "../../features/auth/resource-roles/resource-role.model";
import "../../features/auth/refresh-tokens/refresh-token.model";
import "../../features/auth/rbac.associations";
import { seedUsers } from "../../features/auth/users/users.seeder";
import { seedRoles } from "../../features/auth/roles/roles.seeder";
import { seedResources } from "../../features/auth/resources/resources.seeder";
import { seedResourceRoles } from "../../features/auth/resource-roles/resource-roles.seeder";

dotenv.config();

export async function runAllSeeders(): Promise<void> {
  const connected = await testConnection();
  if (!connected) throw new Error("No hay conexión a la base de datos");

  await seedRoles();
  await seedResources();
  await seedUsers();
  await seedResourceRoles();
  console.log("PedalLibre RBAC seeders finalizados");
}

if (require.main === module) {
  runAllSeeders()
    .then(async () => {
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error("Error en seeders:", error);
      await sequelize.close();
      process.exit(1);
    });
}
