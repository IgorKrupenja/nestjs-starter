import { ConflictException } from '@src/common/exceptions/conflict.exception.js';
import { ErrorUtil } from '@src/common/utils/error.util.js';

export class AlreadyExistsException<T extends Record<string, any>> extends ConflictException {
  constructor(name: string, args: { readonly [key in keyof Partial<T>]: T[key] }) {
    super(ErrorUtil.buildAlreadyExistsErrorMessage({ name, args }));
  }
}
