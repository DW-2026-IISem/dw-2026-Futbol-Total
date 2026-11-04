import {
  CreationAttributes,
  Model,
  ModelStatic,
  Op,
} from "sequelize";
import { sequelize } from "../../database/db";
import { AppError } from "../../shared/errors/app-error";
import { Client } from "./clients/client.model";
import { Role } from "../auth/roles/role.model";
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

export type PedalibreEntity =
  | "stations"
  | "bicycles"
  | "docking_points"
  | "rates"
  | "reservations"
  | "rentals"
  | "rental_events"
  | "bicycle_dockings"
  | "penalties"
  | "maintenances"
  | "payments";

interface EntityDefinition {
  model: ModelStatic<Model>;
  fields: readonly string[];
  updateFields?: readonly string[];
  required: readonly string[];
  writable: boolean;
}

const entityDefinitions: Record<PedalibreEntity, EntityDefinition> = {
  stations: {
    model: Station,
    fields: ["name", "description", "address", "capacity", "status", "is_active"],
    required: ["name"],
    writable: true,
  },
  bicycles: {
    model: Bicycle,
    fields: ["serial_number", "name", "description", "bicycle_type", "is_active"],
    required: ["serial_number"],
    writable: true,
  },
  docking_points: {
    model: DockingPoint,
    fields: ["station_id", "code", "name", "description", "status", "is_active"],
    required: ["station_id"],
    writable: true,
  },
  rates: {
    model: Rate,
    fields: ["name", "calculation_rule", "base_value", "valid_from", "valid_until", "is_active"],
    required: ["name", "calculation_rule", "base_value"],
    writable: true,
  },
  reservations: {
    model: Reservation,
    fields: ["client_id", "bicycle_id", "station_id", "start_at", "end_at", "observations"],
    updateFields: ["bicycle_id", "station_id", "start_at", "end_at", "observations"],
    required: [],
    writable: true,
  },
  rentals: {
    model: Rental,
    fields: ["reservation_id", "client_id", "bicycle_id", "rate_id", "start_station_id", "end_station_id", "start_at", "end_at", "total", "status", "observations"],
    required: ["client_id", "bicycle_id", "rate_id"],
    writable: false,
  },
  rental_events: {
    model: RentalEvent,
    fields: ["rental_id", "type", "event_date", "quantity", "observations", "status"],
    required: ["rental_id", "type"],
    writable: false,
  },
  bicycle_dockings: {
    model: BicycleDocking,
    fields: ["bicycle_id", "docking_point_id", "docked_at", "undocked_at"],
    required: ["bicycle_id", "docking_point_id"],
    writable: false,
  },
  penalties: {
    model: Penalty,
    fields: ["reference_id", "penalty_date", "amount", "status", "observations"],
    updateFields: ["amount", "status", "observations"],
    required: ["reference_id", "amount"],
    writable: true,
  },
  maintenances: {
    model: Maintenance,
    fields: ["resource_id", "type", "scheduled_at", "closed_at", "cost", "status", "observations"],
    updateFields: ["type", "scheduled_at", "closed_at", "cost", "status", "observations"],
    required: ["resource_id", "type", "scheduled_at"],
    writable: true,
  },
  payments: {
    model: Payment,
    fields: ["reservation_id", "rate_id", "method", "transaction_code", "status"],
    updateFields: ["status"],
    required: ["reservation_id", "rate_id", "method"],
    writable: true,
  },
};

