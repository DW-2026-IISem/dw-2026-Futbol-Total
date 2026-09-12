import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE_TOKEN } from '../../../common/constants/database.constants.js';
import { ENV_CONFIG_NAME } from '../../../config/environment/env.config.js';
import { Environment } from '../../../config/environment/env.interface.js';
import { seedClients } from '../../../features/business/clients/infrastructure/persistence/seeders/clients.seeder.js';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @Inject(SEQUELIZE_TOKEN) private readonly sequelize: Sequelize,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const env = this.configService.get(ENV_CONFIG_NAME);
    if (env?.app.nodeEnv === Environment.Production) {
      return;
    }

    await seedClients();
    this.logger.log('Seeders de Clients ejecutados');
  }
}