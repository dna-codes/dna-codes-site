// Writes dist/index.md from the homepage that `astro build` just emitted, then checks
// that every content link in that HTML survives in the Markdown. AX Check compares the
// two representations once the homepage answers Accept: text/markdown; a hand-written
// summary would drop a nav link the next time the header changes.
//
// Coverage panels are marked data-markdown-omit. They are the card's picture: row chrome
// from a sample API and a sample agent. The card's own sentences stay. A <br> becomes a
// space, because the minifier deletes the whitespace around it and textContent would
// join the two lines ("livingoperating", "agents.DNA").

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://dna.codes';

const ASSET = /\.(png|jpe?g|gif|webp|svg|css|js|mjs|map|woff2?|ico|xml|json|txt|md)$/i;

/**
 * @param {string} value
 * @returns {string}
 */
export function clean(value) {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {string} value
 * @returns {string}
 */
function linkLabel(value) {
  return clean(value).replace(/[[\]]/g, '');
}

/**
 * Same-origin page link as an absolute URL, or an external http(s) URL.
 * Assets, /index.md and non-http schemes are not content links.
 *
 * @param {string | null} href
 * @returns {string | null}
 */
export function contentHref(href) {
  if (!href) return null;
  const trimmed = href.trim();
  if (trimmed.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(trimmed)) return null;
  let url;
  try {
    url = new URL(trimmed, ORIGIN);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (url.origin !== ORIGIN) return url.href;
  if (url.pathname.startsWith('/_astro/') || ASSET.test(url.pathname)) return null;
  const pathname = url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '');
  return `${ORIGIN}${pathname === '/' ? '/' : pathname}${url.search}`;
}

/**
 * @param {string} href
 * @returns {string}
 */
export function linkKey(href) {
  const url = new URL(href);
  if (url.origin !== ORIGIN) return url.href;
  return url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '');
}

/**
 * @param {string} html
 * @returns {Map<string, { href: string, label: string }>}
 */
export function contentLinks(html) {
  const { document } = new JSDOM(html).window;
  /** @type {Map<string, { href: string, label: string }>} */
  const byKey = new Map();
  for (const anchor of document.querySelectorAll('a[href]')) {
    const href = contentHref(anchor.getAttribute('href'));
    if (!href) continue;
    const key = linkKey(href);
    const label = linkLabel(anchor.getAttribute('aria-label') || anchor.textContent || '');
    const prev = byKey.get(key);
    if (!prev) byKey.set(key, { href, label });
    else if (label && (!prev.label || label.length < prev.label.length)) byKey.set(key, { href, label });
  }
  return byKey;
}

/**
 * @param {string} markdown
 * @returns {Set<string>}
 */
export function markdownLinkKeys(markdown) {
  const keys = new Set();
  for (const match of markdown.matchAll(/\]\(([^)\s]+)\)/g)) {
    const href = contentHref(match[1]);
    if (href) keys.add(linkKey(href));
  }
  return keys;
}

/**
 * Visible text, with a <br> counted as a space. The HTML minifier strips whitespace on
 * either side of a break, so textContent of "agents.<br>DNA" is "agents.DNA".
 *
 * @param {Node} node
 * @returns {string}
 */
function textOf(node) {
  if (node.nodeType === 3) return node.textContent || '';
  if (node.nodeType !== 1) return '';
  const el = /** @type {Element} */ (node);
  const tag = el.tagName.toLowerCase();
  if (tag === 'br') return ' ';
  if (
    tag === 'script' ||
    tag === 'style' ||
    tag === 'svg' ||
    tag === 'noscript' ||
    el.hasAttribute('data-markdown-omit')
  ) {
    return '';
  }
  let out = '';
  for (const child of el.childNodes) out += textOf(child);
  return out;
}

/**
 * @param {Element} node
 * @param {string[]} chunks
 */
function renderBlocks(node, chunks) {
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      const text = clean(child.textContent || '');
      if (text) chunks.push(text);
      continue;
    }
    if (child.nodeType !== 1) continue;
    const el = /** @type {Element} */ (child);
    const tag = el.tagName.toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'svg' || tag === 'noscript' || tag === 'template') continue;
    if (el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('data-markdown-omit')) continue;
    if (/^h[1-3]$/.test(tag)) {
      const text = linkLabel(textOf(el));
      if (!text) continue;
      const href = contentHref(el.closest('a')?.getAttribute('href') || null);
      const hashes = '#'.repeat(Number(tag[1]));
      chunks.push(href ? `${hashes} [${text}](${href})` : `${hashes} ${text}`);
      continue;
    }
    if (tag === 'p') {
      const text = clean(textOf(el));
      if (text) chunks.push(text);
      continue;
    }
    if (tag === 'img') {
      const alt = clean(el.getAttribute('alt') || '');
      if (alt) chunks.push(alt);
      continue;
    }
    if (tag === 'a' && el.querySelector('h1, h2, h3')) {
      const inner = [];
      renderBlocks(el, inner);
      const href = contentHref(el.getAttribute('href'));
      const last = inner.at(-1);
      if (href && last && !last.startsWith('#') && !last.includes('](') && last.length < 80) {
        inner[inner.length - 1] = `[${linkLabel(last)}](${href})`;
      } else if (href && !inner.some((chunk) => chunk.includes(href))) {
        const heading = el.querySelector('h1, h2, h3');
        const name = linkLabel(heading ? textOf(heading) : '') || 'Open';
        inner.push(`[${name}](${href})`);
      }
      chunks.push(...inner);
      continue;
    }
    if (tag === 'a') {
      const href = contentHref(el.getAttribute('href'));
      const label = linkLabel(el.getAttribute('aria-label') || textOf(el));
      if (href && label) chunks.push(`[${label}](${href})`);
      else if (label) chunks.push(label);
      continue;
    }
    renderBlocks(el, chunks);
  }
}

