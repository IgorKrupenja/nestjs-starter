import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@src/generated/prisma/client.js';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

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
    const isDevelopment = process.env.NODE_ENV !== 'production';

    switch (exception.code) {
      case 'P2002':
        // In production, don't expose field names
        return isDevelopment
          ? `Unique constraint failed on field: ${this.getTarget(exception)}`
          : 'A record with this value already exists';
      case 'P2025':
        return 'Record not found';
      case 'P2003':
        return isDevelopment
          ? 'Foreign key constraint failed'
          : 'Invalid reference to related record';
      case 'P2021':
      case 'P2022':
        // Never expose schema details in production
        return isDevelopment ? exception.message : 'Database error occurred';
      default:
        // Don't leak internal error details in production
        return isDevelopment ? exception.message : 'An error occurred processing your request';
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
