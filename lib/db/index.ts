import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.SQLITE_DB_PATH ?? path.join(process.cwd(), 'data', 'glamour.db');

const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const globalForDb = globalThis as unknown as { client: Database.Database | undefined };
const client = (globalForDb.client ??= new Database(dbPath));

client.pragma('journal_mode = WAL');
client.pragma('foreign_keys = ON');

export const db = drizzle(client, { schema });
