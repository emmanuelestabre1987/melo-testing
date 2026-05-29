import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "..", "public");

// Melo Envíos app mark: full-bleed near-black field with the white route-"M"
// and its two pin dots, kept inside the central safe zone so it also works as a
// maskable icon (the OS applies its own rounded mask).
const svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#121212"/>
  <g transform="translate(26 8) scale(4.6)">
    <path d="M30 70 L30 47 C30 35 50 35 50 55 C50 35 70 35 70 47 L70 70"
      fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="30" cy="70" r="5.6" fill="#ffffff"/>
    <circle cx="70" cy="70" r="5.6" fill="#ffffff"/>
  </g>
</svg>`;

const buf = Buffer.from(svg);

const targets = [
  { name: "pwa-192x192.png", size: 192 },
  { name: "pwa-512x512.png", size: 512 },
  { name: "maskable-512x512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of targets) {
  await sharp(buf, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(resolve(publicDir, name));
  console.log(`✓ ${name} (${size}x${size})`);
}
console.log("Icons generated in /public");
