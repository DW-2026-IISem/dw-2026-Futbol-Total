import type { Transaction } from 'sequelize';
import type { Sale } from '../entities/sale.entity';

export const SALE_REPOSITORY = Symbol('SALE_REPOSITORY');

export interface ISaleRepository {
  create(sale: Sale, transaction?: Transaction): Promise<Sale>;
  findById(id: number): Promise<Sale | null>;
}
