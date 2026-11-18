// Share cards for the genome pages and the template page, as SVG strings. Astro endpoints turn
// them into PNGs with sharp at build time, so a new genome gets its card with no hand-drawn input.
//
// Same palette and font stack as scripts/generate-*-og.mjs, so a link preview sits in the same
// family as the site's other cards. Relative imports only, so `node --test` can load this file.

import type { GenomeMapRole, GenomeMapVm } from './genome-map.ts';

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 628;
/** Levels of the role tree a card shows. A deeper tree does not fit. */
export const CARD_ROLE_DEPTH = 2;
/** Steps of the process a card shows. The rest are counted. */
export const CARD_STEPS = 6;
const CARD_ROLE_LINES = 7;

const TEAL = '#2dd4bf';
const TEAL_DIM = '#14b8a6';
const TEAL_SOFT = '#5eead4';
const WHITE = '#ffffff';
const MUTED = '#94a3b8';
const LINE = '#1e3a44';
const FONT = "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif";

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (v: unknown): string => String(v ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);

const clip = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

const text = (x: number, y: number, size: number, weight: number, fill: string, value: string, extra = '') =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}"${extra}>${esc(value)}</text>`;

const frame = (
  body: string
) => `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <defs>
    <radialGradient id="bg" cx="55%" cy="42%" r="78%">
      <stop offset="0%" stop-color="#0e2a31"/>
      <stop offset="55%" stop-color="#0a1c26"/>
      <stop offset="100%" stop-color="#060f18"/>
    </radialGradient>
  </defs>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bg)"/>
  ${body}
</svg>`;

export interface GenomeCardInput {
  key: string;
  orgName: string;
  industry: string;
  provenanceLabel: string;
  map: GenomeMapVm;
}

/** The roles to draw: the first CARD_ROLE_DEPTH levels, depth-first, capped to the space. */
function roleLines(roots: GenomeMapRole[]): { label: string; depth: number }[] {
  const out: { label: string; depth: number }[] = [];
  const walk = (nodes: GenomeMapRole[], depth: number) => {
    for (const n of nodes) {
      out.push({ label: n.label, depth });
      if (depth + 1 < CARD_ROLE_DEPTH) walk(n.children, depth + 1);
    }
  };
  walk(roots, 0);
  return out;
}

export function genomeCardSvg(input: GenomeCardInput): string {
  const process = input.map.processes[0];
  const steps = process?.steps ?? [];
  const shownSteps = steps.slice(0, CARD_STEPS);
  const moreSteps = steps.length - shownSteps.length;

  const roles = roleLines(input.map.roles);
  const shownRoles = roles.slice(0, CARD_ROLE_LINES);
  const moreRoles = roles.length - shownRoles.length;

  const left = 72;
  const right = 500;
  const top = 290;

  const roleSvg = shownRoles
    .map((r, i) => {
      const y = top + 34 + i * 34;
      const x = left + r.depth * 26;
      const marker =
        r.depth === 0
          ? `<circle cx="${x + 6}" cy="${y - 6}" r="6" fill="${TEAL}"/>`
          : `<path d="M${x - 14} ${y - 20} V${y - 6} H${x}" stroke="${LINE}" stroke-width="2" fill="none"/><circle cx="${x + 6}" cy="${y - 6}" r="5" fill="#0a1c26" stroke="${TEAL_DIM}" stroke-width="2"/>`;
      return `${marker}${text(x + 20, y, r.depth === 0 ? 20 : 18, r.depth === 0 ? 700 : 500, WHITE, clip(r.label, 24))}`;
    })
    .join('');

  const stepSvg = shownSteps
    .map((s, i) => {
      const y = top + 34 + i * 40;
      return `<circle cx="${right + 14}" cy="${y - 6}" r="14" fill="#0f3b3b" stroke="${TEAL_DIM}" stroke-width="2"/>
      ${text(right + 14, y, 14, 700, TEAL, String(i + 1), ' text-anchor="middle"')}
      ${text(right + 42, y, 19, 600, WHITE, clip(s.title, 36))}
      ${text(CARD_WIDTH - 72, y, 15, 500, TEAL_SOFT, clip(s.actorLabel, 24), ' text-anchor="end"')}`;
    })
    .join('');

  const subtitle = `${input.industry} · ${input.provenanceLabel}`;

  return frame(`
  ${text(left, 96, 15, 700, TEAL_DIM, 'DNA CODES · COMPANY GENOME', ' letter-spacing="4"')}
  ${text(left, 168, 56, 800, WHITE, clip(input.orgName, 32))}
  ${text(left, 214, 24, 500, TEAL_SOFT, subtitle)}
  <line x1="${left}" y1="246" x2="${CARD_WIDTH - 72}" y2="246" stroke="${LINE}" stroke-width="2"/>
  ${text(left, top, 13, 700, MUTED, 'ROLES', ' letter-spacing="3"')}
  ${roleSvg}
  ${moreRoles > 0 ? text(left, top + 34 + shownRoles.length * 34, 15, 500, MUTED, `+ ${moreRoles} more ${moreRoles === 1 ? 'role' : 'roles'}`) : ''}
  ${text(right, top, 13, 700, MUTED, clip(`PROCESS · ${(process?.label ?? '').toUpperCase()}`, 52), ' letter-spacing="3"')}
  ${stepSvg}
  ${moreSteps > 0 ? text(right + 42, top + 34 + shownSteps.length * 40, 15, 500, MUTED, `+ ${moreSteps} more ${moreSteps === 1 ? 'step' : 'steps'}`) : ''}
  ${text(CARD_WIDTH - 72, 96, 15, 500, MUTED, `dna.codes/playground/${input.key}`, ' text-anchor="end"')}
`);
}

/** The card for /operating-model-template: every company in the corpus. */
export function templateCardSvg(cards: { orgName: string; industry: string }[]): string {
  const cols = 2;
  const max = 6;
  const more = cards.length - max;
  const rows = cards
    .slice(0, max)
    .map((c, i) => {
      const x = 72 + (i % cols) * 540;
      const y = 330 + Math.floor(i / cols) * 74;
      return `<circle cx="${x + 7}" cy="${y - 7}" r="7" fill="${TEAL}"/>
      ${text(x + 26, y, 24, 700, WHITE, clip(c.orgName, 28))}
      ${text(x + 26, y + 26, 16, 500, TEAL_SOFT, clip(c.industry, 36))}`;
    })
    .join('');
  return frame(`
  ${text(72, 108, 15, 700, TEAL_DIM, 'DNA CODES', ' letter-spacing="4"')}
  ${text(72, 180, 56, 800, WHITE, 'Operating model templates')}
  ${text(72, 228, 24, 500, TEAL_SOFT, 'Open how a company works: roles, processes, rules and systems.')}
  <line x1="72" y1="262" x2="${CARD_WIDTH - 72}" y2="262" stroke="${LINE}" stroke-width="2"/>
  ${rows}
  ${more > 0 ? text(72, 590, 18, 500, MUTED, `+ ${more} more ${more === 1 ? 'company' : 'companies'} at dna.codes/operating-model-template`) : ''}
`);
}
