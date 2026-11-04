import { readFile } from "node:fs/promises";
import path from "node:path";
import { Transaction } from "sequelize";
import { sequelize, getDatabaseInfo, testConnection } from "../db";
import "../../features/business/clients/client.model";
import {
  Bicycle,
  BicycleDocking,
  DockingPoint,
  Rate,
  Station,
} from "../../features/business/pedalibre.models";
import "../../features/business/pedalibre.associations";
import { PedalibreService } from "../../features/business/pedalibre.service";

interface StationRow {
  station_code: string;
  zone: string;
  priority: string;
  name: string;
  address: string;
  city: string;
  department: string;
  country: string;
  description: string;
  capacity: number;
  bicycle_count: number;
  electric_bicycle_count: number;
  docking_point_count: number;
}

interface BicycleRow {
  serial_number: string;
  station_code: string;
  name: string;
  description: string;
  bicycle_type: string;
  rental_rate_name: string;
  hourly_rate_cop: number;
}

interface RateRow {
  bicycle_type: string;
  name: string;
  calculation_rule: string;
  base_value: number;
  currency: string;
}

interface InventorySlot {
  point: DockingPoint;
  bicycle: Bicycle;
}

const sourcePath = path.resolve(process.cwd(), "data/riohacha/estaciones.csv");
const bicyclesPath = path.resolve(process.cwd(), "data/riohacha/bicicletas.csv");
const ratesPath = path.resolve(process.cwd(), "data/riohacha/tarifas.csv");
const confirmDatabase = process.env.RIOHACHA_SEED_DATABASE;

async function run(): Promise<void> {
  const rows = parseStationRows(await readFile(sourcePath, "utf8"));
  const bicycleRows = parseBicycleRows(await readFile(bicyclesPath, "utf8"), rows);
  const rateRows = parseRateRows(await readFile(ratesPath, "utf8"), bicycleRows);
  const bicycles = bicycleRows.length;
  const electricBicycles = bicycleRows.filter((row) => row.bicycle_type === "electric").length;
  const points = rows.reduce((total, row) => total + row.docking_point_count, 0);
  if (process.argv.includes("--validate")) {
    console.log(
      `CSV válido: ${rows.length} estaciones, ${bicycles} bicicletas ` +
        `(${bicycles - electricBicycles} estándar, ${electricBicycles} eléctricas), ` +
        `${points} puntos y ${rateRows.length} tarifas.`,
    );
    return;
  }

  if (!confirmDatabase) {
    throw new Error(
      "Define RIOHACHA_SEED_DATABASE con el nombre exacto de la base local que deseas poblar.",
    );
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("La carga de inventario de Riohacha está bloqueada en NODE_ENV=production.");
  }

  const database = getDatabaseInfo().database;
  if (confirmDatabase !== database) {
    throw new Error(
      `La confirmación no coincide con la base seleccionada (${database}); no se realizaron cambios.`,
    );
  }

  const connected = await testConnection();
  if (!connected) throw new Error("No hay conexión a la base de datos");

  const slots = await provisionInventory(rows, bicycleRows);
  await provisionRates(rateRows);
  const service = new PedalibreService();
  let dockingsCreated = 0;
  let dockingsAlreadyPresent = 0;

  for (const slot of slots) {
    const activeDocking = await BicycleDocking.findOne({
      where: { bicycle_id: slot.bicycle.id, undocked_at: null },
    });
    if (activeDocking) {
      if (activeDocking.docking_point_id !== slot.point.id) {
        throw new Error(
          `La bicicleta ${slot.bicycle.serial_number} ya está anclada en otro punto; se requiere revisión manual.`,
        );
      }
      dockingsAlreadyPresent += 1;
      continue;
    }

    await service.dockBicycle({
      bicycle_id: slot.bicycle.id,
      docking_point_id: slot.point.id,
    });
    dockingsCreated += 1;
  }

  console.log(
    `Inventario listo en ${database}: ${rows.length} estaciones, ${points} puntos y ` +
      `${bicycles} bicicletas (${bicycles - electricBicycles} estándar, ${electricBicycles} eléctricas); ` +
      `${rateRows.length} tarifas verificadas, ${dockingsCreated} movimientos creados, ` +
      `${dockingsAlreadyPresent} ya existían.`,
  );
  console.log(
    "Las ubicaciones son propuestas suministradas por el usuario; no incluyen coordenadas ni verificación física.",
  );
}

