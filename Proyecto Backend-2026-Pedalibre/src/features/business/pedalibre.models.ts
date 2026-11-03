import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/db";

function primaryKey(column: string) {
  return {
    type: DataTypes.INTEGER,
    field: column,
    primaryKey: true,
    autoIncrement: true,
  };
}

export class Station extends Model {
  declare id: number;
  declare name: string;
  declare description: string;
  declare address: string;
  declare capacity: number;
  declare status: string;
  declare is_active: boolean;
}

Station.init(
  {
    id: primaryKey("station_id"),
    name: { type: DataTypes.STRING(120), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    address: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "" },
    capacity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "active" },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, modelName: "Station", tableName: "stations", timestamps: true, underscored: true },
);

export class Bicycle extends Model {
  declare id: number;
  declare serial_number: string;
  declare name: string;
  declare description: string;
  declare bicycle_type: string;
  declare status: string;
  declare is_active: boolean;
}

Bicycle.init(
  {
    id: primaryKey("bicycle_id"),
    serial_number: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(120), allowNull: false, defaultValue: "" },
    description: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    bicycle_type: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "standard" },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "available" },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, modelName: "Bicycle", tableName: "bicycles", timestamps: true, underscored: true },
);

export class DockingPoint extends Model {
  declare id: number;
  declare station_id: number;
  declare code: string | null;
  declare name: string;
  declare description: string;
  declare status: string;
  declare is_active: boolean;
}

DockingPoint.init(
  {
    id: primaryKey("docking_point_id"),
    station_id: { type: DataTypes.INTEGER, allowNull: false },
    code: { type: DataTypes.STRING(30), allowNull: true },
    name: { type: DataTypes.STRING(120), allowNull: false, defaultValue: "" },
    description: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "available" },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, modelName: "DockingPoint", tableName: "docking_points", timestamps: true, underscored: true },
);

export class Rate extends Model {
  declare id: number;
  declare name: string;
  declare calculation_rule: string;
  declare base_value: string;
  declare valid_from: string | null;
  declare valid_until: string | null;
  declare is_active: boolean;
}

Rate.init(
  {
    id: primaryKey("rate_id"),
    name: { type: DataTypes.STRING(100), allowNull: false },
    calculation_rule: { type: DataTypes.STRING(80), allowNull: false },
    base_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    valid_from: { type: DataTypes.DATEONLY, allowNull: true },
    valid_until: { type: DataTypes.DATEONLY, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, modelName: "Rate", tableName: "rates", timestamps: true, underscored: true },
);

export class Reservation extends Model {
  declare id: number;
  declare client_id: number;
  declare bicycle_id: number | null;
  declare station_id: number | null;
  declare start_at: Date | null;
  declare end_at: Date | null;
  declare reserved_at: Date;
  declare expires_at: Date | null;
  declare status: string;
  declare observations: string;
}

Reservation.init(
  {
    id: primaryKey("reservation_id"),
    client_id: { type: DataTypes.INTEGER, allowNull: false },
    bicycle_id: { type: DataTypes.INTEGER, allowNull: true },
    station_id: { type: DataTypes.INTEGER, allowNull: true },
    start_at: { type: DataTypes.DATE, allowNull: true },
    end_at: { type: DataTypes.DATE, allowNull: true },
    reserved_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    expires_at: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "pending" },
    observations: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
  },
  { sequelize, modelName: "Reservation", tableName: "reservations", timestamps: false },
);

export class Rental extends Model {
  declare id: number;
  declare reservation_id: number | null;
  declare client_id: number;
  declare bicycle_id: number;
  declare rate_id: number;
  declare start_station_id: number | null;
  declare end_station_id: number | null;
  declare start_at: Date;
  declare end_at: Date | null;
  declare total: string;
  declare status: string;
  declare observations: string;
}

Rental.init(
  {
    id: primaryKey("rental_id"),
    reservation_id: { type: DataTypes.INTEGER, allowNull: true, unique: true },
    client_id: { type: DataTypes.INTEGER, allowNull: false },
    bicycle_id: { type: DataTypes.INTEGER, allowNull: false },
    rate_id: { type: DataTypes.INTEGER, allowNull: false },
    start_station_id: { type: DataTypes.INTEGER, allowNull: true },
    end_station_id: { type: DataTypes.INTEGER, allowNull: true },
    start_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    end_at: { type: DataTypes.DATE, allowNull: true },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "active" },
    observations: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
  },
  { sequelize, modelName: "Rental", tableName: "rentals", timestamps: false },
);

export class RentalEvent extends Model {
  declare id: number;
  declare rental_id: number;
  declare type: string;
  declare event_date: Date;
  declare quantity: number | null;
  declare observations: string | null;
  declare status: string;
}

RentalEvent.init(
  {
    id: primaryKey("rental_event_id"),
    rental_id: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING(50), allowNull: false },
    event_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    observations: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "confirmed" },
  },
  { sequelize, modelName: "RentalEvent", tableName: "rental_events", timestamps: false },
);

export class BicycleDocking extends Model {
  declare id: number;
  declare bicycle_id: number;
  declare docking_point_id: number;
  declare docked_at: Date;
  declare undocked_at: Date | null;
}

BicycleDocking.init(
  {
    id: primaryKey("bicycle_docking_id"),
    bicycle_id: { type: DataTypes.INTEGER, allowNull: false },
    docking_point_id: { type: DataTypes.INTEGER, allowNull: false },
    docked_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    undocked_at: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: "BicycleDocking", tableName: "bicycle_dockings", timestamps: false },
);

export class Penalty extends Model {
  declare id: number;
  declare reference_id: number;
  declare penalty_date: Date;
  declare amount: string;
  declare status: string;
  declare observations: string;
}

Penalty.init(
  {
    id: primaryKey("penalty_id"),
    reference_id: { type: DataTypes.INTEGER, allowNull: false },
    penalty_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "pending" },
    observations: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
  },
  { sequelize, modelName: "Penalty", tableName: "penalties", timestamps: false },
);

export class Maintenance extends Model {
  declare id: number;
  declare resource_id: number;
  declare type: string;
  declare scheduled_at: Date;
  declare closed_at: Date | null;
  declare cost: string;
  declare status: string;
  declare observations: string;
}

Maintenance.init(
  {
    id: primaryKey("maintenance_id"),
    resource_id: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING(80), allowNull: false },
    scheduled_at: { type: DataTypes.DATE, allowNull: false },
    closed_at: { type: DataTypes.DATE, allowNull: true },
    cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "scheduled" },
    observations: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
  },
  { sequelize, modelName: "Maintenance", tableName: "maintenances", timestamps: true, underscored: true },
);

export class Payment extends Model {
  declare id: number;
  declare reference_type: string;
  declare reference_id: number;
  declare method: string;
  declare amount: string;
  declare payment_date: Date;
  declare status: string;
}

Payment.init(
  {
    id: primaryKey("payment_id"),
    reference_type: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "RENTAL" },
    reference_id: { type: DataTypes.INTEGER, allowNull: false },
    method: { type: DataTypes.STRING(30), allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    payment_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "pending" },
  },
  { sequelize, modelName: "Payment", tableName: "payments", timestamps: false },
);
