export interface AppConfig {
  readonly databaseUrl: string;
  readonly loggerLogLevels: string[];
  readonly loggerColors: boolean;
  readonly apiDocumentationEnabled: boolean;
  // todo do we need this
  readonly nodeEnv: string;
}
