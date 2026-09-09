import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { LoggerModule } from './common/logger/logger.module.js';
import { envConfig } from './config/environment/env.config.js';
import { validate } from './config/environment/env.validation.js';
import { AuthModule } from './features/auth/auth.module.js';
import { BusinessModule } from './features/business/business.module.js';
import { SequelizeDatabaseModule } from './infrastructure/database/sequelize/sequelize.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
      load: [envConfig],
    }),
    LoggerModule,
    SequelizeDatabaseModule,
    BusinessModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
