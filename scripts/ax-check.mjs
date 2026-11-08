// Pull-request gate for the AX Check signal this site can own.
//
// AX Check (https://www.ax-check.com/dna.codes) asks the homepage for text/markdown and
// fails when the response is still text/html. The grade is provisional and technical
// only; coding sessions are separate evidence and this script does not start them.
// is-agentic.com's static signals stay in scripts/agentic-check.mjs.
//
// GitHub Pages cannot negotiate Accept. What ships in dist/ is the Markdown sibling and
// the <link rel="alternate">. What answers the header in production is the Cloudflare
// worker in cloudflare/markdown-negotiation/, and this exercises that same function
// against dist/ over HTTP. A green run here is not a green run against https://dna.codes
// until that worker is deployed.

import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { negotiateMarkdown, prefersMarkdown } from '../cloudflare/markdown-negotiation/negotiate.js';
import { diskFetch } from '../cloudflare/markdown-negotiation/preview.js';
import { missingContentLinks } from './emit-homepage-markdown.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const failures = [];
const fail = (detail) => failures.push(detail);

if (!existsSync(join(dist, 'index.html')) || !existsSync(join(dist, 'index.md'))) {
  console.error('ax-check: dist/index.html or dist/index.md is missing. Run `npm run build` first.');
  process.exit(1);
}

const html = readFileSync(join(dist, 'index.html'), 'utf8');
const markdown = readFileSync(join(dist, 'index.md'), 'utf8');

if (!markdown.startsWith('# ')) fail('dist/index.md must open with an H1');
if (/<!doctype|<html\b|<head\b|<body\b/i.test(markdown)) fail('dist/index.md still looks like an HTML document');
if (Buffer.byteLength(markdown) >= Buffer.byteLength(html)) fail('dist/index.md is not smaller than dist/index.html');
const markdownAlternate = [...html.matchAll(/<link\b[^>]*>/gi)].some((match) => {
  const tag = match[0];
  return (
    /rel=["']alternate["']/i.test(tag) &&
    /type=["']text\/markdown["']/i.test(tag) &&
    /href=["']\/index\.md["']/i.test(tag)
  );
});
if (!markdownAlternate) {
  fail('homepage HTML does not advertise <link rel="alternate" type="text/markdown" href="/index.md">');
}
for (const path of missingContentLinks(html, markdown)) fail(`Markdown drops ${path}`);

const preferences = [
  ['text/markdown', true],
  ['text/markdown, text/html;q=0.9, */*;q=0.8', true],
  ['text/markdown, text/html, */*', true],
  ['text/markdown; charset=utf-8', true],
  ['text/html;q=0.5, text/markdown;q=0.8', true],
  ['text/html, text/markdown', false],
  ['text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', false],
  ['*/*', false],
  ['', false],
  ['text/markdown;q=0', false],
];
for (const [header, expected] of preferences) {
  if (prefersMarkdown(header) !== expected) fail(`prefersMarkdown(${JSON.stringify(header)}) should be ${expected}`);
}

const fetchFromDist = (input, init) => diskFetch(dist, input, init);

const server = createServer(async (req, res) => {
  try {
    const request = new Request(`https://dna.codes${req.url}`, {
      method: req.method,
      headers: req.headers.accept ? { accept: String(req.headers.accept) } : undefined,
    });
    const response = await negotiateMarkdown(request, fetchFromDist);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    res.statusCode = 500;
    res.end(error instanceof Error ? error.message : 'negotiation failed');
  }
});

await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
const { port } = /** @type {import('node:net').AddressInfo} */ (server.address());

try {
  const markdownResponse = await fetch(`http://127.0.0.1:${port}/`, { headers: { accept: 'text/markdown' } });
  const markdownType = markdownResponse.headers.get('content-type') || '';
  const markdownVary = markdownResponse.headers.get('vary') || '';
  const markdownBody = await markdownResponse.text();
  if (markdownResponse.status !== 200) fail(`Accept: text/markdown returned ${markdownResponse.status}`);
  if (!markdownType.startsWith('text/markdown'))
    fail(`Accept: text/markdown returned ${markdownType || 'no content-type'}`);
  if (!/(^|,)\s*accept\s*(,|$)/i.test(markdownVary) && !/\*/.test(markdownVary)) {
    fail(`Accept: text/markdown did not vary on Accept (vary: ${markdownVary || 'absent'})`);
  }
  if (markdownBody !== markdown) fail('Accept: text/markdown body is not dist/index.md');

  const browserAccept = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
  const htmlResponse = await fetch(`http://127.0.0.1:${port}/`, { headers: { accept: browserAccept } });
  const htmlType = htmlResponse.headers.get('content-type') || '';
  const htmlVary = htmlResponse.headers.get('vary') || '';
  const htmlBody = await htmlResponse.text();
  if (!htmlType.startsWith('text/html')) fail(`a browser Accept returned ${htmlType || 'no content-type'}`);
  if (!htmlBody.includes('<html')) fail('a browser Accept did not return the homepage HTML');
  if (!/(^|,)\s*accept\s*(,|$)/i.test(htmlVary)) fail('the HTML representation does not vary on Accept');

  const direct = await fetch(`http://127.0.0.1:${port}/index.md`, { headers: { accept: browserAccept } });
  if (!(direct.headers.get('content-type') || '').startsWith('text/markdown')) {
    fail('/index.md was not served as text/markdown');
  }

  const other = await fetch(`http://127.0.0.1:${port}/pricing`, { headers: { accept: 'text/markdown' } });
  if ((other.headers.get('content-type') || '').includes('text/markdown')) {
    fail('/pricing was negotiated; only the homepage has a Markdown sibling');
  }
} finally {
  await new Promise((resolveClose) => server.close(resolveClose));
}

if (failures.length) {
  console.error(`ax-check: ${failures.length} problem(s)\n`);
  for (const detail of failures) console.error(`  ✗ ${detail}`);
  console.error('\nHomepage Markdown negotiation. See AGENTS.md, "Agent readiness".');
  process.exit(1);
}

console.log('ax-check: homepage Markdown, alternate link, and Accept negotiation pass.');
