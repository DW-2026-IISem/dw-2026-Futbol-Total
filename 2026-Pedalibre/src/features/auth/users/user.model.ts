import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface UserI {
  id?: number;
  role_id: number;
  username: string;
  email: string | null;
  password: string;
  is_active?: boolean;
  status?: "active" | "inactive";
  createdAt?: Date;
}

export class User extends Model<UserI> {
  declare id: number;
  declare role_id: number;
  declare username: string;
  declare email: string | null;
  declare password: string;
  declare is_active: boolean;
  declare status: "active" | "inactive";
  declare readonly createdAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      field: "user_id",
      primaryKey: true,
      autoIncrement: true,
    },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "uq_users_username",
      validate: {
        notEmpty: { msg: "Username cannot be empty" },
        len: { args: [3, 100], msg: "Username must be between 3 and 100 characters" },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      field: "password_hash",
      allowNull: false,
      validate: { notEmpty: { msg: "Password cannot be empty" } },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      unique: "uq_users_email",
      validate: { isEmail: { msg: "Email must be a valid email address" } },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status: {
      type: DataTypes.VIRTUAL,
      get(this: User) {
        return this.getDataValue("is_active") ? "active" : "inactive";
      },
      set(this: User, value: "active" | "inactive") {
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
    modelName: "User",
    tableName: "users",
    timestamps: false,
    hooks: {
      beforeValidate: (user: User) => {
        if (user.username) user.username = user.username.trim().toLowerCase();
        if (user.email) user.email = user.email.trim().toLowerCase();
      },
    },
  },
);
