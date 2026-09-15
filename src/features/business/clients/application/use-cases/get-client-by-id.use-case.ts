import { Inject, Injectable } from '@nestjs/common';
import { ClientNotFoundException } from '../../domain/exceptions/client-not-found.exception';
import type { Client } from '../../domain/entities/client.entity';
import {
  CLIENT_REPOSITORY,
  type IClientRepository,
} from '../../domain/interfaces/client.repository';

@Injectable()
export class GetClientById {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly repository: IClientRepository,
  ) {}

  async execute(id: number): Promise<Client> {
    const client = await this.repository.findById(id);
    if (!client) {
      throw new ClientNotFoundException(id);
    }
    return client;
  }
}
