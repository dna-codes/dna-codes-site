import assert from 'node:assert/strict';
import test from 'node:test';
import { genomeMap } from './genome-map.ts';
import { fixture } from './genome-map.fixture.ts';
import { renderGenomeMap } from './genome-render.ts';

const attrValues = (html: string, name: string): string[] =>
  [...html.matchAll(new RegExp(`\\b${name}="([^"]*)"`, 'g'))].map((m) => m[1]);

test('renderGenomeMap: a data-role for every role', () => {
  const html = renderGenomeMap(genomeMap(fixture));
  assert.deepEqual(new Set(attrValues(html, 'data-role')), new Set(['Owner', 'Manager', 'Clerk', 'Auditor']));
});

test('renderGenomeMap: a data-step for every step, in order', () => {
  const html = renderGenomeMap(genomeMap(fixture));
  assert.deepEqual(attrValues(html, 'data-step'), ['receive-order', 'pack-order', 'issue-invoice']);
});

test('renderGenomeMap: a data-rule for every rule, and a data-resource for every resource', () => {
  const html = renderGenomeMap(genomeMap(fixture));
  assert.deepEqual(
    new Set(attrValues(html, 'data-rule')),
    new Set(['ReceiveNeedsClerk', 'PackOnlyWhenPaid', 'IssueByManager', 'CloseLedger'])
  );
  assert.deepEqual(attrValues(html, 'data-resource'), ['Order', 'Invoice', 'Ledger']);
});

test('renderGenomeMap: the reach JSON sits on the root element', () => {
  const vm = genomeMap(fixture);
  const html = renderGenomeMap(vm);
  const raw = attrValues(html, 'data-reach')[0];
  assert.ok(raw, 'no data-reach attribute');
  const decoded = raw
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  assert.deepEqual(JSON.parse(decoded), vm.reach);
  assert.match(html.trim(), /^<div class="gm"[^>]*data-genome-map/);
});

test('renderGenomeMap: roles are buttons, so Tab reaches them and Enter or Space selects them', () => {
  const html = renderGenomeMap(genomeMap(fixture));
  const buttons = [...html.matchAll(/<button\b[^>]*data-role="([^"]+)"[^>]*>/g)].map((m) => m[1]);
  assert.deepEqual(new Set(buttons), new Set(['Owner', 'Manager', 'Clerk', 'Auditor']));
  assert.ok(/<button\b[^>]*aria-pressed="false"/.test(html));
});

test('renderGenomeMap: text is escaped', () => {
  const html = renderGenomeMap(genomeMap(fixture));
  assert.ok(!html.includes('Runs <the> floor.'));
  assert.ok(html.includes('Runs &lt;the&gt; floor.'));
});
