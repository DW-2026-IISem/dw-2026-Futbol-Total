import { Inject, Injectable } from '@nestjs/common';
import { ProductType } from '../../domain/entities/product-type.entity';
import { ProductTypeNameAlreadyExistsException } from '../../domain/exceptions/product-type-name-already-exists.exception';
import {
  PRODUCT_TYPE_REPOSITORY,
  type IProductTypeRepository,
} from '../../domain/interfaces/product-type.repository';
import type { CreateProductTypeDto } from '../dto/create-product-type.dto';

@Injectable()
export class CreateProductType {
  constructor(
    @Inject(PRODUCT_TYPE_REPOSITORY)
    private readonly repository: IProductTypeRepository,
  ) {}

  async execute(dto: CreateProductTypeDto): Promise<ProductType> {
    if (await this.repository.findByName(dto.name)) {
      throw new ProductTypeNameAlreadyExistsException(dto.name);
    }

    return this.repository.create(new ProductType(dto));
  }
}