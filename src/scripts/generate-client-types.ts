import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { NestFactory } from '@nestjs/core';
import openapiTS, { astToString } from 'openapi-typescript';

import { configureApp } from '../app.config.js';
import { AppModule } from '../app.module.js';

process.env.NODE_ENV ??= 'development';

async function generateClientTypes(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });

  try {
    const openApiDocument = configureApp(app);
    if (!openApiDocument) {
      throw new Error(
        'OpenAPI document is unavailable. Enable Swagger via config.apiDocumentationEnabled.',
      );
    }

    const clientDir = fileURLToPath(new URL('../../client', import.meta.url));
    fs.mkdirSync(clientDir, { recursive: true });

    const ast = await openapiTS(JSON.stringify(openApiDocument));
    fs.writeFileSync(
      fileURLToPath(new URL('../../client/index.d.ts', import.meta.url)),
      astToString(ast),
      'utf-8',
    );
  } finally {
    await app.close();
  }
}

void generateClientTypes().catch((error) => {
  console.error('Failed to generate client types:', error);
  process.exit(1);
});