export class PedalibreService {
  public async list(entity: PedalibreEntity, userId?: number): Promise<Model[]> {
    const definition = this.definition(entity);
    if (entity === "reservations") {
      const clientId = userId === undefined ? undefined : await this.clientScope(userId);
      return Reservation.findAll({
        ...(clientId === undefined ? {} : { where: { client_id: clientId ?? -1 } }),
        include: [
          { model: Bicycle, as: "bicycle", attributes: ["id", "serial_number", "name", "bicycle_type"] },
          { model: Client, as: "client", attributes: ["id", "first_name", "last_name"] },
          { model: Station, as: "station", attributes: ["id", "name", "address"] },
          {
            model: Payment,
            as: "reservation_payments",
            attributes: ["id", "status", "amount", "payment_date"],
          },
        ],
        limit: 100,
        order: [["id", "ASC"]],
      });
    }
    if (entity === "rentals") {
      const clientId = userId === undefined ? undefined : await this.clientScope(userId);
      return Rental.findAll({
        ...(clientId === undefined ? {} : { where: { client_id: clientId ?? -1 } }),
        include: [
          { model: Bicycle, as: "bicycle", attributes: ["id", "serial_number", "name", "bicycle_type"] },
          { model: Client, as: "client", attributes: ["id", "first_name", "last_name"] },
          { model: Rate, as: "rate", attributes: ["id", "name", "calculation_rule", "base_value"] },
        ],
        limit: 100,
        order: [["id", "DESC"]],
      });
    }
    if (entity === "payments") {
      return Payment.findAll({
        include: [
          {
            model: Rental,
            as: "rental",
            include: [
              { model: Client, as: "client", attributes: ["id", "first_name", "last_name"] },
              { model: Bicycle, as: "bicycle", attributes: ["id", "serial_number", "name", "bicycle_type"] },
            ],
          },
          {
            model: Reservation,
            as: "reservation",
            attributes: ["id", "status", "start_at", "end_at"],
            include: [
              { model: Client, as: "client", attributes: ["id", "first_name", "last_name"] },
            ],
          },
          { model: Rate, as: "rate", attributes: ["id", "name", "calculation_rule", "base_value"] },
        ],
        limit: 100,
        order: [["id", "DESC"]],
      });
    }
    if (entity === "penalties" && userId !== undefined) {
      const clientId = await this.clientScope(userId);
      if (clientId !== undefined) {
        if (clientId === null) return [];
        const rentals = await Rental.findAll({
          where: { client_id: clientId },
          attributes: ["id"],
        });
        const rentalIds = rentals.map((rental) => rental.id);
        return Penalty.findAll({
          where: { reference_id: rentalIds.length ? { [Op.in]: rentalIds } : -1 },
          limit: 100,
          order: [["id", "DESC"]],
        });
      }
    }
    const inventoryEntity = entity === "bicycles" || entity === "docking_points";
    return definition.model.findAll({
      ...(inventoryEntity ? {} : { limit: 100 }),
      order: [["id", "ASC"]],
    });
  }

  public async getOne(entity: PedalibreEntity, id: number, userId?: number): Promise<Model> {
    const row = await this.definition(entity).model.findByPk(id);
    if (!row) throw new AppError(404, `${entity} record not found`);
    if (entity === "reservations" && userId !== undefined) {
      const clientId = await this.clientScope(userId);
      if (clientId !== undefined && (clientId === null || (row as Reservation).client_id !== clientId)) {
        throw new AppError(404, `${entity} record not found`);
      }
    }
    if ((entity === "rentals" || entity === "penalties") && userId !== undefined) {
      const clientId = await this.clientScope(userId);
      if (clientId !== undefined) {
        let rentalId: number;
        if (entity === "rentals") {
          const rental = row as Rental;
          if (clientId === null || rental.client_id !== clientId) {
            throw new AppError(404, `${entity} record not found`);
          }
          return row;
        }
        const penalty = row as Penalty;
        rentalId = penalty.reference_id;
        const rental = await Rental.findByPk(rentalId);
        if (clientId === null || !rental || rental.client_id !== clientId) {
          throw new AppError(404, `${entity} record not found`);
        }
      }
    }
    return row;
  }

  public async create(
    entity: PedalibreEntity,
    input: unknown,
    userId?: number,
  ): Promise<Model> {
    const definition = this.definition(entity);
    if (!definition.writable) {
      throw new AppError(405, `${entity} records are created by business workflows`);
    }
    const values = this.validateInput(input, definition.fields, definition.required);

    if (entity === "rates") this.validateRateRule(values.calculation_rule);
    if (entity === "payments") return this.createPayment(values);
    if (entity === "reservations") {
      return this.createReservation(values, userId);
    }
    if (entity === "maintenances") {
      return this.createMaintenance(values);
    }
    if (entity === "bicycle_dockings" || entity === "rentals" || entity === "rental_events") {
      throw new AppError(405, `${entity} records are created by business workflows`);
    }
    return definition.model.create(values as CreationAttributes<Model>);
  }

