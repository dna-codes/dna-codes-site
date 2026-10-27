// Generates the site-wide default OG card, src/assets/images/default.png.
//
// src/config.yaml names this file as the fallback image for every page without its own. The
// Metadata component emits no Open Graph tags at all when that image is missing, so this card
// is what puts og:image and og:type on the homepage. Same palette and renderer as
// generate-series-og.mjs, so a link preview from the homepage and one from a series post look
// like the same site.
//
// Usage: node scripts/generate-default-og.mjs

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'images', 'default.png');

const W = 1200;
const H = 628;

const TEAL = '#2dd4bf';
const TEAL_DIM = '#14b8a6';
const WHITE = '#ffffff';
const FOOTER = '#8fa3b0';
const FONT = "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif";

const SURFACES = ['Operational DNA', 'UI Operations', 'API Operations', 'Agent Operations'];

// A strand of the helix the homepage hero draws, flattened into two sine rails with rungs.
function helix() {
  const y0 = 470;
  const amp = 26;
  const period = 160;
  const x0 = 120;
  const x1 = W - 120;
  const pts = (phase) => {
    const out = [];
    for (let x = x0; x <= x1; x += 6)
      out.push(`${x},${(y0 + amp * Math.sin(((x - x0) / period) * 2 * Math.PI + phase)).toFixed(1)}`);
    return out.join(' ');
  };
  const rungs = [];
  for (let x = x0 + 20; x <= x1; x += 40) {
    const t = ((x - x0) / period) * 2 * Math.PI;
    const a = y0 + amp * Math.sin(t);
    const b = y0 + amp * Math.sin(t + Math.PI);
    rungs.push(
      `<line x1="${x}" y1="${a.toFixed(1)}" x2="${x}" y2="${b.toFixed(1)}" stroke="#1e3a44" stroke-width="2"/>`
    );
    rungs.push(`<circle cx="${x}" cy="${a.toFixed(1)}" r="4.5" fill="${TEAL_DIM}"/>`);
    rungs.push(`<circle cx="${x}" cy="${b.toFixed(1)}" r="4.5" fill="#5f7d8c"/>`);
  }
  return `
  ${rungs.join('\n  ')}
  <polyline points="${pts(0)}" fill="none" stroke="${TEAL}" stroke-width="2.5" opacity="0.85"/>
  <polyline points="${pts(Math.PI)}" fill="none" stroke="#5f7d8c" stroke-width="2.5" opacity="0.7"/>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="55%" cy="42%" r="78%">
      <stop offset="0%" stop-color="#0e2a31"/>
      <stop offset="55%" stop-color="#0a1c26"/>
      <stop offset="100%" stop-color="#060f18"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <text x="${W / 2}" y="110" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="700"
        letter-spacing="4" fill="${TEAL_DIM}">DNA CODES</text>
  <text x="${W / 2}" y="190" text-anchor="middle" font-family="${FONT}" font-size="64" font-weight="800"
        fill="${WHITE}">Your <tspan fill="${TEAL}">living</tspan> operating model</text>
  <text x="${W / 2}" y="245" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="500"
        fill="#5eead4">The future of work is humans + agents.</text>
  <line x1="${W / 2 - 30}" y1="275" x2="${W / 2 + 30}" y2="275" stroke="${TEAL_DIM}" stroke-width="3" stroke-linecap="round"/>

  <text x="${W / 2}" y="340" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="500"
        fill="${FOOTER}">${SURFACES.join('   ·   ')}</text>
${helix()}

  <text x="${W / 2}" y="585" text-anchor="middle" font-family="${FONT}" font-size="18" fill="${FOOTER}">dna.codes</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(OUT);
console.log('  default card → src/assets/images/default.png');
