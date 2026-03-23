import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/config/env';
import { DRIZZLE_DB } from './database.constants';

const postgresClient = postgres(env.DATABASE_URL);
const db = drizzle(postgresClient);

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_DB,
      useValue: db,
    },
  ],
  exports: [DRIZZLE_DB],
})
export class DatabaseModule {}
