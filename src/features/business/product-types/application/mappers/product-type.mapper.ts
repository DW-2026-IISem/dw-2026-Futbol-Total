import { ProductType } from '../../domain/entities/product-type.entity';
import type { ProductTypeModel } from '../../infrastructure/persistence/models/product-type.model';

export const ProductTypeMapper = {
  toDomain(model: ProductTypeModel): ProductType {
    return new ProductType({
      id: model.id,
      name: model.name,
      description: model.description ?? undefined,
      status: model.status,
    });
  },

  toPersistence(productType: ProductType) {
    return {
      name: productType.name,
      description: productType.description ?? null,
      status: productType.status,
    };
  },
};