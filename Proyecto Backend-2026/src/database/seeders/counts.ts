/**
 * Cantidad de registros por feature/entidad.
 * Prioridad: CLI (--clients=N) > env (SEED_CLIENTS) > valor por defecto.
 */
export type SeedCounts = {
  clients: number;
};

export const DEFAULT_SEED_COUNTS: SeedCounts = {
  clients: 10,
};

export function resolveSeedCounts(
  argv: string[] = process.argv.slice(2)
): SeedCounts {
  const counts: SeedCounts = { ...DEFAULT_SEED_COUNTS };

  const envClients = process.env.SEED_CLIENTS;
  if (envClients !== undefined && envClients !== "") {
    counts.clients = Number(envClients);
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
