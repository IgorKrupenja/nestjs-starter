import type { Server } from 'node:http';

import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@src/prisma/services/prisma.service.js';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestApp } from './utils/create-test-app.util.js';

describe('Swagger Documentation (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  describe('when API_DOCUMENTATION_ENABLED is true', () => {
    beforeAll(async () => {
      process.env.API_DOCUMENTATION_ENABLED = 'true';
      ({ app, server, prisma } = await createTestApp());
    });

    afterAll(async () => {
      await prisma.$disconnect();
      await app.close();
      delete process.env.API_DOCUMENTATION_ENABLED;
    });

    it('should serve Swagger UI at /documentation', async () => {
      const response = await request(server).get('/documentation').expect(200);

      expect(response.text).toContain('Swagger UI');
    });

    it('should serve OpenAPI JSON at /documentation-json', async () => {
      const response = (await request(server).get('/documentation-json').expect(200)) as {
        body: { openapi: string; info: { title: string } };
      };

      expect(response.body).toHaveProperty('openapi');
      expect(response.body).toHaveProperty('info');
      expect(response.body.info.title).toBe('NestJS Starter');
    });
  });

  describe('when API_DOCUMENTATION_ENABLED is false', () => {
    beforeAll(async () => {
      process.env.API_DOCUMENTATION_ENABLED = 'false';
      ({ app, server, prisma } = await createTestApp());
    });

    afterAll(async () => {
      await prisma.$disconnect();
      await app.close();
      delete process.env.API_DOCUMENTATION_ENABLED;
    });

    it('should return 404 for /documentation', async () => {
      await request(server).get('/documentation').expect(404);
    });

    it('should return 404 for /documentation-json', async () => {
      await request(server).get('/documentation-json').expect(404);
    });
  });

  describe('when API_DOCUMENTATION_ENABLED is not set', () => {
    beforeAll(async () => {
      delete process.env.API_DOCUMENTATION_ENABLED;
      ({ app, server, prisma } = await createTestApp());
    });

    afterAll(async () => {
      await prisma.$disconnect();
      await app.close();
    });

    it('should return 404 for /documentation (disabled by default)', async () => {
      await request(server).get('/documentation').expect(404);
    });
  });
});
