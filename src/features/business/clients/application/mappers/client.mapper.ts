import { Client } from '../../domain/entities/client.entity';
import type { ClientModel } from '../../infrastructure/persistence/models/client.model';

export const ClientMapper = {
  toDomain(model: ClientModel): Client {
    return new Client({
      id: model.id,
      name: model.name,
      email: model.email ?? undefined,
      phone: model.phone ?? undefined,
      address: model.address ?? undefined,
      status: model.status,
    });
  },

  toPersistence(client: Client) {
    return {
      name: client.name,
      email: client.email ?? null,
      phone: client.phone ?? null,
      address: client.address ?? null,
      status: client.status,
    };
  },
};
