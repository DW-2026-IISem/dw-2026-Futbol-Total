import { createRequire } from 'node:module';
import { Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import {
  DatabaseDialect,
  Environment,
  type DatabaseConfig,
} from '../../../config/environment/env.interface.js';
import { getSequelizeOptions } from './sequelize.options.js';
import { ClientModel } from '../../../features/business/clients/infrastructure/persistence/models/client.model.js';

const require = createRequire(import.meta.url);
const logger = new Logger('Sequelize');

export const ALL_MODELS = [ClientModel];

function loadDialectModule(dialect: DatabaseDialect): object {
  try {
    switch (dialect) {
      case DatabaseDialect.MySQL:
        return require('mysql2') as object;
      case DatabaseDialect.Postgres:
        return require('pg') as object;
      case DatabaseDialect.MSSQL:
        return require('tedious') as object;
      case DatabaseDialect.Oracle:
        return require('oracledb') as object;
      default: {
        const unsupported: never = dialect;
        throw new Error(`Dialecto no soportado: ${String(unsupported)}`);
      }
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `No se pudo cargar el driver de ${dialect.toUpperCase()}: ${detail}`,
    );
  }
}

export async function createSequelizeInstance(
  database: DatabaseConfig,
  nodeEnv: Environment = Environment.Development,
): Promise<Sequelize> {
  const options = getSequelizeOptions(database);
  const dialectModule = loadDialectModule(database.dialect);

  const sequelize = new Sequelize({
    ...options,
    dialectModule,
    models: ALL_MODELS,
  });

  try {
    await sequelize.authenticate();
    logger.log(
      `Conexión exitosa a ${database.dialect.toUpperCase()} (${database.host}:${database.port}/${database.database})`,
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    logger.error(
      `Error conectando a ${database.dialect.toUpperCase()} (${database.host}:${database.port}/${database.database}): ${detail}`,
    );
    throw new Error(
      `No se pudo conectar a ${database.dialect.toUpperCase()} usando el bloque DB_${database.dialect.toUpperCase()}_*. ${detail}`,
    );
  }

  if (nodeEnv !== Environment.Production) {
    await sequelize.sync({ alter: false });
    logger.log('Esquema sincronizado (sync alter: false)');
  }

  return sequelize;
}
