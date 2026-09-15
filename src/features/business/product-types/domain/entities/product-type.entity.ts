export type ProductTypeStatus = 'active' | 'inactive';

export interface ProductTypeProperties {
  id?: number;
  name: string;
  description?: string;
  status?: ProductTypeStatus;
}

export class ProductType {
  readonly id?: number;
  readonly name: string;
  readonly description?: string;
  readonly status: ProductTypeStatus;

  constructor(properties: ProductTypeProperties) {
    this.id = properties.id;
    this.name = properties.name;
    this.description = properties.description;
    this.status = properties.status ?? 'active';
  }
}