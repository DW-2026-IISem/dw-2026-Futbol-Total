/**
 * Cantidad de registros por feature/entidad.
 * Prioridad: CLI (--clients=N) > env (SEED_CLIENTS) > valor por defecto.
 */
export type SeedCounts = {
  clients: number;
  product_types: number;
};

export const DEFAULT_SEED_COUNTS: SeedCounts = {
  clients: 10,
  product_types: 25,
};

export function resolveSeedCounts(
  argv: string[] = process.argv.slice(2)
): SeedCounts {
  const counts: SeedCounts = { ...DEFAULT_SEED_COUNTS };

  const envClients = process.env.SEED_CLIENTS;
  if (envClients !== undefined && envClients !== "") {
    counts.clients = Number(envClients);
  }

  const envProductTypes = process.env.SEED_PRODUCT_TYPES;
  if (envProductTypes !== undefined && envProductTypes !== "") {
    counts.product_types = Number(envProductTypes);
  }

  for (const arg of argv) {
    const match = arg.match(/^--([a-zA-Z_]+)=(\d+)$/);
    if (!match) continue;

    const key = match[1] as keyof SeedCounts;
    const value = Number(match[2]);

    if (key in counts) {
      counts[key] = value;
    }
  }

  return counts;
}
