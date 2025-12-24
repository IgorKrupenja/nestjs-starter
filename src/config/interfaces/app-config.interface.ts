import { LogLevel } from '@nestjs/common';

export interface AppConfig {
  readonly databaseUrl: string;
  readonly loggerLogLevels: LogLevel[];
  readonly loggerColors: boolean;
  readonly apiDocumentationEnabled: boolean;
  // todo do we need this
  readonly nodeEnv: string;
}
