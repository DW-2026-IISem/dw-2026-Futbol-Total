import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { ProductNotFoundException } from '../../domain/exceptions/product-not-found.exception';
import { PRODUCT_REPOSITORY, type IProductRepository } from '../../domain/interfaces/product.repository';

@Injectable()
export class GetProductById {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: IProductRepository,
  ) {}

  async execute(id: number): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new ProductNotFoundException(id);
    }
    return product;
  }
}
