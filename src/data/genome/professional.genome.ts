// Ardent Consulting — the professional services genome.
//
// Value proposition it has to make obvious: engagements, delivery teams, and the work they own.
// So the process runs an engagement from scope to invoice, and the RACI is the artifact that
// earns its keep here — in a services firm the question is never "what happens", it is "who is
// on it and who is answerable when the client asks".

import type { AuthoredGenome } from '~/utils/genome-types';

export const professional: AuthoredGenome = {
  key: 'professional',
  ontologies: [
    { name: 'PMBOK', note: 'Work breakdown structure, scope baseline, and change control.' },
    { name: 'Statement of Work conventions', note: 'Fee basis, acceptance criteria, change orders.' },
    { name: 'Services performance metrics', note: 'Utilisation, realisation, and work in progress.' },
  ],
  domain: 'ArdentConsulting',
  domainPath: 'ardent.delivery',
  orgName: 'Ardent Consulting',
  description:
    'A professional services firm running scoping, staffing, delivery, and billing across concurrent client engagements.',

  resources: [
    {
      name: 'Engagement',
      description: 'One contracted piece of client work, with its scope, fee basis, and dates.',
      attributes: [
        { name: 'code', type: 'string', required: true },
        { name: 'client', type: 'string', required: true },
        { name: 'feeBasis', type: 'enum', values: ['fixed-fee', 'time-and-materials', 'retainer'], required: true },
        { name: 'wbsCode', type: 'string', description: 'PMBOK work breakdown structure code.' },
        { name: 'realizationRate', type: 'number', description: 'Billed over standard value, as a decimal.' },
        {
          name: 'status',
          type: 'enum',
          values: ['scoping', 'staffing', 'active', 'closing', 'closed'],
          required: true,
        },
      ],
      actions: [
        { name: 'Scope', type: 'write', description: 'Define the work, the fee basis, and the acceptance criteria.' },
        { name: 'Close', type: 'write', description: 'Close the engagement after final acceptance.' },
        { name: 'List', type: 'read', description: 'List engagements by status.' },
      ],
    },
    {
      name: 'StaffingPlan',
      description: 'Who is on the engagement, in what role, at what allocation.',
      attributes: [
        { name: 'allocation', type: 'number', required: true, description: 'Percent of a full week.' },
        { name: 'utilizationTarget', type: 'number', description: 'Target billable percentage for this consultant.' },
        { name: 'startsOn', type: 'date', required: true },
        { name: 'endsOn', type: 'date' },
      ],
      actions: [{ name: 'Assign', type: 'write', description: 'Commit named people to the engagement.' }],
    },
    {
      name: 'Deliverable',
      description: 'A named output the client accepts or rejects.',
      attributes: [
        { name: 'title', type: 'string', required: true },
        { name: 'dueOn', type: 'date', required: true },
        {
          name: 'state',
          type: 'enum',
          values: ['drafting', 'in-review', 'submitted', 'accepted', 'rework'],
          required: true,
        },
      ],
      actions: [
        { name: 'Submit', type: 'write', description: 'Send the deliverable for client acceptance.' },
        { name: 'List', type: 'read', description: 'List deliverables on an engagement.' },
      ],
    },
    {
      name: 'TimeEntry',
      description: 'Hours booked against an engagement, by person and date.',
      attributes: [
        { name: 'hours', type: 'number', required: true },
        { name: 'workedOn', type: 'date', required: true },
        { name: 'billable', type: 'boolean', required: true },
      ],
      actions: [{ name: 'Approve', type: 'write', description: 'Approve time before it can be billed.' }],
    },
    {
      name: 'Invoice',
      description: 'A billing document raised against approved time or a fixed-fee milestone.',
      attributes: [
        { name: 'amount', type: 'number', required: true },
        { name: 'period', type: 'string', required: true },
        { name: 'state', type: 'enum', values: ['draft', 'issued', 'paid', 'disputed'], required: true },
      ],
      actions: [{ name: 'Issue', type: 'write', description: 'Issue the invoice to the client.' }],
    },
  ],

  persons: [
    { name: 'Consultant', description: 'Anyone in the delivery organisation who books time.' },
    { name: 'Client', description: 'The engaging organisation and its sponsors.' },
    { name: 'Subcontractor', description: 'An external specialist staffed onto an engagement.' },
  ],

  roles: [
    {
      name: 'ManagingPrincipal',
      description: 'Accountable for the practice, its margin, and its client relationships.',
    },
    { name: 'EngagementManager', parent: 'ManagingPrincipal', description: 'Runs one engagement day to day.' },
    {
      name: 'ResourceManager',
      parent: 'ManagingPrincipal',
      description: 'Owns the bench, allocations, and utilisation.',
    },
    { name: 'DeliveryLead', parent: 'EngagementManager', description: 'Owns the deliverables and their quality.' },
    {
      name: 'BillingSpecialist',
      parent: 'ManagingPrincipal',
      description: 'Turns approved time into issued invoices.',
    },
  ],

  groups: [
    { name: 'DeliveryTeam', description: 'Everyone staffed on one engagement.' },
    { name: 'PracticeLeadership', description: 'The people accountable for margin and client outcomes.' },
  ],

  memberships: [
    { name: 'ConsultantAsEngagementManager', person: 'Consultant', role: 'EngagementManager', group: 'DeliveryTeam' },
    { name: 'ConsultantAsDeliveryLead', person: 'Consultant', role: 'DeliveryLead', group: 'DeliveryTeam' },
    { name: 'ConsultantAsResourceManager', person: 'Consultant', role: 'ResourceManager', group: 'PracticeLeadership' },
    {
      name: 'ConsultantAsBillingSpecialist',
      person: 'Consultant',
      role: 'BillingSpecialist',
      group: 'PracticeLeadership',
    },
    { name: 'SubcontractorOnDeliveryTeam', person: 'Subcontractor', role: 'DeliveryLead', group: 'DeliveryTeam' },
  ],

  operations: [
    { target: 'Engagement', action: 'Scope', description: 'Define scope, fee basis, and acceptance criteria.' },
    { target: 'Engagement', action: 'Close', description: 'Close after final acceptance.' },
    { target: 'Engagement', action: 'List', description: 'List engagements by status.' },
    { target: 'StaffingPlan', action: 'Assign', description: 'Commit people to the engagement.' },
    { target: 'StaffingPlan', action: 'Read', description: 'Read the current allocation.' },
    { target: 'Deliverable', action: 'Submit', description: 'Send a deliverable for acceptance.' },
    { target: 'Deliverable', action: 'List', description: 'List deliverables and their state.' },
    { target: 'TimeEntry', action: 'Approve', description: 'Approve time for billing.' },
    { target: 'Invoice', action: 'Issue', description: 'Issue an invoice to the client.' },
  ],

  process: {
    name: 'EngagementDelivery',
    description: 'Scope through invoice — the loop a services firm repeats on every client.',
    operator: 'ManagingPrincipal',
    steps: [
      {
        id: 'scope-engagement',
        title: 'Scope engagement',
        actor: 'EngagementManager',
        operation: 'Engagement.Scope',
        description: 'Agree the work, the fee basis, and what acceptance means before anyone is staffed.',
        consulted: ['ManagingPrincipal'],
      },
      {
        id: 'assign-team',
        title: 'Assign team',
        actor: 'ResourceManager',
        operation: 'StaffingPlan.Assign',
        description: 'Staff to the shape of the work, against real bench availability.',
        consulted: ['EngagementManager'],
      },
      {
        id: 'produce-deliverables',
        title: 'Produce deliverables',
        actor: 'DeliveryLead',
        operation: 'Deliverable.Submit',
        description: 'Draft, review internally, and submit each deliverable for client acceptance.',
        consulted: ['EngagementManager'],
      },
      {
        id: 'approve-time',
        title: 'Approve time',
        actor: 'EngagementManager',
        operation: 'TimeEntry.Approve',
        description: 'Review booked hours against the plan; approve what is billable.',
        consulted: ['ResourceManager'],
      },
      {
        id: 'issue-invoice',
        title: 'Issue invoice',
        actor: 'BillingSpecialist',
        operation: 'Invoice.Issue',
        description: 'Bill approved time or the reached milestone, and send it.',
      },
      {
        id: 'close-engagement',
        title: 'Close engagement',
        actor: 'EngagementManager',
        operation: 'Engagement.Close',
        description: 'Confirm final acceptance, release the team, and close the code.',
        consulted: ['ManagingPrincipal', 'ResourceManager'],
      },
    ],
  },

  rules: [
    {
      name: 'NoStaffingBeforeSignedScope',
      operation: 'StaffingPlan.Assign',
      ruleType: 'condition',
      description: 'Nobody is allocated until the scope and fee basis are agreed — the cause of most write-offs.',
    },
    {
      name: 'OnlyApprovedTimeIsBilled',
      operation: 'Invoice.Issue',
      ruleType: 'condition',
      description: 'An invoice can only carry hours an engagement manager has already approved.',
    },
    {
      name: 'AllocationIsResourceManagements',
      operation: 'StaffingPlan.Assign',
      ruleType: 'access',
      description: 'One bench, one allocator — otherwise every engagement staffs itself and utilisation is fiction.',
      allow: [{ role: 'ResourceManager' }, { role: 'ManagingPrincipal' }],
    },
    {
      name: 'TimeApprovedByTheEngagement',
      operation: 'TimeEntry.Approve',
      ruleType: 'access',
      description: 'The person answerable for the budget approves the hours charged to it.',
      allow: [{ role: 'EngagementManager' }, { role: 'ManagingPrincipal' }],
    },
    {
      name: 'BillingIsSeparateFromDelivery',
      operation: 'Invoice.Issue',
      ruleType: 'access',
      description: 'The team doing the work does not raise its own invoices.',
      allow: [{ role: 'BillingSpecialist' }, { role: 'ManagingPrincipal' }],
    },
  ],

  triggers: [
    { source: 'user', process: 'EngagementDelivery', description: 'A signed statement of work arrives.' },
    {
      source: 'schedule',
      operation: 'TimeEntry.Approve',
      schedule: '0 9 * * 1',
      description: 'Monday time approval across every active engagement.',
    },
  ],

  product: {
    resources: [
      {
        name: 'Engagement',
        resource: 'Engagement',
        description: 'The engagement portfolio.',
        fields: [
          { name: 'code', label: 'Code', type: 'string', required: true, readonly: true },
          { name: 'client', label: 'Client', type: 'string', required: true },
          {
            name: 'feeBasis',
            label: 'Fee basis',
            type: 'enum',
            values: ['fixed-fee', 'time-and-materials', 'retainer'],
            required: true,
          },
          { name: 'manager', label: 'Manager', type: 'string' },
          {
            name: 'status',
            label: 'Status',
            type: 'enum',
            values: ['scoping', 'staffing', 'active', 'closing', 'closed'],
            required: true,
          },
        ],
        actions: [{ name: 'Scope' }, { name: 'Close' }],
        samples: [
          { code: 'ARD-114', client: 'Trellis Health', feeBasis: 'fixed-fee', manager: 'P. Nwosu', status: 'active' },
          {
            code: 'ARD-115',
            client: 'Grantham Rail',
            feeBasis: 'time-and-materials',
            manager: 'L. Farrow',
            status: 'staffing',
          },
          { code: 'ARD-116', client: 'Vela Energy', feeBasis: 'retainer', manager: 'P. Nwosu', status: 'active' },
          {
            code: 'ARD-109',
            client: 'Bright Harbor Trust',
            feeBasis: 'fixed-fee',
            manager: 'D. Sato',
            status: 'closing',
          },
        ],
      },
      {
        name: 'StaffingPlan',
        resource: 'StaffingPlan',
        description: 'Who is on what, and how much of them.',
        fields: [
          { name: 'engagement', label: 'Engagement', type: 'string', required: true },
          { name: 'person', label: 'Person', type: 'string', required: true },
          { name: 'role', label: 'Role', type: 'string', required: true },
          { name: 'allocation', label: 'Allocation %', type: 'number', required: true },
          { name: 'endsOn', label: 'Rolls off', type: 'date' },
        ],
        actions: [{ name: 'Assign' }],
        samples: [
          { engagement: 'ARD-114', person: 'K. Duarte', role: 'DeliveryLead', allocation: 80, endsOn: '2026-10-30' },
          { engagement: 'ARD-114', person: 'M. Oyelaran', role: 'Consultant', allocation: 100, endsOn: '2026-10-30' },
          { engagement: 'ARD-116', person: 'K. Duarte', role: 'Consultant', allocation: 20, endsOn: '2026-12-18' },
        ],
      },
      {
        name: 'Deliverable',
        resource: 'Deliverable',
        description: 'What the client is waiting for.',
        fields: [
          { name: 'engagement', label: 'Engagement', type: 'string', required: true },
          { name: 'title', label: 'Deliverable', type: 'string', required: true },
          { name: 'dueOn', label: 'Due', type: 'date', required: true },
          {
            name: 'state',
            label: 'State',
            type: 'enum',
            values: ['drafting', 'in-review', 'submitted', 'accepted', 'rework'],
            required: true,
          },
        ],
        actions: [{ name: 'Submit' }],
        samples: [
          { engagement: 'ARD-114', title: 'Current-state assessment', dueOn: '2026-09-04', state: 'accepted' },
          { engagement: 'ARD-114', title: 'Target operating model', dueOn: '2026-09-25', state: 'in-review' },
          { engagement: 'ARD-116', title: 'Quarterly advisory readout', dueOn: '2026-09-30', state: 'drafting' },
        ],
      },
      {
        name: 'Invoice',
        resource: 'Invoice',
        description: 'Billing state by engagement and period.',
        fields: [
          { name: 'engagement', label: 'Engagement', type: 'string', required: true },
          { name: 'period', label: 'Period', type: 'string', required: true },
          { name: 'amount', label: 'Amount ($)', type: 'number', required: true },
          {
            name: 'state',
            label: 'State',
            type: 'enum',
            values: ['draft', 'issued', 'paid', 'disputed'],
            required: true,
          },
        ],
        actions: [{ name: 'Issue' }],
        samples: [
          { engagement: 'ARD-114', period: 'Aug 2026', amount: 84000, state: 'issued' },
          { engagement: 'ARD-115', period: 'Aug 2026', amount: 31250, state: 'draft' },
          { engagement: 'ARD-109', period: 'Jul 2026', amount: 120000, state: 'paid' },
        ],
      },
    ],
    namespace: {
      name: 'Delivery',
      path: '/api/delivery',
      description: 'Engagement, staffing, deliverable, and billing operations.',
    },
    endpoints: [
      { method: 'GET', path: '/engagements', operation: 'Engagement.List', description: 'The portfolio by status.' },
      {
        method: 'POST',
        path: '/engagements',
        operation: 'Engagement.Scope',
        description: 'Open and scope an engagement.',
      },
      {
        method: 'GET',
        path: '/engagements/{id}/staffing',
        operation: 'StaffingPlan.Read',
        description: 'Current allocation.',
      },
      {
        method: 'POST',
        path: '/staffing',
        operation: 'StaffingPlan.Assign',
        description: 'Commit people to an engagement.',
      },
      {
        method: 'GET',
        path: '/deliverables',
        operation: 'Deliverable.List',
        description: 'Deliverables and their state.',
      },
      {
        method: 'POST',
        path: '/time/{id}/approve',
        operation: 'TimeEntry.Approve',
        description: 'Approve booked time.',
      },
      { method: 'POST', path: '/invoices', operation: 'Invoice.Issue', description: 'Issue an invoice.' },
    ],
    layout: { name: 'DeliveryShell', type: 'sidebar' },
    pages: [
      {
        name: 'EngagementPortfolio',
        resource: 'Engagement',
        description: 'Every engagement, by status.',
        blocks: [
          { name: 'EngagementTable', type: 'table', operation: 'Engagement.List' },
          { name: 'MarginSummary', type: 'summary' },
        ],
      },
      {
        name: 'StaffingBoard',
        resource: 'StaffingPlan',
        description: 'Allocations against the bench.',
        blocks: [
          { name: 'StaffingForm', type: 'form', operation: 'StaffingPlan.Read' },
          { name: 'AssignAction', type: 'actions', operation: 'StaffingPlan.Assign' },
        ],
      },
      {
        name: 'DeliverableTracker',
        resource: 'Deliverable',
        description: 'What is due, and what is late.',
        blocks: [{ name: 'DeliverableTable', type: 'table', operation: 'Deliverable.List' }],
      },
      {
        name: 'BillingRun',
        resource: 'Invoice',
        description: 'Approved time turned into invoices.',
        blocks: [{ name: 'IssueAction', type: 'actions', operation: 'Invoice.Issue' }],
      },
    ],
    routes: [
      { path: '/engagements', page: 'EngagementPortfolio', protected: true, description: 'Engagement portfolio.' },
      { path: '/staffing', page: 'StaffingBoard', protected: true, description: 'Staffing board.' },
      { path: '/deliverables', page: 'DeliverableTracker', protected: true, description: 'Deliverable tracker.' },
      { path: '/billing', page: 'BillingRun', protected: true, description: 'Billing run.' },
    ],
  },

  technical: {
    providers: [
      { name: 'GoogleCloud', type: 'cloud', description: 'Delivery surfaces.', region: 'iad1' },
      {
        name: 'CloudSql',
        type: 'database',
        description: 'Engagements, staffing, time, invoices.',
        region: 'us-east-2',
      },
      { name: 'OneLogin', type: 'auth', description: 'Consultant and subcontractor identity.' },
      { name: 'OpenAir', type: 'other', description: 'The PSA system of record for utilisation and realisation.' },
    ],
    environments: [
      { name: 'dev', description: 'Sample engagements.', providers: ['GoogleCloud', 'CloudSql'] },
      {
        name: 'staging',
        description: 'Billing rehearsal before month end.',
        providers: ['GoogleCloud', 'CloudSql', 'OneLogin'],
      },
      {
        name: 'prod',
        description: 'Live delivery and billing.',
        providers: ['GoogleCloud', 'CloudSql', 'OneLogin', 'OpenAir'],
      },
    ],
    cells: [
      {
        name: 'DeliveryWeb',
        dna: 'ArdentConsulting.Product.Web',
        adapter: { type: 'nextjs', version: '15' },
        environment: 'prod',
        description: 'Portfolio, staffing, and deliverable surfaces.',
      },
      {
        name: 'EngagementService',
        dna: 'ArdentConsulting.Product.Api',
        adapter: { type: 'nestjs', version: '10' },
        environment: 'prod',
        description: 'Engagements, scope, and closure.',
      },
      {
        name: 'StaffingService',
        dna: 'ArdentConsulting.Product.Api',
        adapter: { type: 'nestjs', version: '10' },
        environment: 'prod',
        description: 'Bench, allocations, and utilisation.',
      },
      {
        name: 'BillingWorker',
        dna: 'ArdentConsulting.Operational',
        adapter: { type: 'express', version: '4' },
        environment: 'prod',
        description: 'Runs the approve-then-bill sequence at period end.',
      },
      {
        name: 'DeliveryDb',
        dna: 'ArdentConsulting.Product.Core',
        adapter: { type: 'postgres', version: '16' },
        environment: 'prod',
        description: 'Engagements, plans, deliverables, time, invoices.',
      },
    ],
    connections: [
      { source: 'DeliveryWeb', target: 'EngagementService', type: 'data-flow', label: 'portfolio' },
      { source: 'DeliveryWeb', target: 'StaffingService', type: 'data-flow', label: 'allocations' },
      { source: 'EngagementService', target: 'StaffingService', type: 'depends-on', label: 'scope agreed' },
      { source: 'EngagementService', target: 'BillingWorker', type: 'publishes-to', label: 'time.approved' },
      { source: 'BillingWorker', target: 'DeliveryDb', type: 'depends-on' },
      { source: 'EngagementService', target: 'DeliveryDb', type: 'depends-on' },
    ],
  },
};

export default professional;
