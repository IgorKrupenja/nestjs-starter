import { PrismaClient } from '@src/generated/prisma/client.js';

export type PrismaTransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];
