import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module';
import { ProductTypeModel } from '../models/product-type.model';

@Injectable()
export class ProductTypeSeeder implements OnModuleInit {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  async onModuleInit(): Promise<void> {
    void this.sequelize;
    await ProductTypeModel.findOrCreate({
      where: { name: 'Bebidas' },
      defaults: {
        name: 'Bebidas',
        description: 'Productos líquidos',
        status: 'active',
      } as ProductTypeModel,
    });
  }
}