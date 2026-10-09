import { faker } from "@faker-js/faker";
import { Sale } from "./sale.model";
import { Client } from "../clients/client.model";

export async function seedSales(count: number): Promise<number> {
  if (count <= 0) {
    console.log("sales: count=0, se omite");
    return 0;
  }

  const existing = await Sale.count();
  if (existing > 0) {
    console.log(`sales: ya hay ${existing} registro(s), se omite seeder`);
    return 0;
  }

  const clients = await Client.findAll({ where: { status: "active" } });
  if (clients.length === 0) {
    console.log("sales: faltan clientes activos, se omite seeder");
    return 0;
  }

  const rows = Array.from({ length: count }, () => {
    const client = faker.helpers.arrayElement(clients);
    const tax = Number(
      faker.number.float({ min: 0, max: 20, fractionDigits: 2 }),
    );
    const discounts = Number(
      faker.number.float({ min: 0, max: 10, fractionDigits: 2 }),
    );

    return {
      sale_date: faker.date.recent({ days: 30 }),
      subtotal: 0,
      tax,
      discounts,
      total: tax - discounts,
      client_id: client.id,
      status: "active" as const,
    };
  });

  await Sale.bulkCreate(rows);
  console.log(`sales: insertados ${count} registro(s) falsos (sin ítems)`);
  return count;
}
