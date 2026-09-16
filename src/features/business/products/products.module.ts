import { Module } from '@nestjs/common';
import { ProductTypesModule } from '../product-types/product-types.module';
import { CreateProduct } from './application/use-cases/create-product.use-case';
import { GetProductById } from './application/use-cases/get-product-by-id.use-case';
import { ListProducts } from './application/use-cases/list-products.use-case';
import { PRODUCT_REPOSITORY } from './domain/interfaces/product.repository';
import { ProductRepository } from './infrastructure/persistence/repositories/product.repository';
import { ProductSeeder } from './infrastructure/persistence/seeders/product.seeder';
import { ProductsController } from './presentation/http/controllers/products.controller';

@Module({
  imports: [ProductTypesModule],
  controllers: [ProductsController],
  providers: [
    ProductSeeder,
    CreateProduct,
    ListProducts,
    GetProductById,
    ProductRepository,
    {
      provide: PRODUCT_REPOSITORY,
      useExisting: ProductRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
