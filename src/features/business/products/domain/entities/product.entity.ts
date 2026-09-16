import { InsufficientStockException } from '../exceptions/insufficient-stock.exception';

export type ProductStatus = 'active' | 'inactive';

export interface ProductProperties {
  id?: number;
  name: string;
  brand?: string;
  price: number;
  minStock?: number;
  quantity?: number;
  productTypeId: number;
  status?: ProductStatus;
}

export class Product {
  readonly id?: number;
  readonly name: string;
  readonly brand?: string;
  readonly price: number;
  readonly minStock: number;
  readonly quantity: number;
  readonly productTypeId: number;
  readonly status: ProductStatus;

  constructor(properties: ProductProperties) {
    this.id = properties.id;
    this.name = properties.name;
    this.brand = properties.brand;
    this.price = properties.price;
    this.minStock = properties.minStock ?? 0;
    this.quantity = properties.quantity ?? 0;
    this.productTypeId = properties.productTypeId;
    this.status = properties.status ?? 'active';
  }

  /**
   * Reduce el stock en n unidades.
   * @throws InsufficientStockException si quantity - n < 0
   */
  reduceStock(n: number): Product {
    if (this.quantity - n < 0) {
      throw new InsufficientStockException(this.id!, this.quantity, n);
    }
    return new Product({ ...this, quantity: this.quantity - n });
  }
}
