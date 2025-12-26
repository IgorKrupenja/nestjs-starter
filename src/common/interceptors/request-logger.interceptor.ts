import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs';

interface RequestData {
  originalUrl: string;
  method: string;
  params: Record<string, unknown>;
  query: Record<string, unknown>;
  body: Record<string, unknown>;
}

interface ResponseData {
  statusCode: number;
}

@Injectable()
export class RequestLogger implements NestInterceptor {
  private readonly logger = new Logger(RequestLogger.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestData>();
    const response = context.switchToHttp().getResponse<ResponseData>();

    const { originalUrl, method, params, query, body } = request;
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
