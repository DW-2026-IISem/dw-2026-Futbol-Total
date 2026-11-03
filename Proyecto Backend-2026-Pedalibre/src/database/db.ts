import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

type DatabaseEngine = "mysql" | "postgres" | "mssql" | "oracle";

interface DatabaseConfig {
  dialect: DatabaseEngine;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  dialectOptions?: {
    connectString: string;
  };
}

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.trim() === "") {
    throw new Error(`Falta la variable requerida ${name}`);
  }

  return value.trim();
}

function requiredPort(name: string): number {
  const port = Number(requiredEnv(name));

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} debe ser un puerto válido`);
  }

  return port;
}

function readDatabaseEngine(): DatabaseEngine {
  const engine = requiredEnv("DB_DIALECT").toLowerCase();

  switch (engine) {
    case "mysql":
    case "postgres":
    case "mssql":
    case "oracle":
      return engine;
    default:
      throw new Error(
        `DB_DIALECT no soportado: ${engine}. Usa mysql, postgres, mssql u oracle.`,
      );
  }
}

function readDatabaseConfig(engine: DatabaseEngine): DatabaseConfig {
  const prefix = {
    mysql: "DB_MYSQL",
    postgres: "DB_POSTGRES",
    mssql: "DB_MSSQL",
    oracle: "DB_ORACLE",
  }[engine];

  const config: DatabaseConfig = {
    dialect: engine,
    host: requiredEnv(`${prefix}_HOST`),
    port: requiredPort(`${prefix}_PORT`),
    username: requiredEnv(`${prefix}_USERNAME`),
    password: requiredEnv(`${prefix}_PASSWORD`),
    database: requiredEnv(`${prefix}_NAME`),
  };

  if (engine === "oracle") {
    config.dialectOptions = {
      connectString: requiredEnv("DB_ORACLE_CONNECT_STRING"),
    };
  }

  return config;
}

const selectedEngine = readDatabaseEngine();
const selectedConfig = readDatabaseConfig(selectedEngine);

export const sequelize = new Sequelize(
  selectedConfig.database,
  selectedConfig.username,
  selectedConfig.password,
  {
    host: selectedConfig.host,
    port: selectedConfig.port,
    dialect: selectedConfig.dialect,
    dialectOptions: selectedConfig.dialectOptions,
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

export function getDatabaseInfo() {
  return {
    engine: selectedEngine,
    host: selectedConfig.host,
    port: selectedConfig.port,
    database: selectedConfig.database,
  };
}

export async function testConnection(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    console.log(`Conexión exitosa a ${selectedEngine.toUpperCase()}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error(`Falló la conexión a ${selectedEngine.toUpperCase()}: ${message}`);
    return false;
  }
}
