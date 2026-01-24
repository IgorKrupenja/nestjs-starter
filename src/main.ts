import * as fs from 'fs';

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import openapiTS, { astToString } from 'openapi-typescript';

import { configureApp } from './app.config.js';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Apply shared app configuration
  const openApiDocument = configureApp(app);

  // Generate TypeScript client types from OpenAPI spec in development
  if (process.env.NODE_ENV === 'development' && openApiDocument) {
    fs.mkdirSync('./client', { recursive: true });
    const ast = await openapiTS(JSON.stringify(openApiDocument));
    fs.writeFileSync('./client/index.d.ts', astToString(ast), 'utf-8');
  }

  await app.listen(3000);
}

void bootstrap();