  public async update(
    entity: PedalibreEntity,
    id: number,
    input: unknown,
  ): Promise<Model> {
    const definition = this.definition(entity);
    if (!definition.writable) {
      throw new AppError(405, `${entity} records are updated by business workflows`);
    }
    const values = this.validateInput(input, definition.updateFields ?? definition.fields, []);
    if (Object.keys(values).length === 0) {
      throw new AppError(400, "At least one editable field is required");
    }

    if (entity === "maintenances") {
      return this.updateMaintenance(id, values);
    }
    if (entity === "payments") {
      return this.updatePayment(id, values);
    }
    if (entity === "reservations") {
      return this.updateReservation(id, values);
    }
    if (entity === "rates" && values.calculation_rule !== undefined) {
      this.validateRateRule(values.calculation_rule);
    }
    const row = await this.getOne(entity, id);
    return row.update(values as Partial<Model>);
  }

  public async delete(entity: PedalibreEntity, id: number): Promise<void> {
    const definition = this.definition(entity);
    if (!definition.writable || entity === "reservations" || entity === "maintenances") {
      throw new AppError(405, `${entity} records cannot be deleted directly`);
    }
    const row = await this.getOne(entity, id);
    await row.destroy();
  }

  public async availableBicycles(): Promise<Bicycle[]> {
    const activeRentals = await Rental.findAll({
      where: { status: "active" },
      attributes: ["bicycle_id"],
    });
    const rentedIds = activeRentals.map((rental) => rental.bicycle_id);
    return Bicycle.findAll({
      where: {
        is_active: true,
        status: "available",
        ...(rentedIds.length ? { id: { [Op.notIn]: rentedIds } } : {}),
      },
      order: [["id", "ASC"]],
    });
  }

