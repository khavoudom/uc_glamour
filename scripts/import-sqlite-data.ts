/**
 * One-time import script: reads backup/data.sql (PostgreSQL pg_dump)
 * and inserts the data into the local SQLite database.
 *
 * Run: npm run db:restore
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const dbPath = process.env.SQLITE_DB_PATH ?? path.join(process.cwd(), 'data', 'glamour.db');
const backupPath = path.join(process.cwd(), 'backup', 'data.sql');

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = OFF');

const content = fs.readFileSync(backupPath, 'utf-8');
const lines = content.split('\n');

interface CopyBlock {
  table: string;
  columns: string[];
  rows: string[];
}

function parseCopyBlocks(): CopyBlock[] {
  const blocks: CopyBlock[] = [];
  const copyRegex = /^COPY\s+public\.(\w+)\s+\(([^)]+)\)\s+FROM\s+stdin;/;
  const endRegex = /^\\\.$/;

  let current: CopyBlock | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (current) {
      if (endRegex.test(trimmed)) {
        blocks.push(current);
        current = null;
      } else {
        current.rows.push(line);
      }
    } else {
      const m = trimmed.match(copyRegex);
      if (m) {
        current = {
          table: m[1],
          columns: m[2].split(',').map((c) => c.trim()),
          rows: [],
        };
      }
    }
  }

  return blocks;
}

function splitTabSeparatedRow(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuote = false;

  for (const ch of line) {
    if (ch === '"' && !inQuote) {
      inQuote = true;
      current += ch;
    } else if (ch === '"' && inQuote) {
      inQuote = false;
      current += ch;
    } else if (ch === '\t' && !inQuote) {
      values.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  values.push(current);
  return values;
}

const booleanColumns = new Map<string, Set<string>>([
  ['users', new Set(['email_verified'])],
  ['products', new Set(['is_new', 'is_subscription_eligible'])],
  ['reviews', new Set(['is_verified'])],
  ['coupons', new Set(['is_active'])],
  ['subscriptions', new Set(['active'])],
  ['shipping_services', new Set(['is_active'])],
  ['product_alerts', new Set(['is_active'])],
]);

const tableOrder = [
  'users', 'products', 'shades', 'reviews', 'coupons',
  'cart_items', 'wishlist_items', 'subscriptions', 'loyalty_transactions',
  'conversations', 'chat_messages', 'tool_executions',
  'shipping_services', 'orders', 'order_items', 'product_alerts', 'email_queue',
];

const blocks = parseCopyBlocks();
let totalRows = 0;

for (const tableName of tableOrder) {
  const block = blocks.find((b) => b.table === tableName);
  if (!block) {
    console.log(`Skipping ${tableName}: no data in backup`);
    continue;
  }

  const booleans = booleanColumns.get(tableName) ?? new Set();
  const colList = block.columns.map((c) => `"${c}"`).join(', ');
  const placeholders = block.columns.map(() => '?').join(', ');
  const insert = sqlite.prepare(
    `INSERT INTO "${tableName}" (${colList}) VALUES (${placeholders})`,
  );

  const insertMany = sqlite.transaction((rows: string[][]) => {
    for (const row of rows) {
      const values = row.map((val, i) => {
        const colName = block.columns[i];
        if (val === '\\N') {
          // Supply default for rows where pg dump has NULL but SQLite schema requires NOT NULL
          if (tableName === 'shades' && colName === 'name') return 'Original';
          return null;
        }
        if (val.startsWith('["')) return val;
        if (booleans.has(colName)) return val === 't' ? 1 : 0;
        return val;
      });
      insert.run(...values);
    }
  });

  const rows = block.rows.map((line) => splitTabSeparatedRow(line));
  insertMany(rows);
  totalRows += rows.length;
  console.log(`Imported ${rows.length} rows into ${tableName}`);
}

// Reset auto-increment sequences
for (const block of blocks) {
  if (block.rows.length === 0) continue;
  const idColIdx = block.columns.indexOf('id');
  if (idColIdx === -1) continue;
  let maxId = 0;
  for (const row of block.rows) {
    const vals = splitTabSeparatedRow(row);
    const id = parseInt(vals[idColIdx], 10);
    if (!isNaN(id) && id > maxId) maxId = id;
  }
  if (maxId > 0) {
    sqlite.prepare(`DELETE FROM sqlite_sequence WHERE name = ?`).run(block.table);
    sqlite.prepare(`INSERT INTO sqlite_sequence (name, seq) VALUES (?, ?)`).run(block.table, maxId);
    console.log(`Set ${block.table} sequence to ${maxId}`);
  }
}

sqlite.pragma('foreign_keys = ON');
sqlite.close();

console.log(`\nImport complete: ${blocks.length} tables, ${totalRows} total rows.`);
