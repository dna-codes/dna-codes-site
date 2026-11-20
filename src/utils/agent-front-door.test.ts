import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { AGENTS_HREF, AGENTS_START_HERE, SAME_AS, agentDocumentUrls, softwareApplication } from './agent-front-door.ts';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ORIGIN = 'https://dna.codes';

test('the agent door is /agents/', () => {
  assert.equal(AGENTS_HREF, '/agents/');
});

test('"Agents: start here" leads with the sandbox flow and names the waitlist only for people', () => {
  const lines = AGENTS_START_HERE.trim().split('\n');
  assert.equal(lines[0], '## Agents: start here');
  for (const step of ['1. Register', '2. Connect MCP', '3. Draft and validate', '4. Hand your person', '5. Optional'])
    assert.ok(AGENTS_START_HERE.includes(step), `missing step "${step}"`);
  assert.ok(AGENTS_START_HERE.includes('npx @dna-codes/cli register --json'));
  assert.ok(AGENTS_START_HERE.includes('https://agents.dna.codes/o/{org}/mcp'));
  // one-mcp-url shipped: the one URL comes first; the per-organization URL is for a registered token.
  const one = AGENTS_START_HERE.indexOf('https://agents.dna.codes/mcp');
  assert.ok(one > 0 && one < AGENTS_START_HERE.indexOf('https://agents.dna.codes/o/{org}/mcp'));
  assert.ok(AGENTS_START_HERE.includes(`](${ORIGIN}/agents/llms.txt)`));
  assert.ok(AGENTS_START_HERE.includes(`](${ORIGIN}/agents/llms-full.txt)`));
  const waitlist = lines.filter((line) => /waitlist/i.test(line));
  assert.deepEqual(
    waitlist.filter((line) => !/no waitlist step/i.test(line)),
    [`People who arrive without an agent can join the waitlist: ${ORIGIN}/waitlist/`]
  );
});

test('the root llms.txt source puts the block first and drops the two waitlist lines', () => {
  const source = readFileSync(path.join(siteRoot, 'src/pages/llms.txt.ts'), 'utf8');
  assert.ok(!source.includes('the waitlist form is the way in'));
  assert.ok(!/send the user to \$\{url\('\/waitlist'\)\}/.test(source));
  const block = source.indexOf('${AGENTS_START_HERE}');
  assert.ok(block > 0, 'llms.txt.ts does not insert AGENTS_START_HERE');
  assert.ok(block < source.indexOf('## When to use'), 'the block must come before "When to use"');
});

test('agentDocumentUrls lists /agents/ and each .md, .json and .txt document, recursively', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'agents-'));
  mkdirSync(path.join(dir, 'guides'));
  for (const file of ['llms.txt', 'auth.md', 'discovery.json', 'index.html', 'claim.html', 'apex-llms-section.md'])
    writeFileSync(path.join(dir, file), 'x');
  writeFileSync(path.join(dir, 'guides', 'agent-quickstart.md'), 'x');
  const urls = agentDocumentUrls(dir, ORIGIN);
  assert.deepEqual(urls, [
    `${ORIGIN}/agents/`,
    `${ORIGIN}/agents/auth.md`,
    `${ORIGIN}/agents/discovery.json`,
    `${ORIGIN}/agents/guides/agent-quickstart.md`,
    `${ORIGIN}/agents/llms.txt`,
  ]);
});

test('agentDocumentUrls is empty when no agent documents are published', () => {
  assert.deepEqual(agentDocumentUrls(path.join(tmpdir(), 'no-such-agents-dir'), ORIGIN), []);
});

test('sameAs names GitHub, X and npm', () => {
  assert.deepEqual(SAME_AS, [
    'https://github.com/dna-codes',
    'https://x.com/dnacodes',
    'https://www.npmjs.com/org/dna-codes',
  ]);
});

test('softwareApplication takes its offers from the published pricing', () => {
  const pricing = JSON.parse(readFileSync(path.join(siteRoot, 'public/agents/pricing.json'), 'utf8'));
  const app = softwareApplication(pricing, ORIGIN);
  assert.equal(app['@type'], 'SoftwareApplication');
  assert.equal(app.name, 'DNA Codes');
  assert.equal(app.applicationCategory, 'DeveloperApplication');
  assert.equal(app.url, `${ORIGIN}/agents/`);
  assert.deepEqual(app.sameAs, SAME_AS);
  assert.ok(app.offers);
  const [free, perAction] = app.offers;
  assert.equal(free.price, 0);
  assert.equal(free.priceCurrency, 'USD');
  assert.match(free.description, /500 actions a month/);
  assert.equal(perAction.priceSpecification?.price, 0.01);
  assert.equal(perAction.priceSpecification?.unitText, 'action');
});

test('softwareApplication has no offers without pricing', () => {
  assert.equal(softwareApplication(undefined, ORIGIN).offers, undefined);
});
