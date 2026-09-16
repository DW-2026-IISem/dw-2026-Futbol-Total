import { Module } from '@nestjs/common';
import { CreateProductType } from './application/use-cases/create-product-type.use-case';
import { GetProductTypeById } from './application/use-cases/get-product-type-by-id.use-case';
import { ListProductTypes } from './application/use-cases/list-product-types.use-case';
import { PRODUCT_TYPE_REPOSITORY } from './domain/interfaces/product-type.repository';
import { ProductTypeRepository } from './infrastructure/persistence/repositories/product-type.repository';
import { ProductTypeSeeder } from './infrastructure/persistence/seeders/product-type.seeder';
import { ProductTypesController } from './presentation/http/controllers/product-types.controller';

@Module({
  controllers: [ProductTypesController],
  providers: [
    ProductTypeSeeder,
    CreateProductType,
    ListProductTypes,
    GetProductTypeById,
    ProductTypeRepository,
    {
      provide: PRODUCT_TYPE_REPOSITORY,
      useExisting: ProductTypeRepository,
    },
  ],
  exports: [PRODUCT_TYPE_REPOSITORY],
})
export class ProductTypesModule {}