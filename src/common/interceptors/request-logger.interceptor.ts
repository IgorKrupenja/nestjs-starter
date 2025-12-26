import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs';

@Injectable()
export class RequestLogger implements NestInterceptor {
  private readonly logger = new Logger(RequestLogger.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { originalUrl, method, params, query } = request;
    const body = request.body as Record<string, unknown>;
    const { statusCode } = response;

    return next.handle().pipe(
      tap((data) => {
        this.logger.log(
          `Request: {method: ${method}, url: ${originalUrl}, params: ${JSON.stringify(params)}, query: ${JSON.stringify(query)}, body: ${JSON.stringify(body)}}`,
        );

        this.logger.log(
          `Response: {statusCode: ${statusCode}, responseData: ${JSON.stringify(data ?? {})}}`,
        );
      }),
    );
  }
}
