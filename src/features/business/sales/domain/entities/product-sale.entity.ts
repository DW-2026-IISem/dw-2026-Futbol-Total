export interface ProductSaleProperties {
  id?: number;
  saleId?: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  total?: number;
}

export class ProductSale {
  readonly id?: number;
  readonly saleId?: number;
  readonly productId: number;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly total: number;

  constructor(properties: ProductSaleProperties) {
    this.id = properties.id;
    this.saleId = properties.saleId;
    this.productId = properties.productId;
    this.quantity = properties.quantity;
    this.unitPrice = properties.unitPrice;
    this.total = properties.total ?? Number((this.quantity * this.unitPrice).toFixed(2));
  }
}
