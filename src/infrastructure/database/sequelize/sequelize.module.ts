import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { envConfig } from '../../../config/environment/env.config';
import { createSequelizeInstance } from './sequelize.factory';

export const SEQUELIZE = 'SEQUELIZE';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SEQUELIZE,
      inject: [envConfig.KEY],
      useFactory: async (
        env: ConfigType<typeof envConfig>,
      ): Promise<Sequelize> => {
        return createSequelizeInstance(env.database);
      },
    },
  ],
  exports: [SEQUELIZE],
})
export class SequelizeDatabaseModule {}
