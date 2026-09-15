import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BusinessModule } from './features/business/business.module';

@Module({
  imports: [BusinessModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
