import { ErrorUtil } from '@src/common/utils/error.util.js';

export class NotFoundException<T extends Record<string, any>> extends Error {
  constructor(name: string, args: { readonly [key in keyof Partial<T>]: T[key] }) {
    super(ErrorUtil.buildNotFoundErrorMessage({ name, args }));
  }
}
