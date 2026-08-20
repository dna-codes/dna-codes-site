// Meridian Partners — the M&A genome.
//
// Value proposition it has to make obvious: operational modeling and business valuation. So the
// process runs a target from screening through close, and the product layer carries the two
// things a diligence read actually wants — the target's operating model and the valuation built
// on top of it.
//
// Everything the /whats-your-dna page shows for M&A comes out of this file.

import type { AuthoredGenome } from '~/utils/genome-types';

export const ma: AuthoredGenome = {
  key: 'ma',
  ontologies: [
    {
      name: 'ASC 805 / IFRS 3',
      note: 'Business combinations — purchase price allocation, goodwill, identifiable intangibles.',
    },
    { name: 'Quality of Earnings', note: 'Adjusted EBITDA, add-backs, run-rate adjustments, working-capital peg.' },
    {
      name: 'Standard diligence workstreams',
      note: 'Financial, legal, commercial, technical, people, tax, environmental.',
    },
  ],
  domain: 'MeridianPartners',
  domainPath: 'meridian.deals',
  orgName: 'Meridian Partners',
  description:
    'A mid-market acquirer running screening, diligence, valuation, and integration planning on a repeatable deal process.',

  resources: [
    {
      name: 'Target',
      description: 'A company under evaluation, from first screen through close or pass.',
      attributes: [
        { name: 'legalName', type: 'string', required: true },
        { name: 'sector', type: 'string', required: true },
        { name: 'revenue', type: 'number' },
        {
          name: 'stage',
          type: 'enum',
          values: ['screening', 'diligence', 'negotiation', 'closed', 'passed'],
          required: true,
        },
      ],
      actions: [
        {
          name: 'Screen',
          type: 'write',
          description: 'Assess fit against the thesis before spending diligence hours.',
        },
        { name: 'Approve', type: 'write', description: 'Commit the committee to proceed.' },
      ],
    },
    {
      name: 'DiligenceRequest',
      description: 'One information request against a target, with its owner and status.',
      attributes: [
        {
          name: 'workstream',
          type: 'enum',
          values: ['financial', 'legal', 'commercial', 'technical', 'people'],
          required: true,
        },
        { name: 'question', type: 'text', required: true },
        { name: 'status', type: 'enum', values: ['open', 'answered', 'flagged'], required: true },
      ],
      actions: [{ name: 'Resolve', type: 'write', description: 'Close a request against a received answer.' }],
    },
    {
      name: 'ValuationModel',
      description: 'The financial model behind an offer — base, upside, and downside cases.',
      attributes: [
        { name: 'method', type: 'enum', values: ['dcf', 'comparables', 'precedent', 'lbo'], required: true },
        { name: 'enterpriseValue', type: 'number', required: true },
        { name: 'impliedMultiple', type: 'number' },
        { name: 'adjustedEbitda', type: 'number', description: 'Quality-of-earnings adjusted EBITDA.' },
        { name: 'workingCapitalPeg', type: 'number', description: 'The normalised working-capital target at close.' },
        { name: 'netDebt', type: 'number', description: 'Bridges enterprise value to equity value.' },
        { name: 'preparedOn', type: 'date' },
      ],
      actions: [{ name: 'Build', type: 'write', description: 'Assemble the model from diligence findings.' }],
    },
    {
      name: 'SynergyCase',
      description: 'A named cost or revenue synergy with an owner and a confidence level.',
      attributes: [
        { name: 'category', type: 'enum', values: ['cost', 'revenue', 'capital'], required: true },
        { name: 'annualValue', type: 'number', required: true },
        { name: 'confidence', type: 'enum', values: ['high', 'medium', 'low'], required: true },
      ],
      actions: [{ name: 'Validate', type: 'write', description: 'Test a synergy claim against diligence evidence.' }],
    },
    {
      name: 'IntegrationPlan',
      description: 'The first-hundred-days plan for a target that clears committee.',
      attributes: [
        { name: 'owner', type: 'string', required: true },
        { name: 'startDate', type: 'date' },
        { name: 'workstreamCount', type: 'number' },
      ],
      actions: [{ name: 'Draft', type: 'write', description: 'Draft the integration plan ahead of close.' }],
    },
  ],

  persons: [
    { name: 'Associate', description: 'A member of the deal organisation — analyst through partner.' },
    { name: 'Advisor', description: 'External counsel, accountants, or bankers on a deal.' },
    { name: 'TargetContact', description: 'A counterparty at the company under evaluation.' },
  ],

  roles: [
    { name: 'ManagingPartner', description: 'Chairs the investment committee and owns the final go/no-go.' },
    {
      name: 'DealLead',
      parent: 'ManagingPartner',
      description: 'Runs one deal end to end and owns the recommendation.',
    },
    {
      name: 'DiligenceLead',
      parent: 'DealLead',
      description: 'Coordinates the workstreams and owns the request register.',
    },
    {
      name: 'FinancialAnalyst',
      parent: 'DealLead',
      description: 'Builds the valuation model and tests the synergy cases.',
    },
    {
      name: 'IntegrationLead',
      parent: 'ManagingPartner',
      description: 'Owns the first hundred days and inherits the operating model at close.',
    },
  ],

  groups: [
    { name: 'InvestmentCommittee', description: 'The body that approves proceeding, offering, and closing.' },
    { name: 'DealTeam', description: 'Everyone working one transaction.' },
  ],

  memberships: [
    { name: 'AssociateAsDealLead', person: 'Associate', role: 'DealLead', group: 'DealTeam' },
    { name: 'AssociateAsDiligenceLead', person: 'Associate', role: 'DiligenceLead', group: 'DealTeam' },
    { name: 'AssociateAsAnalyst', person: 'Associate', role: 'FinancialAnalyst', group: 'DealTeam' },
    { name: 'AssociateAsManagingPartner', person: 'Associate', role: 'ManagingPartner', group: 'InvestmentCommittee' },
    { name: 'AdvisorOnDealTeam', person: 'Advisor', role: 'DiligenceLead', group: 'DealTeam' },
  ],

  operations: [
    { target: 'Target', action: 'Screen', description: 'Assess a target against the investment thesis.' },
    { target: 'Target', action: 'Approve', description: 'Commit the committee to proceed to an offer.' },
    { target: 'Target', action: 'List', description: 'List targets in the pipeline by stage.' },
    { target: 'Target', action: 'Read', description: 'Read one target in full.' },
    { target: 'DiligenceRequest', action: 'Resolve', description: 'Close a diligence request.' },
    { target: 'DiligenceRequest', action: 'List', description: 'List open requests by workstream.' },
    { target: 'ValuationModel', action: 'Build', description: 'Assemble the valuation from diligence findings.' },
    { target: 'ValuationModel', action: 'Read', description: 'Read a valuation model and its cases.' },
    { target: 'SynergyCase', action: 'Validate', description: 'Test a synergy claim against evidence.' },
    { target: 'IntegrationPlan', action: 'Draft', description: 'Draft the hundred-day plan.' },
  ],

  process: {
    name: 'DealExecution',
    description: 'Screening through close — the operating model that produces a defensible valuation.',
    operator: 'ManagingPartner',
    steps: [
      {
        id: 'screen-target',
        title: 'Screen target',
        actor: 'DealLead',
        operation: 'Target.Screen',
        description: 'Test the target against the thesis before any diligence hours are committed.',
      },
      {
        id: 'open-diligence',
        title: 'Open diligence',
        actor: 'DiligenceLead',
        operation: 'DiligenceRequest.List',
        description: 'Stand up the request register across financial, legal, commercial, technical, and people.',
        consulted: ['DealLead'],
      },
      {
        id: 'resolve-requests',
        title: 'Resolve requests',
        actor: 'DiligenceLead',
        operation: 'DiligenceRequest.Resolve',
        description: 'Work the register to closed, flagging anything that changes the thesis.',
        consulted: ['FinancialAnalyst'],
      },
      {
        id: 'validate-synergies',
        title: 'Validate synergies',
        actor: 'FinancialAnalyst',
        operation: 'SynergyCase.Validate',
        description: 'Test each claimed synergy against diligence evidence and mark its confidence.',
        consulted: ['IntegrationLead'],
      },
      {
        id: 'build-valuation',
        title: 'Build valuation',
        actor: 'FinancialAnalyst',
        operation: 'ValuationModel.Build',
        description: 'Assemble base, upside, and downside cases from the resolved register.',
        consulted: ['DealLead'],
      },
      {
        id: 'committee-approval',
        title: 'Committee approval',
        actor: 'ManagingPartner',
        operation: 'Target.Approve',
        description: 'Investment committee decides go, no-go, or revised terms.',
        consulted: ['DealLead', 'IntegrationLead'],
      },
      {
        id: 'draft-integration-plan',
        title: 'Draft integration plan',
        actor: 'IntegrationLead',
        operation: 'IntegrationPlan.Draft',
        description: 'Turn the approved operating model into the first hundred days.',
      },
    ],
  },

  rules: [
    {
      name: 'ValuationRequiresClosedRegister',
      operation: 'ValuationModel.Build',
      ruleType: 'condition',
      description: 'No valuation is built while financial or legal requests are still open.',
    },
    {
      name: 'CommitteeApprovesTargets',
      operation: 'Target.Approve',
      ruleType: 'access',
      description: 'Approval to proceed is the committee’s alone — a deal lead cannot approve their own deal.',
      allow: [{ role: 'ManagingPartner' }],
    },
    {
      name: 'AnalystsOwnTheModel',
      operation: 'ValuationModel.Build',
      ruleType: 'access',
      description: 'The model is built by the analyst who can defend it, not by the person selling the deal.',
      allow: [{ role: 'FinancialAnalyst' }, { role: 'ManagingPartner' }],
    },
    {
      name: 'SynergiesValidatedByBothSides',
      operation: 'SynergyCase.Validate',
      ruleType: 'access',
      description: 'A synergy counts once the analyst and the person who has to deliver it both sign it.',
      allow: [{ role: 'FinancialAnalyst' }, { role: 'IntegrationLead' }],
    },
  ],

  triggers: [
    { source: 'user', process: 'DealExecution', description: 'A target enters the pipeline.' },
    {
      source: 'schedule',
      operation: 'DiligenceRequest.List',
      schedule: '0 8 * * 1',
      description: 'Monday register review across every live deal.',
    },
  ],

  product: {
    resources: [
      {
        name: 'Target',
        resource: 'Target',
        description: 'The pipeline record for a company under evaluation.',
        fields: [
          { name: 'legalName', label: 'Target', type: 'string', required: true },
          { name: 'sector', label: 'Sector', type: 'string', required: true },
          {
            name: 'stage',
            label: 'Stage',
            type: 'enum',
            values: ['screening', 'diligence', 'negotiation', 'closed', 'passed'],
            required: true,
          },
          { name: 'revenue', label: 'Revenue ($M)', type: 'number' },
          { name: 'dealLead', label: 'Deal lead', type: 'string' },
        ],
        actions: [{ name: 'Screen' }, { name: 'Approve' }],
        samples: [
          {
            legalName: 'Halcyon Fabrication',
            sector: 'Industrials',
            stage: 'diligence',
            revenue: 84.2,
            dealLead: 'R. Ibarra',
          },
          {
            legalName: 'Northwind Logistics',
            sector: 'Transport',
            stage: 'negotiation',
            revenue: 143.0,
            dealLead: 'S. Adeyemi',
          },
          {
            legalName: 'Copperline Foods',
            sector: 'Consumer',
            stage: 'screening',
            revenue: 31.5,
            dealLead: 'R. Ibarra',
          },
          { legalName: 'Vantage Dental', sector: 'Healthcare', stage: 'passed', revenue: 22.8, dealLead: 'T. Brennan' },
        ],
      },
      {
        name: 'ValuationModel',
        resource: 'ValuationModel',
        description: 'The model behind an offer.',
        fields: [
          {
            name: 'method',
            label: 'Method',
            type: 'enum',
            values: ['dcf', 'comparables', 'precedent', 'lbo'],
            required: true,
          },
          { name: 'enterpriseValue', label: 'EV ($M)', type: 'number', required: true },
          { name: 'impliedMultiple', label: 'Implied x', type: 'number' },
          { name: 'preparedOn', label: 'Prepared', type: 'date' },
        ],
        actions: [{ name: 'Build' }],
        samples: [
          { method: 'dcf', enterpriseValue: 312.0, impliedMultiple: 8.4, preparedOn: '2026-07-30' },
          { method: 'comparables', enterpriseValue: 298.5, impliedMultiple: 8.0, preparedOn: '2026-07-30' },
          { method: 'lbo', enterpriseValue: 271.0, impliedMultiple: 7.3, preparedOn: '2026-08-04' },
        ],
      },
      {
        name: 'DiligenceRequest',
        resource: 'DiligenceRequest',
        description: 'The request register, by workstream.',
        fields: [
          {
            name: 'workstream',
            label: 'Workstream',
            type: 'enum',
            values: ['financial', 'legal', 'commercial', 'technical', 'people'],
            required: true,
          },
          { name: 'question', label: 'Request', type: 'text', required: true },
          { name: 'status', label: 'Status', type: 'enum', values: ['open', 'answered', 'flagged'], required: true },
          { name: 'owner', label: 'Owner', type: 'string' },
        ],
        actions: [{ name: 'Resolve' }],
        samples: [
          {
            workstream: 'financial',
            question: 'Three-year revenue bridge by customer',
            status: 'answered',
            owner: 'T. Brennan',
          },
          {
            workstream: 'legal',
            question: 'Change-of-control clauses in top 20 contracts',
            status: 'flagged',
            owner: 'Counsel',
          },
          { workstream: 'people', question: 'Retention risk in plant leadership', status: 'open', owner: 'S. Adeyemi' },
        ],
      },
      {
        name: 'SynergyCase',
        resource: 'SynergyCase',
        description: 'Claimed synergies and how well they hold up.',
        fields: [
          { name: 'category', label: 'Category', type: 'enum', values: ['cost', 'revenue', 'capital'], required: true },
          { name: 'annualValue', label: 'Annual ($M)', type: 'number', required: true },
          { name: 'confidence', label: 'Confidence', type: 'enum', values: ['high', 'medium', 'low'], required: true },
        ],
        actions: [{ name: 'Validate' }],
        samples: [
          { category: 'cost', annualValue: 6.4, confidence: 'high' },
          { category: 'revenue', annualValue: 11.2, confidence: 'low' },
          { category: 'capital', annualValue: 2.8, confidence: 'medium' },
        ],
      },
    ],
    namespace: { name: 'Deals', path: '/api/deals', description: 'Pipeline, diligence, and valuation operations.' },
    endpoints: [
      { method: 'GET', path: '/targets', operation: 'Target.List', description: 'Pipeline by stage.' },
      { method: 'GET', path: '/targets/{id}', operation: 'Target.Read', description: 'One target in full.' },
      {
        method: 'POST',
        path: '/targets/{id}/approve',
        operation: 'Target.Approve',
        description: 'Record a committee decision.',
      },
      {
        method: 'GET',
        path: '/requests',
        operation: 'DiligenceRequest.List',
        description: 'The register, by workstream.',
      },
      {
        method: 'POST',
        path: '/requests/{id}/resolve',
        operation: 'DiligenceRequest.Resolve',
        description: 'Close a request.',
      },
      {
        method: 'GET',
        path: '/valuations/{id}',
        operation: 'ValuationModel.Read',
        description: 'A model and its cases.',
      },
      { method: 'POST', path: '/valuations', operation: 'ValuationModel.Build', description: 'Build a model.' },
    ],
    layout: { name: 'DealRoom', type: 'sidebar' },
    pages: [
      {
        name: 'Pipeline',
        resource: 'Target',
        description: 'Every live target by stage.',
        blocks: [
          { name: 'TargetTable', type: 'table', operation: 'Target.List' },
          { name: 'StageFilter', type: 'summary' },
        ],
      },
      {
        name: 'TargetDetail',
        resource: 'Target',
        description: 'One target, its register, and its model.',
        blocks: [
          { name: 'TargetForm', type: 'form', operation: 'Target.Read' },
          { name: 'ApproveAction', type: 'actions', operation: 'Target.Approve' },
        ],
      },
      {
        name: 'DiligenceRegister',
        resource: 'DiligenceRequest',
        description: 'Open requests across workstreams.',
        blocks: [{ name: 'RequestTable', type: 'table', operation: 'DiligenceRequest.List' }],
      },
      {
        name: 'ValuationWorkbench',
        resource: 'ValuationModel',
        description: 'Cases side by side.',
        blocks: [{ name: 'BuildAction', type: 'actions', operation: 'ValuationModel.Build' }],
      },
    ],
    routes: [
      { path: '/pipeline', page: 'Pipeline', protected: true, description: 'Deal pipeline.' },
      { path: '/targets/:id', page: 'TargetDetail', protected: true, description: 'Single target.' },
      { path: '/diligence', page: 'DiligenceRegister', protected: true, description: 'Request register.' },
      { path: '/valuation/:id', page: 'ValuationWorkbench', protected: true, description: 'Valuation cases.' },
    ],
  },

  technical: {
    providers: [
      { name: 'Azure', type: 'cloud', description: 'Deal room and services.', region: 'us-east-1' },
      {
        name: 'Snowflake',
        type: 'database',
        description: 'Target financials and the model workbench.',
        region: 'us-east-1',
      },
      { name: 'EntraId', type: 'auth', description: 'Identity for partners, analysts, and external advisors.' },
      { name: 'Datasite', type: 'storage', description: 'The virtual data room, with per-deal document access logs.' },
    ],
    environments: [
      { name: 'dev', description: 'Analyst sandboxes with synthetic targets.', providers: ['Azure', 'Snowflake'] },
      {
        name: 'staging',
        description: 'Committee rehearsal environment.',
        providers: ['Azure', 'Snowflake', 'EntraId'],
      },
      { name: 'prod', description: 'Live deals.', providers: ['Azure', 'Snowflake', 'EntraId', 'Datasite'] },
    ],
    cells: [
      {
        name: 'DealRoomWeb',
        dna: 'MeridianPartners.Product.Web',
        adapter: { type: 'nextjs', version: '15' },
        environment: 'prod',
        description: 'The partner-facing deal room.',
      },
      {
        name: 'PipelineService',
        dna: 'MeridianPartners.Product.Api',
        adapter: { type: 'nestjs', version: '10' },
        environment: 'prod',
        description: 'Targets, stages, and committee decisions.',
      },
      {
        name: 'DiligenceService',
        dna: 'MeridianPartners.Product.Api',
        adapter: { type: 'nestjs', version: '10' },
        environment: 'prod',
        description: 'The request register and its workstreams.',
      },
      {
        name: 'ValuationEngine',
        dna: 'MeridianPartners.Operational',
        adapter: { type: 'express', version: '4' },
        environment: 'prod',
        description: 'Runs the model cases off resolved diligence.',
      },
      {
        name: 'DealDb',
        dna: 'MeridianPartners.Product.Core',
        adapter: { type: 'postgres', version: '16' },
        environment: 'prod',
        description: 'Targets, requests, models, synergies.',
      },
    ],
    connections: [
      { source: 'DealRoomWeb', target: 'PipelineService', type: 'data-flow', label: 'pipeline' },
      { source: 'DealRoomWeb', target: 'DiligenceService', type: 'data-flow', label: 'register' },
      { source: 'ValuationEngine', target: 'DiligenceService', type: 'depends-on', label: 'resolved requests' },
      { source: 'PipelineService', target: 'ValuationEngine', type: 'publishes-to', label: 'target.approved' },
      { source: 'PipelineService', target: 'DealDb', type: 'depends-on' },
      { source: 'DiligenceService', target: 'DealDb', type: 'depends-on' },
    ],
  },
};

export default ma;
