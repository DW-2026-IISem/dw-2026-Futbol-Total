import { Inject, Injectable } from '@nestjs/common';
import type { ProductType } from '../../domain/entities/product-type.entity';
import {
  PRODUCT_TYPE_REPOSITORY,
  type IProductTypeRepository,
} from '../../domain/interfaces/product-type.repository';

@Injectable()
export class ListProductTypes {
  constructor(
    @Inject(PRODUCT_TYPE_REPOSITORY)
    private readonly repository: IProductTypeRepository,
  ) {}

  execute(): Promise<ProductType[]> {
    return this.repository.findAll();
  }
}