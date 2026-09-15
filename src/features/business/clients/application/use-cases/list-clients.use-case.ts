import { Inject, Injectable } from '@nestjs/common';
import type { Client } from '../../domain/entities/client.entity';
import {
  CLIENT_REPOSITORY,
  type IClientRepository,
} from '../../domain/interfaces/client.repository';

@Injectable()
export class ListClients {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly repository: IClientRepository,
  ) {}

  execute(): Promise<Client[]> {
    return this.repository.findAll();
  }
}
