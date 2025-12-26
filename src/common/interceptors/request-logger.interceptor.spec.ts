import { CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RequestLogger } from './request-logger.interceptor.js';

describe('RequestLogger', () => {
  let interceptor: RequestLogger;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestLogger],
    }).compile();

    interceptor = module.get<RequestLogger>(RequestLogger);

    mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({
          originalUrl: '/test',
          method: 'GET',
          params: { id: '1' },
          query: { filter: 'active' },
          body: { data: 'test' },
        }),
        getResponse: vi.fn().mockReturnValue({
          statusCode: 200,
        }),
      }),
    } as unknown as ExecutionContext;

    mockCallHandler = {
      handle: vi.fn().mockReturnValue(of({ result: 'success' })),
    };
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log request and response data', (done) => {
    const logSpy = vi.spyOn(Logger.prototype, 'log');

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (data) => {
        expect(data).toEqual({ result: 'success' });
        expect(logSpy).toHaveBeenCalledTimes(2);
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('Request: {method: GET, url: /test'),
        );
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Response: {statusCode: 200'));
        done();
      },
    });
  });

  it('should handle empty response data', (done) => {
    mockCallHandler = {
      handle: vi.fn().mockReturnValue(of(null)),
    };

    const logSpy = vi.spyOn(Logger.prototype, 'log');

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: () => {
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('responseData: {}'));
        done();
      },
    });
  });
});
