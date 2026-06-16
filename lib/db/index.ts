import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Use global singleton so Turbopack hot reloads don't exhaust the connection pool
const globalForDb = globalThis as unknown as { client: ReturnType<typeof postgres> | undefined };
const client = (globalForDb.client ??= postgres(connectionString, { prepare: false, max: 10 }));

export const db = drizzle(client, { schema });
