import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './generated/prisma/client';

const adapter = new PrismaPg({ url: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

export type PrismaClientType = typeof prisma;
