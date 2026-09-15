import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envConfig } from './config/environment/env.config';
import { validate } from './config/environment/env.validation';
import { BusinessModule } from './features/business/business.module';
import { SequelizeDatabaseModule } from './infrastructure/database/sequelize/sequelize.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
      load: [envConfig],
    }),
    SequelizeDatabaseModule,
    BusinessModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
