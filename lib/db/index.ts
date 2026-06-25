import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';
import { logger } from '../logger';
import { autoSeed } from '../seed/auto-seed';

function resolveCandidateDbPath(candidate: string) {
  return path.isAbsolute(candidate) ? candidate : path.resolve(process.cwd(), candidate);
}

function ensureDbPath() {
  const candidates = process.env.SQLITE_DB_PATH
    ? [resolveCandidateDbPath(process.env.SQLITE_DB_PATH), path.join('/tmp', 'data', 'glamour.db')]
    : [path.join(process.cwd(), 'data', 'glamour.db'), path.join('/tmp', 'data', 'glamour.db')];

  for (const candidate of candidates) {
    try {
      fs.mkdirSync(path.dirname(candidate), { recursive: true });
      return candidate;
    } catch (error) {
      if (candidate === candidates[candidates.length - 1]) {
        throw error;
      }
    }
  }

  throw new Error('Unable to initialize SQLite database path');
}

const dbPath = ensureDbPath();

const globalForDb = globalThis as unknown as { client: Database.Database | undefined };
const client = (globalForDb.client ??= new Database(dbPath));

client.pragma('journal_mode = WAL');
client.pragma('foreign_keys = ON');

export const db = drizzle(client, { schema });

migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });

// Auto-seed admin user and cosmetics on ephemeral environments (Vercel).
// These run on every cold start but are idempotent (upsert/skip existing).
autoSeed(db).catch((e) => {
  logger('lib/db').error('Auto-seed failed', e instanceof Error ? { message: e.message } : { error: e });
});
