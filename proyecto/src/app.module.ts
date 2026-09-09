import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './features/auth/auth.module.js';
import { BusinessModule } from './features/business/business.module.js';

@Module({
  imports: [BusinessModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
