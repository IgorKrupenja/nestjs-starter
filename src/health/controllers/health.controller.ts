import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '@src/prisma/services/prisma.service.js';

@ApiTags('health')
@Controller({ version: '1', path: '/health' })
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
    private readonly prismaService: PrismaService,
  ) {}

  @Get('/')
  @HealthCheck()
  async healthCheck(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      (): Promise<HealthIndicatorResult> =>
        this.prismaHealthIndicator.pingCheck('database', this.prismaService),
    ]);
  }
}
