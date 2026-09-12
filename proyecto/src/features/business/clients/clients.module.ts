import { Module } from '@nestjs/common';
import { PASSWORD_HASHER } from '../../../infrastructure/security/hashing/password-hasher.interface.js';
import { ScryptPasswordHasherService } from '../../../infrastructure/security/hashing/scrypt-password-hasher.service.js';
import { CLIENT_REPOSITORY } from './domain/interfaces/client-repository.interface.js';
import { ClientRepository } from './infrastructure/persistence/repositories/client.repository.js';
import { CreateClientUseCase } from './application/use-cases/create-client.use-case.js';
import { ClientsController } from './presentation/http/controllers/clients.controller.js';

@Module({
  controllers: [ClientsController],
  providers: [
    ClientRepository,
    { provide: CLIENT_REPOSITORY, useExisting: ClientRepository },
    ScryptPasswordHasherService,
    { provide: PASSWORD_HASHER, useExisting: ScryptPasswordHasherService },
    CreateClientUseCase,
  ],
})
export class ClientsModule {}