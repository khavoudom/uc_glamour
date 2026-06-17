const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const args = process.argv.slice(2);
const input = args[0];

if (!input) {
  console.error('Usage: node scripts/convert-to-webp.js <file-or-directory>');
  process.exit(1);
}

const extensions = new Set(['.png', '.jpg', '.jpeg']);

async function convert(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!extensions.has(ext)) return;

  const outPath = filePath.replace(ext, '.webp');
  await sharp(filePath).webp({ quality: 80 }).toFile(outPath);
  fs.unlinkSync(filePath);
}

async function main() {
  const stat = fs.statSync(input);
  if (stat.isFile()) {
    await convert(input);
  } else if (stat.isDirectory()) {
    const entries = fs.readdirSync(input, { recursive: true });
    for (const entry of entries) {
      const fullPath = path.join(input, entry);
      if (fs.statSync(fullPath).isFile()) {
        await convert(fullPath);
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
