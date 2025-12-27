import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

interface ApiDataResponseArgs<T extends Type> {
  status: HttpStatus;
  data: {
    type: T;
    isArray?: boolean;
  };
}

export const ApiDataResponse = <T extends Type>(
  args: ApiDataResponseArgs<T>,
): MethodDecorator & ClassDecorator =>
  applyDecorators(
    ApiExtraModels(args.data.type),
    ApiResponse({
      status: args.status,
      schema: {
        type: 'object',
        properties: {
          data: args.data.isArray
            ? {
                type: 'array',
                items: { $ref: getSchemaPath(args.data.type) },
              }
            : { $ref: getSchemaPath(args.data.type) },
        },
        required: ['data'],
      },
    }),
  );

export const ApiCreatedDataResponse = <T extends Type>(
  args: Omit<ApiDataResponseArgs<T>, 'status'>,
): MethodDecorator & ClassDecorator => ApiDataResponse({ ...args, status: HttpStatus.CREATED });

export const ApiOkDataResponse = <T extends Type>(
  args: Omit<ApiDataResponseArgs<T>, 'status'>,
): MethodDecorator & ClassDecorator => ApiDataResponse({ ...args, status: HttpStatus.OK });
