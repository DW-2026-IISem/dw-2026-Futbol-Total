import { Client } from "./clients/client.model";
import { User } from "../auth/users/user.model";
import {
  Bicycle,
  BicycleDocking,
  DockingPoint,
  Maintenance,
  Payment,
  Penalty,
  Rate,
  Rental,
  RentalEvent,
  Reservation,
  Station,
} from "./pedalibre.models";

Client.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasOne(Client, { foreignKey: "user_id", as: "client" });

Station.hasMany(DockingPoint, { foreignKey: "station_id", as: "docking_points" });
DockingPoint.belongsTo(Station, { foreignKey: "station_id", as: "station" });

Client.hasMany(Reservation, { foreignKey: "client_id", as: "reservations" });
Reservation.belongsTo(Client, { foreignKey: "client_id", as: "client" });
Client.hasMany(Rental, { foreignKey: "client_id", as: "rentals" });
Rental.belongsTo(Client, { foreignKey: "client_id", as: "client" });

Bicycle.hasMany(Reservation, { foreignKey: "bicycle_id", as: "reservations" });
Reservation.belongsTo(Bicycle, { foreignKey: "bicycle_id", as: "bicycle" });
Station.hasMany(Reservation, { foreignKey: "station_id", as: "reservations" });
Reservation.belongsTo(Station, { foreignKey: "station_id", as: "station" });
Reservation.hasOne(Rental, { foreignKey: "reservation_id", as: "rental" });
Rental.belongsTo(Reservation, { foreignKey: "reservation_id", as: "reservation" });

Bicycle.hasMany(Rental, { foreignKey: "bicycle_id", as: "rentals" });
Rental.belongsTo(Bicycle, { foreignKey: "bicycle_id", as: "bicycle" });
Rate.hasMany(Rental, { foreignKey: "rate_id", as: "rentals" });
Rental.belongsTo(Rate, { foreignKey: "rate_id", as: "rate" });
Station.hasMany(Rental, { foreignKey: "start_station_id", as: "started_rentals" });
Station.hasMany(Rental, { foreignKey: "end_station_id", as: "ended_rentals" });

Rental.hasMany(RentalEvent, { foreignKey: "rental_id", as: "events" });
RentalEvent.belongsTo(Rental, { foreignKey: "rental_id", as: "rental" });
Bicycle.hasMany(BicycleDocking, { foreignKey: "bicycle_id", as: "dockings" });
BicycleDocking.belongsTo(Bicycle, { foreignKey: "bicycle_id", as: "bicycle" });
DockingPoint.hasMany(BicycleDocking, { foreignKey: "docking_point_id", as: "dockings" });
BicycleDocking.belongsTo(DockingPoint, { foreignKey: "docking_point_id", as: "docking_point" });

Rental.hasMany(Penalty, { foreignKey: "reference_id", as: "penalties" });
Penalty.belongsTo(Rental, { foreignKey: "reference_id", as: "rental" });
Bicycle.hasMany(Maintenance, { foreignKey: "resource_id", as: "maintenances" });
Maintenance.belongsTo(Bicycle, { foreignKey: "resource_id", as: "bicycle" });
Rental.hasMany(Payment, { foreignKey: "reference_id", as: "payments" });
Payment.belongsTo(Rental, { foreignKey: "reference_id", as: "rental" });
Reservation.hasMany(Payment, { foreignKey: "reservation_id", as: "reservation_payments" });
Payment.belongsTo(Reservation, { foreignKey: "reservation_id", as: "reservation" });
Rate.hasMany(Payment, { foreignKey: "rate_id", as: "payments" });
Payment.belongsTo(Rate, { foreignKey: "rate_id", as: "rate" });
