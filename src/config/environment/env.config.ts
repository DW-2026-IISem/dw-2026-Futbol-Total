import { registerAs } from '@nestjs/config';
import { resolveDialectCredentials } from './db-env';
import { Environment, type EnvironmentConfig } from './env.interface';
import { validate } from './env.validation';

export const envConfig = registerAs(
  'environment',
  (): EnvironmentConfig => {
    const validated = validate(process.env);

    return {
      app: {
        port: validated.PORT,
        nodeEnv: validated.NODE_ENV ?? Environment.Development,
      },
      database: resolveDialectCredentials(validated),
    };
  },
);
