import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { configureApp } from './app.config.js';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });

  // Apply shared app configuration (logger, compression, versioning, pipes, filters, swagger)
  configureApp(app);

  await app.listen(3000);
}

void bootstrap();
