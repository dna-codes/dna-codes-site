// Bastion Assurance — the security & compliance genome.
//
// Value proposition it has to make obvious: controls mapped to the operations they actually
// govern. That is the whole reason this genome exists — a control framework floating beside the
// business is what every GRC tool already sells. Here the controls point at operations declared
// in the same document, which is why this industry's access-control artifact has an ungoverned
// list worth reading.

import type { AuthoredGenome } from '~/utils/genome-types';

export const security: AuthoredGenome = {
  key: 'security',
  ontologies: [
    { name: 'SOC 2 Trust Services Criteria', note: 'Control references (CC1–CC9) and the five criteria categories.' },
    { name: 'NIST SP 800-53 Rev. 5', note: 'Control family mappings — AC, AU, CM, IR.' },
    { name: 'NIST OSCAL', note: 'Catalog, profile, assessment result, and plan-of-action-and-milestones artifacts.' },
  ],
  domain: 'BastionAssurance',
  domainPath: 'bastion.assurance',
  orgName: 'Bastion Assurance',
  description:
    'A security and compliance function running control ownership, evidence collection, findings, and attestation on one operating model.',

  resources: [
    {
      name: 'Control',
      description: 'One control from the framework, with its owner and testing cadence.',
      attributes: [
        { name: 'reference', type: 'string', required: true, description: 'Framework reference, e.g. CC6.1.' },
        { name: 'objective', type: 'text', required: true },
        { name: 'frequency', type: 'enum', values: ['continuous', 'monthly', 'quarterly', 'annual'], required: true },
        {
          name: 'criteria',
          type: 'enum',
          values: ['security', 'availability', 'confidentiality', 'processing-integrity', 'privacy'],
          required: true,
          description: 'The SOC 2 Trust Services Criteria category this control serves.',
        },
        { name: 'nistMapping', type: 'string', description: 'NIST SP 800-53 Rev. 5 control, e.g. AC-2.' },
        { name: 'automated', type: 'boolean' },
      ],
      actions: [
        { name: 'Test', type: 'write', description: 'Run the control test for the period.' },
        { name: 'List', type: 'read', description: 'List controls by framework or owner.' },
      ],
    },
    {
      name: 'Evidence',
      description: 'An artifact collected to demonstrate a control operated as designed.',
      attributes: [
        { name: 'collectedOn', type: 'date', required: true },
        { name: 'source', type: 'enum', values: ['system', 'screenshot', 'attestation', 'log-export'], required: true },
        { name: 'period', type: 'string', required: true },
      ],
      actions: [{ name: 'Collect', type: 'write', description: 'Gather and attach evidence for a period.' }],
    },
    {
      name: 'Finding',
      description: 'A control that did not operate as designed, with its severity and remediation owner.',
      attributes: [
        { name: 'severity', type: 'enum', values: ['low', 'moderate', 'high', 'critical'], required: true },
        { name: 'summary', type: 'text', required: true },
        { name: 'dueOn', type: 'date' },
        { name: 'status', type: 'enum', values: ['open', 'remediating', 'closed', 'accepted'], required: true },
      ],
      actions: [
        { name: 'Raise', type: 'write', description: 'Open a finding against a failed control test.' },
        { name: 'Close', type: 'write', description: 'Close a finding once remediation is verified.' },
      ],
    },
    {
      name: 'Exception',
      description: 'A documented, time-boxed acceptance of a control gap.',
      attributes: [
        { name: 'rationale', type: 'text', required: true },
        { name: 'expiresOn', type: 'date', required: true },
        { name: 'compensating', type: 'string' },
      ],
      actions: [{ name: 'Approve', type: 'write', description: 'Accept the risk for a bounded period.' }],
    },
    {
      name: 'Attestation',
      description: 'The signed statement that the control set operated for a period.',
      attributes: [
        { name: 'period', type: 'string', required: true },
        { name: 'signedOn', type: 'date' },
        { name: 'scope', type: 'string', required: true },
      ],
      actions: [{ name: 'Sign', type: 'write', description: 'Sign the period attestation.' }],
    },
  ],

  persons: [
    {
      name: 'WorkforceMember',
      description: 'HIPAA/NIST term of art — anyone under the organisation’s control, staff or not.',
    },
    { name: 'Auditor', description: 'An external assessor requesting evidence.' },
    { name: 'Vendor', description: 'A third party inside the assessment boundary.' },
  ],

  roles: [
    { name: 'ChiefInformationSecurityOfficer', description: 'Accountable for the control environment as a whole.' },
    {
      name: 'ComplianceManager',
      parent: 'ChiefInformationSecurityOfficer',
      description: 'Runs the calendar, the evidence register, and the audit relationship.',
    },
    {
      name: 'ControlOwner',
      parent: 'ComplianceManager',
      description: 'Operates a specific control and produces its evidence.',
    },
    {
      name: 'SecurityEngineer',
      parent: 'ChiefInformationSecurityOfficer',
      description: 'Automates control tests and remediates technical findings.',
    },
    {
      name: 'RiskCommitteeChair',
      parent: 'ChiefInformationSecurityOfficer',
      description: 'Approves exceptions and accepted risk.',
    },
  ],

  groups: [
    { name: 'ControlEnvironment', description: 'Everyone who operates or owns a control in scope.' },
    { name: 'RiskCommittee', description: 'The body that accepts risk on the organisation’s behalf.' },
  ],

  memberships: [
    {
      name: 'WorkforceMemberAsControlOwner',
      person: 'WorkforceMember',
      role: 'ControlOwner',
      group: 'ControlEnvironment',
    },
    {
      name: 'WorkforceMemberAsComplianceManager',
      person: 'WorkforceMember',
      role: 'ComplianceManager',
      group: 'ControlEnvironment',
    },
    {
      name: 'WorkforceMemberAsSecurityEngineer',
      person: 'WorkforceMember',
      role: 'SecurityEngineer',
      group: 'ControlEnvironment',
    },
    {
      name: 'WorkforceMemberAsRiskChair',
      person: 'WorkforceMember',
      role: 'RiskCommitteeChair',
      group: 'RiskCommittee',
    },
    {
      name: 'WorkforceMemberAsCiso',
      person: 'WorkforceMember',
      role: 'ChiefInformationSecurityOfficer',
      group: 'RiskCommittee',
    },
  ],

  operations: [
    { target: 'Control', action: 'Test', description: 'Run a control test for the period.' },
    { target: 'Control', action: 'List', description: 'List controls by framework or owner.' },
    { target: 'Evidence', action: 'Collect', description: 'Gather evidence for a control period.' },
    { target: 'Evidence', action: 'List', description: 'List evidence in the register.' },
    { target: 'Finding', action: 'Raise', description: 'Open a finding against a failed test.' },
    { target: 'Finding', action: 'Close', description: 'Close a remediated finding.' },
    { target: 'Finding', action: 'List', description: 'List open findings by severity.' },
    { target: 'Exception', action: 'Approve', description: 'Accept a control gap for a bounded period.' },
    { target: 'Attestation', action: 'Sign', description: 'Sign the period attestation.' },
    { target: 'Attestation', action: 'Read', description: 'Read a signed attestation.' },
  ],

  process: {
    name: 'ControlAssurance',
    description: 'Scoping through signed attestation — the loop an auditor asks you to evidence.',
    operator: 'ChiefInformationSecurityOfficer',
    steps: [
      {
        id: 'scope-controls',
        title: 'Scope controls',
        actor: 'ComplianceManager',
        operation: 'Control.List',
        description: 'Fix the control set for the period and confirm every one has a named owner.',
        consulted: ['ChiefInformationSecurityOfficer'],
      },
      {
        id: 'collect-evidence',
        title: 'Collect evidence',
        actor: 'ControlOwner',
        operation: 'Evidence.Collect',
        description: 'Produce the artifact each control requires, from the system wherever possible.',
        consulted: ['SecurityEngineer'],
      },
      {
        id: 'test-controls',
        title: 'Test controls',
        actor: 'SecurityEngineer',
        operation: 'Control.Test',
        description: 'Run the test against collected evidence; automated controls test continuously.',
      },
      {
        id: 'raise-findings',
        title: 'Raise findings',
        actor: 'ComplianceManager',
        operation: 'Finding.Raise',
        description: 'Open a finding for every control that did not operate, with severity and a due date.',
        consulted: ['ControlOwner'],
      },
      {
        id: 'remediate',
        title: 'Remediate or except',
        actor: 'SecurityEngineer',
        operation: 'Finding.Close',
        description: 'Fix and verify, or route to the risk committee for a time-boxed exception.',
        consulted: ['RiskCommitteeChair'],
      },
      {
        id: 'sign-attestation',
        title: 'Sign attestation',
        actor: 'ChiefInformationSecurityOfficer',
        operation: 'Attestation.Sign',
        description: 'Sign the period statement once findings are closed or formally accepted.',
        consulted: ['ComplianceManager', 'RiskCommitteeChair'],
      },
    ],
  },

  rules: [
    {
      name: 'NoAttestationWithOpenCriticalFindings',
      operation: 'Attestation.Sign',
      ruleType: 'condition',
      description: 'The period cannot be attested while a critical finding is open and unaccepted.',
    },
    {
      name: 'SignatureIsTheCisos',
      operation: 'Attestation.Sign',
      ruleType: 'access',
      description: 'One signature, one accountable person. Delegation defeats the point of signing.',
      allow: [{ role: 'ChiefInformationSecurityOfficer' }],
    },
    {
      name: 'ExceptionsGoToCommittee',
      operation: 'Exception.Approve',
      ruleType: 'access',
      description: 'Accepting a gap is a risk decision, not an engineering one.',
      allow: [{ role: 'RiskCommitteeChair' }, { role: 'ChiefInformationSecurityOfficer' }],
    },
    {
      name: 'SeparationOfTestAndRemediation',
      operation: 'Finding.Close',
      ruleType: 'access',
      description: 'The person who closes a finding is not the person who tested it — the whole basis of the evidence.',
      allow: [{ role: 'SecurityEngineer' }, { role: 'ComplianceManager' }],
    },
    {
      name: 'OwnersProduceTheirOwnEvidence',
      operation: 'Evidence.Collect',
      ruleType: 'access',
      description: 'Evidence comes from the control’s owner, so provenance is never in question.',
      allow: [{ role: 'ControlOwner' }, { role: 'ComplianceManager' }],
    },
  ],

  triggers: [
    {
      source: 'schedule',
      process: 'ControlAssurance',
      schedule: '0 6 1 */3 *',
      description: 'Quarterly assurance cycle opens.',
    },
    {
      source: 'operation',
      operation: 'Finding.Raise',
      after: 'Control.Test',
      description: 'A failed control test opens a finding automatically.',
    },
  ],

  product: {
    resources: [
      {
        name: 'Control',
        resource: 'Control',
        description: 'The control register.',
        fields: [
          { name: 'reference', label: 'Ref', type: 'string', required: true, readonly: true },
          { name: 'objective', label: 'Objective', type: 'text', required: true },
          { name: 'owner', label: 'Owner', type: 'string', required: true },
          {
            name: 'frequency',
            label: 'Cadence',
            type: 'enum',
            values: ['continuous', 'monthly', 'quarterly', 'annual'],
            required: true,
          },
          { name: 'automated', label: 'Automated', type: 'boolean' },
        ],
        actions: [{ name: 'Test' }],
        samples: [
          {
            reference: 'CC6.1',
            objective: 'Logical access is restricted to authorised users',
            owner: 'Platform',
            frequency: 'continuous',
            automated: true,
          },
          {
            reference: 'CC7.2',
            objective: 'Security events are monitored and triaged',
            owner: 'SecOps',
            frequency: 'continuous',
            automated: true,
          },
          {
            reference: 'CC8.1',
            objective: 'Changes are authorised before deployment',
            owner: 'Engineering',
            frequency: 'monthly',
            automated: false,
          },
          {
            reference: 'CC1.4',
            objective: 'Personnel complete security training',
            owner: 'People',
            frequency: 'annual',
            automated: false,
          },
        ],
      },
      {
        name: 'Finding',
        resource: 'Finding',
        description: 'Open findings and their remediation state.',
        fields: [
          { name: 'control', label: 'Control', type: 'string', required: true },
          {
            name: 'severity',
            label: 'Severity',
            type: 'enum',
            values: ['low', 'moderate', 'high', 'critical'],
            required: true,
          },
          { name: 'summary', label: 'Summary', type: 'text', required: true },
          {
            name: 'status',
            label: 'Status',
            type: 'enum',
            values: ['open', 'remediating', 'closed', 'accepted'],
            required: true,
          },
          { name: 'dueOn', label: 'Due', type: 'date' },
        ],
        actions: [{ name: 'Close' }],
        samples: [
          {
            control: 'CC8.1',
            severity: 'high',
            summary: 'Two deploys bypassed change approval',
            status: 'remediating',
            dueOn: '2026-09-05',
          },
          {
            control: 'CC1.4',
            severity: 'low',
            summary: 'Four contractors past training due date',
            status: 'open',
            dueOn: '2026-09-30',
          },
          {
            control: 'CC6.1',
            severity: 'critical',
            summary: 'Dormant admin account retained production access',
            status: 'closed',
            dueOn: '2026-08-12',
          },
        ],
      },
      {
        name: 'Evidence',
        resource: 'Evidence',
        description: 'The evidence register for the period.',
        fields: [
          { name: 'control', label: 'Control', type: 'string', required: true },
          {
            name: 'source',
            label: 'Source',
            type: 'enum',
            values: ['system', 'screenshot', 'attestation', 'log-export'],
            required: true,
          },
          { name: 'period', label: 'Period', type: 'string', required: true },
          { name: 'collectedOn', label: 'Collected', type: 'date', required: true },
        ],
        actions: [{ name: 'Collect' }],
        samples: [
          { control: 'CC6.1', source: 'system', period: 'Q3 2026', collectedOn: '2026-08-01' },
          { control: 'CC7.2', source: 'log-export', period: 'Q3 2026', collectedOn: '2026-08-01' },
          { control: 'CC8.1', source: 'screenshot', period: 'Q3 2026', collectedOn: '2026-08-04' },
        ],
      },
      {
        name: 'Exception',
        resource: 'Exception',
        description: 'Accepted gaps and their expiry.',
        fields: [
          { name: 'control', label: 'Control', type: 'string', required: true },
          { name: 'rationale', label: 'Rationale', type: 'text', required: true },
          { name: 'expiresOn', label: 'Expires', type: 'date', required: true },
          { name: 'compensating', label: 'Compensating control', type: 'string' },
        ],
        actions: [{ name: 'Approve' }],
        samples: [
          {
            control: 'CC1.4',
            rationale: 'Contractor cohort onboards in September',
            expiresOn: '2026-10-01',
            compensating: 'Supervised access only',
          },
        ],
      },
    ],
    namespace: {
      name: 'Assurance',
      path: '/api/assurance',
      description: 'Control, evidence, finding, and attestation operations.',
    },
    endpoints: [
      { method: 'GET', path: '/controls', operation: 'Control.List', description: 'The control register.' },
      { method: 'POST', path: '/controls/{id}/test', operation: 'Control.Test', description: 'Run a control test.' },
      { method: 'GET', path: '/evidence', operation: 'Evidence.List', description: 'Evidence for the period.' },
      { method: 'POST', path: '/evidence', operation: 'Evidence.Collect', description: 'Attach evidence.' },
      { method: 'GET', path: '/findings', operation: 'Finding.List', description: 'Open findings by severity.' },
      { method: 'POST', path: '/findings/{id}/close', operation: 'Finding.Close', description: 'Close a finding.' },
      {
        method: 'POST',
        path: '/attestations',
        operation: 'Attestation.Sign',
        description: 'Sign the period attestation.',
      },
    ],
    layout: { name: 'AssuranceShell', type: 'sidebar' },
    pages: [
      {
        name: 'ControlRegister',
        resource: 'Control',
        description: 'Every control in scope, with owner and cadence.',
        blocks: [
          { name: 'ControlTable', type: 'table', operation: 'Control.List' },
          { name: 'CoverageSummary', type: 'summary' },
        ],
      },
      {
        name: 'FindingDetail',
        resource: 'Finding',
        description: 'One finding and its remediation.',
        blocks: [
          { name: 'FindingForm', type: 'form', operation: 'Finding.List' },
          { name: 'CloseAction', type: 'actions', operation: 'Finding.Close' },
        ],
      },
      {
        name: 'EvidenceRegister',
        resource: 'Evidence',
        description: 'What has been collected, and what has not.',
        blocks: [{ name: 'EvidenceTable', type: 'table', operation: 'Evidence.List' }],
      },
      {
        name: 'ExceptionLog',
        resource: 'Exception',
        description: 'Accepted risk, with expiry dates.',
        blocks: [{ name: 'ApproveAction', type: 'actions', operation: 'Exception.Approve' }],
      },
    ],
    routes: [
      { path: '/controls', page: 'ControlRegister', protected: true, description: 'Control register.' },
      { path: '/findings/:id', page: 'FindingDetail', protected: true, description: 'Finding detail.' },
      { path: '/evidence', page: 'EvidenceRegister', protected: true, description: 'Evidence register.' },
      { path: '/exceptions', page: 'ExceptionLog', protected: true, description: 'Exception log.' },
    ],
  },

  technical: {
    providers: [
      { name: 'AWS', type: 'cloud', description: 'Assurance workloads.', region: 'us-west-2' },
      {
        name: 'Aurora',
        type: 'database',
        description: 'Catalog, evidence, findings, and the POA&M.',
        region: 'us-west-2',
      },
      { name: 'Okta', type: 'auth', description: 'Identity, and the source for access-review evidence.' },
      {
        name: 'S3ObjectLock',
        type: 'storage',
        description: 'Write-once evidence store — an auditor asks whether it can be altered.',
      },
      { name: 'Splunk', type: 'monitoring', description: 'SIEM signals behind the continuously-tested controls.' },
    ],
    environments: [
      { name: 'dev', description: 'Control authoring and test development.', providers: ['AWS', 'Aurora'] },
      {
        name: 'staging',
        description: 'Audit rehearsal against last period’s data.',
        providers: ['AWS', 'Aurora', 'Okta'],
      },
      {
        name: 'prod',
        description: 'The register of record.',
        providers: ['AWS', 'Aurora', 'Okta', 'S3ObjectLock', 'Splunk'],
      },
    ],
    cells: [
      {
        name: 'AssuranceWeb',
        dna: 'BastionAssurance.Product.Web',
        adapter: { type: 'nextjs', version: '15' },
        environment: 'prod',
        description: 'Register, findings, and evidence surfaces.',
      },
      {
        name: 'ControlService',
        dna: 'BastionAssurance.Product.Api',
        adapter: { type: 'nestjs', version: '10' },
        environment: 'prod',
        description: 'Control register and test orchestration.',
      },
      {
        name: 'EvidenceCollector',
        dna: 'BastionAssurance.Operational',
        adapter: { type: 'express', version: '4' },
        environment: 'prod',
        description: 'Pulls system evidence on the control cadence.',
      },
      {
        name: 'FindingService',
        dna: 'BastionAssurance.Product.Api',
        adapter: { type: 'nestjs', version: '10' },
        environment: 'prod',
        description: 'Findings, exceptions, and remediation state.',
      },
      {
        name: 'AssuranceDb',
        dna: 'BastionAssurance.Product.Core',
        adapter: { type: 'postgres', version: '16' },
        environment: 'prod',
        description: 'Controls, evidence, findings, attestations.',
      },
    ],
    connections: [
      { source: 'AssuranceWeb', target: 'ControlService', type: 'data-flow', label: 'register' },
      { source: 'AssuranceWeb', target: 'FindingService', type: 'data-flow', label: 'findings' },
      { source: 'EvidenceCollector', target: 'ControlService', type: 'publishes-to', label: 'evidence.collected' },
      { source: 'ControlService', target: 'FindingService', type: 'publishes-to', label: 'control.failed' },
      { source: 'ControlService', target: 'AssuranceDb', type: 'depends-on' },
      { source: 'FindingService', target: 'AssuranceDb', type: 'depends-on' },
    ],
  },
};

export default security;
