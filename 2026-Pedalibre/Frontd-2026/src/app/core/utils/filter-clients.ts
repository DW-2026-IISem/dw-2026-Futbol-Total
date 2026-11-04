import { Client } from '../models/client.model';

export function filterClients(
  clients: readonly Client[],
  query: string,
): Client[] {
  const term = query.trim().toLowerCase();
  if (!term) return [...clients];

  return clients.filter((client) =>
    [
      client.first_name,
      client.last_name,
      client.document_type,
      client.document_number,
      client.email,
      client.phone,
    ].some((value) => (value ?? '').toLowerCase().includes(term)),
  );
}