/**
 * @param {string[]} chunks
 * @returns {string[]}
 */
function polish(chunks) {
  const firstHeading = chunks.findIndex((chunk) => chunk.startsWith('# ') || chunk.startsWith('#['));
  const ordered =
    firstHeading > 0
      ? [chunks[firstHeading], ...chunks.slice(0, firstHeading), ...chunks.slice(firstHeading + 1)]
      : chunks;
  const out = [];
  for (const chunk of ordered) {
    const text = chunk.trim();
    if (!text || out.at(-1) === text) continue;
    out.push(text);
  }
  return out;
}

/**
 * @param {string} html
 * @returns {string}
 */
export function homepageMarkdown(html) {
  const { document } = new JSDOM(html).window;
  const main = document.querySelector('main');
  if (!main) throw new Error('homepage has no <main>');

  const chunks = [];
  renderBlocks(main, chunks);
  const body = polish(chunks);
  if (!body.some((chunk) => chunk.startsWith('# '))) throw new Error('homepage Markdown has no H1');

  const present = markdownLinkKeys(body.join('\n\n'));
  const extras = [];
  for (const [key, { href, label }] of contentLinks(html)) {
    if (present.has(key)) continue;
    extras.push(`- [${label || key}](${href})`);
    present.add(key);
  }

  const parts = [body.join('\n\n')];
  if (extras.length) parts.push(`## Also on this site\n\n${extras.join('\n')}`);
  parts.push(
    [
      `## For agents`,
      ``,
      `- [llms.txt](${ORIGIN}/llms.txt): index of docs, products, genomes, and the pages below.`,
      `- [SOP Software](${ORIGIN}/sop-software): procedures that stay tied to the work, including a small team that has outgrown a wiki. The page shows the procedure as a running SOP.`,
      `- [Target Operating Model](${ORIGIN}/operating-model): roles, processes, rules, and systems on one board, plus an ungated template.`,
      `- [Business Process Software](${ORIGIN}/business-process-software): living business processes, as a diagram of steps, roles, and work. DNA is not a BPM engine.`,
      `- [Business Process Management: The Copies Drift](${ORIGIN}/blog/business-process-management): three copies of one process. A step, a role, and a rule are what holds. The diagram is the copy that drifts.`,
      `- [Business Process Modeling Notation: A Drawing](${ORIGIN}/blog/business-process-modeling): the notation draws the process. Written as roles, steps, and a rule, the same process is what the software can read.`,
    ].join('\n')
  );

  const footerNote = clean(document.querySelector('footer .mr-4')?.textContent || '');
  if (footerNote) parts.push(footerNote);

  return `${parts.join('\n\n')}\n`;
}

/**
 * @param {string} html
 * @param {string} markdown
 * @returns {string[]}
 */
export function missingContentLinks(html, markdown) {
  const present = markdownLinkKeys(markdown);
  const missing = [];
  for (const key of contentLinks(html).keys()) {
    if (!present.has(key)) missing.push(key);
  }
  return missing;
}

function emit() {
  const htmlPath = join(root, 'dist', 'index.html');
  const html = readFileSync(htmlPath, 'utf8');
  const markdown = homepageMarkdown(html);
  const missing = missingContentLinks(html, markdown);
  if (missing.length) {
    throw new Error(`homepage Markdown drops content links: ${missing.join(', ')}`);
  }
  if (!markdown.startsWith('# ') || /<!doctype|<html\b|<head\b|<body\b/i.test(markdown)) {
    throw new Error('homepage Markdown is empty or still HTML');
  }
  if (Buffer.byteLength(markdown) >= Buffer.byteLength(html)) {
    throw new Error('homepage Markdown is not smaller than the HTML');
  }
  writeFileSync(join(root, 'dist', 'index.md'), markdown);
}

const isMain = process.argv[1] && resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1]);
if (isMain) {
  try {
    emit();
  } catch (error) {
    console.error(`emit-homepage-markdown: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}
