import { registerAs } from '@nestjs/config';

import { appConfigSchema } from './app-config.schema.js';
import { AppConfig } from './interfaces/app-config.interface.js';
import { ConfigUtil } from '../common/utils/config.util.js';

export const appConfigFactory = registerAs('app', (): AppConfig => {
  const env = ConfigUtil.validate(appConfigSchema);

  return {
    databaseUrl: <string>env['DATABASE_URL'],
    loggerLogLevels: parseLogLevels(<string>env['LOGGER_LOG_LEVELS']),
    loggerColors: <boolean>env['LOGGER_COLORS'],
    apiDocumentationEnabled: <boolean>env['API_DOCUMENTATION_ENABLED'],
    nodeEnv: <string>env['NODE_ENV'],
  };
});

function parseLogLevels(value: string): string[] {
  return value.split(',').map((level) => level.trim());
}
