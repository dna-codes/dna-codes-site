// Fails when an .astro template puts a line break between text and an inline tag.
//
// Astro's HTML compression deletes that line break, so text Prettier wrapped as
//
//   For the case behind it, read the
//   <a href="/operating-model/">target operating model</a> page.
//
// renders as "read the<a>target operating model</a>": the word runs into the link. The same
// happens after a closing tag (`</strong>` then text on the next line). End the text line with
// `&#32;` (or `{' '}`), which Astro keeps and Prettier leaves alone.
//
// Usage: node scripts/check-inline-spacing.mjs   (part of `npm run check`)

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INLINE = '(?:a|strong|em|code|span|b|i|kbd|abbr)';
const OPENS = new RegExp(`^\\s*<${INLINE}\\b`);
const CLOSES = new RegExp(`</${INLINE}>\\s*$`);
const SPACED = /&#32;$|\{' '\}$/;

/** @param {string} dir */
function astroFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return astroFiles(p);
    return name.endsWith('.astro') ? [p] : [];
  });
}

/**
 * Findings for one template, as 1-based line numbers with a short excerpt.
 *
 * @param {string} src
 * @returns {{ line: number, excerpt: string }[]}
 */
export function findCrowding(src) {
  const lines = src.split('\n');
  // Skip the frontmatter.
  let i = 0;
  if (lines[0]?.trim() === '---') {
    i = lines.findIndex((l, n) => n > 0 && l.trim() === '---') + 1;
  }
  const out = [];
  let skipping = /** @type {string | null} */ (null);
  for (; i < lines.length - 1; i++) {
    const a = lines[i];
    if (skipping) {
      if (a.includes(`</${skipping}>`) || (skipping !== 'pre' && /\/>\s*$/.test(a))) skipping = null;
      continue;
    }
    // Whitespace is kept in <pre>, and <script>/<style> are not text.
    const open = a.match(/<(pre|script|style)\b/);
    if (open && !a.includes(`</${open[1]}>`) && !/\/>\s*$/.test(a)) {
      skipping = open[1];
      continue;
    }
    const ta = a.trimEnd();
    const tb = lines[i + 1].trimStart();
    if (SPACED.test(ta) || /^&#32;|^\{' '\}/.test(tb)) continue;
    if (/^\s*(\/\/|\*|\{\/\*|<!--)/.test(a) || /^\s*[\w:-]+=/.test(a)) continue;

    const textEnds = /[\p{L}\p{N}.,;:!?)\]’'"”]$/u.test(ta) && !/[>}]$/.test(ta);
    if (textEnds && OPENS.test(tb)) out.push({ line: i + 1, excerpt: `${ta.slice(-30)} ⏎ ${tb.slice(0, 40)}` });
    else if (CLOSES.test(ta) && /^[\p{L}\p{N}(“"']/u.test(tb) && !/^[\w:-]+=/.test(tb)) {
      out.push({ line: i + 1, excerpt: `${ta.slice(-30)} ⏎ ${tb.slice(0, 40)}` });
    }
  }
  return out;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  // src/pages/_* are template pages Astro does not build.
  const files = astroFiles(join(root, 'src')).filter((f) => !/\/pages\/_/.test(f));
  const findings = files.flatMap((f) =>
    findCrowding(readFileSync(f, 'utf8')).map((x) => `${relative(root, f)}:${x.line}  ${x.excerpt}`)
  );
  if (findings.length) {
    console.error(`check-inline-spacing: ${findings.length} place(s) where text will run into a tag\n`);
    for (const f of findings) console.error(`  ✗ ${f}`);
    console.error('\nEnd the text line with &#32; so Astro keeps the space. See the comment in this script.');
    process.exit(1);
  }
  console.log(`check-inline-spacing: ${files.length} templates, no text runs into a tag.`);
}
