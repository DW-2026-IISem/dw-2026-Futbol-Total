import {
  AutoIncrement,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import type { SaleStatus } from '../../../domain/entities/sale.entity';
import { ProductSaleModel } from './product-sale.model';

@Table({
  tableName: 'sales',
  timestamps: true,
})
export class SaleModel extends Model<SaleModel> {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({ type: DataType.DATE, allowNull: false })
  declare saleDate: Date;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0 })
  declare subtotal: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0 })
  declare tax: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0 })
  declare discounts: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0 })
  declare total: number;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'completed' })
  declare status: SaleStatus;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare clientId: number;

  @HasMany(() => ProductSaleModel, { foreignKey: 'saleId', as: 'items' })
  declare items?: ProductSaleModel[];
}
