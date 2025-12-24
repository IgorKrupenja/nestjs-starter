import * as joi from 'joi';

const schema = {
  DATABASE_URL: joi.string().uri().required(),
  LOGGER_LOG_LEVELS: joi.string().default('error,warn,log'),
  LOGGER_COLORS: joi.boolean().default(false),
  API_DOCUMENTATION_ENABLED: joi.boolean().default(false),
  NODE_ENV: joi.string().valid('development', 'production', 'test').default('development'),
};

export const appConfigSchema = joi.object<typeof schema>(schema);
