import dotenv from "dotenv";
import { sequelize, testConnection } from "../db";
import "../../features/business/clients/client.model";
import "../../features/business/product-types/product-type.model";
import "../../features/business/products/product.model";
import "../../features/business/products/products.associations";
import "../../features/business/sales/sale.model";
import "../../features/business/product-sales/product-sale.model";
import "../../features/business/sales/sales.associations";
import "../../features/business/product-sales/product-sales.associations";
import { seedClients } from "../../features/business/clients/clients.seeder";
import { seedProductTypes } from "../../features/business/product-types/product-types.seeder";
import { seedProducts } from "../../features/business/products/products.seeder";
import { seedSales } from "../../features/business/sales/sales.seeder";
import { seedProductSales } from "../../features/business/product-sales/product-sales.seeder";
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

  await sequelize.sync({ force: false });
  await seedClients(counts.clients);
  await seedProductTypes(counts.product_types);
  await seedProducts(counts.products);
  await seedSales(counts.sales);
  await seedProductSales(counts.product_sales);

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
