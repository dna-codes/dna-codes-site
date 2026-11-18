// A small compiled genome for the genome-map, questions and share-card tests. Written by hand
// in the compiled shape, so the tests need no compiler and no `~/` alias.

import type { CompiledGenome } from './genome-types';

const base = (type: string, name: string) => ({ id: `${type}-${name}`, type, name, version: '1' });

export const fixture: CompiledGenome = {
  key: 'ecommerce',
  orgName: 'Fixture & Sons',
  description: 'A small company used by the tests.',
  ontologies: [
    { name: 'GS1', note: 'Item numbers.' },
    { name: 'EDI X12', note: 'Order documents.' },
  ],
  operational: {
    domain: {
      name: 'FixtureCo',
      roles: [
        { ...base('role', 'Owner') },
        { ...base('role', 'Manager'), parent: 'Owner', description: 'Runs <the> floor.' },
        { ...base('role', 'Clerk'), parent: 'Manager' },
        { ...base('role', 'Auditor'), parent: 'Owner' },
      ],
      resources: [
        { ...base('resource', 'Order'), description: 'A purchase.' },
        { ...base('resource', 'Invoice') },
        { ...base('resource', 'Ledger') },
      ],
    },
    operations: [
      { ...base('operation', 'Order.Receive'), target: 'Order', action: 'Receive' },
      { ...base('operation', 'Order.Pack'), target: 'Order', action: 'Pack' },
      { ...base('operation', 'Invoice.Issue'), target: 'Invoice', action: 'Issue' },
      { ...base('operation', 'Ledger.Close'), target: 'Ledger', action: 'Close' },
      { ...base('operation', 'Order.Cancel'), target: 'Order', action: 'Cancel' },
    ],
    tasks: [
      { ...base('task', 'receive-order'), actor: 'Clerk', operation: 'Order.Receive' },
      { ...base('task', 'pack-order'), actor: 'Clerk', operation: 'Order.Pack' },
      { ...base('task', 'issue-invoice'), actor: 'Manager', operation: 'Invoice.Issue' },
    ],
    processes: [
      {
        ...base('process', 'OrderToCash'),
        operator: 'Manager',
        startStep: 'receive-order',
        steps: [
          { id: 'receive-order', task: 'receive-order' },
          { id: 'pack-order', task: 'pack-order', depends_on: ['receive-order'] },
          { id: 'issue-invoice', task: 'issue-invoice', depends_on: ['pack-order'] },
        ],
      },
    ],
    rules: [
      {
        ...base('rule', 'ReceiveNeedsClerk'),
        operation: 'Order.Receive',
        rule_type: 'access',
        allow: [{ role: 'Clerk' }, { role: 'Manager' }],
      },
      { ...base('rule', 'PackOnlyWhenPaid'), operation: 'Order.Pack', rule_type: 'condition' },
      {
        ...base('rule', 'IssueByManager'),
        operation: 'Invoice.Issue',
        rule_type: 'access',
        allow: [{ role: 'Manager' }],
      },
      {
        ...base('rule', 'CloseLedger'),
        operation: 'Ledger.Close',
        rule_type: 'access',
        allow: [{ role: 'Auditor' }, { role: 'Owner' }],
      },
    ],
  },
  product: {
    core: { domain: { name: 'FixtureCo', path: 'fixture.co' }, resources: [], operations: [] },
    api: { namespace: { name: 'Fixture', path: '/fixture' }, resources: [], endpoints: [] },
    ui: { layout: { name: 'Shell', type: 'sidebar' }, pages: [], routes: [] },
  },
  technical: { cells: [] },
  samples: {},
  consulted: {},
  stepTitles: { 'receive-order': 'Receive order', 'pack-order': 'Pack order', 'issue-invoice': 'Issue invoice' },
};
