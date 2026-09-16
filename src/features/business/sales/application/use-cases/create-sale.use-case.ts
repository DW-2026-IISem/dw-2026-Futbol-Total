import { Inject, Injectable } from '@nestjs/common';
import type { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../infrastructure/database/sequelize/sequelize.module';
import { ClientNotFoundException } from '../../../clients/domain/exceptions/client-not-found.exception';
import { CLIENT_REPOSITORY, type IClientRepository } from '../../../clients/domain/interfaces/client.repository';
import { Product } from '../../../products/domain/entities/product.entity';
import { ProductNotFoundException } from '../../../products/domain/exceptions/product-not-found.exception';
import { PRODUCT_REPOSITORY, type IProductRepository } from '../../../products/domain/interfaces/product.repository';
import { ProductModel } from '../../../products/infrastructure/persistence/models/product.model';
import { ProductSale } from '../../domain/entities/product-sale.entity';
import { Sale } from '../../domain/entities/sale.entity';
import { EmptySaleException } from '../../domain/exceptions/empty-sale.exception';
import { SALE_REPOSITORY, type ISaleRepository } from '../../domain/interfaces/sale.repository';
import { SaleCalculator } from '../../domain/services/sale-calculator';
import type { CreateSaleDto } from '../dto/create-sale.dto';

@Injectable()
export class CreateSale {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(SALE_REPOSITORY)
    private readonly saleRepository: ISaleRepository,
    @Inject(SEQUELIZE)
    private readonly sequelize: Sequelize,
  ) {}

  async execute(dto: CreateSaleDto): Promise<Sale> {
    if (!dto.items || dto.items.length === 0) {
      throw new EmptySaleException();
    }

    const client = await this.clientRepository.findById(dto.clientId);
    if (!client) {
      throw new ClientNotFoundException(dto.clientId);
    }

    let createdSale!: Sale;

    await this.sequelize.transaction(async (transaction) => {
      const items: ProductSale[] = [];

      for (const item of dto.items) {
        const productFound = await this.productRepository.findById(item.productId);
        if (!productFound) {
          throw new ProductNotFoundException(item.productId);
        }

        const productModel = await ProductModel.findByPk(item.productId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!productModel) {
          throw new ProductNotFoundException(item.productId);
        }

        const product = new Product({
          id: productModel.id,
          name: productModel.name,
          brand: productModel.brand ?? undefined,
          price: Number(productModel.price),
          minStock: productModel.minStock,
          quantity: productModel.quantity,
          productTypeId: productModel.productTypeId,
          status: productModel.status,
        });

        const reducedProduct = product.reduceStock(item.quantity);
        const unitPrice = item.unitPrice ?? product.price;
        const total = Number((item.quantity * unitPrice).toFixed(2));

        items.push(
          new ProductSale({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            total,
          }),
        );

        await ProductModel.update(
          { quantity: reducedProduct.quantity },
          { where: { id: item.productId }, transaction },
        );
      }

      const subtotal = SaleCalculator.calculateSubtotal(items);
      const tax = dto.tax ?? 0;
      const discounts = dto.discounts ?? 0;

      const sale = new Sale({
        saleDate: new Date(),
        subtotal,
        tax,
        discounts,
        total: SaleCalculator.calculateTotal(subtotal, tax, discounts),
        status: 'completed',
        clientId: dto.clientId,
        items,
      });

      createdSale = await this.saleRepository.create(sale, transaction);
    });

    return createdSale;
  }
}