  public async startRental(input: unknown): Promise<Rental> {
    const values = this.validateInput(input, ["reservation_id"], ["reservation_id"]);

    return sequelize.transaction(async (transaction) => {
      const reservation = await Reservation.findByPk(Number(values.reservation_id), {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!reservation || reservation.status !== "pending") {
        throw new AppError(409, "A pending reservation is required to start a rental");
      }
      if (reservation.expires_at && reservation.expires_at.getTime() <= Date.now()) {
        throw new AppError(409, "The reservation has expired");
      }
      if (reservation.start_at && reservation.start_at.getTime() > Date.now()) {
        throw new AppError(409, "The reservation start time has not arrived");
      }
      if (!reservation.bicycle_id) {
        throw new AppError(409, "Assign a bicycle to the reservation before starting the rental");
      }

      const bicycle = await Bicycle.findByPk(reservation.bicycle_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!bicycle || !bicycle.is_active || bicycle.status !== "available") {
        throw new AppError(409, "The reserved bicycle is not available");
      }
      const prepayment = await Payment.findOne({
        where: {
          reservation_id: reservation.id,
          status: "successful",
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!prepayment) {
        throw new AppError(409, "A successful payment for this reservation and rate is required before starting");
      }
      const prepaidAmount = Number(prepayment.amount);
      if (!Number.isFinite(prepaidAmount) || prepaidAmount <= 0) {
        throw new AppError(409, "The successful reservation payment must have a positive amount");
      }
      if (!prepayment.rate_id) {
        throw new AppError(409, "The successful reservation payment has no associated rate");
      }
      const rate = await Rate.findByPk(prepayment.rate_id, { transaction });
      if (!rate) throw new AppError(409, "The rate associated with the successful payment no longer exists");
      const electricBicycle = bicycle.bicycle_type.toLowerCase() === "electric";
      const rateName = rate.name.toLowerCase();
      const electricRate = rateName.includes("electric") || rateName.includes("eléctric");
      const standardRate = rateName.includes("standard") || rateName.includes("estándar");
      if ((electricRate && !electricBicycle) || (standardRate && electricBicycle)) {
        throw new AppError(409, "The paid rate does not match the reserved bicycle type");
      }

      const rental = await Rental.create(
        {
          reservation_id: reservation.id,
          client_id: reservation.client_id,
          bicycle_id: bicycle.id,
          rate_id: rate.id,
          start_station_id: reservation.station_id,
          start_at: new Date(),
          status: "active",
          total: prepaidAmount,
          observations: reservation.observations,
        },
        { transaction },
      );
      await prepayment.update({
        reference_type: "RENTAL",
        reference_id: rental.id,
      }, { transaction });
      await reservation.update({ status: "in_progress" }, { transaction });
      await bicycle.update({ status: "rented" }, { transaction });
      await RentalEvent.create(
        {
          rental_id: rental.id,
          type: "RENTAL_STARTED",
          status: "confirmed",
          observations: "Rental started from reservation",
        },
        { transaction },
      );
      return rental;
    });
  }

  public async finishRental(input: unknown): Promise<Rental> {
    const values = this.validateInput(input, ["rental_id", "end_station_id", "docking_point_id"], [
      "rental_id",
    ]);
    return sequelize.transaction(async (transaction) => {
      const rental = await Rental.findByPk(Number(values.rental_id), {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!rental || rental.status !== "active") {
        throw new AppError(409, "An active rental is required to finish it");
      }
      const bicycle = await Bicycle.findByPk(rental.bicycle_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!bicycle) throw new AppError(404, "Rental bicycle not found");

      let endStationId: number | null = null;
      if (values.end_station_id !== undefined) {
        endStationId = Number(values.end_station_id);
        const station = await Station.findByPk(endStationId, { transaction });
        if (!station || !station.is_active) throw new AppError(404, "End station not found or inactive");
      }

      if (values.docking_point_id !== undefined) {
        const point = await DockingPoint.findByPk(Number(values.docking_point_id), {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!point || !point.is_active || point.status !== "available") {
          throw new AppError(409, "The docking point is not available");
        }
        if (endStationId !== null && point.station_id !== endStationId) {
          throw new AppError(400, "The docking point must belong to the end station");
        }
        const occupiedPoint = await BicycleDocking.findOne({
          where: { docking_point_id: point.id, undocked_at: null },
          transaction,
        });
        if (occupiedPoint) throw new AppError(409, "The docking point already contains a bicycle");
        endStationId = point.station_id;
        await BicycleDocking.create(
          { bicycle_id: bicycle.id, docking_point_id: point.id, docked_at: new Date() },
          { transaction },
        );
        await point.update({ status: "occupied" }, { transaction });
      }

      const rate = await Rate.findByPk(rental.rate_id, { transaction });
      if (!rate) throw new AppError(409, "Rental rate no longer exists");
      const endedAt = new Date();
      const total = Number(rental.total) > 0
        ? Number(rental.total)
        : this.calculateTotal(rental.start_at, endedAt, rate);
      const reservation = rental.reservation_id === null
        ? null
        : await Reservation.findByPk(rental.reservation_id, { transaction });
      const graceDeadline = reservation?.end_at
        ? new Date(reservation.end_at.getTime() + 10 * 60_000)
        : null;
      if (graceDeadline && endedAt.getTime() > graceDeadline.getTime()) {
        const penaltyAmount = this.hourlyPenaltyAmount(rate);
        await Penalty.create(
          {
            reference_id: rental.id,
            penalty_date: endedAt,
            amount: penaltyAmount,
            status: "pending",
            observations:
              "Devolución posterior al plazo de gracia de 10 minutos. " +
              "Penalidad equivalente a una hora de la tarifa seleccionada.",
          },
          { transaction },
        );
      }
      await rental.update(
        { end_at: endedAt, end_station_id: endStationId, total, status: "completed" },
        { transaction },
      );
      const activeMaintenance = await Maintenance.findOne({
        where: {
          resource_id: bicycle.id,
          status: { [Op.notIn]: ["closed", "completed", "cancelled"] },
          closed_at: null,
        },
        transaction,
      });
      if (!activeMaintenance) await bicycle.update({ status: "available" }, { transaction });
      if (rental.reservation_id !== null) {
        const reservation = await Reservation.findByPk(rental.reservation_id, { transaction });
        if (reservation) await reservation.update({ status: "completed" }, { transaction });
      }
      await RentalEvent.create(
        {
          rental_id: rental.id,
          type: "RENTAL_FINISHED",
          status: "confirmed",
          observations: "Rental finished and fare calculated",
        },
        { transaction },
      );
      return rental;
    });
  }

  public async dockBicycle(input: unknown): Promise<BicycleDocking> {
    const values = this.validateInput(input, ["bicycle_id", "docking_point_id"], [
      "bicycle_id",
      "docking_point_id",
    ]);
    return sequelize.transaction(async (transaction) => {
      const bicycle = await Bicycle.findByPk(Number(values.bicycle_id), {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      const point = await DockingPoint.findByPk(Number(values.docking_point_id), {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!bicycle || !bicycle.is_active || bicycle.status !== "available") {
        throw new AppError(409, "Only an available bicycle can be docked");
      }
      if (!point || !point.is_active || point.status !== "available") {
        throw new AppError(409, "The docking point is not available");
      }
      const occupiedPoint = await BicycleDocking.findOne({
        where: { docking_point_id: point.id, undocked_at: null },
        transaction,
      });
      if (occupiedPoint) throw new AppError(409, "The docking point already contains a bicycle");
      const existing = await BicycleDocking.findOne({
        where: { bicycle_id: bicycle.id, undocked_at: null },
        transaction,
      });
      if (existing) throw new AppError(409, "The bicycle already has an active docking");

      const movement = await BicycleDocking.create(
        { bicycle_id: bicycle.id, docking_point_id: point.id, docked_at: new Date() },
        { transaction },
      );
      await point.update({ status: "occupied" }, { transaction });
      return movement;
    });
  }

  public async undockBicycle(id: number): Promise<BicycleDocking> {
    return sequelize.transaction(async (transaction) => {
      const movement = await BicycleDocking.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!movement || movement.undocked_at) {
        throw new AppError(404, "Active bicycle docking not found");
      }
      const point = await DockingPoint.findByPk(movement.docking_point_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      await movement.update({ undocked_at: new Date() }, { transaction });
      if (point) await point.update({ status: "available" }, { transaction });
      return movement;
    });
  }

  private async createReservation(
    values: Record<string, unknown>,
    userId?: number,
  ): Promise<Reservation> {
    if (userId !== undefined) {
      const clientId = await this.clientScope(userId);
      if (clientId !== undefined) {
        if (clientId === null) throw new AppError(403, "The client account is not linked to a client profile");
        values.client_id = clientId;
      }

    }
    if (values.client_id === undefined || values.client_id === null) {
      throw new AppError(400, "client_id is required");
    }
    const client = await Client.findByPk(Number(values.client_id));
    if (!client || !client.is_active) throw new AppError(404, "Client not found or inactive");
    const valuesWithDefaults: Record<string, unknown> = {
      ...values,
      status: values.status ?? "pending",
      observations: values.observations ?? "",
    };
    if (valuesWithDefaults.bicycle_id !== undefined && valuesWithDefaults.bicycle_id !== null) {
      const bicycle = await Bicycle.findByPk(Number(valuesWithDefaults.bicycle_id));
      if (!bicycle || !bicycle.is_active || bicycle.status !== "available") {
        throw new AppError(409, "The selected bicycle is not available");
      }
      const activeRental = await Rental.findOne({
        where: { bicycle_id: bicycle.id, status: "active" },
      });
      if (activeRental) throw new AppError(409, "The selected bicycle already has an active rental");
    }
    if (valuesWithDefaults.station_id !== undefined && valuesWithDefaults.station_id !== null) {
      const station = await Station.findByPk(Number(valuesWithDefaults.station_id));
      if (!station || !station.is_active) throw new AppError(404, "Station not found or inactive");
    }
    if (valuesWithDefaults.start_at && valuesWithDefaults.end_at) {
      const start = new Date(String(valuesWithDefaults.start_at));
      const end = new Date(String(valuesWithDefaults.end_at));
      if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
        throw new AppError(400, "Reservation end_at must be later than start_at");
      }
      if (valuesWithDefaults.bicycle_id !== undefined && valuesWithDefaults.bicycle_id !== null) {
        const conflicts = await Reservation.findAll({
          where: {
            bicycle_id: Number(valuesWithDefaults.bicycle_id),
            status: { [Op.in]: ["pending", "in_progress"] },
          },
          attributes: ["start_at", "end_at"],
        });
        if (conflicts.some((reservation) =>
          reservation.start_at !== null &&
          reservation.end_at !== null &&
          start < reservation.end_at &&
          end > reservation.start_at
        )) {
          throw new AppError(409, "The bicycle is already reserved during that time window");
        }
      }
    }
    if (!valuesWithDefaults.start_at || !valuesWithDefaults.end_at) {
      throw new AppError(400, "start_at and end_at are required for a timed reservation");
    }
    const endAt = new Date(String(valuesWithDefaults.end_at));
    valuesWithDefaults.expires_at = new Date(endAt.getTime() + 10 * 60_000);
    return Reservation.create(valuesWithDefaults as CreationAttributes<Reservation>);
  }

  private async updateReservation(
    id: number,
    values: Record<string, unknown>,
  ): Promise<Reservation> {
    return sequelize.transaction(async (transaction) => {
      const reservation = await Reservation.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!reservation) throw new AppError(404, "reservations record not found");
      const startAt = values.start_at === undefined
        ? reservation.start_at
        : new Date(String(values.start_at));
      const endAt = values.end_at === undefined
        ? reservation.end_at
        : new Date(String(values.end_at));
      if (
        !startAt ||
        !endAt ||
        !Number.isFinite(startAt.getTime()) ||
        !Number.isFinite(endAt.getTime()) ||
        endAt <= startAt
      ) {
        throw new AppError(400, "Reservation end_at must be later than start_at");
      }
      await reservation.update(
        { ...values, expires_at: new Date(endAt.getTime() + 10 * 60_000) },
        { transaction },
      );
      return reservation;
    });
  }

  private async createPayment(values: Record<string, unknown>): Promise<Payment> {
    const method = String(values.method).trim().toLowerCase();
    if (method !== "cash" && method !== "transfer") {
      throw new AppError(400, "method must be cash or transfer");
    }
    const transactionCode = String(values.transaction_code ?? "").trim();
    if (method === "transfer" && !transactionCode) {
      throw new AppError(400, "transaction_code is required for transfers");
    }
    if (transactionCode.length > 120) {
      throw new AppError(400, "transaction_code cannot exceed 120 characters");
    }

    const status = String(values.status ?? "pending").trim().toLowerCase();
    if (status !== "pending" && status !== "successful") {
      throw new AppError(400, "status must be pending or successful");
    }

    return sequelize.transaction(async (transaction) => {
      const reservation = await Reservation.findByPk(Number(values.reservation_id), {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!reservation || reservation.status !== "pending" || !reservation.start_at || !reservation.end_at) {
        throw new AppError(409, "Payments can only be recorded for a pending timed reservation");
      }
      if (reservation.expires_at && reservation.expires_at.getTime() <= Date.now()) {
        throw new AppError(409, "The reservation has expired");
      }

      const bicycle = reservation.bicycle_id
        ? await Bicycle.findByPk(reservation.bicycle_id, { transaction })
        : null;
      if (!bicycle) throw new AppError(409, "A bicycle must be assigned to the reservation before payment");
      const rate = await Rate.findByPk(Number(values.rate_id), { transaction });
      if (!rate || !rate.is_active || !this.rateIsValidOn(rate, reservation.start_at)) {
        throw new AppError(409, "An active rate valid for the reservation date is required");
      }
      const electricBicycle = bicycle.bicycle_type.toLowerCase() === "electric";
      const rateName = rate.name.toLowerCase();
      const electricRate = rateName.includes("electric") || rateName.includes("eléctric");
      const standardRate = rateName.includes("standard") || rateName.includes("estándar");
      if ((electricRate && !electricBicycle) || (standardRate && electricBicycle)) {
        throw new AppError(409, "The selected rate does not match the bicycle type");
      }

      const existing = await Payment.findOne({
        where: {
          reservation_id: reservation.id,
          status: { [Op.in]: ["pending", "successful", "paid", "completed"] },
        },
        transaction,
      });
      if (existing) throw new AppError(409, "This reservation already has a payment record");

      const amount = this.calculateTotal(reservation.start_at, reservation.end_at, rate);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new AppError(409, "The reservation has no payable amount");
      }
      return Payment.create({
        reference_type: "RESERVATION",
        reference_id: null,
        reservation_id: reservation.id,
        rate_id: rate.id,
        method,
        transaction_code: method === "transfer" ? transactionCode : null,
        amount,
        payment_date: new Date(),
        status,
      }, { transaction });
    });
  }

  private async updatePayment(
    id: number,
    values: Record<string, unknown>,
  ): Promise<Payment> {
    const payment = await Payment.findByPk(id);
    if (!payment) throw new AppError(404, "payments record not found");
    if (payment.status !== "pending" || values.status !== "successful") {
      throw new AppError(409, "Only pending payments can be marked successful");
    }
    if (payment.reservation_id !== null) {
      const reservation = await Reservation.findByPk(payment.reservation_id);
      if (!reservation || reservation.status !== "pending") {
        throw new AppError(409, "Only pending reservations can have their payment confirmed");
      }
    }
    await payment.update({ status: "successful" });
    return payment;
  }

  private async createMaintenance(values: Record<string, unknown>): Promise<Maintenance> {
    return sequelize.transaction(async (transaction) => {
      const bicycle = await Bicycle.findByPk(Number(values.resource_id), {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!bicycle) throw new AppError(404, "Maintenance bicycle not found");
      if (bicycle.status === "rented") {
        throw new AppError(409, "A rented bicycle cannot enter maintenance");
      }
      const completed = ["closed", "completed", "cancelled"].includes(String(values.status));
      const maintenance = await Maintenance.create(
        {
          ...values,
          status: values.status ?? "scheduled",
          closed_at: values.closed_at ?? (completed ? new Date() : null),
          observations: values.observations ?? "",
        } as CreationAttributes<Maintenance>,
        { transaction },
      );
      if (!completed && !values.closed_at) {
        await bicycle.update({ status: "maintenance" }, { transaction });
      }
      return maintenance;
    });
  }

  private async updateMaintenance(
    id: number,
    values: Record<string, unknown>,
  ): Promise<Maintenance> {
    return sequelize.transaction(async (transaction) => {
      const maintenance = await Maintenance.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!maintenance) throw new AppError(404, "maintenances record not found");
      const data = { ...values };
      if (data.resource_id !== undefined) {
        throw new AppError(400, "resource_id cannot be changed after maintenance is created");
      }
      const closedStatuses = ["closed", "completed", "cancelled"];
      if (data.closed_at === null && (data.status === undefined || closedStatuses.includes(String(data.status)))) {
        data.status = "scheduled";
      } else if (data.closed_at !== undefined && data.closed_at !== null && data.status === undefined) {
        data.status = "completed";
      }
      if (data.closed_at === undefined && closedStatuses.includes(String(data.status))) {
        data.closed_at = new Date();
      }
      const status = String(data.status ?? maintenance.status);
      const isOpen = !closedStatuses.includes(status) && (data.closed_at === undefined || data.closed_at === null);
      await maintenance.update(data, { transaction });
      const bicycle = await Bicycle.findByPk(maintenance.resource_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (bicycle && isOpen && bicycle.status !== "rented") {
        await bicycle.update({ status: "maintenance" }, { transaction });
      } else if (bicycle && !isOpen && bicycle.status === "maintenance") {
        const otherOpen = await Maintenance.findOne({
          where: {
            resource_id: bicycle.id,
            id: { [Op.ne]: maintenance.id },
            closed_at: null,
            status: { [Op.notIn]: closedStatuses },
          },
          transaction,
        });
        if (!otherOpen) await bicycle.update({ status: "available" }, { transaction });
      }
      return maintenance;
    });
  }

  private async clientScope(userId: number): Promise<number | null | undefined> {
    const user = await User.findByPk(userId, { attributes: ["id", "role_id"] });
    if (!user) return null;
    const role = await Role.findByPk(user.role_id, { attributes: ["id", "name"] });
    if (role?.name !== "CLIENTE") return undefined;
    const client = await Client.findOne({
      where: { user_id: userId, is_active: true },
      attributes: ["id"],
    });
    return client?.id ?? null;
  }

  private rateIsValidOn(rate: Rate, date: Date): boolean {
    const dateOnly = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return (!rate.valid_from || rate.valid_from <= dateOnly)
      && (!rate.valid_until || rate.valid_until >= dateOnly);
  }

  private calculateTotal(start: Date, end: Date, rate: Rate): number {
    const durationMs = Math.max(0, end.getTime() - start.getTime());
    const baseValue = Number(rate.base_value);
    if (!Number.isFinite(baseValue) || baseValue < 0) {
      throw new AppError(422, "Rate base_value must be a non-negative number");
    }
    const rule = rate.calculation_rule.trim().toLowerCase();
    let total: number;
    switch (rule) {
      case "fixed":
      case "fijo":
        total = baseValue;
        break;
      case "hourly":
      case "por_hora":
        total = Math.max(1, Math.ceil(durationMs / 3_600_000)) * baseValue;
        break;
      case "daily":
      case "por_dia":
        total = Math.max(1, Math.ceil(durationMs / 86_400_000)) * baseValue;
        break;
      default:
        throw new AppError(422, `Unsupported rate calculation_rule: ${rate.calculation_rule}`);
    }
    return Math.round(total * 100) / 100;
  }

  private hourlyPenaltyAmount(rate: Rate): number {
    const baseValue = Number(rate.base_value);
    if (!Number.isFinite(baseValue) || baseValue < 0) {
      throw new AppError(422, "Rate base_value must be a non-negative number");
    }
    const rule = rate.calculation_rule.trim().toLowerCase();
    const hourlyValue = rule === "daily" || rule === "por_dia"
      ? baseValue / 24
      : baseValue;
    return Math.round(hourlyValue * 100) / 100;
  }

  private validateInput(
    input: unknown,
    allowedFields: readonly string[],
    required: readonly string[],
  ): Record<string, unknown> {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      throw new AppError(400, "Request body must be a JSON object");
    }
    const body = input as Record<string, unknown>;
    const unknownFields = Object.keys(body).filter((key) => !allowedFields.includes(key));
    if (unknownFields.length) {
      throw new AppError(400, `Unexpected field(s): ${unknownFields.join(", ")}`);
    }
    for (const key of required) {
      if (body[key] === undefined || body[key] === null || body[key] === "") {
        throw new AppError(400, `${key} is required`);
      }
    }
    const values = Object.fromEntries(
      Object.entries(body).filter(([, value]) => value !== undefined),
    );
    for (const [key, value] of Object.entries(values)) {
      if (key.endsWith("_id") && value !== null) {
        const numericId = Number(value);
        if (!Number.isSafeInteger(numericId) || numericId < 1) {
          throw new AppError(400, `${key} must be a positive integer`);
        }
      }
      if (
        ["capacity", "base_value", "total", "amount", "cost", "quantity"].includes(key) &&
        value !== null
      ) {
        const number = Number(value);
        if (!Number.isFinite(number) || number < 0) {
          throw new AppError(400, `${key} must be a non-negative number`);
        }
        if (["capacity", "quantity"].includes(key) && value !== null) {
          const integer = Number(value);
          if (!Number.isSafeInteger(integer)) {
            throw new AppError(400, `${key} must be a non-negative integer`);
          }
        }
      }
      if (key === "is_active" && typeof value !== "boolean") {
        throw new AppError(400, "is_active must be a boolean");
      }
    }
    return values;
  }

  private validateRateRule(value: unknown): void {
    if (typeof value !== "string") {
      throw new AppError(400, "calculation_rule is required");
    }
    const supported = ["fixed", "fijo", "hourly", "por_hora", "daily", "por_dia"];
    if (!supported.includes(value.trim().toLowerCase())) {
      throw new AppError(400, `calculation_rule must be one of ${supported.join(", ")}`);
    }
  }

  private definition(entity: PedalibreEntity): EntityDefinition {
    const definition = entityDefinitions[entity];
    if (!definition) throw new AppError(404, "Unknown PedalLibre entity");
    return definition;
  }
}
