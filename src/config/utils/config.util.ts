import Joi from 'joi';

export class ConfigUtil {
  static validate<T>(schema: Joi.ObjectSchema<T>): {
    [key in keyof T]: unknown;
  } {
    const result = schema.options({ stripUnknown: true }).validate(process.env);
    if (result.error) throw new Error(`Config validation error: ${result.error.message}`);
    return result.value;
  }
}
