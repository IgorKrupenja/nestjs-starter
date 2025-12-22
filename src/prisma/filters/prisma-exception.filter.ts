import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { Prisma } from '../../generated/prisma/client.js';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode = this.getStatusCode(exception);
    const message = this.getMessage(exception);

    response.status(statusCode).json({
      statusCode,
      message,
    });
  }

  private getStatusCode(exception: Prisma.PrismaClientKnownRequestError): number {
    switch (exception.code) {
      case 'P2002': // Unique constraint violation
        return HttpStatus.CONFLICT;
      case 'P2025': // Record not found
        return HttpStatus.NOT_FOUND;
      case 'P2003': // Foreign key constraint failed
        return HttpStatus.BAD_REQUEST;
      case 'P2021': // Table does not exist
      case 'P2022': // Column does not exist
        return HttpStatus.INTERNAL_SERVER_ERROR;
      default:
        return HttpStatus.BAD_REQUEST;
    }
  }

  private getMessage(exception: Prisma.PrismaClientKnownRequestError): string {
    switch (exception.code) {
      case 'P2002':
        return `Unique constraint failed on field: ${this.getTarget(exception)}`;
      case 'P2025':
        return 'Record not found';
      case 'P2003':
        return 'Foreign key constraint failed';
      case 'P2021':
        return 'Table does not exist in the database';
      case 'P2022':
        return 'Column does not exist in the database';
      default:
        return exception.message;
    }
  }

  private getTarget(exception: Prisma.PrismaClientKnownRequestError): string {
    if (exception.meta && typeof exception.meta === 'object' && 'target' in exception.meta) {
      const target = exception.meta.target;
      return Array.isArray(target) ? target.join(', ') : String(target);
    }
    return 'unknown';
  }
}
