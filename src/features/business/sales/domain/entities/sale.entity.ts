import { ProductSale } from './product-sale.entity';
import { SaleCalculator } from '../services/sale-calculator';

export type SaleStatus = 'completed' | 'pending' | 'cancelled';

export interface SaleProperties {
  id?: number;
  saleDate?: Date;
  subtotal?: number;
  tax?: number;
  discounts?: number;
  total?: number;
  status?: SaleStatus;
  clientId: number;
  items?: ProductSale[];
}

export class Sale {
  readonly id?: number;
  readonly saleDate: Date;
  readonly subtotal: number;
  readonly tax: number;
  readonly discounts: number;
  readonly total: number;
  readonly status: SaleStatus;
  readonly clientId: number;
  readonly items: ProductSale[];

  constructor(properties: SaleProperties) {
    this.id = properties.id;
    this.saleDate = properties.saleDate ?? new Date();
    this.subtotal = Number(properties.subtotal ?? 0);
    this.tax = Number(properties.tax ?? 0);
    this.discounts = Number(properties.discounts ?? 0);
    this.items = properties.items ?? [];
    this.status = properties.status ?? 'completed';
    this.clientId = properties.clientId;
    this.total =
      properties.total ??
      SaleCalculator.calculateTotal(this.subtotal, this.tax, this.discounts);
  }
}
