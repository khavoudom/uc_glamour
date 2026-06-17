#!/usr/bin/env node

/**
 * Remove all // comments from .ts, .tsx, .js, .jsx files.
 *
 * Preserves:
 *  - Triple-slash directives: /// <reference />
 *  - URLs containing //
 *  - // inside strings
 *
 * Usage:
 *   node scripts/remove-comments.mjs
 *   node scripts/remove-comments.mjs --dry-run
 *   node scripts/remove-comments.mjs --no-trailing
 *
 *   --dry-run     Preview changes without writing
 *   --no-trailing Only remove full-line // comments, keep trailing ones
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const IGNORE_DIRS = new Set(['node_modules', '.next', 'dist', 'build', 'coverage']);

const dryRun = process.argv.includes('--dry-run');
const noTrailing = process.argv.includes('--no-trailing');

function* walk(root) {
  const entries = readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) yield* walk(full);
    } else if (entry.isFile() && EXTENSIONS.has(extname(entry.name))) {
      yield full;
    }
  }
}

let totalChanged = 0;
let totalRemoved = 0;

for (const filePath of walk(ROOT)) {
  const original = readFileSync(filePath, 'utf-8');
  const lines = original.split('\n');
  const result = [];
  let changed = false;

  for (const line of lines) {
    // Preserve triple-slash directives
    if (/^\s*\/\/\//.test(line)) {
      result.push(line);
      continue;
    }

    if (noTrailing) {
      // Only remove full-line // comments
      if (/^\s*\/\//.test(line)) {
        changed = true;
        totalRemoved++;
        continue;
      }
      result.push(line);
    } else {
      const processed = removeComment(line);
      if (processed !== line) {
        changed = true;
        totalRemoved++;
      }
      if (processed !== null) {
        result.push(processed);
      }
    }
  }

  const output = result.join('\n');
  if (output !== original) {
    totalChanged++;
    const relPath = filePath.slice(ROOT.length);
    if (dryRun) {
      console.log(`[DRY-RUN] Would modify: ${relPath}`);
    } else {
      writeFileSync(filePath, output, 'utf-8');
    }
  }
}

function removeComment(line) {
  // Full-line comment → drop the line entirely
  if (/^\s*\/\//.test(line)) return null;

  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === '\\') {
      escaped = true;
      continue;
    }

    if (inSingle) {
      if (ch === "'") inSingle = false;
      continue;
    }

    if (inDouble) {
      if (ch === '"') inDouble = false;
      continue;
    }

    if (ch === "'") {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }

    // Check for // — but skip if it's part of a URL (e.g. https://)
    if (ch === '/' && i + 1 < line.length && line[i + 1] === '/') {
      // Heuristic: if the text before // looks like a protocol (e.g. https:)
      // keep the whole line
      const before = line.slice(0, i).trimEnd();
      if (/[a-zA-Z]+:$/.test(before) || before.endsWith(':')) {
        // Looks like a protocol — preserve the line
        return line;
      }
      return before;
    }
  }

  return line;
}

// suggestCanonicalClasses conversions (for tailwind.md tracking):
// text-[12px] → text-xs   (×34 occurrences)
// text-[14px] → text-sm   (×7)
// text-[16px] → text-base (×3)
// text-[18px] → text-lg   (×17)
// text-[20px] → text-xl   (×4)
// text-[48px] → text-5xl  (×1)
// text-[96px] → text-8xl  (×1)
// font-[600]  → font-semibold (×1)
// mx-[28px]   → mx-7      (×1)
// w-[120px]   → w-30      (×1)
// h-[120px]   → h-30      (×1)
// px-[60px]   → px-15     (×1)
// top-[60px]  → top-15    (×1)
// rounded-[16px] → rounded-2xl (×1)

console.log(`\nDone.`);
console.log(`  Files modified:   ${totalChanged}`);
console.log(`  Comments removed: ${totalRemoved}`);
if (dryRun) {
  console.log(`  (dry-run mode — no files were written)`);
}
