import { Inject, Injectable } from '@nestjs/common';
import { Client } from '../../domain/entities/client.entity';
import { ClientEmailAlreadyExistsException } from '../../domain/exceptions/client-email-already-exists.exception';
import {
  CLIENT_REPOSITORY,
  type IClientRepository,
} from '../../domain/interfaces/client.repository';
import type { CreateClientDto } from '../dto/create-client.dto';

@Injectable()
export class CreateClient {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly repository: IClientRepository,
  ) {}

  async execute(dto: CreateClientDto): Promise<Client> {
    if (dto.email && (await this.repository.findByEmail(dto.email))) {
      throw new ClientEmailAlreadyExistsException(dto.email);
    }

    return this.repository.create(new Client(dto));
  }
}
