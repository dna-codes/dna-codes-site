// Keystone Financial — the financial services genome.
//
// Value proposition it has to make obvious: products, approvals, and the authority behind each
// one. So the process is an origination that passes through a decision, and the rules are
// delegation limits — who may approve what, up to how much. That is the artifact a bank actually
// argues about.

import type { AuthoredGenome } from '~/utils/genome-types';

export const financial: AuthoredGenome = {
  key: 'financial',
  ontologies: [
    { name: 'FIBO', note: 'Financial Industry Business Ontology — facility, obligor, and exposure concepts.' },
    { name: 'BIAN', note: 'Service domains — Credit Facility, Credit Decisioning, Collateral Administration.' },
    { name: 'Basel III', note: 'PD, LGD, EAD, and risk-weighted assets on the credit file and exposure.' },
    { name: 'ISO 20022', note: 'Payment instruction message types for disbursement.' },
  ],
  domain: 'KeystoneFinancial',
  domainPath: 'keystone.lending',
  orgName: 'Keystone Financial',
  description:
    'A commercial lender running origination through servicing under delegated approval authority and exposure limits.',

  resources: [
    {
      name: 'Application',
      description: 'A credit request from a borrower, from submission through decision.',
      attributes: [
        { name: 'reference', type: 'string', required: true },
        { name: 'amount', type: 'number', required: true },
        {
          name: 'purpose',
          type: 'enum',
          values: ['working-capital', 'equipment', 'real-estate', 'refinance'],
          required: true,
        },
        {
          name: 'status',
          type: 'enum',
          values: ['submitted', 'underwriting', 'approved', 'declined', 'funded'],
          required: true,
        },
      ],
      actions: [
        { name: 'Submit', type: 'write', description: 'Take in the request and open a file.' },
        { name: 'Decide', type: 'write', description: 'Approve or decline within delegated authority.' },
        { name: 'List', type: 'read', description: 'List applications in the pipeline.' },
      ],
    },
    {
      name: 'CreditFile',
      description: 'The analysis behind a decision — spreads, ratios, and the recommendation.',
      attributes: [
        { name: 'riskGrade', type: 'enum', values: ['1', '2', '3', '4', '5', '6'], required: true },
        { name: 'debtServiceCoverage', type: 'number' },
        { name: 'probabilityOfDefault', type: 'number', description: 'Basel III PD, as a decimal.' },
        { name: 'lossGivenDefault', type: 'number', description: 'Basel III LGD, as a decimal.' },
        { name: 'exposureAtDefault', type: 'number', description: 'Basel III EAD, in thousands.' },
        {
          name: 'recommendation',
          type: 'enum',
          values: ['approve', 'approve-with-conditions', 'decline'],
          required: true,
        },
      ],
      actions: [{ name: 'Underwrite', type: 'write', description: 'Spread the financials and grade the risk.' }],
    },
    {
      name: 'Facility',
      description: 'An approved credit line or loan, with its terms and covenants.',
      attributes: [
        { name: 'facilityType', type: 'enum', values: ['term-loan', 'revolver', 'letter-of-credit'], required: true },
        { name: 'committedAmount', type: 'number', required: true },
        { name: 'rate', type: 'number' },
        { name: 'maturity', type: 'date' },
      ],
      actions: [
        { name: 'Fund', type: 'write', description: 'Disburse against the approved facility.' },
        { name: 'Monitor', type: 'read', description: 'Track covenant compliance over the life of the facility.' },
      ],
    },
    {
      name: 'ApprovalAuthority',
      description: 'The delegation grid — which role may approve up to which amount and risk grade.',
      attributes: [
        { name: 'limit', type: 'number', required: true },
        { name: 'maxRiskGrade', type: 'enum', values: ['1', '2', '3', '4', '5', '6'], required: true },
        { name: 'requiresSecondSignature', type: 'boolean' },
      ],
      actions: [{ name: 'Read', type: 'read', description: 'Look up the authority applying to a request.' }],
    },
    {
      name: 'Exposure',
      description: 'Aggregate committed and outstanding exposure to one borrower or sector.',
      attributes: [
        { name: 'committed', type: 'number', required: true },
        { name: 'outstanding', type: 'number', required: true },
        { name: 'riskWeightedAssets', type: 'number', description: 'Basel III RWA carried against this obligor.' },
        { name: 'concentration', type: 'enum', values: ['within-limit', 'watch', 'over-limit'], required: true },
      ],
      actions: [{ name: 'Recalculate', type: 'write', description: 'Recompute exposure after a funding event.' }],
    },
  ],

  persons: [
    { name: 'Banker', description: 'A member of the lending organisation — relationship, credit, or operations.' },
    { name: 'Borrower', description: 'A business seeking or holding credit.' },
    { name: 'Guarantor', description: 'A party standing behind a borrower’s obligations.' },
  ],

  roles: [
    { name: 'ChiefCreditOfficer', description: 'Owns the credit policy and the delegation grid.' },
    {
      name: 'CreditCommitteeChair',
      parent: 'ChiefCreditOfficer',
      description: 'Decides anything above delegated authority.',
    },
    {
      name: 'RelationshipManager',
      parent: 'ChiefCreditOfficer',
      description: 'Owns the borrower and brings the request.',
    },
    { name: 'CreditAnalyst', parent: 'ChiefCreditOfficer', description: 'Spreads the financials and grades the risk.' },
    {
      name: 'LoanOperationsSpecialist',
      parent: 'ChiefCreditOfficer',
      description: 'Books, funds, and services the facility.',
    },
  ],

  groups: [
    { name: 'CreditCommittee', description: 'The body that decides above the delegation grid.' },
    { name: 'LendingTeam', description: 'Relationship, analysis, and operations on one deal.' },
  ],

  memberships: [
    { name: 'BankerAsRelationshipManager', person: 'Banker', role: 'RelationshipManager', group: 'LendingTeam' },
    { name: 'BankerAsCreditAnalyst', person: 'Banker', role: 'CreditAnalyst', group: 'LendingTeam' },
    { name: 'BankerAsLoanOps', person: 'Banker', role: 'LoanOperationsSpecialist', group: 'LendingTeam' },
    { name: 'BankerAsCommitteeChair', person: 'Banker', role: 'CreditCommitteeChair', group: 'CreditCommittee' },
    { name: 'BankerAsChiefCreditOfficer', person: 'Banker', role: 'ChiefCreditOfficer', group: 'CreditCommittee' },
  ],

  operations: [
    { target: 'Application', action: 'Submit', description: 'Open a credit file from a borrower request.' },
    { target: 'Application', action: 'Decide', description: 'Approve or decline within authority.' },
    { target: 'Application', action: 'List', description: 'List the origination pipeline.' },
    { target: 'CreditFile', action: 'Underwrite', description: 'Spread financials, grade risk, recommend.' },
    { target: 'CreditFile', action: 'Read', description: 'Read the analysis behind a decision.' },
    { target: 'ApprovalAuthority', action: 'Read', description: 'Look up the applicable delegated authority.' },
    { target: 'Facility', action: 'Fund', description: 'Disburse against an approved facility.' },
    { target: 'Facility', action: 'Monitor', description: 'Track covenants over the facility’s life.' },
    { target: 'Exposure', action: 'Recalculate', description: 'Recompute borrower and sector exposure.' },
  ],

  process: {
    name: 'CreditOrigination',
    description: 'Request through funding, with the approval authority checked before anyone decides.',
    operator: 'ChiefCreditOfficer',
    steps: [
      {
        id: 'take-application',
        title: 'Take application',
        actor: 'RelationshipManager',
        operation: 'Application.Submit',
        description: 'Capture the request, the purpose, and the borrower’s existing relationship.',
      },
      {
        id: 'underwrite',
        title: 'Underwrite',
        actor: 'CreditAnalyst',
        operation: 'CreditFile.Underwrite',
        description: 'Spread the financials, compute coverage, grade the risk, and recommend.',
        consulted: ['RelationshipManager'],
      },
      {
        id: 'check-authority',
        title: 'Check authority',
        actor: 'CreditAnalyst',
        operation: 'ApprovalAuthority.Read',
        description: 'Resolve who may decide this amount at this risk grade before it goes anywhere.',
        consulted: ['ChiefCreditOfficer'],
      },
      {
        id: 'decide',
        title: 'Decide',
        actor: 'CreditCommitteeChair',
        operation: 'Application.Decide',
        description: 'Approve, approve with conditions, or decline — inside the resolved authority.',
        consulted: ['ChiefCreditOfficer', 'RelationshipManager'],
      },
      {
        id: 'fund-facility',
        title: 'Fund facility',
        actor: 'LoanOperationsSpecialist',
        operation: 'Facility.Fund',
        description: 'Book the facility, satisfy conditions precedent, and disburse.',
      },
      {
        id: 'recalculate-exposure',
        title: 'Recalculate exposure',
        actor: 'LoanOperationsSpecialist',
        operation: 'Exposure.Recalculate',
        description: 'Update borrower and sector exposure, and flag anything now over limit.',
        consulted: ['ChiefCreditOfficer'],
      },
    ],
  },

  rules: [
    {
      name: 'DecisionRequiresCompletedUnderwriting',
      operation: 'Application.Decide',
      ruleType: 'condition',
      description: 'Nothing is decided before the credit file carries a risk grade and a recommendation.',
    },
    {
      name: 'ApprovalWithinDelegatedAuthority',
      operation: 'Application.Decide',
      ruleType: 'access',
      description: 'Only the committee decides — the relationship manager who sourced the deal never approves it.',
      allow: [{ role: 'CreditCommitteeChair' }, { role: 'ChiefCreditOfficer' }],
    },
    {
      name: 'FundingIsOperations',
      operation: 'Facility.Fund',
      ruleType: 'access',
      description: 'Money moves through operations, not through the people who sold or approved the deal.',
      allow: [{ role: 'LoanOperationsSpecialist' }],
    },
    {
      name: 'RiskGradingIsIndependent',
      operation: 'CreditFile.Underwrite',
      ruleType: 'access',
      description: 'The grade is set by analysis, independent of the relationship it might disappoint.',
      allow: [{ role: 'CreditAnalyst' }, { role: 'ChiefCreditOfficer' }],
    },
    {
      name: 'ExposureLimitsAreTheCreditOfficers',
      operation: 'Exposure.Recalculate',
      ruleType: 'access',
      description: 'Concentration is a portfolio question, so it sits with the portfolio owner.',
      allow: [{ role: 'LoanOperationsSpecialist' }, { role: 'ChiefCreditOfficer' }],
    },
  ],

  triggers: [
    { source: 'user', process: 'CreditOrigination', description: 'A relationship manager submits a request.' },
    {
      source: 'schedule',
      operation: 'Facility.Monitor',
      schedule: '0 5 1 * *',
      description: 'Monthly covenant compliance sweep across the book.',
    },
  ],

  product: {
    resources: [
      {
        name: 'Application',
        resource: 'Application',
        description: 'The origination pipeline.',
        fields: [
          { name: 'reference', label: 'Ref', type: 'string', required: true, readonly: true },
          { name: 'borrower', label: 'Borrower', type: 'string', required: true },
          { name: 'amount', label: 'Amount ($K)', type: 'number', required: true },
          {
            name: 'purpose',
            label: 'Purpose',
            type: 'enum',
            values: ['working-capital', 'equipment', 'real-estate', 'refinance'],
            required: true,
          },
          {
            name: 'status',
            label: 'Status',
            type: 'enum',
            values: ['submitted', 'underwriting', 'approved', 'declined', 'funded'],
            required: true,
          },
        ],
        actions: [{ name: 'Decide' }],
        samples: [
          {
            reference: 'KF-2291',
            borrower: 'Harbor Machine Works',
            amount: 1450,
            purpose: 'equipment',
            status: 'underwriting',
          },
          {
            reference: 'KF-2292',
            borrower: 'Delta Grain Co-op',
            amount: 3200,
            purpose: 'working-capital',
            status: 'approved',
          },
          {
            reference: 'KF-2293',
            borrower: 'Fairlane Properties',
            amount: 8750,
            purpose: 'real-estate',
            status: 'submitted',
          },
          { reference: 'KF-2288', borrower: 'Union Freight', amount: 620, purpose: 'refinance', status: 'funded' },
        ],
      },
      {
        name: 'CreditFile',
        resource: 'CreditFile',
        description: 'The analysis behind each decision.',
        fields: [
          { name: 'application', label: 'Application', type: 'string', required: true },
          { name: 'riskGrade', label: 'Grade', type: 'enum', values: ['1', '2', '3', '4', '5', '6'], required: true },
          { name: 'debtServiceCoverage', label: 'DSCR', type: 'number' },
          {
            name: 'recommendation',
            label: 'Recommendation',
            type: 'enum',
            values: ['approve', 'approve-with-conditions', 'decline'],
            required: true,
          },
        ],
        actions: [{ name: 'Underwrite' }],
        samples: [
          {
            application: 'KF-2291',
            riskGrade: '3',
            debtServiceCoverage: 1.42,
            recommendation: 'approve-with-conditions',
          },
          { application: 'KF-2292', riskGrade: '2', debtServiceCoverage: 1.88, recommendation: 'approve' },
          { application: 'KF-2293', riskGrade: '4', debtServiceCoverage: 1.11, recommendation: 'decline' },
        ],
      },
      {
        name: 'ApprovalAuthority',
        resource: 'ApprovalAuthority',
        description: 'The delegation grid, as data rather than as a policy PDF.',
        fields: [
          { name: 'role', label: 'Role', type: 'string', required: true },
          { name: 'limit', label: 'Limit ($K)', type: 'number', required: true },
          {
            name: 'maxRiskGrade',
            label: 'Max grade',
            type: 'enum',
            values: ['1', '2', '3', '4', '5', '6'],
            required: true,
          },
          { name: 'requiresSecondSignature', label: 'Second signature', type: 'boolean' },
        ],
        samples: [
          { role: 'RelationshipManager', limit: 250, maxRiskGrade: '2', requiresSecondSignature: false },
          { role: 'CreditCommitteeChair', limit: 5000, maxRiskGrade: '4', requiresSecondSignature: true },
          { role: 'ChiefCreditOfficer', limit: 15000, maxRiskGrade: '5', requiresSecondSignature: true },
        ],
      },
      {
        name: 'Facility',
        resource: 'Facility',
        description: 'Booked facilities and their terms.',
        fields: [
          { name: 'borrower', label: 'Borrower', type: 'string', required: true },
          {
            name: 'facilityType',
            label: 'Type',
            type: 'enum',
            values: ['term-loan', 'revolver', 'letter-of-credit'],
            required: true,
          },
          { name: 'committedAmount', label: 'Committed ($K)', type: 'number', required: true },
          { name: 'rate', label: 'Rate %', type: 'number' },
          { name: 'maturity', label: 'Maturity', type: 'date' },
        ],
        actions: [{ name: 'Fund' }],
        samples: [
          {
            borrower: 'Delta Grain Co-op',
            facilityType: 'revolver',
            committedAmount: 3200,
            rate: 7.85,
            maturity: '2027-09-30',
          },
          {
            borrower: 'Union Freight',
            facilityType: 'term-loan',
            committedAmount: 620,
            rate: 8.4,
            maturity: '2030-06-15',
          },
        ],
      },
    ],
    namespace: {
      name: 'Lending',
      path: '/api/lending',
      description: 'Origination, underwriting, and servicing operations.',
    },
    endpoints: [
      { method: 'GET', path: '/applications', operation: 'Application.List', description: 'Origination pipeline.' },
      { method: 'POST', path: '/applications', operation: 'Application.Submit', description: 'Open a credit file.' },
      {
        method: 'POST',
        path: '/applications/{id}/decide',
        operation: 'Application.Decide',
        description: 'Record a decision.',
      },
      { method: 'GET', path: '/credit-files/{id}', operation: 'CreditFile.Read', description: 'The analysis.' },
      { method: 'GET', path: '/authority', operation: 'ApprovalAuthority.Read', description: 'The delegation grid.' },
      {
        method: 'POST',
        path: '/facilities/{id}/fund',
        operation: 'Facility.Fund',
        description: 'Disburse a facility.',
      },
      {
        method: 'GET',
        path: '/facilities/{id}/covenants',
        operation: 'Facility.Monitor',
        description: 'Covenant state.',
      },
    ],
    layout: { name: 'LendingShell', type: 'sidebar' },
    pages: [
      {
        name: 'OriginationPipeline',
        resource: 'Application',
        description: 'Every live request by status.',
        blocks: [
          { name: 'ApplicationTable', type: 'table', operation: 'Application.List' },
          { name: 'PipelineSummary', type: 'summary' },
        ],
      },
      {
        name: 'CreditFileDetail',
        resource: 'CreditFile',
        description: 'Spreads, grade, and recommendation.',
        blocks: [
          { name: 'CreditForm', type: 'form', operation: 'CreditFile.Read' },
          { name: 'DecideAction', type: 'actions', operation: 'Application.Decide' },
        ],
      },
      {
        name: 'AuthorityGrid',
        resource: 'ApprovalAuthority',
        description: 'Who may approve what.',
        blocks: [{ name: 'AuthorityTable', type: 'table', operation: 'ApprovalAuthority.Read' }],
      },
      {
        name: 'FacilityBook',
        resource: 'Facility',
        description: 'Booked facilities and funding.',
        blocks: [{ name: 'FundAction', type: 'actions', operation: 'Facility.Fund' }],
      },
    ],
    routes: [
      { path: '/pipeline', page: 'OriginationPipeline', protected: true, description: 'Origination pipeline.' },
      { path: '/credit-files/:id', page: 'CreditFileDetail', protected: true, description: 'Credit file.' },
      { path: '/authority', page: 'AuthorityGrid', protected: true, description: 'Delegation grid.' },
      { path: '/facilities', page: 'FacilityBook', protected: true, description: 'Facility book.' },
    ],
  },

  technical: {
    providers: [
      { name: 'Azure', type: 'cloud', description: 'Lending platform workloads.', region: 'us-east-1' },
      {
        name: 'OracleExadata',
        type: 'database',
        description: 'Applications, credit files, facilities.',
        region: 'us-east-1',
      },
      { name: 'PingIdentity', type: 'auth', description: 'Identity, with the delegation grid carried as claims.' },
      { name: 'Swift', type: 'messaging', description: 'ISO 20022 payment instructions for disbursement.' },
    ],
    environments: [
      { name: 'dev', description: 'Synthetic borrowers.', providers: ['Azure', 'OracleExadata'] },
      { name: 'staging', description: 'Core banking sandbox.', providers: ['Azure', 'OracleExadata', 'PingIdentity'] },
      { name: 'prod', description: 'Live book.', providers: ['Azure', 'OracleExadata', 'PingIdentity', 'Swift'] },
    ],
    cells: [
      {
        name: 'LendingWeb',
        dna: 'KeystoneFinancial.Product.Web',
        adapter: { type: 'nextjs', version: '15' },
        environment: 'prod',
        description: 'Pipeline, credit file, and authority surfaces.',
      },
      {
        name: 'OriginationService',
        dna: 'KeystoneFinancial.Product.Api',
        adapter: { type: 'nestjs', version: '10' },
        environment: 'prod',
        description: 'Applications and decisions.',
      },
      {
        name: 'AuthorityService',
        dna: 'KeystoneFinancial.Operational',
        adapter: { type: 'express', version: '4' },
        environment: 'prod',
        description: 'Resolves delegated authority before any decision is written.',
      },
      {
        name: 'ServicingService',
        dna: 'KeystoneFinancial.Product.Api',
        adapter: { type: 'nestjs', version: '10' },
        environment: 'prod',
        description: 'Funding, covenants, and exposure.',
      },
      {
        name: 'LendingDb',
        dna: 'KeystoneFinancial.Product.Core',
        adapter: { type: 'postgres', version: '16' },
        environment: 'prod',
        description: 'Applications, files, facilities, exposure.',
      },
    ],
    connections: [
      { source: 'LendingWeb', target: 'OriginationService', type: 'data-flow', label: 'pipeline' },
      { source: 'OriginationService', target: 'AuthorityService', type: 'depends-on', label: 'authority check' },
      { source: 'OriginationService', target: 'ServicingService', type: 'publishes-to', label: 'application.approved' },
      { source: 'ServicingService', target: 'LendingDb', type: 'depends-on' },
      { source: 'OriginationService', target: 'LendingDb', type: 'depends-on' },
    ],
  },
};

export default financial;
