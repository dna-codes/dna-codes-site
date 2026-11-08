// Compiles every industry genome and validates it against @dna-codes/dna-schemas.
// Wired into `npm run build`, so a genome that cannot become valid DNA cannot ship.
//
// The logic lives in src/utils/genome-validate.ts, which is written against the `~/` and
// `~schemas` aliases the rest of the site uses. Node cannot resolve those, so this runner
// bundles that module with esbuild first — the same aliases astro.config.ts declares — then
// hands it the schema documents and an Ajv instance.

import { readdirSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const schemasDir = join(root, 'node_modules/@dna-codes/dna-schemas');
const outDir = join(root, 'node_modules/.cache/dna-genome-validate');

/** Every .json under the schemas package that is actually a schema (has an $id). */
function loadSchemas() {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith('.json')) {
        try {
          const doc = JSON.parse(readFileSync(p, 'utf8'));
          if (doc && typeof doc === 'object' && doc.$id) out.push(doc);
        } catch {
          // package.json and friends — not schemas, not our problem.
        }
      }
    }
  };
  walk(schemasDir);
  return out;
}

async function main() {
  const schemas = loadSchemas();
  if (!schemas.length) {
    console.error('✗ genome validation: no schemas found under @dna-codes/dna-schemas');
    process.exit(1);
  }

  mkdirSync(outDir, { recursive: true });
  const outfile = join(outDir, 'genome-validate.mjs');

  await esbuild.build({
    entryPoints: [join(root, 'src/utils/genome-validate.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    outfile,
    logLevel: 'silent',
    alias: {
      '~schemas': join(root, 'node_modules/@dna-codes/dna-schemas'),
      '~lenses': join(root, 'node_modules/@dna-codes/dna-core/lenses'),
      '~': join(root, 'src'),
    },
  });

  const { validateGenomes } = await import(pathToFileURL(outfile).href);

  const ajv = new Ajv2020({ strict: false, allErrors: true, validateFormats: true });
  addFormats(ajv);

  const issues = validateGenomes(ajv, schemas);
  rmSync(outDir, { recursive: true, force: true });

  if (!issues.length) {
    console.log('✓ genome validation: all genomes compile to valid DNA');
    return;
  }

  const byGenome = new Map();
  for (const i of issues) {
    if (!byGenome.has(i.genome)) byGenome.set(i.genome, []);
    byGenome.get(i.genome).push(i);
  }
  console.error(`\n✗ genome validation failed — ${issues.length} issue(s)\n`);
  for (const [genome, list] of byGenome) {
    console.error(`  ${genome}`);
    for (const i of list) console.error(`    [${i.pass}] ${i.where}: ${i.message}`);
    console.error('');
  }
  process.exit(1);
}

main().catch((e) => {
  console.error('✗ genome validation crashed:', e);
  process.exit(1);
});
