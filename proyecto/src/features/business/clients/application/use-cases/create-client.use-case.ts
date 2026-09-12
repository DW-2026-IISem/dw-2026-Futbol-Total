import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  CLIENT_REPOSITORY,
  type IClientRepository,
} from '../../domain/interfaces/client-repository.interface.js';
import { Client } from '../../domain/entities/client.entity.js';
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../../../../../infrastructure/security/hashing/password-hasher.interface.js';
import { ClientMapper } from '../mappers/client.mapper.js';
import type { CreateClientDto } from '../dto/create-client.dto.js';
import type { ClientResponseDto } from '../dto/client-response.dto.js';

@Injectable()
export class CreateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly repository: IClientRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(dto: CreateClientDto): Promise<ClientResponseDto> {
    if (dto.email && (await this.repository.findByEmail(dto.email))) {
      throw new ConflictException('El email del cliente ya está registrado');
    }

    const password = dto.password
      ? await this.passwordHasher.hash(dto.password)
      : undefined;
    const client = Client.create({ ...dto, password });
    return ClientMapper.toResponse(await this.repository.create(client));
  }
}