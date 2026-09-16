import { Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product.entity';
import type { IProductRepository } from '../../../domain/interfaces/product.repository';
import { ProductMapper } from '../../../application/mappers/product.mapper';
import { ProductModel } from '../models/product.model';

@Injectable()
export class ProductRepository implements IProductRepository {
  async create(product: Product): Promise<Product> {
    const values = ProductMapper.toPersistence(product) as ProductModel;
    const model = await ProductModel.create(values);
    return ProductMapper.toDomain(model);
  }

  async findAll(): Promise<Product[]> {
    const models = await ProductModel.findAll({ order: [['id', 'ASC']] });
    return models.map(ProductMapper.toDomain);
  }

  async findById(id: number): Promise<Product | null> {
    const model = await ProductModel.findByPk(id);
    return model ? ProductMapper.toDomain(model) : null;
  }
}
