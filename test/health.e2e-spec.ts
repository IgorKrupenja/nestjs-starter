import type { Server } from 'node:http';

import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@src/prisma/services/prisma.service.js';
import request from 'supertest';
import { createTestApp } from 'test/utils/create-test-app.util.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Health API (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, server, prisma } = await createTestApp());
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('returns health status', async () => {
    const response = await request(server).get('/v1/health').expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      details: {
        database: {
          status: 'up',
        },
      },
    });
  });
});