async function provisionInventory(
  rows: StationRow[],
  bicycleRows: BicycleRow[],
): Promise<InventorySlot[]> {
  const bicyclesByStation = new Map<string, BicycleRow[]>();
  for (const bicycle of bicycleRows) {
    const stationBicycles = bicyclesByStation.get(bicycle.station_code) ?? [];
    stationBicycles.push(bicycle);
    bicyclesByStation.set(bicycle.station_code, stationBicycles);
  }

  return sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
    async (transaction) => {
      const slots: InventorySlot[] = [];

      for (const [stationIndex, row] of rows.entries()) {
        const station = await findOrCreateStation(row, transaction);
        const stationBicycles = bicyclesByStation.get(row.station_code) ?? [];
        const slotCount = Math.max(row.bicycle_count, row.docking_point_count);

        for (let slotIndex = 1; slotIndex <= slotCount; slotIndex += 1) {
          const pointCode = `${row.station_code}-P${String(slotIndex).padStart(2, "0")}`;
          const point = await findOrCreatePoint(station, row, pointCode, transaction);

          const bicycleRow = stationBicycles[slotIndex - 1];
          if (bicycleRow) {
            const bicycle = await findOrCreateBicycle(
              bicycleRow,
              transaction,
            );
            if (slotIndex <= row.docking_point_count) slots.push({ point, bicycle });
          }
        }
      }

      return slots;
    },
  );
}

async function provisionRates(rows: RateRow[]): Promise<void> {
  await sequelize.transaction(async (transaction) => {
    for (const row of rows) {
      const [rate, created] = await Rate.findOrCreate({
        where: { name: row.name },
        defaults: {
          name: row.name,
          calculation_rule: row.calculation_rule,
          base_value: row.base_value,
          is_active: true,
        },
        transaction,
      });
      if (
        !created &&
        (rate.calculation_rule !== row.calculation_rule ||
          Number(rate.base_value) !== row.base_value ||
          !rate.is_active)
      ) {
        throw new Error(
          `La tarifa "${row.name}" ya existe con datos diferentes o está inactiva; no se modificó.`,
        );
      }
    }
  });
}

async function findOrCreateStation(row: StationRow, transaction: Transaction): Promise<Station> {
  const [station, created] = await Station.findOrCreate({
    where: { name: row.name },
    defaults: {
      name: row.name,
      description:
        `${row.description} Ubicación: ${row.city}, ${row.department}, ${row.country}. ` +
        `Zona: ${row.zone}. Prioridad propuesta: ${row.priority}. ` +
        "Ubicación propuesta por el usuario; confirmar en terreno.",
      address: row.address,
      capacity: row.capacity,
      status: "active",
      is_active: true,
    },
    transaction,
  });
  if (
    !created &&
    (station.address !== row.address || station.capacity !== row.capacity || !station.is_active)
  ) {
    throw new Error(
      `La estación existente "${row.name}" no coincide con el CSV o está inactiva; no se modificó.`,
    );
  }
  return station;
}

async function findOrCreatePoint(
  station: Station,
  row: StationRow,
  code: string,
  transaction: Transaction,
): Promise<DockingPoint> {
  const name = `Anclaje ${code}`;
  const [point, created] = await DockingPoint.findOrCreate({
    where: { station_id: station.id, code },
    defaults: {
      station_id: station.id,
      code,
      name,
      description: `Punto de inventario inicial en ${row.name}, Riohacha.`,
      status: "available",
      is_active: true,
    },
    transaction,
  });
  if (!created && (point.name !== name || !point.is_active)) {
    throw new Error(`El punto ${code} existente no coincide con el CSV o está inactivo.`);
  }
  return point;
}

async function findOrCreateBicycle(
  row: BicycleRow,
  transaction: Transaction,
): Promise<Bicycle> {
  const [bicycle, created] = await Bicycle.findOrCreate({
    where: { serial_number: row.serial_number },
    defaults: {
      serial_number: row.serial_number,
      name: row.name,
      description: row.description,
      bicycle_type: row.bicycle_type,
      status: "available",
      is_active: true,
    },
    transaction,
  });
  if (
    !created &&
    (bicycle.name !== row.name ||
      bicycle.description !== row.description ||
      bicycle.bicycle_type !== row.bicycle_type ||
      bicycle.status !== "available" ||
      !bicycle.is_active)
  ) {
    throw new Error(
      `La bicicleta ${row.serial_number} ya existe con datos diferentes o no está disponible; no se modificó.`,
    );
  }
  return bicycle;
}

