import assert from 'node:assert/strict';
import test from 'node:test';
import { DNA_MCP_HOST, agentPrompt } from './genome-prompt.ts';

const prompt = agentPrompt({ key: 'ecommerce', orgName: 'BrightBox Commerce' });

test('the prompt names the genome JSON URL', () => {
  assert.ok(prompt.includes('https://dna.codes/genome/ecommerce.json'));
});

test('the prompt names the DNA MCP server', () => {
  assert.equal(DNA_MCP_HOST, 'https://agents.dna.codes');
  assert.ok(prompt.includes('https://agents.dna.codes'));
});

test('the prompt says to draft in conversation and save only when asked', () => {
  assert.match(prompt, /draft .* in (this|our|the) conversation/i);
  assert.match(prompt, /call `apply` only when I ask/i);
});

test('the prompt is a function of the key alone', () => {
  const other = agentPrompt({ key: 'ma', orgName: 'Meridian Partners' });
  assert.ok(other.includes('/genome/ma.json'));
  assert.ok(!other.includes('ecommerce'));
});
