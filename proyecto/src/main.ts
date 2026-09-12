import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { getLoggerConfig } from './common/logger/logger.config.js';
import { ValidationPipe } from '@nestjs/common';
import { ENV_CONFIG_NAME } from './config/environment/env.config.js';
import type { EnvironmentConfig } from './config/environment/env.interface.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: getLoggerConfig().logLevels,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const configService = app.get(ConfigService);
  const env = configService.get<EnvironmentConfig>(ENV_CONFIG_NAME);
  const port = env?.app.port ?? 3002;

  try {
    await app.listen(port);
    console.log(`Application listening on http://localhost:${port}`);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException)?.code;
    if (code === 'EADDRINUSE') {
      console.error(
        `El puerto ${port} ya está en uso (EADDRINUSE). Libera el puerto o cambia PORT en .env.`,
      );
      await app.close();
      process.exit(1);
    }
    throw error;
  }
}

await bootstrap();