function parseStationRows(csv: string): StationRow[] {
  const records = parseCsv(csv);
  if (records.length < 2) throw new Error("El CSV no contiene estaciones.");
  const [headers, ...data] = records;
  const requiredHeaders = [
    "station_code",
    "zone",
    "priority",
    "name",
    "address",
    "city",
    "department",
    "country",
    "description",
    "capacity",
    "bicycle_count",
    "electric_bicycle_count",
    "docking_point_count",
  ];
  if (headers.join(",") !== requiredHeaders.join(",")) {
    throw new Error(`El encabezado de ${sourcePath} no coincide con el formato esperado.`);
  }

  const seenCodes = new Set<string>();
  const seenNames = new Set<string>();
  const rows = data.map((record, index): StationRow => {
    const rowNumber = index + 2;
    if (record.length !== requiredHeaders.length) {
      throw new Error(`La fila ${rowNumber} del CSV tiene un número incorrecto de columnas.`);
    }
    const values = Object.fromEntries(
      requiredHeaders.map((header, column) => [header, record[column].trim()]),
    );
    const row: StationRow = {
      station_code: values["station_code"],
      zone: values["zone"],
      priority: values["priority"],
      name: values["name"],
      address: values["address"],
      city: values["city"],
      department: values["department"],
      country: values["country"],
      description: values["description"],
      capacity: parsePositiveInteger(values["capacity"], "capacity", rowNumber),
      bicycle_count: parsePositiveInteger(values["bicycle_count"], "bicycle_count", rowNumber),
      electric_bicycle_count: parseNonNegativeInteger(
        values["electric_bicycle_count"],
        "electric_bicycle_count",
        rowNumber,
      ),
      docking_point_count: parsePositiveInteger(
        values["docking_point_count"],
        "docking_point_count",
        rowNumber,
      ),
    };
    if (
      !row.station_code ||
      !row.zone ||
      !row.priority ||
      !row.name ||
      !row.address ||
      !row.city ||
      !row.department ||
      !row.country ||
      !row.description
    ) {
      throw new Error(`La fila ${rowNumber} tiene campos obligatorios vacíos.`);
    }
    if (row.electric_bicycle_count > row.bicycle_count) {
      throw new Error(
        `La fila ${rowNumber} tiene más bicicletas eléctricas que bicicletas totales.`,
      );
    }
    if (row.bicycle_count > row.docking_point_count) {
      throw new Error(
        `La fila ${rowNumber} tiene más bicicletas que puntos de anclaje; no se puede anclar toda la flota.`,
      );
    }
    if (row.capacity < row.bicycle_count) {
      throw new Error(`La fila ${rowNumber} tiene capacidad menor que su flota.`);
    }
    if (seenCodes.has(row.station_code) || seenNames.has(row.name)) {
      throw new Error(`La estación de la fila ${rowNumber} duplica código o nombre.`);
    }
    seenCodes.add(row.station_code);
    seenNames.add(row.name);
    return row;
  });
  return rows;
}

function parseBicycleRows(csv: string, stations: StationRow[]): BicycleRow[] {
  const records = parseCsv(csv);
  if (records.length < 2) throw new Error("El CSV no contiene bicicletas.");
  const [headers, ...data] = records;
  const requiredHeaders = [
    "serial_number",
    "station_code",
    "name",
    "description",
    "bicycle_type",
    "rental_rate_name",
    "hourly_rate_cop",
  ];
  if (headers.join(",") !== requiredHeaders.join(",")) {
    throw new Error(`El encabezado de ${bicyclesPath} no coincide con el formato esperado.`);
  }

  const stationsByCode = new Map(stations.map((station) => [station.station_code, station]));
  const rows = data.map((record, index): BicycleRow => {
    const rowNumber = index + 2;
    if (record.length !== requiredHeaders.length) {
      throw new Error(`La fila ${rowNumber} de bicicletas tiene un número incorrecto de columnas.`);
    }
    const values = Object.fromEntries(
      requiredHeaders.map((header, column) => [header, record[column].trim()]),
    );
    const row: BicycleRow = {
      serial_number: values["serial_number"],
      station_code: values["station_code"],
      name: values["name"],
      description: values["description"],
      bicycle_type: values["bicycle_type"],
      rental_rate_name: values["rental_rate_name"],
      hourly_rate_cop: parsePositiveInteger(values["hourly_rate_cop"], "hourly_rate_cop", rowNumber),
    };
    const station = stationsByCode.get(row.station_code);
    if (
      !station ||
      !row.serial_number ||
      !row.name ||
      !row.description ||
      !row.rental_rate_name ||
      !["standard", "electric"].includes(row.bicycle_type)
    ) {
      throw new Error(`La fila ${rowNumber} de bicicletas tiene datos vacíos o inválidos.`);
    }
    if (
      row.rental_rate_name !== (row.bicycle_type === "electric"
        ? "Alquiler por hora - Bicicleta eléctrica"
        : "Alquiler por hora - Bicicleta estándar")
    ) {
      throw new Error(`La fila ${rowNumber} usa una tarifa que no corresponde al tipo de bicicleta.`);
    }
    return row;
  });

  const seenSerialNumbers = new Set<string>();
  const countsByStation = new Map<string, { total: number; electric: number }>();
  for (const row of rows) {
    if (seenSerialNumbers.has(row.serial_number)) {
      throw new Error(`El número de serie ${row.serial_number} está duplicado.`);
    }
    seenSerialNumbers.add(row.serial_number);
    const counts = countsByStation.get(row.station_code) ?? { total: 0, electric: 0 };
    counts.total += 1;
    if (row.bicycle_type === "electric") counts.electric += 1;
    countsByStation.set(row.station_code, counts);
  }
  for (const station of stations) {
    const counts = countsByStation.get(station.station_code) ?? { total: 0, electric: 0 };
    if (counts.total !== station.bicycle_count || counts.electric !== station.electric_bicycle_count) {
      throw new Error(
        `La estación ${station.station_code} no coincide con el conteo/tipo de bicicletas del CSV.`,
      );
    }
  }
  return rows;
}

