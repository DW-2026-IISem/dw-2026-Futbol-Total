import { Inject, Injectable } from '@nestjs/common';
import { ProductTypeNotFoundException } from '../../../product-types/domain/exceptions/product-type-not-found.exception';
import { PRODUCT_TYPE_REPOSITORY, type IProductTypeRepository } from '../../../product-types/domain/interfaces/product-type.repository';
import { Product } from '../../domain/entities/product.entity';
import { ProductTypeInactiveException } from '../../domain/exceptions/product-type-inactive.exception';
import { PRODUCT_REPOSITORY, type IProductRepository } from '../../domain/interfaces/product.repository';
import type { CreateProductDto } from '../dto/create-product.dto';

@Injectable()
export class CreateProduct {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: IProductRepository,
    @Inject(PRODUCT_TYPE_REPOSITORY)
    private readonly productTypeRepository: IProductTypeRepository,
  ) {}

  async execute(dto: CreateProductDto): Promise<Product> {
    const productType = await this.productTypeRepository.findById(dto.productTypeId);

    if (!productType) {
      throw new ProductTypeNotFoundException(dto.productTypeId);
    }

    if (productType.status === 'inactive') {
      throw new ProductTypeInactiveException(dto.productTypeId);
    }

    return this.repository.create(
      new Product({
        ...dto,
        minStock: dto.minStock ?? 0,
        quantity: dto.quantity ?? 0,
        status: 'active',
      }),
    );
  }
}
