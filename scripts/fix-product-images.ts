import { db } from '../lib/db';
import { products } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { existsSync } from 'node:fs';
import path from 'node:path';

async function main() {
  const all = await db
    .select({ id: products.id, name: products.name, imageUrls: products.imageUrls })
    .from(products);

  let fixed = 0;
  for (const p of all) {
    if (!p.imageUrls || p.imageUrls === '[]') continue;

    try {
      const urls = JSON.parse(p.imageUrls);
      if (!Array.isArray(urls) || urls.length === 0) continue;

      const validUrls = urls.filter((url: string) => {
        if (!url.startsWith('/uploads/')) return true;
        const filePath = path.join(process.cwd(), 'public', url);
        return existsSync(filePath);
      });

      if (validUrls.length !== urls.length) {
        const newValue = validUrls.length > 0 ? JSON.stringify(validUrls) : null;
        await db.update(products).set({ imageUrls: newValue }).where(eq(products.id, p.id));
        fixed++;
      }
    } catch {}
  }

  process.exit(0);
}

main();
