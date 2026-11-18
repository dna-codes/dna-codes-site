import assert from 'node:assert/strict';
import test from 'node:test';
import { genomeMap, genomeQuestions } from './genome-map.ts';
import { fixture } from './genome-map.fixture.ts';
import type { CompiledGenome } from './genome-types';

const flatRoles = (nodes: { name: string; children: unknown[] }[]): string[] =>
  nodes.flatMap((n) => [n.name, ...flatRoles(n.children as { name: string; children: unknown[] }[])]);

// --- genomeMap --------------------------------------------------------------

test('genomeMap: every role appears, in its hierarchy', () => {
  const vm = genomeMap(fixture);
  assert.deepEqual(flatRoles(vm.roles).sort(), ['Auditor', 'Clerk', 'Manager', 'Owner']);
  assert.equal(vm.roles.length, 1);
  assert.equal(vm.roles[0].name, 'Owner');
  assert.deepEqual(
    vm.roles[0].children.map((c) => c.name),
    ['Manager', 'Auditor']
  );
  assert.equal(vm.roles[0].children[0].children[0].name, 'Clerk');
  assert.equal(vm.roles[0].children[0].label, 'Manager');
});

test('genomeMap: every step appears in order with its actor and resource', () => {
  const vm = genomeMap(fixture);
  assert.equal(vm.processes.length, 1);
  const p = vm.processes[0];
  assert.equal(p.label, 'Order To Cash');
  assert.equal(p.operator, 'Manager');
  assert.deepEqual(
    p.steps.map((s) => [s.id, s.title, s.actor, s.operation, s.resource]),
    [
      ['receive-order', 'Receive order', 'Clerk', 'Order.Receive', 'Order'],
      ['pack-order', 'Pack order', 'Clerk', 'Order.Pack', 'Order'],
      ['issue-invoice', 'Issue invoice', 'Manager', 'Invoice.Issue', 'Invoice'],
    ]
  );
});

test('genomeMap: every resource and rule appears', () => {
  const vm = genomeMap(fixture);
  assert.deepEqual(
    vm.resources.map((r) => r.name),
    ['Order', 'Invoice', 'Ledger']
  );
  assert.deepEqual(vm.rules.map((r) => r.name).sort(), [
    'CloseLedger',
    'IssueByManager',
    'PackOnlyWhenPaid',
    'ReceiveNeedsClerk',
  ]);
});

test('genomeMap: each rule attaches to the step whose operation it governs', () => {
  const vm = genomeMap(fixture);
  const steps = vm.processes[0].steps;
  assert.deepEqual(steps.find((s) => s.id === 'receive-order')?.rules, ['ReceiveNeedsClerk']);
  assert.deepEqual(steps.find((s) => s.id === 'pack-order')?.rules, ['PackOnlyWhenPaid']);
  assert.deepEqual(steps.find((s) => s.id === 'issue-invoice')?.rules, ['IssueByManager']);
  assert.deepEqual(vm.unattached, ['CloseLedger']);
  assert.deepEqual(vm.rules.find((r) => r.name === 'ReceiveNeedsClerk')?.steps, ['receive-order']);
});

test("genomeMap: each role's reach is its steps, the rules that allow it, and the resources it acts on", () => {
  const { reach } = genomeMap(fixture);
  assert.deepEqual(reach.Clerk, {
    steps: ['receive-order', 'pack-order'],
    rules: ['ReceiveNeedsClerk'],
    resources: ['Order'],
  });
  assert.deepEqual(reach.Manager, {
    steps: ['issue-invoice'],
    rules: ['ReceiveNeedsClerk', 'IssueByManager'],
    resources: ['Invoice'],
  });
  assert.deepEqual(reach.Auditor, { steps: [], rules: ['CloseLedger'], resources: [] });
  assert.deepEqual(reach.Owner, { steps: [], rules: ['CloseLedger'], resources: [] });
});

// --- genomeQuestions ----------------------------------------------------------

test('genomeQuestions: who may perform an operation', () => {
  const q = genomeQuestions(fixture);
  assert.deepEqual(q.whoMay['Order.Receive'], { roles: ['Manager', 'Clerk'], rules: ['Receive needs clerk'] });
  assert.deepEqual(q.whoMay['Ledger.Close'].roles, ['Owner', 'Auditor']);
});

test('genomeQuestions: an operation no rule governs says so', () => {
  const q = genomeQuestions(fixture);
  assert.deepEqual(q.whoMay['Order.Cancel'], { roles: [], rules: [] });
  // A condition rule governs the operation but names no role.
  assert.deepEqual(q.whoMay['Order.Pack'], { roles: [], rules: ['Pack only when paid'] });
});

test('genomeQuestions: what stalls when a role is out', () => {
  const q = genomeQuestions(fixture);
  assert.deepEqual(q.stalls.Clerk, {
    steps: [
      { title: 'Receive order', process: 'Order To Cash' },
      { title: 'Pack order', process: 'Order To Cash' },
    ],
    processes: [],
  });
  assert.deepEqual(q.stalls.Manager, {
    steps: [{ title: 'Issue invoice', process: 'Order To Cash' }],
    processes: ['Order To Cash'],
  });
  assert.deepEqual(q.stalls.Owner, { steps: [], processes: [] });
});

test('genomeQuestions: who touches a resource, by step and by rule', () => {
  const q = genomeQuestions(fixture);
  assert.deepEqual(q.touches.Order, { roles: ['Manager', 'Clerk'] });
  assert.deepEqual(q.touches.Invoice, { roles: ['Manager'] });
  assert.deepEqual(q.touches.Ledger, { roles: ['Owner', 'Auditor'] });
});

test('genomeQuestions: subjects list every operation, role and resource', () => {
  const q = genomeQuestions(fixture);
  assert.equal(q.operations.length, 5);
  assert.deepEqual(
    q.roles.map((r) => r.name),
    ['Owner', 'Manager', 'Clerk', 'Auditor']
  );
  assert.deepEqual(
    q.resources.map((r) => r.name),
    ['Order', 'Invoice', 'Ledger']
  );
});

test('genomeQuestions: default subjects follow the rule, with name-order tie-breaks', () => {
  const q = genomeQuestions(fixture);
  // Ledger.Close and Order.Receive both allow two roles. Ledger.Close sorts first.
  assert.equal(q.defaults.operation, 'Ledger.Close');
  assert.equal(q.defaults.role, 'Clerk');
  assert.equal(q.defaults.resource, 'Order');

  // Give Manager a second step: Clerk and Manager tie, and Clerk sorts first.
  const tied: CompiledGenome = structuredClone(fixture);
  tied.operational.tasks!.push({
    id: 't',
    type: 'task',
    name: 'post-ledger',
    version: '1',
    actor: 'Manager',
    operation: 'Ledger.Close',
  });
  tied.operational.processes![0].steps.push({ id: 'post-ledger', task: 'post-ledger' });
  assert.equal(genomeQuestions(tied).defaults.role, 'Clerk');
  // Order has two steps and Invoice and Ledger one each, so Order still wins.
  assert.equal(genomeQuestions(tied).defaults.resource, 'Order');
});

test('genomeQuestions and genomeMap: two calls give identical output', () => {
  assert.equal(JSON.stringify(genomeQuestions(fixture)), JSON.stringify(genomeQuestions(fixture)));
  assert.equal(JSON.stringify(genomeMap(fixture)), JSON.stringify(genomeMap(fixture)));
});
