import { MigrationConfig } from "drizzle-orm/migrator";

type APIConfig = {
  fileserverHits: number;
  port: number;
  platform: string;
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

type Config = {
  api: APIConfig;
  db: DBConfig;
};

process.loadEnvFile();

function envOrThrow(key: string) {
  if (process.env[key] == null) {
    throw new Error(`value of ${key} in .env file is missing`);
  }

  return process.env[key];
}

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
  api: {
    fileserverHits: 0,
    port: Number(envOrThrow("PORT")),
    platform: envOrThrow("PLATFORM"),
  },
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: migrationConfig,
  },
};
