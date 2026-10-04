import dotenv from "dotenv";
import { sequelize, testConnection } from "../db";
import "../../features/business/clients/client.model";
import { seedClients } from "../../features/business/clients/clients.seeder";
import { resolveSeedCounts } from "./counts";

dotenv.config();

export async function runAllSeeders(): Promise<void> {
  const counts = resolveSeedCounts();
  console.log("Iniciando SeedersRunner...");
  console.log("Conteos:", counts);

  const connected = await testConnection();
  if (!connected) {
    throw new Error("No hay conexión a la base de datos");
  }

  await sequelize.sync({ force: false, alter: true });
  await seedClients(counts.clients);

  console.log("SeedersRunner finalizado");
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
