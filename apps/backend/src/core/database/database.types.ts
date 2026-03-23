import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export type DrizzleDatabase = PostgresJsDatabase<Record<string, never>>;
export type DrizzleTransaction = Parameters<
  Parameters<DrizzleDatabase['transaction']>[0]
>[0];
