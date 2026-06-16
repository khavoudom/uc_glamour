import fs from 'fs';
import path from 'path';

const products = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.json'), 'utf-8'));

const UPLOADS_DIR = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const brandColors: Record<string, string> = {
  Cetaphil: '#0081A7',
  'La Roche-Posay': '#00A86B',
  Neutrogena: '#004B87',
  CeraVe: '#00A3E0',
  'The Ordinary': '#000000',
  Garnier: '#E2001A',
  Simple: '#8BC34A',
  Olay: '#E6007E',
  Clinique: '#000000',
  'SK-II': '#C8102E',
  "Kiehl's": '#003D7A',
  Eucerin: '#005293',
  Avène: '#A9D9D0',
  Bioderma: '#004B85',
  "Paula's Choice": '#B8860B',
  'Drunk Elephant': '#4A4A4A',
  Tatcha: '#C4A882',
  Fresh: '#7CB342',
  'Fenty Skin': '#E28B8B',
  'Glow Recipe': '#FF6B9D',
  Laneige: '#9FB6D4',
  Cosrx: '#2E2E2E',
  Innisfree: '#7CB342',
  'Some By Mi': '#FF69B4',
  "Pond's": '#003366',
  Vaseline: '#006DA3',
  Himalaya: '#8B4513',
  'Burts Bees': '#F5A623',
  Aveeno: '#00665E',
  Dove: '#004B87',
};

function generateProductSVG(name: string, brand: string, category: string): string {
  const color = brandColors[brand] || '#666666';
  const lightColor = color + '20';
  const initial = brand.charAt(0);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${lightColor}"/>
      <stop offset="100%" style="stop-color:#ffffff"/>
    </linearGradient>
    <linearGradient id="bottle" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${color}"/>
      <stop offset="100%" style="stop-color:${color}dd"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="400" height="400" fill="url(#bg)" rx="20"/>

  <!-- Product container shape (bottle/jar based on category) -->
  ${
    category === 'Cleanser' || category === 'Toner'
      ? `
  <!-- Bottle shape -->
  <rect x="145" y="50" width="110" height="220" rx="15" fill="url(#bottle)" opacity="0.9"/>
  <rect x="160" y="40" width="80" height="25" rx="5" fill="${color}"/>
  <rect x="185" y="30" width="30" height="15" rx="3" fill="${color}88"/>
  <rect x="170" y="120" width="60" height="80" rx="8" fill="none" stroke="white" stroke-width="1" opacity="0.3"/>
  `
      : category === 'Moisturizer'
        ? `
  <!-- Jar shape -->
  <rect x="130" y="90" width="140" height="160" rx="25" fill="url(#bottle)" opacity="0.9"/>
  <rect x="120" y="75" width="160" height="30" rx="10" fill="${color}"/>
  <rect x="135" y="110" width="130" height="100" rx="15" fill="none" stroke="white" stroke-width="1" opacity="0.2"/>
  `
        : `
  <!-- Dropper/serum bottle -->
  <rect x="155" y="70" width="90" height="180" rx="12" fill="url(#bottle)" opacity="0.9"/>
  <rect x="170" y="40" width="60" height="40" rx="8" fill="${color}"/>
  <circle cx="200" cy="55" r="10" fill="${color}88"/>
  <rect x="180" y="120" width="40" height="60" rx="5" fill="none" stroke="white" stroke-width="1" opacity="0.3"/>
  `
  }

  <!-- Brand initial badge -->
  <circle cx="200" cy="300" r="25" fill="${color}" opacity="0.15"/>
  <text x="200" y="310" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="bold" fill="${color}" opacity="0.6">${initial}</text>

  <!-- Product name -->
  <text x="200" y="350" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#555" font-weight="600">
    ${name.length > 28 ? name.substring(0, 28) + '...' : name}
  </text>

  <!-- Brand name -->
  <text x="200" y="370" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#999">
    ${brand}
  </text>

  <!-- Category tag -->
  <rect x="160" y="268" width="80" height="20" rx="10" fill="${color}" opacity="0.1"/>
  <text x="200" y="282" text-anchor="middle" font-family="sans-serif" font-size="10" fill="${color}" font-weight="600">${category}</text>
</svg>`;
}

let count = 0;

for (const product of products) {
  const imageName = product.image_url.replace('/uploads/', '');
  const dest = path.join(UPLOADS_DIR, imageName);

  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    console.log(`✓ Exists: ${imageName}`);
    count++;
    continue;
  }

  const svg = generateProductSVG(product.name, product.brand, product.category);
  fs.writeFileSync(dest, svg);
  console.log(`✓ Generated: ${imageName}`);
  count++;
}

console.log(`\nDone! Generated ${count} product images.`);
