import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";
import { normalizePath } from "../../../shared/auth/resource-match";

export interface ResourceI {
  id?: number;
  method: string;
  path: string;
  description: string;
  is_active?: boolean;
  status?: "active" | "inactive";
}

export class Resource extends Model<ResourceI> {
  declare id: number;
  declare method: string;
  declare path: string;
  declare description: string;
  declare is_active: boolean;
  declare status: "active" | "inactive";
}

Resource.init(
  {
    id: {
      type: DataTypes.INTEGER,
      field: "resource_id",
      primaryKey: true,
      autoIncrement: true,
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: {
          args: [["GET", "POST", "PUT", "PATCH", "DELETE"]],
          msg: "Method must be one of GET, POST, PUT, PATCH, DELETE",
        },
      },
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: { msg: "Path cannot be empty" } },
    },
    description: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "" },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    status: {
      type: DataTypes.VIRTUAL,
      get(this: Resource) {
        return this.getDataValue("is_active") ? "active" : "inactive";
      },
      set(this: Resource, value: "active" | "inactive") {
        this.setDataValue("is_active", value === "active");
      },
    },
  },
  {
    sequelize,
    modelName: "Resource",
    tableName: "resources",
    timestamps: false,
    indexes: [
      {
        name: "uq_resources_method_path",
        unique: true,
        fields: ["method", "path"],
      },
    ],
    hooks: {
      beforeValidate: (resource: Resource) => {
        if (resource.method) resource.method = resource.method.trim().toUpperCase();
        if (resource.path) resource.path = normalizePath(resource.path.trim());
      },
    },
  },
);
