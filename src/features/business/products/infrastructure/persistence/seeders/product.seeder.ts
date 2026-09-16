import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { Sequelize } from 'sequelize-typescript';
import { PRODUCT_TYPE_REPOSITORY, type IProductTypeRepository } from '../../../../product-types/domain/interfaces/product-type.repository';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module';
import { ProductModel } from '../models/product.model';

@Injectable()
export class ProductSeeder implements OnModuleInit {
  constructor(
    @Inject(SEQUELIZE) private readonly sequelize: Sequelize,
    @Inject(PRODUCT_TYPE_REPOSITORY)
    private readonly productTypeRepository: IProductTypeRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    void this.sequelize;

    const productTypes = await this.productTypeRepository.findAll();
    const activeProductType = productTypes.find((productType) => productType.status === 'active');

    if (!activeProductType?.id) {
      return;
    }

    await ProductModel.findOrCreate({
      where: { name: 'Agua 600ml' },
      defaults: {
        name: 'Agua 600ml',
        brand: 'Cristal',
        price: 2500,
        minStock: 1,
        quantity: 5,
        productTypeId: activeProductType.id,
        status: 'active',
      } as ProductModel,
    });
  }
}
