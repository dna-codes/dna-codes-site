import assert from 'node:assert/strict';
import test from 'node:test';
import { CARD_HEIGHT, CARD_ROLE_DEPTH, CARD_STEPS, CARD_WIDTH, templateCardSvg, genomeCardSvg } from './genome-card.ts';
import { genomeMap } from './genome-map.ts';
import { fixture } from './genome-map.fixture.ts';
import type { CompiledGenome } from './genome-types';

const input = (g: CompiledGenome = fixture) => ({
  key: g.key,
  orgName: g.orgName,
  industry: 'E-commerce',
  provenanceLabel: 'Fictional company',
  map: genomeMap(g),
});

const texts = (svg: string) => [...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);

test('the card is 1200 × 628', () => {
  assert.equal(CARD_WIDTH, 1200);
  assert.equal(CARD_HEIGHT, 628);
  const svg = genomeCardSvg(input());
  assert.match(svg, /^<svg[^>]*width="1200" height="628"/);
});

test('the card names the company, the industry and the provenance', () => {
  const t = texts(genomeCardSvg(input())).join('\n');
  assert.ok(t.includes('Fixture &amp; Sons'));
  assert.ok(t.includes('E-commerce'));
  assert.ok(t.includes('Fictional company'));
});

test('the card escapes text', () => {
  const svg = genomeCardSvg(input());
  assert.ok(!svg.includes('Fixture & Sons'));
});

/** A genome with a deep role tree and a long process. */
function large(): CompiledGenome {
  const g: CompiledGenome = structuredClone(fixture);
  g.operational.domain.roles!.push({ id: 'r', type: 'role', name: 'Trainee', version: '1', parent: 'Clerk' });
  g.operational.domain.roles!.push({ id: 'i', type: 'role', name: 'Intern', version: '1', parent: 'Auditor' });
  const steps = g.operational.processes![0].steps;
  for (let i = 0; i < 6; i++) {
    const id = `extra-step-${i}`;
    g.operational.tasks!.push({ id, type: 'task', name: id, version: '1', actor: 'Clerk', operation: 'Order.Pack' });
    steps.push({ id, task: id });
  }
  return g;
}

test(`the card shows the first ${CARD_ROLE_DEPTH} levels of the role tree`, () => {
  const t = texts(genomeCardSvg(input(large())));
  assert.ok(t.includes('Owner'));
  assert.ok(t.includes('Manager'));
  assert.ok(t.includes('Auditor'));
  // Intern sits on the third level and performs no step, so it can only appear as a role.
  assert.ok(!t.includes('Intern'), 'third level shown');
  assert.ok(!t.includes('Trainee'), 'fourth level shown');
});

test(`the card shows the first ${CARD_STEPS} steps and counts the rest`, () => {
  const g = large();
  const t = texts(genomeCardSvg(input(g)));
  assert.ok(t.includes('Receive order'));
  assert.ok(t.includes('Extra step 2'));
  assert.ok(!t.includes('Extra step 3'), 'seventh step shown');
  assert.ok(t.some((x) => /\+ 3 more steps/.test(x)));
});

test('the template card lists every company', () => {
  const svg = templateCardSvg([
    { orgName: 'Fixture & Sons', industry: 'E-commerce' },
    { orgName: 'Other Co', industry: 'M&A' },
  ]);
  const t = texts(svg).join('\n');
  assert.ok(t.includes('Fixture &amp; Sons'));
  assert.ok(t.includes('M&amp;A'));
  assert.match(svg, /^<svg[^>]*width="1200" height="628"/);
});
