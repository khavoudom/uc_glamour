import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

const globalForDb = globalThis as unknown as { client: ReturnType<typeof postgres> | undefined };
const client = (globalForDb.client ??= postgres(connectionString, {
  prepare: false,
  max: 10,
  ssl: process.env.NODE_ENV === 'development' ? false : 'require',
}));

export const db = drizzle(client, { schema });
