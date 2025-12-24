import { LogLevel } from '@nestjs/common';
import * as joi from 'joi';

const validLogLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose', 'fatal'];

const schema = {
  DATABASE_URL: joi.string().uri().required(),
  LOGGER_LOG_LEVELS: joi
    .string()
    .pattern(new RegExp(`^(${validLogLevels.join('|')})(,(${validLogLevels.join('|')}))*$`))
    .default('error,warn,log'),
  LOGGER_COLORS: joi.boolean().default(false),
  API_DOCUMENTATION_ENABLED: joi.boolean().default(false),
  NODE_ENV: joi.string().valid('development', 'production', 'test').default('development'),
};

export const appConfigSchema = joi.object<typeof schema>(schema);
