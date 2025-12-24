import { LogLevel } from '@nestjs/common';

export interface AppConfig {
  readonly databaseUrl: string;
  readonly loggerLogLevels: LogLevel[];
  readonly loggerColors: boolean;
  readonly apiDocumentationEnabled: boolean;
  // Used in unit tests with ConfigService mocks
  readonly nodeEnv: string;
}
