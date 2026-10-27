// Agent-readiness gate for the built site. Run after `npm run build`: `npm run check:agentic`.
//
// is-agentic.com scores the live site, which means it can only tell us about a regression after
// it has shipped, and it serves a cached report rather than rescanning on demand. This checks
// the same signals against dist/ on every pull request instead, for the checks a static site
// on GitHub Pages can actually pass:
//
//   metadata completeness   canonical, <html lang>, og:image, og:type on every page
//   JSON-LD / Organization  parseable structured data on the homepage naming the organization
//   llms.txt                exists, llmstxt.org shape, a when-to-use section, links resolve
//   trust anchor pages      /about, /contact and /privacy with at least 500 characters of copy
//
// The checks that need a server (Markdown content negotiation, Markdown 404 bodies) or an API
// the site does not have are out of reach for a static site; `npx is-agentic dna.codes` shows
// the full live report.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ORIGIN = 'https://dna.codes';
const TRUST_PAGES = ['about', 'contact', 'privacy'];
const TRUST_MIN_CHARS = 500;

if (!existsSync(join(dist, 'index.html'))) {
  console.error('agentic-check: dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

// Anything under public/ is copied into dist/ verbatim and is not rendered by our layouts
// (the talk companion app, the CMS admin), so the metadata rules do not apply to it.
const publicDir = join(root, 'public');
const passthrough = readdirSync(publicDir).filter((name) => statSync(join(publicDir, name)).isDirectory());

const failures = [];
const fail = (check, detail) => failures.push({ check, detail });

const htmlFiles = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (dir === dist && (passthrough.includes(entry.name) || entry.name === '_astro')) continue;
      walk(p);
    } else if (entry.name.endsWith('.html')) htmlFiles.push(p);
  }
})(dist);

const attr = (tag, name) => tag.match(new RegExp(`\\b${name}=["']?([^"'\\s>]+)`, 'i'))?.[1];
const metaContent = (html, property) => {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (attr(tag, 'property') === property || attr(tag, 'name') === property) return attr(tag, 'content');
  }
  return undefined;
};
const routeOf = (file) =>
  '/' +
  relative(dist, file)
    .split(sep)
    .join('/')
    .replace(/(^|\/)index\.html$/, '')
    .replace(/\.html$/, '');
const visibleText = (html) =>
  (html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? html)
    .replace(/<(script|style|noscript|svg|form)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Metadata completeness, on every rendered page rather than only the homepage: Metadata.astro
// drops every Open Graph tag when the default image is missing, so one deleted file empties
// them sitewide without any build error.
let pages = 0;
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  if (/http-equiv=["']?refresh/i.test(html)) continue;
  pages++;
  const route = routeOf(file) || '/';
  const missing = [];
  if (!/<html\b[^>]*\blang=["']?[a-z]/i.test(html)) missing.push('<html lang>');
  if (!/<link\b[^>]*rel=["']?canonical/i.test(html)) missing.push('canonical');
  if (!metaContent(html, 'og:image')) missing.push('og:image');
  if (!metaContent(html, 'og:type')) missing.push('og:type');
  if (missing.length) fail('metadata', `${route} is missing ${missing.join(', ')}`);
}

// JSON-LD on the homepage.
{
  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  const blocks = [...html.matchAll(/<script\b[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)];
  if (!blocks.length) fail('json-ld', 'homepage has no application/ld+json block');
  const nodes = [];
  for (const [, json] of blocks) {
    try {
      const doc = JSON.parse(json);
      for (const d of [doc].flat()) nodes.push(...(d['@graph'] ?? [d]));
    } catch (e) {
      fail('json-ld', `homepage JSON-LD does not parse: ${e.message}`);
    }
  }
  const org = nodes.find((n) => [n['@type']].flat().includes('Organization'));
  if (blocks.length && !org) fail('json-ld', 'homepage JSON-LD has no Organization node');
  if (org) {
    for (const key of ['name', 'url', 'logo', 'description', 'contactPoint']) {
      if (!org[key]) fail('json-ld', `Organization is missing ${key}`);
    }
  }
}

// llms.txt
{
  const file = join(dist, 'llms.txt');
  if (!existsSync(file)) fail('llms-txt', 'dist/llms.txt does not exist');
  else {
    const text = readFileSync(file, 'utf8');
    if (!/^# \S/.test(text)) fail('llms-txt', 'must open with an H1 naming the site');
    if (!/^> \S/m.test(text)) fail('llms-txt', 'needs a "> " blockquote summary');
    if (!/^## When to use/im.test(text)) fail('llms-txt', 'needs a "## When to use" section for agents');
    for (const [, href] of text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
      if (!href.startsWith(ORIGIN)) continue;
      const path = new URL(href).pathname.replace(/\/$/, '');
      const candidates = [join(dist, path), join(dist, path, 'index.html'), join(dist, `${path}.html`)];
      if (!candidates.some((c) => existsSync(c) && (statSync(c).isFile() || existsSync(join(c, 'index.html')))))
        fail('llms-txt', `links to ${href}, which is not in the build`);
    }
  }
}

// Trust anchor pages.
for (const slug of TRUST_PAGES) {
  const file = join(dist, slug, 'index.html');
  if (!existsSync(file)) {
    fail('trust-pages', `/${slug} does not exist`);
    continue;
  }
  const chars = visibleText(readFileSync(file, 'utf8')).length;
  if (chars < TRUST_MIN_CHARS)
    fail('trust-pages', `/${slug} has ${chars} characters of copy, needs ${TRUST_MIN_CHARS}`);
}

if (failures.length) {
  console.error(`agentic-check: ${failures.length} problem(s) across ${pages} pages\n`);
  for (const { check, detail } of failures) console.error(`  ✗ [${check}] ${detail}`);
  console.error('\nThese are the static signals is-agentic.com scores. See AGENTS.md, "Agent readiness".');
  process.exit(1);
}

console.log(`agentic-check: ${pages} pages, homepage JSON-LD, llms.txt and trust pages all pass.`);
