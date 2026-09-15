import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module';
import { ClientModel } from '../models/client.model';

@Injectable()
export class ClientSeeder implements OnModuleInit {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  async onModuleInit(): Promise<void> {
    void this.sequelize;
    await ClientModel.findOrCreate({
      where: { email: 'seed.client@pedalibre.local' },
      defaults: {
        name: 'Cliente inicial',
        email: 'seed.client@pedalibre.local',
        phone: null,
        address: null,
        status: 'active',
      } as ClientModel,
    });
  }
}
