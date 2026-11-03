import { faker } from "@faker-js/faker";
import { Client } from "./client.model";

/**
 * Seeder del feature Client.
 * Se ejecuta desde el SeedersRunner, no desde la API.
 */
export async function seedClients(count: number): Promise<number> {
  if (count <= 0) {
    console.log("clients: count=0, se omite");
    return 0;
  }

  const existing = await Client.count();
  if (existing > 0) {
    console.log(`clients: ya hay ${existing} registro(s), se omite seeder`);
    return 0;
  }

  const rows = Array.from({ length: count }, (_, index) => ({
    name: faker.person.fullName(),
    address: faker.location.streetAddress(),
    phone: faker.phone.number({ style: "national" }),
    email: `client.${index}.${faker.string.alphanumeric(6)}@example.com`.toLowerCase(),
    password: faker.internet.password(),
    status: "active" as const,
  }));

  await Client.bulkCreate(rows);
  console.log(`clients: insertados ${count} registro(s) falsos`);
  return count;
}
