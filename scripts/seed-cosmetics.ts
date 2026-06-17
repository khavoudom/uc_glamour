import 'dotenv/config';
import { db } from '../lib/db';
import { products, shades } from '../lib/db/schema';
import { logger } from '../lib/logger';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { get } from 'https';
import { join } from 'path';

const log = logger('scripts/seed-cosmetics');

interface CosmeticProduct {
  name: string;
  brand: string;
  category: 'Lips' | 'Skincare' | 'Perfume' | 'Eyes' | 'Face';
  price: number;
  originalPrice?: number;
  emoji: string;
  description: string;
  rating: number;
  reviewCount: number;
  badge: 'NEW' | 'SALE' | 'HOT' | null;
  isNew: boolean;
  isSubscriptionEligible?: boolean;
  shades: { name: string; hex: string; stock: number; sku?: string }[];
  imageUrl: string;
}

const productsData: (CosmeticProduct & { slug: string })[] = [
  {
    name: 'Rouge Dior Forever Lipstick',
    brand: 'Dior',
    category: 'Lips',
    price: 42.0,
    emoji: '\u{1F484}',
    description:
      "Dior's iconic long-wearing lipstick with floral lip care. Enriched with flower waxes for vibrant color and 16-hour wear. Transfer-proof and comfortable on the lips.",
    rating: 4.7,
    reviewCount: 892,
    badge: 'HOT',
    isNew: false,
    isSubscriptionEligible: true,
    shades: [
      { name: '999 Forever Dior', hex: '#c0392b', stock: 55, sku: 'DIOR-LIP-999' },
      { name: '100 Forever Nude', hex: '#d4a574', stock: 42, sku: 'DIOR-LIP-100' },
      { name: '840 Forever Rose', hex: '#c85070', stock: 38, sku: 'DIOR-LIP-840' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?fm=jpg&q=80&w=800',
    slug: 'rouge-dior-forever-lipstick',
  },
  {
    name: 'Pillow Talk Matte Revolution Lipstick',
    brand: 'Charlotte Tilbury',
    category: 'Lips',
    price: 35.0,
    emoji: '\u{1F48B}',
    description:
      'The world-famous Pillow Talk lipstick in a matte finish. The universally-flattering muted rose-pink shade that suits every skin tone. Infused with orchid extract for lip-plumping peptides.',
    rating: 4.8,
    reviewCount: 1452,
    badge: 'HOT',
    isNew: false,
    isSubscriptionEligible: true,
    shades: [
      { name: 'Pillow Talk Original', hex: '#c98ba8', stock: 78, sku: 'CT-LIP-PT-OG' },
      { name: 'Pillow Talk Medium', hex: '#b57490', stock: 65, sku: 'CT-LIP-PT-MD' },
      { name: 'Pillow Talk Intense', hex: '#8c4e6e', stock: 44, sku: 'CT-LIP-PT-IN' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?fm=jpg&q=80&w=800',
    slug: 'pillow-talk-matte-lipstick',
  },
  {
    name: 'Fenty Beauty Gloss Bomb Cream',
    brand: 'Fenty Beauty',
    category: 'Lips',
    price: 22.0,
    emoji: '✨',
    description:
      "Rihanna's best-selling universal lip gloss in a creamy new formula. Super-shine, non-sticky, and smells like peach. Shea butter and monoi oil keep lips soft.",
    rating: 4.6,
    reviewCount: 2103,
    badge: null,
    isNew: true,
    shades: [
      { name: 'Fenty Glow', hex: '#d4a088', stock: 90, sku: 'FB-GLOSS-FG' },
      { name: 'Hot Chocolit', hex: '#7a4a3a', stock: 60, sku: 'FB-GLOSS-HC' },
      { name: 'Candy Mints', hex: '#e8a0b8', stock: 75, sku: 'FB-GLOSS-CM' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1631214524049-0ebbbe6d81aa?fm=jpg&q=80&w=800',
    slug: 'fenty-beauty-gloss-bomb-cream',
  },
  {
    name: 'Soft Pinch Liquid Blush',
    brand: 'Rare Beauty',
    category: 'Face',
    price: 23.0,
    emoji: '\u{1F338}',
    description:
      "Selena Gomez's viral liquid blush that delivers a soft, dewy flush with just one tiny drop. Lightweight, long-lasting, and blendable. Clean vegan formula.",
    rating: 4.9,
    reviewCount: 3867,
    badge: 'HOT',
    isNew: false,
    isSubscriptionEligible: true,
    shades: [
      { name: 'Bliss', hex: '#f2a0a0', stock: 120, sku: 'RB-BLUSH-BL' },
      { name: 'Hope', hex: '#e8b0c0', stock: 95, sku: 'RB-BLUSH-HP' },
      { name: 'Joy', hex: '#d87050', stock: 85, sku: 'RB-BLUSH-JY' },
      { name: 'Grateful', hex: '#b05870', stock: 50, sku: 'RB-BLUSH-GR' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?fm=jpg&q=80&w=800',
    slug: 'soft-pinch-liquid-blush',
  },
  {
    name: 'Cloud Paint Gel Cream Blush',
    brand: 'Glossier',
    category: 'Face',
    price: 18.0,
    emoji: '\u{1F3A8}',
    description:
      "Glossier's revolutionary gel-cream blush that melts into skin for a natural, flushed-from-within look. Buildable color in teeny-tiny tubes that last forever.",
    rating: 4.5,
    reviewCount: 1528,
    badge: null,
    isNew: false,
    shades: [
      { name: 'Storm', hex: '#b85060', stock: 70, sku: 'GLOSS-CP-ST' },
      { name: 'Puff', hex: '#f0b8c8', stock: 88, sku: 'GLOSS-CP-PF' },
      { name: 'Dusk', hex: '#c89878', stock: 55, sku: 'GLOSS-CP-DK' },
      { name: 'Haze', hex: '#a06080', stock: 45, sku: 'GLOSS-CP-HZ' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?fm=jpg&q=80&w=800',
    slug: 'cloud-paint-gel-cream-blush',
  },
  {
    name: 'Advanced Night Repair Serum',
    brand: 'Estee Lauder',
    category: 'Skincare',
    price: 79.0,
    originalPrice: 89.0,
    emoji: '\u{1F319}',
    description:
      'Estée Lauder iconic nighttime serum with Chronolux Power Signal Technology. Reduces multiple signs of aging including lines, wrinkles, uneven texture, and loss of firmness.',
    rating: 4.8,
    reviewCount: 4521,
    badge: 'SALE',
    isNew: false,
    isSubscriptionEligible: true,
    shades: [],
    imageUrl: 'https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?fm=jpg&q=80&w=800',
    slug: 'advanced-night-repair-serum',
  },
  {
    name: 'Laneige Lip Sleeping Mask',
    brand: 'Laneige',
    category: 'Skincare',
    price: 24.0,
    emoji: '\u{1F351}',
    description:
      'The viral overnight lip mask that transforms dry, chapped lips. Packed with Berry Fruit Complex and Vitamin C for soft, supple lips by morning. Wake up to baby-smooth lips.',
    rating: 4.7,
    reviewCount: 5612,
    badge: 'HOT',
    isNew: false,
    isSubscriptionEligible: true,
    shades: [
      { name: 'Berry', hex: '#c04060', stock: 150, sku: 'LAN-LSM-BR' },
      { name: 'Grapefruit', hex: '#e87060', stock: 120, sku: 'LAN-LSM-GF' },
      { name: 'Sweet Candy', hex: '#f0a0b8', stock: 100, sku: 'LAN-LSM-SC' },
      { name: 'Mint Choco', hex: '#a0b080', stock: 80, sku: 'LAN-LSM-MC' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?fm=jpg&q=80&w=800',
    slug: 'laneige-lip-sleeping-mask',
  },
  {
    name: 'Lash Sensational Sky High Mascara',
    brand: 'Maybelline',
    category: 'Eyes',
    price: 12.99,
    emoji: '\u{1F441}',
    description:
      'The #1 best-selling mascara in the US for sky-high length and full volume. Flexible bamboo fiber brush delivers up to 100% more length. Washable formula.',
    rating: 4.6,
    reviewCount: 8745,
    badge: 'HOT',
    isNew: false,
    shades: [
      { name: 'Very Black', hex: '#0a0a0a', stock: 200, sku: 'MAY-MASC-VB' },
      { name: 'Brownish Black', hex: '#2a2018', stock: 130, sku: 'MAY-MASC-BB' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1600852306771-c963331af110?fm=jpg&q=80&w=800',
    slug: 'lash-sensational-sky-high-mascara',
  },
  {
    name: 'Tarte Shape Tape Ultra Creamy Concealer',
    brand: 'Tarte',
    category: 'Face',
    price: 31.0,
    emoji: '✨',
    description:
      'The cult-favorite Shape Tape concealer in a super-creamy formula. Full coverage that never creases or settles into fine lines. Vegan, cruelty-free, and infused with shea butter.',
    rating: 4.7,
    reviewCount: 4123,
    badge: null,
    isNew: false,
    isSubscriptionEligible: true,
    shades: [
      { name: '12N Fair', hex: '#f5e8d8', stock: 65, sku: 'TART-ST-12N' },
      { name: '27S Light Sand', hex: '#dcc8a8', stock: 80, sku: 'TART-ST-27S' },
      { name: '35S Medium Sand', hex: '#c0a078', stock: 70, sku: 'TART-ST-35S' },
      { name: '50H Rich', hex: '#6a4830', stock: 45, sku: 'TART-ST-50H' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?fm=jpg&q=80&w=800',
    slug: 'shape-tape-ultra-creamy-concealer',
  },
  {
    name: 'Miss Dior Eau de Parfum',
    brand: 'Dior',
    category: 'Perfume',
    price: 135.0,
    originalPrice: 150.0,
    emoji: '\u{1F339}',
    description:
      'The legendary Miss Dior fragrance a floral chypre with notes of Grasse rose, iris, and patchouli. An enchanting and romantic scent that captures the spirit of Dior.',
    rating: 4.9,
    reviewCount: 2341,
    badge: 'SALE',
    isNew: false,
    shades: [],
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?fm=jpg&q=80&w=800',
    slug: 'miss-dior-eau-de-parfum',
  },
  {
    name: 'NARS Radiant Creamy Concealer',
    brand: 'NARS',
    category: 'Face',
    price: 32.0,
    emoji: '✨',
    description:
      'A cult-favorite concealer that provides buildable, medium-to-full coverage with a natural radiant finish. Hydrating formula with light-diffusing technology for a smooth, crease-free look.',
    rating: 4.6,
    reviewCount: 3210,
    badge: 'HOT',
    isNew: false,
    isSubscriptionEligible: true,
    shades: [
      { name: 'Vanilla', hex: '#f0dcc8', stock: 60, sku: 'NARS-CON-VA' },
      { name: 'Custard', hex: '#dcc098', stock: 55, sku: 'NARS-CON-CU' },
      { name: 'Ginger', hex: '#c08860', stock: 40, sku: 'NARS-CON-GI' },
      { name: 'Caramel', hex: '#a06848', stock: 35, sku: 'NARS-CON-CA' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?fm=jpg&q=80&w=800',
    slug: 'nars-radiant-creamy-concealer',
  },
  {
    name: 'MAC Studio Fix Powder Plus Foundation',
    brand: 'MAC',
    category: 'Face',
    price: 33.0,
    emoji: '\u{1F484}',
    description:
      'A all-in-one powder foundation that provides medium-to-full coverage with a natural matte finish. Controls oil and shine while evening out skin tone. Travel-friendly compact design.',
    rating: 4.4,
    reviewCount: 2876,
    badge: null,
    isNew: false,
    shades: [
      { name: 'NC15', hex: '#f0e0c8', stock: 70, sku: 'MAC-POW-NC15' },
      { name: 'NC30', hex: '#d0b088', stock: 60, sku: 'MAC-POW-NC30' },
      { name: 'NC42', hex: '#b08858', stock: 45, sku: 'MAC-POW-NC42' },
      { name: 'NC50', hex: '#785838', stock: 30, sku: 'MAC-POW-NC50' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1641471290975-8f062fe863e7?fm=jpg&q=80&w=800',
    slug: 'mac-studio-fix-powder-foundation',
  },
  {
    name: 'Naked3 Eyeshadow Palette',
    brand: 'Urban Decay',
    category: 'Eyes',
    price: 49.0,
    emoji: '\u{1F3A8}',
    description:
      'The iconic rose-hued neutral eyeshadow palette with 12 silky, blendable shades. Featuring a mix of matte, shimmer, and sparkle finishes for endless eye looks. Includes a dual-ended brush.',
    rating: 4.7,
    reviewCount: 4521,
    badge: 'HOT',
    isNew: false,
    isSubscriptionEligible: true,
    shades: [
      { name: 'Strange', hex: '#e8dcc8', stock: 100, sku: 'UD-NAKED-STR' },
      { name: 'Limit', hex: '#c8a8a0', stock: 85, sku: 'UD-NAKED-LIM' },
      { name: 'Nooner', hex: '#a87878', stock: 75, sku: 'UD-NAKED-NOON' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1679141335715-18e7c98486e3?fm=jpg&q=80&w=800',
    slug: 'naked3-eyeshadow-palette',
  },
  {
    name: 'Precisely My Brow Pencil',
    brand: 'Benefit Cosmetics',
    category: 'Eyes',
    price: 24.0,
    emoji: '\u{1F484}',
    description:
      'An ultra-fine brow pencil with a precise tip for creating hair-like strokes. Waterproof, long-wearing formula that lasts up to 12 hours. The cult-favorite for natural-looking brows.',
    rating: 4.5,
    reviewCount: 5632,
    badge: null,
    isNew: false,
    shades: [
      { name: 'Shade 3', hex: '#8a7050', stock: 80, sku: 'BEN-BROW-3' },
      { name: 'Shade 4', hex: '#6a5038', stock: 75, sku: 'BEN-BROW-4' },
      { name: 'Shade 5', hex: '#4a3828', stock: 60, sku: 'BEN-BROW-5' },
      { name: 'Shade 6', hex: '#2a2018', stock: 50, sku: 'BEN-BROW-6' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1679141335462-547b83aa99f5?fm=jpg&q=80&w=800',
    slug: 'precisely-my-brow-pencil',
  },
  {
    name: 'Brazilian Bum Bum Cream',
    brand: 'Sol de Janeiro',
    category: 'Skincare',
    price: 48.0,
    emoji: '\u{1F9F6}',
    description:
      'The viral firming body cream with a delicious pistachio and salted caramel scent. Enriched with guarana caffeine, cupuacu butter, and acai oil to hydrate, firm, and smooth skin.',
    rating: 4.8,
    reviewCount: 7842,
    badge: 'HOT',
    isNew: false,
    isSubscriptionEligible: true,
    shades: [],
    imageUrl: 'https://images.unsplash.com/photo-1770048792338-aaf6a575305f?fm=jpg&q=80&w=800',
    slug: 'brazilian-bum-bum-cream',
  },
  {
    name: 'Facial Spray with Aloe Rosewater',
    brand: 'Mario Badescu',
    category: 'Skincare',
    price: 12.0,
    emoji: '\u{1F4A7}',
    description:
      'A refreshing facial mist that instantly hydrates and revitalizes skin. Blended with aloe vera, herbs, and rosewater for a dewy, glowing complexion. Great for setting makeup or midday refresh.',
    rating: 4.3,
    reviewCount: 9123,
    badge: null,
    isNew: false,
    shades: [
      { name: 'Rosewater', hex: '#f0c0c8', stock: 120, sku: 'MB-SPRAY-RW' },
      { name: 'Green Tea', hex: '#c0d0a0', stock: 100, sku: 'MB-SPRAY-GT' },
      { name: 'Cucumber', hex: '#b0c8b0', stock: 90, sku: 'MB-SPRAY-CU' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1613803745799-ba6c10aace85?fm=jpg&q=80&w=800',
    slug: 'facial-spray-aloe-rosewater',
  },
  {
    name: 'Dipbrow Gel Pomade',
    brand: 'Anastasia Beverly Hills',
    category: 'Eyes',
    price: 21.0,
    emoji: '\u{1F484}',
    description:
      'The award-winning waterproof brow pomade for defined, sculpted brows. Highly pigmented formula glides on smoothly and stays put all day. A little goes a long way.',
    rating: 4.6,
    reviewCount: 6541,
    badge: null,
    isNew: false,
    shades: [
      { name: 'Blonde', hex: '#b8a080', stock: 65, sku: 'ABH-DIP-BL' },
      { name: 'Auburn', hex: '#885038', stock: 50, sku: 'ABH-DIP-AU' },
      { name: 'Ebony', hex: '#282018', stock: 70, sku: 'ABH-DIP-EB' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1633793566189-8e9fe6f817fc?fm=jpg&q=80&w=800',
    slug: 'dipbrow-gel-pomade',
  },
  {
    name: 'Easy Bake Loose Baking Powder',
    brand: 'Huda Beauty',
    category: 'Face',
    price: 35.0,
    emoji: '\u{2728}',
    description:
      'A weightless loose setting powder that bakes and blurs imperfections for a flawless, airbrushed finish. Micro-fine particles lock in makeup and control shine without creasing.',
    rating: 4.5,
    reviewCount: 4321,
    badge: 'NEW',
    isNew: true,
    isSubscriptionEligible: true,
    shades: [
      { name: 'Pound Cake', hex: '#f5e8d8', stock: 90, sku: 'HUDA-BAKE-PC' },
      { name: 'Banana Bread', hex: '#e8d0a8', stock: 80, sku: 'HUDA-BAKE-BB' },
      { name: 'Sugar Cookie', hex: '#f0e0c0', stock: 75, sku: 'HUDA-BAKE-SC' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544838673-1a1acb7e049d?fm=jpg&q=80&w=800',
    slug: 'easy-bake-loose-powder',
  },
  {
    name: 'Ultra Facial Cream',
    brand: "Kiehl's",
    category: 'Skincare',
    price: 35.0,
    emoji: '\u{1F9F4}',
    description:
      "Kiehl's iconic face moisturizer with squalane and glacial glycoprotein. Provides 24-hour hydration while strengthening the skin barrier. Lightweight, non-greasy formula suitable for all skin types.",
    rating: 4.7,
    reviewCount: 5678,
    badge: null,
    isNew: false,
    isSubscriptionEligible: true,
    shades: [],
    imageUrl: 'https://images.unsplash.com/photo-1772191530787-b9546da02fbc?fm=jpg&q=80&w=800',
    slug: 'ultra-facial-cream',
  },
  {
    name: 'Continuous Setting Spray',
    brand: 'Morphe',
    category: 'Face',
    price: 18.0,
    emoji: '\u{1F4A6}',
    description:
      'A micro-fine setting mist that locks in makeup for up to 16 hours. Aloe vera and green tea-infused formula prevents fading, creasing, and settling into fine lines.',
    rating: 4.4,
    reviewCount: 3890,
    badge: null,
    isNew: false,
    shades: [],
    imageUrl: 'https://images.unsplash.com/photo-1567721913486-6585f069b332?fm=jpg&q=80&w=800',
    slug: 'continuous-setting-spray',
  },
];

function downloadImage(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        downloadImage(response.headers.location!, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      reject(err);
    });
  });
}

async function seedCosmetics() {
  log.info('Seeding cosmetic products with images...');

  const uploadsDir = join(__dirname, '..', 'public', 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  const existing = await db.select({ name: products.name }).from(products);
  const existingNames = new Set(existing.map((p) => p.name.toLowerCase()));

  let insertedCount = 0;

  for (const p of productsData) {
    if (existingNames.has(p.name.toLowerCase())) {
      log.info('Skipped ' + p.name + ' (already exists)');
      continue;
    }

    const filename = p.slug + '.jpg';
    const filepath = join(uploadsDir, filename);
    const publicPath = '/uploads/' + filename;

    let imageSaved = existsSync(filepath);
    if (!imageSaved) {
      try {
        log.info('Downloading image for ' + p.name + '...');
        await downloadImage(p.imageUrl, filepath);
        log.info('  Image saved to ' + publicPath);
        imageSaved = true;
      } catch (err) {
        log.warn('  Failed to download image for ' + p.name);
      }
    } else {
      log.info('  Image already exists for ' + p.name);
    }

    const [inserted] = await db
      .insert(products)
      .values({
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: String(p.price),
        originalPrice: p.originalPrice ? String(p.originalPrice) : null,
        emoji: p.emoji,
        description: p.description,
        imageUrls: imageSaved ? JSON.stringify([publicPath]) : null,
        rating: String(p.rating),
        reviewCount: p.reviewCount,
        badge: p.badge,
        isNew: p.isNew,
        isSubscriptionEligible: p.isSubscriptionEligible ?? false,
      })
      .returning();

    for (const s of p.shades) {
      await db.insert(shades).values({
        productId: inserted.id,
        name: s.name,
        hex: s.hex,
        stock: s.stock,
        sku: s.sku ?? null,
      });
    }

    insertedCount++;
    log.info('Inserted ' + p.brand + ' - ' + p.name + ' (' + p.category + ')');
  }

  log.info(
    'Done! Inserted ' +
      insertedCount +
      ' new product(s) (' +
      (productsData.length - insertedCount) +
      ' already existed).',
  );
}

seedCosmetics()
  .catch((e) => {
    log.error(
      'Seed failed',
      e instanceof Error ? { message: e.message, stack: e.stack } : { error: e },
    );
    process.exit(1);
  })
  .then(() => process.exit(0));
