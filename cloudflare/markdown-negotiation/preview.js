// Disk fetch used by `npm run check:ax` to stand in for GitHub Pages.
// `astro preview` drops user Vite plugins, so it cannot run this negotiator;
// the check starts its own server and calls negotiateMarkdown against dist/.
// The worker bundle does not import this file: it pulls in node:fs.

import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';

/**
 * @param {string} dist
 * @param {string} pathname
 * @returns {string | null}
 */
function resolveFile(dist, pathname) {
  const root = resolve(dist);
  const rel = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
  const candidates = [join(root, rel)];
  if (!rel.endsWith('.html') && !rel.includes('.')) {
    candidates.push(join(root, rel, 'index.html'), join(root, `${rel}.html`));
  }
  for (const file of candidates) {
    const resolved = resolve(file);
    if (!resolved.startsWith(root + sep) && resolved !== root) continue;
    if (existsSync(resolved) && statSync(resolved).isFile()) return resolved;
  }
  return null;
}

/**
 * @param {string} file
 * @returns {string}
 */
function contentType(file) {
  if (file.endsWith('.md')) return 'text/markdown; charset=utf-8';
  if (file.endsWith('.html')) return 'text/html; charset=utf-8';
  return 'application/octet-stream';
}

/**
 * @param {string} dist
 * @param {RequestInfo | URL} input
 * @param {RequestInit} [init]
 * @returns {Promise<Response>}
 */
export function diskFetch(dist, input, init) {
  const request = new Request(input, init);
  const file = resolveFile(dist, new URL(request.url).pathname);
  if (!file)
    return Promise.resolve(
      new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } })
    );
  return Promise.resolve(
    new Response(readFileSync(file), {
      status: 200,
      headers: { 'content-type': contentType(file), 'cache-control': 'public, max-age=600' },
    })
  );
}
