import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { NestFactory } from '@nestjs/core';
import { configureApp } from '@src/app.config.js';
import { AppModule } from '@src/app.module.js';
import openapiTS, { astToString } from 'openapi-typescript';

process.env.NODE_ENV ??= 'development';
process.env.SKIP_DB_CONNECTION ??= 'true';
async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });

  try {
    const openApiDocument = configureApp(app);
    if (!openApiDocument) {
      throw new Error(
        'OpenAPI document is unavailable. Enable Swagger via config.apiDocumentationEnabled.',
      );
    }

    const clientDir = fileURLToPath(new URL('../client', import.meta.url));
    fs.mkdirSync(clientDir, { recursive: true });

    const ast = await openapiTS(JSON.stringify(openApiDocument));
    fs.writeFileSync(
      fileURLToPath(new URL('../client/index.d.ts', import.meta.url)),
      astToString(ast),
      'utf-8',
    );

    console.log('client/index.d.ts generated successfully');
  } finally {
    await app.close();
  }
}

void main().catch((error) => {
  console.error('Failed to generate client types:', error);
  process.exit(1);
});
