import { LogLevel } from '@nestjs/common';
import Joi from 'joi';

const validLogLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose', 'fatal'];

const schema = {
  DATABASE_URL: Joi.string().uri().required(),
  LOGGER_LOG_LEVELS: Joi.string()
    .pattern(new RegExp(`^(${validLogLevels.join('|')})(,(${validLogLevels.join('|')}))*$`))
    .default('error,warn,log'),
  LOGGER_COLORS: Joi.boolean().default(false),
  API_DOCUMENTATION_ENABLED: Joi.boolean().default(false),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
};

export const appConfigSchema = Joi.object<typeof schema>(schema);
