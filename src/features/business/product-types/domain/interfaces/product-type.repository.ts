import type { ProductType } from '../entities/product-type.entity';

export const PRODUCT_TYPE_REPOSITORY = Symbol('PRODUCT_TYPE_REPOSITORY');

export interface IProductTypeRepository {
  create(productType: ProductType): Promise<ProductType>;
  findAll(): Promise<ProductType[]>;
  findById(id: number): Promise<ProductType | null>;
  findByName(name: string): Promise<ProductType | null>;
}