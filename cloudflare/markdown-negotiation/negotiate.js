// Accept negotiation for the homepage.
//
// GitHub Pages serves the file it has for a path and ignores Accept. Cloudflare already
// proxies dna.codes, so the worker on the apex route can choose the representation: a
// browser asks for text/html first and gets the page, a client that prefers text/markdown
// gets dist/index.md, served as text/markdown. Vary: Accept keeps those two responses
// from being stored as one cache entry.
//
// Only an explicit text/markdown beats text/html. A browser sends text/html at q=1 and
// */* at q=0.8; treating */* as a request for Markdown would hand the HTML URL to people.

/**
 * @param {string | null | undefined} header
 * @returns {boolean}
 */
export function prefersMarkdown(header) {
  if (!header) return false;

  const parts = header
    .split(',')
    .map((part, index) => {
      const [typeRaw, ...params] = part
        .trim()
        .toLowerCase()
        .split(';')
        .map((piece) => piece.trim())
        .filter(Boolean);
      if (!typeRaw) return null;
      const qParam = params.find((param) => param.startsWith('q='));
      const q = qParam ? Number(qParam.slice(2)) : 1;
      return { type: typeRaw, q: Number.isFinite(q) ? q : 0, index };
    })
    .filter((part) => part !== null);

  const markdown = parts.find((part) => part.type === 'text/markdown');
  if (!markdown || markdown.q <= 0) return false;

  const html = parts.find((part) => part.type === 'text/html');
  if (!html || html.q <= 0) return true;
  if (markdown.q !== html.q) return markdown.q > html.q;
  return markdown.index < html.index;
}

/**
 * Markdown sibling for a document path, or null when this URL is not negotiated.
 * Query and hash are not part of a URL pathname; callers pass pathname only.
 *
 * @param {string} pathname
 * @returns {string | null}
 */
export function markdownSibling(pathname) {
  if (pathname === '/' || pathname === '') return '/index.md';
  return null;
}

/**
 * @param {Headers} headers
 */
function varyAccept(headers) {
  const parts = (headers.get('vary') || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.some((part) => part === '*' || part.toLowerCase() === 'accept')) parts.push('Accept');
  headers.set('vary', parts.join(', '));
}

/**
 * @param {Response} response
 * @returns {Response}
 */
function withVaryAccept(response) {
  const headers = new Headers(response.headers);
  varyAccept(headers);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

/**
 * @param {Request} request
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<Response>}
 */
export async function negotiateMarkdown(request, fetchImpl = fetch) {
  const method = request.method;
  const url = new URL(request.url);
  const negotiable = markdownSibling(url.pathname) !== null;
  if (!negotiable || (method !== 'GET' && method !== 'HEAD')) return fetchImpl(request);

  const fallthrough = async () => withVaryAccept(await fetchImpl(request));
  if (!prefersMarkdown(request.headers.get('accept'))) return fallthrough();

  const sibling = new URL(markdownSibling(url.pathname), url.origin);
  const md = await fetchImpl(sibling, { method: 'GET', redirect: 'manual' });
  const type = md.headers.get('content-type') || '';
  if (!md.ok || /text\/html/i.test(type)) return fallthrough();

  const body = await md.arrayBuffer();
  const sniff = new TextDecoder().decode(body.slice(0, 120)).trim().toLowerCase();
  if (sniff.startsWith('<!doctype') || sniff.startsWith('<html')) return fallthrough();

  const headers = new Headers();
  headers.set('content-type', 'text/markdown; charset=utf-8');
  const cache = md.headers.get('cache-control');
  if (cache) headers.set('cache-control', cache);
  varyAccept(headers);
  if (method === 'HEAD') return new Response(null, { status: 200, headers });
  return new Response(body, { status: 200, headers });
}
