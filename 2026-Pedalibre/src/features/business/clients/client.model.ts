import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface ClientI {
  id?: number;
  user_id?: number | null;
  document_type: string;
  first_name: string;
  last_name: string;
  document_number: string;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Client extends Model<ClientI> {
  declare id: number;
  declare user_id: number | null;
  declare document_type: string;
  declare first_name: string;
  declare last_name: string;
  declare document_number: string;
  declare phone: string | null;
  declare email: string | null;
  declare is_active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Client.init(
  {
    id: {
      type: DataTypes.INTEGER,
      field: "client_id",
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: { type: DataTypes.INTEGER, allowNull: true, unique: true },
    document_type: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "" },
    first_name: { type: DataTypes.STRING(100), allowNull: false },
    last_name: { type: DataTypes.STRING(100), allowNull: false },
    document_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(30), allowNull: true },
    email: { type: DataTypes.STRING(150), allowNull: true, validate: { isEmail: true } },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    sequelize,
    modelName: "Client",
    tableName: "clients",
    timestamps: true,
    underscored: true,
  },
);
