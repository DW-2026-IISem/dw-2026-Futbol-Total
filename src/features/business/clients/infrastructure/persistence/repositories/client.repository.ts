import { Injectable } from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
import { Client } from '../../../domain/entities/client.entity';
import { ClientEmailAlreadyExistsException } from '../../../domain/exceptions/client-email-already-exists.exception';
import type { IClientRepository } from '../../../domain/interfaces/client.repository';
import { ClientMapper } from '../../../application/mappers/client.mapper';
import { ClientModel } from '../models/client.model';

@Injectable()
export class ClientRepository implements IClientRepository {
  async create(client: Client): Promise<Client> {
    try {
      const values = ClientMapper.toPersistence(client) as ClientModel;
      const model = await ClientModel.create(values);
      return ClientMapper.toDomain(model);
    } catch (error) {
      if (error instanceof UniqueConstraintError && client.email) {
        throw new ClientEmailAlreadyExistsException(client.email);
      }
      throw error;
    }
  }

  async findAll(): Promise<Client[]> {
    const models = await ClientModel.findAll({ order: [['id', 'ASC']] });
    return models.map(ClientMapper.toDomain);
  }

  async findById(id: number): Promise<Client | null> {
    const model = await ClientModel.findByPk(id);
    return model ? ClientMapper.toDomain(model) : null;
  }

  async findByEmail(email: string): Promise<Client | null> {
    const model = await ClientModel.findOne({ where: { email } });
    return model ? ClientMapper.toDomain(model) : null;
  }
}
