// Runs src/utils/openapi-resolve.ts over real public OpenAPI documents and prints the resolution
// rate per spec. This is the gate on tasks.md §1: the /api-operations page's whole argument rests
// on what this number actually looks like in the wild, and it was an estimate until this ran.
//
// Bundles the resolver with esbuild first for the same reason validate-genomes.mjs does — the
// module is written against the `~/` alias and Node cannot resolve it.
//
//   node scripts/resolve-report.mjs            # the bundled corpus, cached under node_modules/.cache
//   node scripts/resolve-report.mjs path.json  # one local document

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';
import yaml from 'js-yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'node_modules/.cache/dna-openapi-resolve');
const specDir = join(root, 'node_modules/.cache/dna-openapi-specs');

const CORPUS = [
  ['Stripe', 'https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json'],
  [
    'GitHub',
    'https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json',
  ],
  ['Twilio (Core)', 'https://raw.githubusercontent.com/twilio/twilio-oai/main/spec/json/twilio_api_v2010.json'],
  [
    'Slack (Web API)',
    'https://raw.githubusercontent.com/slackapi/slack-api-specs/master/web-api/slack_web_openapi_v2.json',
  ],
  [
    'DigitalOcean',
    'https://raw.githubusercontent.com/digitalocean/openapi/main/specification/DigitalOcean-public.v2.yaml',
  ],
  ['Asana', 'https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml'],
  ['Box', 'https://raw.githubusercontent.com/box/box-openapi/main/openapi.json'],
  ['Adyen (Checkout)', 'https://raw.githubusercontent.com/Adyen/adyen-openapi/main/json/CheckoutService-v71.json'],
  [
    'Petstore (canonical)',
    'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore-expanded.json',
  ],
  [
    'Kubernetes',
    'https://raw.githubusercontent.com/kubernetes/kubernetes/master/api/openapi-spec/v3/apis__apps__v1_openapi.json',
  ],
];

async function loadResolver() {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  await esbuild.build({
    entryPoints: [join(root, 'src/utils/openapi-resolve.ts')],
    outfile: join(outDir, 'resolve.mjs'),
    bundle: true,
    format: 'esm',
    platform: 'node',
  });
  return import(pathToFileURL(join(outDir, 'resolve.mjs')).href);
}

function parse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return yaml.load(text);
  }
}

async function fetchSpec(name, url) {
  mkdirSync(specDir, { recursive: true });
  const cache = join(specDir, name.replace(/[^a-z0-9]+/gi, '-').toLowerCase());
  if (existsSync(cache)) return readFileSync(cache, 'utf8');
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  writeFileSync(cache, text);
  return text;
}

const pct = (n, d) => (d === 0 ? '—' : `${Math.round((n / d) * 100)}%`);

const { resolveSpec } = await loadResolver();
const local = process.argv[2];
const targets = local ? [[local, null]] : CORPUS;

const rows = [];
const totals = { total: 0, resolved: 0, path: 0, operationId: 0, 'x-dna': 0 };
const reasons = {};

for (const [name, url] of targets) {
  let doc;
  try {
    doc = parse(url ? await fetchSpec(name, url) : readFileSync(name, 'utf8'));
  } catch (err) {
    rows.push([name, 'fetch failed', err.message, '', '', '']);
    continue;
  }
  let reading;
  try {
    reading = resolveSpec(doc);
  } catch (err) {
    rows.push([name, 'unreadable', err.message, '', '', '']);
    continue;
  }

  totals.total += reading.total;
  totals.resolved += reading.resolved;
  for (const rule of ['path', 'operationId', 'x-dna']) totals[rule] += reading.byRule[rule];
  for (const [reason, n] of Object.entries(reading.byReason)) reasons[reason] = (reasons[reason] ?? 0) + n;

  rows.push([
    name,
    String(reading.total),
    `${reading.resolved} (${pct(reading.resolved, reading.total)})`,
    String(reading.byRule.operationId),
    String(reading.byRule.path),
    String(reading.total - reading.resolved),
  ]);
}

const header = ['Spec', 'Operations', 'Resolved', 'via operationId', 'via path', 'Unresolved'];
const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => (r[i] ?? '').length)));
const line = (cells) => cells.map((c, i) => (c ?? '').padEnd(widths[i])).join('  ');

console.log('');
console.log(line(header));
console.log(widths.map((w) => '-'.repeat(w)).join('  '));
for (const r of rows) console.log(line(r));
console.log('');
console.log(`TOTAL  ${totals.resolved} of ${totals.total} operations resolved (${pct(totals.resolved, totals.total)})`);
console.log(`       via operationId ${totals.operationId} · via path ${totals.path} · declared ${totals['x-dna']}`);
console.log(
  `       unresolved by reason: ${Object.entries(reasons)
    .map(([k, v]) => `${k} ${v}`)
    .join(' · ')}`
);
console.log('');
