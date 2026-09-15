import { createRequire } from 'node:module';
import { Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import {
  DatabaseDialect,
  type DatabaseConfig,
} from '../../../config/environment/env.interface';
import { ClientModel } from '../../../features/business/clients/infrastructure/persistence/models/client.model';
import { getSequelizeOptions } from './sequelize.options';

const nodeRequire = createRequire(__filename);
const logger = new Logger('Sequelize');

export const ALL_MODELS = [ClientModel];

function loadDialectModule(dialect: DatabaseDialect): object {
  try {
    switch (dialect) {
      case DatabaseDialect.MySQL:
        return nodeRequire('mysql2') as object;
      case DatabaseDialect.Postgres:
        return nodeRequire('pg') as object;
      case DatabaseDialect.MSSQL:
        return nodeRequire('tedious') as object;
      case DatabaseDialect.Oracle:
        return nodeRequire('oracledb') as object;
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

  await sequelize.sync({ alter: false });
  logger.log('Esquema sincronizado (sync alter: false)');

  return sequelize;
}
