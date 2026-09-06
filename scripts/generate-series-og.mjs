// Generates the hero / OG card for every piece in The Future of Programming series.
//
// One card per post, all from the same template: the abstraction ladder with exactly one
// layer picked out in teal — the layer that post is about. The rest follow the rule the
// series argues for:
//
//   white  — the layer exists today (Intent, Code, Technology Stack, Machine)
//   grey   — the layer is missing today (Semantics, Ontology, Operational Model,
//            Execution Model), which is the whole thesis
//   teal   — this post's layer, whichever it is
//
// So the set reads as one image with a moving highlight rather than eight illustrations,
// and the greyness is doing argumentative work in every single card.
//
// There is no vector source for the original 1200x628 PNG — it was committed flat in
// 371fa74 — so this reconstructs it. Everything here renders through the same code path,
// which matters more for series coherence than matching the original pixel for pixel.
//
// Inter is not installed as a system font (it ships as .woff2 via @fontsource-variable,
// which fontconfig can't load), so librsvg falls back to Helvetica. That's close enough
// to Inter at these sizes and, more to the point, it's identical across all eight cards.
//
// Usage: node scripts/generate-series-og.mjs

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'images', 'series');

const W = 1200;
const H = 628;

const TEAL = '#2dd4bf';
const TEAL_DIM = '#14b8a6';
const WHITE = '#ffffff';
const GREY = '#64748b';
const FOOTER = '#8fa3b0';
const FONT = "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif";

// `exists` is the layer's status today, and it is the same in every card — only the
// highlight moves. Intent has always been written down (tickets, PRDs); Code and below
// have been solid for decades. The middle four are the gap.
const LAYERS = [
  { name: 'Intent', exists: true },
  { name: 'Semantics', exists: false },
  { name: 'Ontology', exists: false },
  { name: 'Operational Model', exists: false },
  { name: 'Execution Model', exists: false },
  { name: 'Code / Program', exists: true },
  { name: 'Technology Stack', exists: true },
  { name: 'Machine / Runtime', exists: true },
];

const ROW_Y = 223;
const ROW_STEP = 45;
const RAIL_L = 489;
const RAIL_R = 510;
const LABEL_X = 530;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function card({ subtitle, footer, highlight }) {
  const rows = LAYERS.map((layer, i) => {
    const y = ROW_Y + i * ROW_STEP;
    const isOn = layer.name === highlight;
    const fill = isOn ? TEAL : layer.exists ? WHITE : GREY;
    const weight = isOn ? 700 : layer.exists ? 500 : 400;
    const dot = isOn ? TEAL : layer.exists ? '#5f7d8c' : '#3d5060';
    const r = isOn ? 6.5 : 4.5;

    return `
      ${isOn ? `<rect x="${LABEL_X - 14}" y="${y - 19}" width="${Math.round(layer.name.length * 11.2) + 30}" height="32" rx="16" fill="${TEAL}" opacity="0.10"/>` : ''}
      <circle cx="${RAIL_L}" cy="${y - 4}" r="${r}" fill="${dot}"/>
      <circle cx="${RAIL_R}" cy="${y - 4}" r="${r}" fill="${dot}"/>
      <text x="${LABEL_X}" y="${y + 3}" font-family="${FONT}" font-size="21" font-weight="${weight}" fill="${fill}">${esc(layer.name)}</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="55%" cy="42%" r="78%">
      <stop offset="0%" stop-color="#0e2a31"/>
      <stop offset="55%" stop-color="#0a1c26"/>
      <stop offset="100%" stop-color="#060f18"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <text x="${W / 2}" y="79" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="700"
        letter-spacing="3.5" fill="${TEAL_DIM}">DNA CODES</text>
  <text x="${W / 2}" y="134" text-anchor="middle" font-family="${FONT}" font-size="46" font-weight="800"
        fill="${WHITE}">The Future of Programming</text>
  <text x="${W / 2}" y="173" text-anchor="middle" font-family="${FONT}" font-size="22" font-weight="500"
        fill="#5eead4">${esc(subtitle)}</text>
  <line x1="${W / 2 - 30}" y1="196" x2="${W / 2 + 30}" y2="196" stroke="${TEAL_DIM}" stroke-width="3" stroke-linecap="round"/>

  <line x1="${RAIL_L}" y1="205" x2="${RAIL_L}" y2="552" stroke="#1e3a44" stroke-width="2"/>
  <line x1="${RAIL_R}" y1="205" x2="${RAIL_R}" y2="552" stroke="#1e3a44" stroke-width="2"/>

  <text x="440" y="330" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="600"
        letter-spacing="2" fill="${TEAL_DIM}" transform="rotate(-90 440 330)">USUALLY INFERRED</text>
  <line x1="462" y1="216" x2="462" y2="430" stroke="${TEAL_DIM}" stroke-width="2" stroke-dasharray="5 6"/>
  <path d="M 457.5 429 L 462 437 L 466.5 429" fill="none" stroke="${TEAL_DIM}" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"/>

  ${rows}

  <text x="${W / 2}" y="592" text-anchor="middle" font-family="${FONT}" font-size="16" fill="${FOOTER}">${esc(footer)}</text>
</svg>`;
}

// One entry per post. `slug` is the output filename and matches the post's slug so the
// frontmatter `image:` line is obvious at a glance.
const CARDS = [
  {
    slug: 'future-of-programming-abstraction-layers',
    subtitle: 'The abstraction layers between intent and execution',
    footer: 'Today the middle four are optional. They should be standard.',
    highlight: 'Operational Model',
  },
  {
    slug: 'semantics-software-without-meaning',
    subtitle: 'Layer 02 · Semantics',
    footer: 'Every layer below inherits what this one means.',
    highlight: 'Semantics',
  },
  {
    slug: 'ontology-your-database-is-not-your-business-model',
    subtitle: 'Layer 03 · Ontology',
    footer: 'A schema says how you store things. Not what exists.',
    highlight: 'Ontology',
  },
  {
    slug: 'operational-model-the-missing-abstraction',
    subtitle: 'Layer 04 · Operational Model',
    footer: 'No standard place to say what a business is allowed to do.',
    highlight: 'Operational Model',
  },
  {
    slug: 'execution-model-one-operation-many-surfaces',
    subtitle: 'Layer 05 · Execution Model',
    footer: 'One operation. Four surfaces. Written four times.',
    highlight: 'Execution Model',
  },
  {
    slug: 'code-is-moving-down-the-stack',
    subtitle: 'Layer 06 · Code',
    footer: "Code doesn't vanish. It stops being where decisions get made.",
    highlight: 'Code / Program',
  },
  {
    slug: 'you-choose-your-tech-stack-too-early',
    subtitle: 'Layer 07 · Technology Stack',
    footer: 'Chosen first, before anyone said what the system does.',
    highlight: 'Technology Stack',
  },
  {
    slug: 'the-best-abstraction-layer-is-invisible',
    subtitle: 'Layer 08 · Machine / Runtime',
    footer: 'The handoff got engineered so well it went invisible.',
    highlight: 'Machine / Runtime',
  },
];

await mkdir(OUT_DIR, { recursive: true });

for (const spec of CARDS) {
  const file = join(OUT_DIR, `${spec.slug}.png`);
  await sharp(Buffer.from(card(spec)))
    .png({ compressionLevel: 9 })
    .toFile(file);
  console.log(`  ${spec.highlight.padEnd(18)} → src/assets/images/series/${spec.slug}.png`);
}

console.log(`\n${CARDS.length} cards written.`);
