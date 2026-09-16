import { ProductSale } from '../../domain/entities/product-sale.entity';
import { Sale } from '../../domain/entities/sale.entity';
import type { ProductSaleModel } from '../../infrastructure/persistence/models/product-sale.model';
import type { SaleModel } from '../../infrastructure/persistence/models/sale.model';

export const ProductSaleMapper = {
  toDomain(model: ProductSaleModel): ProductSale {
    return new ProductSale({
      id: model.id,
      saleId: model.saleId,
      productId: model.productId,
      quantity: model.quantity,
      unitPrice: Number(model.unitPrice),
      total: Number(model.total),
    });
  },

  toPersistence(item: ProductSale, saleId: number) {
    return {
      saleId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    };
  },
};

export const SaleMapper = {
  toDomain(model: SaleModel): Sale {
    return new Sale({
      id: model.id,
      saleDate: model.saleDate,
      subtotal: Number(model.subtotal),
      tax: Number(model.tax),
      discounts: Number(model.discounts),
      total: Number(model.total),
      status: model.status,
      clientId: model.clientId,
      items: (model.items ?? []).map(ProductSaleMapper.toDomain),
    });
  },

  toPersistence(sale: Sale) {
    return {
      saleDate: sale.saleDate,
      subtotal: sale.subtotal,
      tax: sale.tax,
      discounts: sale.discounts,
      total: sale.total,
      status: sale.status,
      clientId: sale.clientId,
    };
  },
};
