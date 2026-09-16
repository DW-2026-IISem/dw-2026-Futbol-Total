import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { PRODUCT_REPOSITORY, type IProductRepository } from '../../domain/interfaces/product.repository';

@Injectable()
export class ListProducts {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: IProductRepository,
  ) {}

  async execute(): Promise<Product[]> {
    return this.repository.findAll();
  }
}