function parseRateRows(csv: string, bicycles: BicycleRow[]): RateRow[] {
  const records = parseCsv(csv);
  if (records.length < 2) throw new Error("El CSV no contiene tarifas.");
  const [headers, ...data] = records;
  const requiredHeaders = ["bicycle_type", "name", "calculation_rule", "base_value", "currency"];
  if (headers.join(",") !== requiredHeaders.join(",")) {
    throw new Error(`El encabezado de ${ratesPath} no coincide con el formato esperado.`);
  }
  const rows = data.map((record, index): RateRow => {
    const rowNumber = index + 2;
    if (record.length !== requiredHeaders.length) {
      throw new Error(`La fila ${rowNumber} de tarifas tiene un número incorrecto de columnas.`);
    }
    const values = Object.fromEntries(
      requiredHeaders.map((header, column) => [header, record[column].trim()]),
    );
    const row: RateRow = {
      bicycle_type: values["bicycle_type"],
      name: values["name"],
      calculation_rule: values["calculation_rule"],
      base_value: parsePositiveInteger(values["base_value"], "base_value", rowNumber),
      currency: values["currency"],
    };
    if (
      !["standard", "electric"].includes(row.bicycle_type) ||
      !row.name ||
      row.calculation_rule !== "hourly" ||
      row.currency !== "COP"
    ) {
      throw new Error(`La fila ${rowNumber} de tarifas tiene datos inválidos.`);
    }
    return row;
  });
  if (rows.length !== 2 || new Set(rows.map((row) => row.bicycle_type)).size !== 2) {
    throw new Error("El CSV de tarifas debe definir una tarifa horaria para cada tipo de bicicleta.");
  }
  for (const rate of rows) {
    const correspondingBicycle = bicycles.find((bicycle) => bicycle.bicycle_type === rate.bicycle_type);
    if (
      !correspondingBicycle ||
      correspondingBicycle.rental_rate_name !== rate.name ||
      correspondingBicycle.hourly_rate_cop !== rate.base_value
    ) {
      throw new Error(`La tarifa de ${rate.bicycle_type} no coincide con el CSV de bicicletas.`);
    }
  }
  const standardRate = rows.find((row) => row.bicycle_type === "standard");
  const electricRate = rows.find((row) => row.bicycle_type === "electric");
  if (!standardRate || !electricRate || electricRate.base_value <= standardRate.base_value) {
    throw new Error("La tarifa horaria eléctrica debe ser mayor que la estándar.");
  }
  return rows;
}

function parsePositiveInteger(value: string, field: string, rowNumber: number): number {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) {
    throw new Error(`La columna ${field} de la fila ${rowNumber} debe ser un entero positivo.`);
  }
  return number;
}

function parseNonNegativeInteger(value: string, field: string, rowNumber: number): number {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) {
    throw new Error(`La columna ${field} de la fila ${rowNumber} debe ser un entero no negativo.`);
  }
  return number;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error("El CSV tiene un campo entrecomillado sin cerrar.");
  row.push(field);
  if (row.some((value) => value.length > 0)) rows.push(row);
  return rows;
}

if (require.main === module) {
  run()
    .then(async () => {
      await sequelize.close();
    })
    .catch(async (error: unknown) => {
      console.error("Error al cargar el inventario propuesto de Riohacha:", error);
      await sequelize.close();
      process.exitCode = 1;
    });
}
