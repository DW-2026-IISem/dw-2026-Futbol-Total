import { Module } from '@nestjs/common';
import { CreateClient } from './application/use-cases/create-client.use-case';
import { GetClientById } from './application/use-cases/get-client-by-id.use-case';
import { ListClients } from './application/use-cases/list-clients.use-case';
import { ClientRepository } from './infrastructure/persistence/repositories/client.repository';
import { ClientSeeder } from './infrastructure/persistence/seeders/client.seeder';
import { ClientsController } from './presentation/http/controllers/clients.controller';
import { CLIENT_REPOSITORY } from './domain/interfaces/client.repository';

@Module({
  controllers: [ClientsController],
  providers: [
    ClientSeeder,
    CreateClient,
    ListClients,
    GetClientById,
    ClientRepository,
    {
      provide: CLIENT_REPOSITORY,
      useExisting: ClientRepository,
    },
  ],
})
export class ClientsModule {}
