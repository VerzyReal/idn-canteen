const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const items = [
  { name: 'Nasi Goreng Spesial', file: 'nasi-goreng.svg', title: 'Nasi Goreng', sub: 'Spesial Telur & Ayam', emoji: '🍳', c1: '#ffedd5', c2: '#fb923c', accent: '#c2410c' },
  { name: 'Mie Ayam Bakso', file: 'mie-ayam.svg', title: 'Mie Ayam Bakso', sub: 'Kuah Kaldu Gurih', emoji: '🍜', c1: '#fef3c7', c2: '#f59e0b', accent: '#b45309' },
  { name: 'Nasi Uduk Komplit', file: 'nasi-uduk.svg', title: 'Nasi Uduk', sub: 'Ayam & Tempe Orek', emoji: '🍛', c1: '#dbeafe', c2: '#60a5fa', accent: '#1d4ed8' },
  { name: 'Gado-Gado Jakarta', file: 'gado-gado.svg', title: 'Gado-Gado', sub: 'Bumbu Kacang Jakarta', emoji: '🥗', c1: '#dcfce7', c2: '#4ade80', accent: '#15803d' },
  { name: 'Soto Ayam Kuah Bening', file: 'soto-ayam.svg', title: 'Soto Ayam', sub: 'Kuah Bening Segar', emoji: '🍲', c1: '#fef9c3', c2: '#facc15', accent: '#a16207' },
  { name: 'Risoles Mayo', file: 'risoles.svg', title: 'Risoles Mayo', sub: 'Renyah Isi Creamy', emoji: '🥟', c1: '#fde68a', c2: '#f59e0b', accent: '#92400e' },
  { name: 'Martabak Mini Coklat Keju', file: 'martabak-mini.svg', title: 'Martabak Mini', sub: 'Topping Coklat Keju', emoji: '🥞', c1: '#f3e8ff', c2: '#c084fc', accent: '#7e22ce' },
  { name: 'Pisang Goreng Crispy', file: 'pisang-goreng.svg', title: 'Pisang Goreng', sub: 'Crispy Keju Manis', emoji: '🍌', c1: '#fef08a', c2: '#eab308', accent: '#854d0e' },
  { name: 'Es Teh Manis', file: 'es-teh.svg', title: 'Es Teh Manis', sub: 'Dingin Menyegarkan', emoji: '🧋', c1: '#ffedd5', c2: '#fdba74', accent: '#9a3412' },
  { name: 'Jus Jeruk Segar', file: 'jus-jeruk.svg', title: 'Jus Jeruk Segar', sub: 'Peras Murni Vitamin C', emoji: '🍊', c1: '#ffedd5', c2: '#fb923c', accent: '#ea580c' },
];

async function main() {
  const dir = path.join(__dirname, '..', 'public', 'images', 'products');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const item of items) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${item.c1}"/>
      <stop offset="100%" stop-color="${item.c2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="40%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bg)"/>
  <circle cx="340" cy="40" r="70" fill="#ffffff" fill-opacity="0.18"/>
  <circle cx="60" cy="260" r="90" fill="#ffffff" fill-opacity="0.15"/>
  <circle cx="200" cy="128" r="110" fill="url(#glow)"/>
  <circle cx="200" cy="124" r="66" fill="#ffffff" fill-opacity="0.92"/>
  <text x="200" y="148" font-size="70" text-anchor="middle" font-family="Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif">${item.emoji}</text>
  <rect x="65" y="210" width="270" height="58" rx="16" fill="#ffffff" fill-opacity="0.92"/>
  <text x="200" y="236" font-size="18" font-weight="700" fill="#131b2e" text-anchor="middle" font-family="Inter, system-ui, sans-serif">${item.title}</text>
  <text x="200" y="256" font-size="12" font-weight="600" fill="${item.accent}" text-anchor="middle" font-family="Inter, system-ui, sans-serif">${item.sub}</text>
</svg>`;
    fs.writeFileSync(path.join(dir, item.file), svg, 'utf8');

    // Update URL di database Neon
    await prisma.product.updateMany({
      where: { name: item.name },
      data: { imageUrl: `/images/products/${item.file}` },
    });
  }

  console.log('✅ 10 gambar SVG placeholder berhasil dibuat & database Neon diperbarui!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
