import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@src/generated/prisma/client.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaExceptionFilter } from './prisma-exception.filter.js';

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
  let mockConfigService: ConfigService;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn().mockReturnValue({
        nodeEnv: 'development',
      }),
    } as unknown as ConfigService;

    filter = new PrismaExceptionFilter(mockConfigService);

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockArgumentsHost = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: vi.fn().mockReturnValue(mockResponse),
      }),
    } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('P2002 - Unique constraint violation', () => {
    it('should return 409 Conflict with proper message', () => {
      const exception = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.2.0',
        meta: { target: ['email'] },
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        message: 'Unique constraint failed on field: email',
      });
    });

    it('should handle multiple target fields', () => {
      const exception = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.2.0',
        meta: { target: ['email', 'username'] },
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        message: 'Unique constraint failed on field: email, username',
      });
    });

    it('should handle missing target metadata', () => {
      const exception = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.2.0',
        meta: {},
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        message: 'Unique constraint failed on field: unknown',
      });
    });
  });

  describe('P2025 - Record not found', () => {
    it('should return 404 Not Found', () => {
      const exception = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '7.2.0',
        meta: { modelName: 'User' },
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Record not found',
      });
    });
  });

  describe('P2003 - Foreign key constraint failed', () => {
    it('should return 400 Bad Request', () => {
      const exception = new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
        code: 'P2003',
        clientVersion: '7.2.0',
        meta: { field_name: 'authorId' },
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Foreign key constraint failed',
      });
    });
  });

  describe('P2021 - Table does not exist', () => {
    it('should return 500 Internal Server Error in development', () => {
      const exception = new Prisma.PrismaClientKnownRequestError('Table does not exist', {
        code: 'P2021',
        clientVersion: '7.2.0',
        meta: { table: 'user' },
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Table does not exist',
      });
    });

    it('should hide schema details in production', () => {
      vi.mocked(mockConfigService.get).mockReturnValue({ nodeEnv: 'production' });
      const exception = new Prisma.PrismaClientKnownRequestError('Table does not exist', {
        code: 'P2021',
        clientVersion: '7.2.0',
        meta: { table: 'user' },
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database error occurred',
      });
    });
  });

  describe('P2022 - Column does not exist', () => {
    it('should return 500 Internal Server Error in development', () => {
      const exception = new Prisma.PrismaClientKnownRequestError('Column does not exist', {
        code: 'P2022',
        clientVersion: '7.2.0',
        meta: { column: 'email' },
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Column does not exist',
      });
    });

    it('should hide schema details in production', () => {
      vi.mocked(mockConfigService.get).mockReturnValue({ nodeEnv: 'production' });
      const exception = new Prisma.PrismaClientKnownRequestError('Column does not exist', {
        code: 'P2022',
        clientVersion: '7.2.0',
        meta: { column: 'email' },
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database error occurred',
      });
    });
  });

  describe('Unknown error codes', () => {
    it('should return 400 Bad Request with original message in development', () => {
      const exception = new Prisma.PrismaClientKnownRequestError('Some unknown error', {
        code: 'P9999',
        clientVersion: '7.2.0',
        meta: {},
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Some unknown error',
      });
    });

    it('should return generic message in production', () => {
      vi.mocked(mockConfigService.get).mockReturnValue({ nodeEnv: 'production' });
      const exception = new Prisma.PrismaClientKnownRequestError('Some internal error details', {
        code: 'P9999',
        clientVersion: '7.2.0',
        meta: {},
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'An error occurred processing your request',
      });
    });
  });

  describe('Production security', () => {
    beforeEach(() => {
      vi.mocked(mockConfigService.get).mockReturnValue({ nodeEnv: 'production' });
    });

    it('should not expose field names for P2002 in production', () => {
      const exception = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.2.0',
        meta: { target: ['email'] },
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        message: 'A record with this value already exists',
      });
    });

    it('should use generic message for P2003 in production', () => {
      const exception = new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
        code: 'P2003',
        clientVersion: '7.2.0',
        meta: { field_name: 'authorId' },
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid reference to related record',
      });
    });
  });

  describe('getTarget helper', () => {
    it('should handle string target', () => {
      const exception = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.2.0',
        meta: { target: 'email' },
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        message: 'Unique constraint failed on field: email',
      });
    });
  });
});
