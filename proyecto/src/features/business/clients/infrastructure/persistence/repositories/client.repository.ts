import { Injectable } from '@nestjs/common';
import { Client } from '../../../domain/entities/client.entity.js';
import type { IClientRepository } from '../../../domain/interfaces/client-repository.interface.js';
import { ClientMapper } from '../../../application/mappers/client.mapper.js';
import { ClientModel } from '../models/client.model.js';

@Injectable()
export class ClientRepository implements IClientRepository {
  async create(client: Client): Promise<Client> {
    const model = await ClientModel.create(ClientMapper.toPersistence(client));
    return ClientMapper.toDomain(model);
  }

  async findByEmail(email: string): Promise<Client | null> {
    const model = await ClientModel.findOne({ where: { email } });
    return model ? ClientMapper.toDomain(model) : null;
  }
}