import { sequelize, testConnection } from "../../../database/db";
import { seedUsers } from "./users.seeder";

async function runUsersSeeder(): Promise<void> {
  const connected = await testConnection();
  if (!connected) {
    throw new Error("No hay conexión a la base de datos");
  }

  await sequelize.sync({ force: false });
  await seedUsers();
}

if (require.main === module) {
  runUsersSeeder()
    .then(async () => {
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error("Error en seeder de Users:", error);
      await sequelize.close();
      process.exit(1);
    });
}
