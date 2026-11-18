import assert from 'node:assert/strict';
import test from 'node:test';
import { checkProvenance, provenanceLabel } from './genome-provenance.ts';

const source = (n: number) => ({
  title: `Source ${n}`,
  url: `https://example.com/${n}`,
  supports: 'The fulfillment roles.',
});

test('a missing provenance fails', () => {
  const problems = checkProvenance({});
  assert.equal(problems.length, 1);
  assert.match(problems[0], /provenance/);
});

test('an unknown provenance kind fails', () => {
  assert.equal(checkProvenance({ provenance: { kind: 'rumour' } as never }).length, 1);
});

test('fictional passes', () => {
  assert.deepEqual(checkProvenance({ provenance: { kind: 'fictional' } }), []);
});

test('public-sources with three complete sources passes', () => {
  assert.deepEqual(
    checkProvenance({ provenance: { kind: 'public-sources', sources: [source(1), source(2), source(3)] } }),
    []
  );
});

test('public-sources with fewer than three sources fails', () => {
  const problems = checkProvenance({ provenance: { kind: 'public-sources', sources: [source(1), source(2)] } });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /at least 3 sources, has 2/);
});

test('a source without an https URL fails', () => {
  const problems = checkProvenance({
    provenance: {
      kind: 'public-sources',
      sources: [source(1), source(2), { ...source(3), url: 'http://example.com/3' }],
    },
  });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /https/);
});

test('a source without a supports note fails', () => {
  const problems = checkProvenance({
    provenance: { kind: 'public-sources', sources: [source(1), source(2), { ...source(3), supports: '  ' }] },
  });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /supports/);
});

test('a source without a title fails', () => {
  const problems = checkProvenance({
    provenance: { kind: 'public-sources', sources: [source(1), source(2), { ...source(3), title: '' }] },
  });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /title/);
});

test('labels name the provenance', () => {
  assert.equal(provenanceLabel({ kind: 'fictional' }), 'Fictional company');
  assert.equal(provenanceLabel({ kind: 'public-sources', sources: [] }), 'Modeled from public sources');
});
