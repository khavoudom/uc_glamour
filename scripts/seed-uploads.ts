import 'dotenv/config';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { db } from '../lib/db';
import { products } from '../lib/db/schema';
import { logger } from '../lib/logger';
import { ilike } from 'drizzle-orm';

const log = logger('scripts/seed-uploads');

interface UploadEntry {
  file: string;
  name: string;
  category: string;
  price: number;
  brand: string;
}

const categoryEmoji: Record<string, string> = {
  Skincare: '🧴',
  Eyes: '👁',
  Face: '✨',
  Lips: '💄',
  Perfume: '🌸',
};

async function productExists(name: string, brand: string): Promise<boolean> {
  const [existing] = await db
    .select({ id: products.id })
    .from(products)
    .where(ilike(products.name, name))
    .limit(1);
  return !!existing;
}

async function seedUploads() {
  const uploadsDir = join(__dirname, '..', 'public', 'uploads');
  const jsonFiles = readdirSync(uploadsDir).filter((f) => f.endsWith('.json'));

  let created = 0;
  let skipped = 0;

  for (const jsonFile of jsonFiles) {
    const filePath = join(uploadsDir, jsonFile);
    const entries: UploadEntry[] = JSON.parse(readFileSync(filePath, 'utf-8'));

    const categoryLabel = jsonFile.replace('.json', '');
    log.info(`Processing ${categoryLabel} (${entries.length} items)`);

    for (const entry of entries) {
      if (await productExists(entry.name, entry.brand)) {
        skipped++;
        continue;
      }

      const fileUrl = `/uploads/${categoryLabel}/${entry.file}`;
      const emoji = categoryEmoji[entry.category] ?? '📦';

      await db.insert(products).values({
        name: entry.name,
        brand: entry.brand,
        category: entry.category,
        price: String(entry.price),
        emoji,
        imageUrls: JSON.stringify([fileUrl]),
        description: `${entry.name} — a premium ${entry.category.toLowerCase()} product by ${entry.brand}.`,
        rating: '0',
        reviewCount: 0,
        isNew: true,
      });

      created++;
    }
  }

  log.info(`Done. Created ${created}, skipped ${skipped} existing.`);
}

seedUploads()
  .catch((e) => {
    log.error(
      'Seed failed',
      e instanceof Error ? { message: e.message, stack: e.stack } : { error: e },
    );
    process.exit(1);
  })
  .then(() => process.exit(0));
