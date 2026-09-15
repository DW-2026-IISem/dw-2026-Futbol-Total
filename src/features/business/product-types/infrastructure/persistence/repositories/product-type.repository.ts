import { Injectable } from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
import { ProductType } from '../../../domain/entities/product-type.entity';
import { ProductTypeNameAlreadyExistsException } from '../../../domain/exceptions/product-type-name-already-exists.exception';
import type { IProductTypeRepository } from '../../../domain/interfaces/product-type.repository';
import { ProductTypeMapper } from '../../../application/mappers/product-type.mapper';
import { ProductTypeModel } from '../models/product-type.model';

@Injectable()
export class ProductTypeRepository implements IProductTypeRepository {
  async create(productType: ProductType): Promise<ProductType> {
    try {
      const values = ProductTypeMapper.toPersistence(productType) as ProductTypeModel;
      const model = await ProductTypeModel.create(values);
      return ProductTypeMapper.toDomain(model);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ProductTypeNameAlreadyExistsException(productType.name);
      }
      throw error;
    }
  }

  async findAll(): Promise<ProductType[]> {
    const models = await ProductTypeModel.findAll({ order: [['id', 'ASC']] });
    return models.map(ProductTypeMapper.toDomain);
  }

  async findById(id: number): Promise<ProductType | null> {
    const model = await ProductTypeModel.findByPk(id);
    return model ? ProductTypeMapper.toDomain(model) : null;
  }

  async findByName(name: string): Promise<ProductType | null> {
    const model = await ProductTypeModel.findOne({ where: { name } });
    return model ? ProductTypeMapper.toDomain(model) : null;
  }
}