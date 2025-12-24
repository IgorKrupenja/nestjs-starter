export interface AppConfig {
  readonly databaseUrl: string;
  readonly loggerLogLevels: string[];
  readonly loggerColors: boolean;
  readonly apiDocumentationEnabled: boolean;
  readonly nodeEnv: string;
}
