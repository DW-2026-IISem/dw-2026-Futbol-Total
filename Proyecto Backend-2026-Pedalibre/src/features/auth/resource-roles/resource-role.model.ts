import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface ResourceRoleI {
  id?: number;
  role_id: number;
  resource_id: number;
  is_allowed?: boolean;
  status?: "active" | "inactive";
  createdAt?: Date;
}

export class ResourceRole extends Model<ResourceRoleI> {
  declare id: number;
  declare role_id: number;
  declare resource_id: number;
  declare is_allowed: boolean;
  declare status: "active" | "inactive";
  declare readonly createdAt: Date;
}

ResourceRole.init(
  {
    id: {
      type: DataTypes.INTEGER,
      field: "role_resource_id",
      primaryKey: true,
      autoIncrement: true,
    },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    resource_id: { type: DataTypes.INTEGER, allowNull: false },
    is_allowed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    status: {
      type: DataTypes.VIRTUAL,
      get(this: ResourceRole) {
        return this.getDataValue("is_allowed") ? "active" : "inactive";
      },
      set(this: ResourceRole, value: "active" | "inactive") {
        this.setDataValue("is_allowed", value === "active");
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "ResourceRole",
    tableName: "role_resources",
    timestamps: false,
    indexes: [
      {
        name: "uq_role_resources_role_resource",
        unique: true,
        fields: ["role_id", "resource_id"],
      },
    ],
  },
);
