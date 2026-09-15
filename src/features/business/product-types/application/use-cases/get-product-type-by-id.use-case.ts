import { Inject, Injectable } from '@nestjs/common';
import { ProductTypeNotFoundException } from '../../domain/exceptions/product-type-not-found.exception';
import type { ProductType } from '../../domain/entities/product-type.entity';
import {
  PRODUCT_TYPE_REPOSITORY,
  type IProductTypeRepository,
} from '../../domain/interfaces/product-type.repository';

@Injectable()
export class GetProductTypeById {
  constructor(
    @Inject(PRODUCT_TYPE_REPOSITORY)
    private readonly repository: IProductTypeRepository,
  ) {}

  async execute(id: number): Promise<ProductType> {
    const productType = await this.repository.findById(id);
    if (!productType) {
      throw new ProductTypeNotFoundException(id);
    }
    return productType;
  }
}