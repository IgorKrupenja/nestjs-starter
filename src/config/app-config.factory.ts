import { LogLevel } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { AppConfig } from '@src/config/interfaces/app-config.interface.js';
import { ConfigUtil } from '@src/config/utils/config.util.js';

import { appConfigSchema } from './app-config.schema.js';

export const appConfigFactory = registerAs('app', (): AppConfig => {
  const env = ConfigUtil.validate(appConfigSchema);

  return {
    databaseUrl: <string>env['DATABASE_URL'],
    loggerLogLevels: parseLogLevels(<string>env['LOGGER_LOG_LEVELS']),
    loggerColors: <boolean>env['LOGGER_COLORS'],
    apiDocumentationEnabled: <boolean>env['API_DOCUMENTATION_ENABLED'],
    corsOrigin: parseCorsOrigin(<string>env['API_CORS_ORIGIN']),
    nodeEnv: <string>env['NODE_ENV'],
  };
});

function parseLogLevels(value: string): LogLevel[] {
  const levels = value.split(',').map((level) => level.trim()) as LogLevel[];
  return levels;
}

function parseCorsOrigin(value: string): string | string[] {
  if (!value || value === '') {
    return ''; // Empty string disables CORS
  }
  const origins = value.split(',').map((origin) => origin.trim());
  return origins.length === 1 ? origins[0] : origins;
}
