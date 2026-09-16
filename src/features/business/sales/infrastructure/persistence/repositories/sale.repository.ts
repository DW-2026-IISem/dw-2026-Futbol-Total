import { Injectable } from '@nestjs/common';
import type { Transaction } from 'sequelize';
import { ProductSale } from '../../../domain/entities/product-sale.entity';
import { Sale } from '../../../domain/entities/sale.entity';
import type { ISaleRepository } from '../../../domain/interfaces/sale.repository';
import {
  ProductSaleMapper,
  SaleMapper,
} from '../../../application/mappers/sale.mapper';
import { ProductSaleModel } from '../models/product-sale.model';
import { SaleModel } from '../models/sale.model';

@Injectable()
export class SaleRepository implements ISaleRepository {
  async create(sale: Sale, transaction?: Transaction): Promise<Sale> {
    const persistable = SaleMapper.toPersistence(sale) as SaleModel;
    const saleModel = await SaleModel.create(persistable, { transaction });

    const itemModels = await Promise.all(
      sale.items.map((item) =>
        ProductSaleModel.create(
          ProductSaleMapper.toPersistence(item, saleModel.id) as ProductSaleModel,
          { transaction },
        ),
      ),
    );

    return new Sale({
      id: saleModel.id,
      saleDate: saleModel.saleDate,
      subtotal: Number(saleModel.subtotal),
      tax: Number(saleModel.tax),
      discounts: Number(saleModel.discounts),
      total: Number(saleModel.total),
      status: saleModel.status,
      clientId: saleModel.clientId,
      items: itemModels.map(
        (itemModel) =>
          new ProductSale({
            id: itemModel.id,
            saleId: itemModel.saleId,
            productId: itemModel.productId,
            quantity: itemModel.quantity,
            unitPrice: Number(itemModel.unitPrice),
            total: Number(itemModel.total),
          }),
      ),
    });
  }

  async findById(id: number): Promise<Sale | null> {
    const model = await SaleModel.findByPk(id, {
      include: [{ model: ProductSaleModel, as: 'items' }],
    });

    return model ? SaleMapper.toDomain(model) : null;
  }
}
