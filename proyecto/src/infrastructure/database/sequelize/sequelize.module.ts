import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE_TOKEN } from '../../../common/constants/database.constants.js';
import { ENV_CONFIG_NAME } from '../../../config/environment/env.config.js';
import {
  Environment,
  type EnvironmentConfig,
} from '../../../config/environment/env.interface.js';
import { createSequelizeInstance } from './sequelize.factory.js';
import { DatabaseSeederService } from '../seeders/database-seeder.service.js';

@Global()
@Module({
  providers: [
    DatabaseSeederService,
    {
      provide: SEQUELIZE_TOKEN,
      useFactory: async (
        configService: ConfigService,
      ): Promise<Sequelize> => {
        const env = configService.get<EnvironmentConfig>(ENV_CONFIG_NAME);
        const database = env?.database;
        if (!database) {
          throw new Error(
            'Error de configuración: no hay bloque de base de datos. Revisa DB_DIALECT y el bloque del motor activo.',
          );
        }

        return createSequelizeInstance(
          database,
          env.app?.nodeEnv ?? Environment.Development,
        );
      },
      inject: [ConfigService],
    },
  ],
  exports: [SEQUELIZE_TOKEN],
})
export class SequelizeDatabaseModule {}
