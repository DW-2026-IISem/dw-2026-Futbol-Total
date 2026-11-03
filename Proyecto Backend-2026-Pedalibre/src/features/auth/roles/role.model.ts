import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface RoleI {
  id?: number;
  name: string;
  description: string;
  is_active?: boolean;
  status?: "active" | "inactive";
  createdAt?: Date;
}

export class Role extends Model<RoleI> {
  declare id: number;
  declare name: string;
  declare description: string;
  declare is_active: boolean;
  declare status: "active" | "inactive";
  declare readonly createdAt: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      field: "role_id",
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: "uq_roles_name",
      validate: { notEmpty: { msg: "Role name cannot be empty" } },
    },
    description: { type: DataTypes.TEXT, allowNull: false },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status: {
      type: DataTypes.VIRTUAL,
      get(this: Role) {
        return this.getDataValue("is_active") ? "active" : "inactive";
      },
      set(this: Role, value: "active" | "inactive") {
        this.setDataValue("is_active", value === "active");
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
    modelName: "Role",
    tableName: "roles",
    timestamps: false,
    hooks: {
      beforeValidate: (role: Role) => {
        if (role.name) role.name = role.name.trim().toUpperCase();
      },
    },
  },
);
