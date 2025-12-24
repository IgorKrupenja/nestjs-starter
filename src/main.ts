import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { configureApp } from './app.config.js';
import { AppModule } from './app.module.js';
import { appConfigFactory } from './config/app-config.factory.js';
import { AppConfig } from './config/interfaces/app-config.interface.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });

  const appConfig = app.get<AppConfig>(appConfigFactory.KEY);

  // Apply shared app configuration (logger, compression, versioning, pipes, filters, swagger)
  configureApp(app, appConfig);

  await app.listen(3000);
}

void bootstrap();
