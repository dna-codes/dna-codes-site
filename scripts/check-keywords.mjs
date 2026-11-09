// Fails the build when a keyword assignment cannot be true of the site that just built.
// Warnings are judgement calls (design D5) and do not fail the build.
//
// Usage: node scripts/check-keywords.mjs
// Run after `astro build`. Reads src/data/seo/keywords.json, post frontmatter, and dist/.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yaml from 'js-yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SUFFIX = ' — DNA Codes';
const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 155;
const STALE_DAYS = 180;

// Folded into a heading on the page that owns the phrase. The search-landing spec
// names these three; a pivot that moves the row still has to keep the heading.
const HEADING_KEYWORDS = [
  'sop software for small business',
  'how to build an operating model',
  'business process modeling',
];

/**
 * @param {string} route
 * @returns {string | undefined}
 */
export function htmlPathFor(route, dist = join(root, 'dist')) {
  const rel = route.replace(/^\//, '').replace(/\/$/, '');
  const candidates = [join(dist, rel, 'index.html'), join(dist, `${rel}.html`)];
  return candidates.find((path) => existsSync(path));
}

/**
 * @param {string} html
 * @returns {string[]}
 */
export function headings(html) {
  return [...html.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/gi)].map((match) =>
    match[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z#0-9]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
  );
}

/**
 * @param {string} dir
 * @returns {{ slug: string, targetKeyword: string | undefined }[]}
 */
export function readPosts(dir = join(root, 'src/data/post')) {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md') || name.endsWith('.mdx'))
    .map((name) => {
      const raw = readFileSync(join(dir, name), 'utf8');
      const front = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      /** @type {Record<string, unknown>} */
      const data = front ? yaml.load(front[1]) || {} : {};
      return {
        slug: name.replace(/\.mdx?$/, ''),
        targetKeyword: typeof data.targetKeyword === 'string' ? data.targetKeyword : undefined,
      };
    });
}

/**
 * @param {object} input
 * @param {Record<string, unknown>[]} input.keywords
 * @param {{ slug: string, targetKeyword: string | undefined }[]} input.posts
 * @param {(route: string) => string | undefined} input.htmlFor
 * @param {(route: string) => string} [input.readHtml]
 * @param {Date} [input.today]
 */
export function evaluate({ keywords, posts, htmlFor, readHtml, today = new Date() }) {
  /** @type {string[]} */
  const failures = [];
  /** @type {string[]} */
  const warnings = [];
  const fail = (message) => failures.push(message);
  const warn = (message) => warnings.push(message);

  const primaries = keywords.filter((row) => row.role === 'primary');
  const assigned = keywords.filter((row) => row.role === 'primary' || row.role === 'secondary');

  const byPage = new Map();
  const byKeyword = new Map();
  for (const row of primaries) {
    const page = String(row.page ?? '');
    const keyword = String(row.keyword ?? '');
    if (!byPage.has(page)) byPage.set(page, []);
    byPage.get(page).push(row.id);
    if (!byKeyword.has(keyword)) byKeyword.set(keyword, []);
    byKeyword.get(keyword).push(row.id);
    if (!row.title || !row.description) fail(`${row.id}: a primary row needs a title and a description`);
    if (typeof row.title === 'string' && row.title.length + SUFFIX.length > TITLE_LIMIT) {
      fail(
        `${row.id}: title is ${row.title.length + SUFFIX.length} characters with the site suffix (limit ${TITLE_LIMIT})`
      );
    }
    if (typeof row.description === 'string' && row.description.length > DESCRIPTION_LIMIT) {
      fail(`${row.id}: description is ${row.description.length} characters (limit ${DESCRIPTION_LIMIT})`);
    }
    if (
      typeof row.title === 'string' &&
      typeof row.keyword === 'string' &&
      !row.title.toLowerCase().includes(row.keyword.toLowerCase())
    ) {
      warn(`${row.id}: title does not contain "${row.keyword}"`);
    }
    if (typeof row.difficulty === 'number' && row.difficulty > 40) {
      warn(`${row.id}: difficulty ${row.difficulty} is over 40`);
    }
  }

  for (const [page, ids] of byPage) {
    if (ids.length > 1) fail(`two primary rows name ${page || '(no page)'}: ${ids.join(', ')}`);
  }
  for (const [keyword, ids] of byKeyword) {
    if (ids.length > 1) fail(`two primary rows name the keyword "${keyword}": ${ids.join(', ')}`);
  }

  for (const row of assigned) {
    if (!row.page) {
      fail(`${row.id}: a ${row.role} row must name a page`);
      continue;
    }
    if (!htmlFor(String(row.page))) fail(`${row.id}: ${row.page} has no built HTML in dist/`);
  }

  for (const phrase of HEADING_KEYWORDS) {
    const row = keywords.find((item) => item.keyword === phrase);
    if (!row) {
      fail(`missing registry row for folded keyword "${phrase}"`);
      continue;
    }
    if (row.role !== 'secondary') fail(`${row.id}: "${phrase}" must stay a secondary keyword`);
    const file = row.page ? htmlFor(String(row.page)) : undefined;
    if (!file || !readHtml) continue;
    const found = headings(readHtml(file)).some((text) => text.includes(phrase));
    if (!found) fail(`${row.id}: ${row.page} has no heading containing "${phrase}"`);
  }

  const primaryById = new Map(primaries.map((row) => [row.id, row]));
  for (const post of posts) {
    if (!post.targetKeyword) continue;
    const row = primaryById.get(post.targetKeyword);
    const url = `/blog/${post.slug}`;
    if (!row) {
      fail(`${post.slug}: targetKeyword "${post.targetKeyword}" is not a primary row`);
      continue;
    }
    if (row.page !== url)
      fail(`${post.slug}: targetKeyword "${post.targetKeyword}" is owned by ${row.page}, not ${url}`);
  }

  const cutoff = today.getTime() - STALE_DAYS * 24 * 60 * 60 * 1000;
  for (const row of primaries) {
    if (typeof row.measuredAt !== 'string') continue;
    const measured = Date.parse(row.measuredAt);
    if (Number.isFinite(measured) && measured < cutoff)
      warn(`${row.id}: measured ${row.measuredAt}, older than ${STALE_DAYS} days`);
  }

  return { failures, warnings };
}

function main() {
  const keywords = JSON.parse(readFileSync(join(root, 'src/data/seo/keywords.json'), 'utf8'));
  const posts = readPosts();
  const { failures, warnings } = evaluate({
    keywords,
    posts,
    htmlFor: (route) => htmlPathFor(route),
    readHtml: (file) => readFileSync(file, 'utf8'),
  });
  for (const warning of warnings) console.warn(`check:keywords warning: ${warning}`);
  if (failures.length) {
    for (const failure of failures) console.error(`check:keywords: ${failure}`);
    process.exit(1);
  }
  console.log(`check:keywords: ${keywords.length} rows, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invokedDirectly) main();
