// Runs the gallery derivations over every genome in the real corpus. The corpus imports through
// the `~/` alias, which Node cannot resolve, so this test bundles it with esbuild first, the same
// way scripts/validate-genomes.mjs does.

import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const ENTRY = `
import { GENOME_SOURCES } from '~/data/genome';
import { compileGenome } from '~/utils/genome-compile';
export const compiled = GENOME_SOURCES.map(compileGenome);
export const sources = GENOME_SOURCES;
`;

async function loadCorpus() {
  const dir = mkdtempSync(path.join(tmpdir(), 'genome-corpus-'));
  const outfile = path.join(dir, 'corpus.mjs');
  try {
    await esbuild.build({
      stdin: { contents: ENTRY, resolveDir: root, loader: 'ts' },
      bundle: true,
      format: 'esm',
      platform: 'node',
      outfile,
      logLevel: 'silent',
      alias: {
        '~schemas': path.join(root, 'node_modules/@dna-codes/dna-schemas'),
        '~': path.join(root, 'src'),
      },
    });
    return await import(pathToFileURL(outfile).href);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('genomeMap and genomeQuestions run on every genome in the corpus', async () => {
  const { genomeMap, genomeQuestions } = await import('./genome-map.ts');
  const { compiled } = await loadCorpus();
  assert.ok(compiled.length >= 6);
  for (const g of compiled) {
    const map = genomeMap(g);
    assert.ok(map.roles.length, `${g.key}: no roles`);
    assert.ok(map.processes[0]?.steps.length, `${g.key}: no steps`);
    const q = genomeQuestions(g);
    assert.ok(q.defaults.operation, `${g.key}: no default operation`);
    assert.ok(q.defaults.role, `${g.key}: no default role`);
    assert.ok(q.defaults.resource, `${g.key}: no default resource`);
  }
});

test('every genome in the corpus declares fictional provenance', async () => {
  const { checkProvenance } = await import('./genome-provenance.ts');
  const { sources } = await loadCorpus();
  for (const s of sources) {
    assert.deepEqual(checkProvenance(s), [], s.key);
    assert.equal(s.provenance.kind, 'fictional', s.key);
  }
});
