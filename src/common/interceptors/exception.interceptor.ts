import {
  CallHandler,
  ExecutionContext,
  BadRequestException as HttpBadRequestException,
  ConflictException as HttpConflictException,
  ForbiddenException as HttpForbiddenException,
  NotFoundException as HttpNotFoundException,
  PayloadTooLargeException as HttpPayloadTooLargeException,
  PreconditionFailedException as HttpPreconditionFailedException,
  UnauthorizedException as HttpUnauthorizedException,
  UnsupportedMediaTypeException as HttpUnsupportedMediaTypeException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { AlreadyExistsException } from '@src/common/exceptions/already-exists.exception.js';
import { BadRequestException } from '@src/common/exceptions/bad-request.exception.js';
import { ConflictException } from '@src/common/exceptions/conflict.exception.js';
import { ForbiddenException } from '@src/common/exceptions/forbidden.exception.js';
import { NotFoundException } from '@src/common/exceptions/not-found.exception.js';
import { PayloadTooLargeException } from '@src/common/exceptions/payload-too-large.exception.js';
import { PreconditionFailedException } from '@src/common/exceptions/precondition-failed.exception.js';
import { UnauthorizedException } from '@src/common/exceptions/unauthorized.exception.js';
import { UnsupportedMediaTypeException } from '@src/common/exceptions/unsupported-media-type.exception.js';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(catchError((err: unknown) => throwError(() => this.map(err))));
  }

  private map(err: unknown): Error {
    if (err instanceof BadRequestException) return new HttpBadRequestException(err.message);
    if (err instanceof ConflictException) return new HttpConflictException(err.message);
    if (err instanceof ForbiddenException) return new HttpForbiddenException(err.message);
    if (err instanceof NotFoundException) return new HttpNotFoundException(err.message);
    if (err instanceof AlreadyExistsException) return new HttpConflictException(err.message);
    if (err instanceof PayloadTooLargeException)
      return new HttpPayloadTooLargeException(err.message);
    if (err instanceof PreconditionFailedException)
      return new HttpPreconditionFailedException(err.message);
    if (err instanceof UnauthorizedException) return new HttpUnauthorizedException(err.message);
    if (err instanceof UnsupportedMediaTypeException)
      return new HttpUnsupportedMediaTypeException(err.message);
    if (err instanceof Error) return err;
    return new Error(String(err));
  }
}
