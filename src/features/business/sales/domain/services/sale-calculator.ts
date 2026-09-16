import type { ProductSale } from '../entities/product-sale.entity';

export class SaleCalculator {
  static calculateSubtotal(items: Pick<ProductSale, 'quantity' | 'unitPrice'>[]): number {
    return Number(
      items.reduce((total, item) => total + item.quantity * item.unitPrice, 0).toFixed(2),
    );
  }

  static calculateTotal(subtotal: number, tax: number, discounts: number): number {
    return Number((subtotal + tax - discounts).toFixed(2));
  }
}
