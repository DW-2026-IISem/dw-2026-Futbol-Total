import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { SaleModel } from './sale.model';

@Table({
  tableName: 'product_sales',
  timestamps: true,
})
export class ProductSaleModel extends Model<ProductSaleModel> {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => SaleModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare saleId: number;

  @BelongsTo(() => SaleModel, { foreignKey: 'saleId', as: 'sale' })
  declare sale?: SaleModel;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare productId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare quantity: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare unitPrice: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare total: number;
}
