// Hero / OG card for Business Process Modeling with DNA.
//
// Same palette and renderer as the series cards and the site default, so a link
// preview sits in the same family. This post is not a layer of that ladder, so the
// picture is the process the post models: six steps, and the rule on the way into
// the one where stock would otherwise move early.
//
// Usage: node scripts/generate-modeling-og.mjs

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'assets',
  'images',
  'posts',
  'business-process-modeling.png'
);

const W = 1200;
const H = 628;

const TEAL = '#2dd4bf';
const TEAL_DIM = '#14b8a6';
const WHITE = '#ffffff';
const FONT = "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif";

const STEPS = ['Receive', 'Verify', 'Reserve', 'Pack', 'Dispatch', 'Confirm'];
const HIGHLIGHT = 2;

const svg = () => {
  const x0 = 150;
  const x1 = W - 150;
  const y = 378;
  const xs = STEPS.map((_, i) => x0 + ((x1 - x0) * i) / (STEPS.length - 1));
  const nodes = STEPS.map((name, i) => {
    const x = xs[i];
    const on = i === HIGHLIGHT;
    const label = on
      ? `<rect x="${x - 62}" y="${y + 28}" width="124" height="32" rx="16" fill="${TEAL}" opacity="0.12"/>`
      : '';
    return `
      ${label}
      <circle cx="${x}" cy="${y}" r="${on ? 16 : 11}" fill="${on ? TEAL : '#0a1c26'}" stroke="${on ? TEAL : '#5f7d8c'}" stroke-width="3"/>
      <text x="${x}" y="${y + 50}" text-anchor="middle" font-family="${FONT}" font-size="18" font-weight="${on ? 700 : 500}" fill="${on ? TEAL : WHITE}">${name}</text>`;
  }).join('');

  const ruleX = (xs[1] + xs[2]) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="55%" cy="42%" r="78%">
      <stop offset="0%" stop-color="#0e2a31"/>
      <stop offset="55%" stop-color="#0a1c26"/>
      <stop offset="100%" stop-color="#060f18"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <text x="${W / 2}" y="108" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="700" letter-spacing="4" fill="${TEAL_DIM}">DNA CODES</text>
  <text x="${W / 2}" y="188" text-anchor="middle" font-family="${FONT}" font-size="52" font-weight="800" fill="${WHITE}">Business Process Modeling</text>
  <text x="${W / 2}" y="238" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="500" fill="#5eead4">with DNA</text>
  <line x1="${W / 2 - 30}" y1="268" x2="${W / 2 + 30}" y2="268" stroke="${TEAL_DIM}" stroke-width="3" stroke-linecap="round"/>
  <line x1="${xs[0]}" y1="${y}" x2="${xs[xs.length - 1]}" y2="${y}" stroke="#1e3a44" stroke-width="3"/>
  <g transform="translate(${ruleX} ${y}) rotate(45)">
    <rect x="-9" y="-9" width="18" height="18" fill="#0a1c26" stroke="${TEAL}" stroke-width="2.5"/>
  </g>
  <text x="${ruleX}" y="${y - 28}" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="600" fill="${TEAL}">Payment before stock</text>
  ${nodes}
</svg>`;
};

await mkdir(dirname(OUT), { recursive: true });
await sharp(Buffer.from(svg())).png({ compressionLevel: 9 }).toFile(OUT);
console.log('wrote src/assets/images/posts/business-process-modeling.png');
