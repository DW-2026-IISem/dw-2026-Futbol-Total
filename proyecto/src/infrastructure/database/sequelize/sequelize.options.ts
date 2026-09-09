import type { SequelizeOptions } from 'sequelize-typescript';
import {
  DatabaseDialect,
  type DatabaseConfig,
} from '../../../config/environment/env.interface.js';

export function getSequelizeOptions(
  database: DatabaseConfig,
): SequelizeOptions {
  const base: SequelizeOptions = {
    dialect: database.dialect,
    host: database.host,
    port: database.port,
    username: database.username,
    password: database.password,
    database: database.database,
    logging: false,
    define: {
      underscored: false,
      freezeTableName: true,
    },
  };

  switch (database.dialect) {
    case DatabaseDialect.MSSQL:
      return {
        ...base,
        dialectOptions: {
          options: {
            encrypt: true,
            trustServerCertificate: true,
          },
        },
      };
    case DatabaseDialect.Oracle:
      return {
        ...base,
        dialectOptions: {
          connectString: database.connectString,
        },
      };
    default:
      return base;
  }
}
