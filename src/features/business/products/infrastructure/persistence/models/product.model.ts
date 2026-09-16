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
import type { ProductStatus } from '../../../domain/entities/product.entity';
import { ProductTypeModel } from '../../../../product-types/infrastructure/persistence/models/product-type.model';

@Table({
  tableName: 'products',
  timestamps: true,
})
export class ProductModel extends Model<ProductModel> {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(150), allowNull: true })
  declare brand: string | null;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare price: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare minStock: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare quantity: number;

  @ForeignKey(() => ProductTypeModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare productTypeId: number;

  @BelongsTo(() => ProductTypeModel, { foreignKey: 'productTypeId', as: 'productType' })
  declare productType?: ProductTypeModel;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'active' })
  declare status: ProductStatus;
}
