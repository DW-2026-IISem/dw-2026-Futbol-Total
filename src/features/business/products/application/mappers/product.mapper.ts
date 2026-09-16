import { Product } from '../../domain/entities/product.entity';
import type { ProductModel } from '../../infrastructure/persistence/models/product.model';

export const ProductMapper = {
  toDomain(model: ProductModel): Product {
    return new Product({
      id: model.id,
      name: model.name,
      brand: model.brand ?? undefined,
      price: model.price,
      minStock: model.minStock,
      quantity: model.quantity,
      productTypeId: model.productTypeId,
      status: model.status,
    });
  },

  toPersistence(product: Product) {
    return {
      name: product.name,
      brand: product.brand ?? null,
      price: product.price,
      minStock: product.minStock,
      quantity: product.quantity,
      productTypeId: product.productTypeId,
      status: product.status,
    };
  },
};
