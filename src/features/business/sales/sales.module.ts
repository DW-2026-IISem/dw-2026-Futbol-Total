import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { ProductsModule } from '../products/products.module';
import { CreateSale } from './application/use-cases/create-sale.use-case';
import { GetSaleById } from './application/use-cases/get-sale-by-id.use-case';
import { SALE_REPOSITORY } from './domain/interfaces/sale.repository';
import { SaleRepository } from './infrastructure/persistence/repositories/sale.repository';
import { SalesController } from './presentation/http/controllers/sales.controller';

@Module({
  imports: [ClientsModule, ProductsModule],
  controllers: [SalesController],
  providers: [
    CreateSale,
    GetSaleById,
    SaleRepository,
    {
      provide: SALE_REPOSITORY,
      useExisting: SaleRepository,
    },
  ],
  exports: [SALE_REPOSITORY],
})
export class SalesModule {}
