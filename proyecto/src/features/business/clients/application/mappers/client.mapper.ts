import { Status } from '../../../../../common/enums/status.enum.js';
import type { ClientModel } from '../../infrastructure/persistence/models/client.model.js';
import { Client } from '../../domain/entities/client.entity.js';
import type { ClientResponseDto } from '../dto/client-response.dto.js';

export class ClientMapper {
  static toDomain(model: ClientModel): Client {
    return Client.reconstitute({
      id: model.id,
      name: model.name,
      address: model.address ?? undefined,
      phone: model.phone ?? undefined,
      email: model.email ?? undefined,
      password: model.password ?? undefined,
      status: model.status,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toPersistence(client: Client) {
    return {
      name: client.name,
      address: client.address ?? null,
      phone: client.phone ?? null,
      email: client.email ?? null,
      password: client.password ?? null,
      status: client.status ?? Status.ACTIVE,
    };
  }

  static toResponse(client: Client): ClientResponseDto {
    return {
      id: client.id!,
      name: client.name,
      address: client.address,
      phone: client.phone,
      email: client.email,
      status: client.status,
      createdAt: client.createdAt!,
      updatedAt: client.updatedAt!,
    };
  }
}