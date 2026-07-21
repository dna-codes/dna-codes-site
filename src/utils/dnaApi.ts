// SINGLE SWAP POINT for the eventual live API integration.
//
// Today this module is a pure in-browser stub: no network requests are issued.
// When `https://api.dna.codes/convert` ships, replace the body of `convert()`
// with a `fetch(...)` call that posts `{ from, to }` as JSON. The exported
// signature (`convert`, `ConvertError`, and the `From` / `To` / `*Result`
// types) is the contract every call site already depends on, so the swap
// should not require changes anywhere else.

export type FromType = 'transcript' | 'dna';
export type ToType = 'dna' | 'process-flow' | 'raci' | 'sop' | 'runbook' | 'agents' | 'app';

export interface From {
  type: FromType;
  content: string;
}

export interface To {
  type: ToType;
}

export interface DnaResult {
  type: 'dna';
  // YAML-style text rendered as-is in the DNA panel.
  content: string;
}

export interface ProcessFlowStep {
  name: string;
  owner?: string;
  timing?: string;
}

export interface ProcessFlowResult {
  type: 'process-flow';
  process: string;
  steps: ProcessFlowStep[];
}

export type RaciCell = 'R' | 'A' | 'C' | 'I' | '';

export interface RaciResult {
  type: 'raci';
  roles: string[];
  rows: { process: string; cells: RaciCell[] }[];
}

export interface SopResult {
  type: 'sop';
  title: string;
  owner?: string;
  steps: string[];
  sla?: string;
}

export interface RunbookGroup {
  area: string;
  processes: string[];
}

export interface RunbookResult {
  type: 'runbook';
  groups: RunbookGroup[];
}

export type AgentActor = 'agent' | 'human';

export interface AgentWorkflowStep {
  name: string;
  actor: AgentActor;
  owner?: string;
  timing?: string;
}

export interface AgentsResult {
  type: 'agents';
  process: string;
  steps: AgentWorkflowStep[];
}

export type AppKind = 'stepper' | 'review' | 'none';

export interface AppStep {
  name: string;
  fields: string[];
}

export interface AppReviewItem {
  label: string;
  value: string;
  flagged?: boolean;
}

export type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface AppApiEndpoint {
  method: ApiMethod;
  path: string;
  description: string;
}

export interface AppResult {
  type: 'app';
  kind: AppKind;
  title?: string;
  steps?: AppStep[];
  reviewItems?: AppReviewItem[];
  emptyMessage?: string;
  api?: AppApiEndpoint[];
}

export type ConvertResult =
  | DnaResult
  | ProcessFlowResult
  | RaciResult
  | SopResult
  | RunbookResult
  | AgentsResult
  | AppResult;

export class ConvertError extends Error {
  constructor(
    public userMessage: string,
    cause?: unknown
  ) {
    super(userMessage);
    this.name = 'ConvertError';
    if (cause !== undefined) {
      (this as { cause?: unknown }).cause = cause;
    }
  }
}

// ── Stub-only knobs ────────────────────────────────────────────────────────

type ProcessKey = 'onboarding' | 'launch' | 'close';

// Reads ?stub=fail-raci / ?stub=fail-dna etc from the current URL so error
// and Retry paths can be exercised in dev. Removed when the live client lands.
function shouldSimulateFailure(to: ToType): boolean {
  if (typeof window === 'undefined') return false;
  const flag = new URLSearchParams(window.location.search).get('stub');
  if (!flag) return false;
  if (flag === 'fail-all') return true;
  return flag === `fail-${to}`;
}

function pickProcess(transcript: string): ProcessKey {
  const t = transcript.toLowerCase();
  if (/\blaunch|go[- ]?to[- ]?market|gtm|release\b/.test(t)) return 'launch';
  if (/\bclose|month[- ]?end|finance|reconcil/.test(t)) return 'close';
  return 'onboarding';
}

function detectProcessFromDna(dna: string): ProcessKey {
  if (/MonthlyClose/i.test(dna)) return 'close';
  if (/ProductLaunch/i.test(dna)) return 'launch';
  return 'onboarding';
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Canned payloads ────────────────────────────────────────────────────────
// Vocabulary matches the Operational + Product schemas documented at
// /docs/operational and /docs/product (@dna-codes/dna-schemas): a Resource
// declares attributes[] and an actions[] catalog (read/write/destructive);
// an Operation is a Resource.Action pair; a Process is an ordered set of
// steps, each a Role performing one Operation (a Task).
//
// The 02 panel shows a *simplified* projection of the spec below — resource
// shape, action catalog, and the process's core steps only (see
// renderDnaText). The 03 output tabs read the full spec: Process Flow / SOP
// show the core steps; Agents shows every step including agent-only
// automation (e.g. "CRM record enriched") that never appears in the
// simplified panel; App derives its form/review UI directly from the
// Resource's attributes[], and its "Generated API" from whichever actions[]
// entries declare an HTTP `method` (the rest are internal-only Operations,
// invoked by Tasks rather than called over the API).

interface StepRaci {
  // Exactly one role is Accountable; one or more are Responsible. Consulted /
  // Informed are optional. A role may appear as both A and R — Accountable wins
  // when the matrix cell is rendered (see raciCell PRECEDENCE below).
  responsible: string[];
  accountable: string;
  consulted?: string[];
  informed?: string[];
}

interface DnaAttribute {
  name: string; // snake_case, matches product/core/field
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum';
  required?: boolean;
  values?: string[]; // when type === 'enum'
}

type DnaActionType = 'read' | 'write' | 'destructive';

interface DnaAction {
  name: string; // PascalCase verb
  type: DnaActionType;
  description: string;
  // Present only when this action is exposed as a public API endpoint (see
  // deriveApi). Actions without a method are internal — invoked by a Task
  // within the process, not callable directly.
  method?: ApiMethod;
}

interface DnaResource {
  name: string; // PascalCase, e.g. "Account"
  domain: string;
  attributes: DnaAttribute[];
  actions: DnaAction[];
  // Representative instance rows — used as stub data for review-style App UIs.
  examples?: Record<string, unknown>[];
}

interface ProcessStep {
  id: string; // kebab-case
  label: string;
  actor: 'agent' | 'human';
  owner?: string; // display role, human steps only
  timing?: string;
  core: boolean; // shown in the simplified 02 panel, Process Flow, SOP, and RACI
  raci?: StepRaci; // set on core steps only
}

type AppSpec =
  | { kind: 'stepper'; title: string; uiSteps: { name: string; fields: string[] }[] }
  | { kind: 'review'; title: string; reviewFields: { label: string; value: string; flagged?: string } }
  | { kind: 'none'; emptyMessage: string };

interface ProcessSpec {
  process: string; // PascalCase
  title: string; // display name
  operator: string; // PascalCase Role
  operatorLabel: string; // display name
  sla: string;
  roles: string[]; // RACI column order
  triggers: string[];
  resource: DnaResource;
  steps: ProcessStep[];
  app: AppSpec;
}

const PROCESS_SPECS: Record<ProcessKey, ProcessSpec> = {
  onboarding: {
    process: 'CustomerOnboarding',
    title: 'Customer Onboarding',
    operator: 'CustomerSuccess',
    operatorLabel: 'Customer Success Team',
    sla: '24h response',
    roles: ['CustomerSuccess', 'Sales', 'Ops', 'Finance'],
    triggers: ['new-signup', 'plan-upgrade'],
    resource: {
      name: 'Account',
      domain: 'dna.success.onboarding',
      attributes: [
        { name: 'company_name', label: 'Company name', type: 'string', required: true },
        { name: 'industry', label: 'Industry', type: 'string' },
        { name: 'team_size', label: 'Team size', type: 'number' },
        { name: 'plan_tier', label: 'Plan tier', type: 'enum', values: ['free', 'pro', 'enterprise'] },
        { name: 'billing_contact', label: 'Billing contact', type: 'string' },
        { name: 'payment_method', label: 'Payment method', type: 'string' },
        { name: 'sso_provider', label: 'SSO provider', type: 'string' },
        { name: 'data_import_source', label: 'Data import source', type: 'string' },
        { name: 'assigned_csm', label: 'Assigned CSM', type: 'string' },
      ],
      actions: [
        { name: 'CompleteSetup', type: 'write', method: 'POST', description: 'Finalize setup and assign a CSM' },
        { name: 'SendWelcomeEmail', type: 'write', description: 'Send the automated welcome email' },
        { name: 'EnrichCrmRecord', type: 'write', description: 'Enrich the CRM record from signup data' },
        { name: 'BookIntroCall', type: 'write', description: 'Book the intro call' },
        { name: 'SummarizeCallNotes', type: 'write', description: 'Summarize intro call notes' },
        { name: 'RunWalkthrough', type: 'write', description: 'Walk the account through the product' },
        { name: 'CompleteCheckIn', type: 'write', description: 'Complete the 30-day check-in' },
      ],
    },
    app: {
      kind: 'stepper',
      title: 'Account Setup',
      uiSteps: [
        { name: 'Company details', fields: ['company_name', 'industry', 'team_size'] },
        { name: 'Plan & billing', fields: ['plan_tier', 'billing_contact', 'payment_method'] },
        { name: 'Integrations', fields: ['sso_provider', 'data_import_source'] },
        { name: 'Review & launch', fields: ['assigned_csm'] },
      ],
    },
    steps: [
      {
        id: 'welcome-email',
        label: 'Welcome email sent',
        actor: 'agent',
        timing: 'on trigger',
        core: true,
        raci: { accountable: 'CustomerSuccess', responsible: ['Ops'], informed: ['Sales', 'Finance'] },
      },
      { id: 'enrich-crm-record', label: 'CRM record enriched', actor: 'agent', timing: 'within minutes', core: false },
      {
        id: 'intro-call',
        label: 'Intro call booked',
        actor: 'human',
        owner: 'Sales',
        timing: 'within 24h',
        core: true,
        raci: { accountable: 'CustomerSuccess', responsible: ['Sales'], consulted: ['Ops'], informed: ['Finance'] },
      },
      { id: 'summarize-call-notes', label: 'Call notes summarized', actor: 'agent', timing: 'after call', core: false },
      {
        id: 'product-walkthrough',
        label: 'Product walkthrough',
        actor: 'human',
        owner: 'Customer Success',
        timing: 'day 3',
        core: true,
        raci: {
          accountable: 'CustomerSuccess',
          responsible: ['CustomerSuccess'],
          consulted: ['Sales'],
          informed: ['Ops', 'Finance'],
        },
      },
      {
        id: 'thirty-day-check-in',
        label: '30-day check-in',
        actor: 'human',
        owner: 'Customer Success',
        timing: 'day 30',
        core: true,
        raci: {
          accountable: 'CustomerSuccess',
          responsible: ['CustomerSuccess'],
          consulted: ['Finance'],
          informed: ['Sales', 'Ops'],
        },
      },
    ],
  },
  launch: {
    process: 'ProductLaunch',
    title: 'Product Launch',
    operator: 'Product',
    operatorLabel: 'Product Team',
    sla: '90-day cycle',
    roles: ['Product', 'Engineering', 'Sales', 'CustomerSuccess'],
    triggers: ['roadmap-approval', 'exec-signoff'],
    resource: {
      name: 'Release',
      domain: 'dna.product.launch',
      attributes: [
        { name: 'name', label: 'Release name', type: 'string', required: true },
        { name: 'target_date', label: 'Target date', type: 'date' },
        { name: 'status', label: 'Status', type: 'enum', values: ['planning', 'building', 'gtm', 'launched'] },
      ],
      // No action carries a `method` — Launch intentionally has no exposed API (see app.kind below).
      actions: [
        { name: 'ValidateMarket', type: 'write', description: 'Validate market demand before committing' },
        { name: 'Build', type: 'write', description: 'Engineering builds the release' },
        { name: 'PrepGtm', type: 'write', description: 'Prepare go-to-market materials' },
        { name: 'Ship', type: 'write', description: 'Ship the release on launch day' },
        { name: 'ReviewPostLaunch', type: 'write', description: 'Review post-launch metrics' },
        { name: 'DraftReleaseNotes', type: 'write', description: 'Draft release notes' },
        { name: 'SummarizePostLaunchMetrics', type: 'write', description: 'Summarize post-launch metrics' },
      ],
    },
    app: {
      kind: 'none',
      emptyMessage: 'Product Launch doesn’t need an operational UI or API — none generated for this process.',
    },
    steps: [
      {
        id: 'market-validation',
        label: 'Market validation',
        actor: 'human',
        owner: 'Product',
        timing: 'week 1',
        core: true,
        raci: {
          accountable: 'Product',
          responsible: ['Product'],
          consulted: ['Engineering', 'Sales'],
          informed: ['CustomerSuccess'],
        },
      },
      {
        id: 'engineering-build',
        label: 'Engineering build',
        actor: 'human',
        owner: 'Engineering',
        timing: 'weeks 2–10',
        core: true,
        raci: {
          accountable: 'Product',
          responsible: ['Engineering'],
          consulted: ['Product'],
          informed: ['Sales', 'CustomerSuccess'],
        },
      },
      { id: 'draft-release-notes', label: 'Release notes drafted', actor: 'agent', timing: 'week 11', core: false },
      {
        id: 'gtm-prep',
        label: 'GTM prep',
        actor: 'human',
        owner: 'Sales',
        timing: 'week 11',
        core: true,
        raci: {
          accountable: 'Product',
          responsible: ['Sales'],
          consulted: ['CustomerSuccess'],
          informed: ['Engineering'],
        },
      },
      {
        id: 'launch-day',
        label: 'Launch day',
        actor: 'human',
        owner: 'Cross-functional',
        timing: 'week 12',
        core: true,
        raci: { accountable: 'Product', responsible: ['Engineering', 'Sales'], consulted: ['CustomerSuccess'] },
      },
      {
        id: 'summarize-post-launch-metrics',
        label: 'Post-launch metrics summarized',
        actor: 'agent',
        timing: 'week 14',
        core: false,
      },
      {
        id: 'post-launch-review',
        label: 'Post-launch review',
        actor: 'human',
        owner: 'Product',
        timing: 'week 14',
        core: true,
        raci: {
          accountable: 'Product',
          responsible: ['Product'],
          consulted: ['Engineering', 'Sales', 'CustomerSuccess'],
        },
      },
    ],
  },
  close: {
    process: 'MonthlyClose',
    title: 'Monthly Close',
    operator: 'Finance',
    operatorLabel: 'Finance Team',
    sla: '5-day close',
    roles: ['Finance', 'Operations', 'Leadership', 'Audit'],
    triggers: ['month-end', 'quarter-end'],
    resource: {
      name: 'VarianceLine',
      domain: 'dna.finance.close',
      attributes: [
        { name: 'category', label: 'Category', type: 'string', required: true },
        { name: 'variance_pct', label: 'Variance %', type: 'number', required: true },
        { name: 'amount', label: 'Amount', type: 'number' },
      ],
      actions: [
        { name: 'List', type: 'read', method: 'GET', description: 'List variance line items for the current close' },
        { name: 'Approve', type: 'write', method: 'POST', description: 'Approve a flagged line item' },
        { name: 'Escalate', type: 'write', method: 'POST', description: 'Escalate a flagged line item' },
        { name: 'ReconcileTransactions', type: 'write', description: 'Auto-reconcile transactions' },
        { name: 'CloseBooks', type: 'write', description: 'Close the books' },
        { name: 'FlagVariance', type: 'write', description: 'Flag line items exceeding the variance threshold' },
        { name: 'DraftExecReport', type: 'write', description: 'Draft the exec report' },
        { name: 'PublishExecReport', type: 'write', description: 'Publish the exec report' },
        { name: 'ApproveBoardPackage', type: 'write', description: 'Leadership signs off on the board package' },
      ],
      examples: [
        { category: 'Marketing spend', variance: '+12% vs budget', flagged: true },
        { category: 'Payroll', variance: '-2% vs budget', flagged: false },
        { category: 'Software & tools', variance: '+34% vs budget', flagged: true },
        { category: 'Travel & entertainment', variance: '-18% vs budget', flagged: false },
      ],
    },
    app: {
      kind: 'review',
      title: 'Review Variance',
      reviewFields: { label: 'category', value: 'variance', flagged: 'flagged' },
    },
    steps: [
      { id: 'reconcile-transactions', label: 'Transactions reconciled', actor: 'agent', timing: 'day 1', core: false },
      {
        id: 'close-books',
        label: 'Close books',
        actor: 'human',
        owner: 'Finance',
        timing: 'day 1',
        core: true,
        raci: {
          accountable: 'Finance',
          responsible: ['Finance'],
          consulted: ['Operations'],
          informed: ['Leadership', 'Audit'],
        },
      },
      {
        id: 'reconcile-accounts',
        label: 'Reconcile accounts',
        actor: 'human',
        owner: 'Finance',
        timing: 'day 2',
        core: true,
        raci: {
          accountable: 'Finance',
          responsible: ['Finance'],
          consulted: ['Operations', 'Audit'],
          informed: ['Leadership'],
        },
      },
      { id: 'flag-variance', label: 'Variance flagged', actor: 'agent', timing: 'day 2', core: false },
      {
        id: 'review-variance',
        label: 'Review variance',
        actor: 'human',
        owner: 'Operations',
        timing: 'day 3',
        core: true,
        raci: {
          accountable: 'Operations',
          responsible: ['Operations'],
          consulted: ['Finance'],
          informed: ['Leadership', 'Audit'],
        },
      },
      { id: 'draft-exec-report', label: 'Exec report drafted', actor: 'agent', timing: 'day 4', core: false },
      {
        id: 'exec-report',
        label: 'Exec report',
        actor: 'human',
        owner: 'Finance',
        timing: 'day 4',
        core: true,
        raci: {
          accountable: 'Finance',
          responsible: ['Finance'],
          consulted: ['Operations'],
          informed: ['Leadership', 'Audit'],
        },
      },
      {
        id: 'board-package',
        label: 'Board package',
        actor: 'human',
        owner: 'Leadership',
        timing: 'day 5',
        core: true,
        raci: {
          accountable: 'Leadership',
          responsible: ['Finance'],
          consulted: ['Operations'],
          informed: ['Audit'],
        },
      },
    ],
  },
};

// Accountable beats Responsible beats Consulted beats Informed when a role
// carries more than one designation for a step.
function raciCell(role: string, raci: StepRaci): RaciCell {
  if (role === raci.accountable) return 'A';
  if (raci.responsible.includes(role)) return 'R';
  if (raci.consulted?.includes(role)) return 'C';
  if (raci.informed?.includes(role)) return 'I';
  return '';
}

function deriveRaci(spec: ProcessSpec): RaciResult {
  const raciSteps = spec.steps.filter((s): s is ProcessStep & { raci: StepRaci } => !!s.raci);
  return {
    type: 'raci',
    roles: spec.roles,
    rows: raciSteps.map((s) => ({
      process: s.label,
      cells: spec.roles.map((role) => raciCell(role, s.raci)),
    })),
  };
}

// "CompleteSetup" → "complete-setup"
function kebabCase(pascal: string): string {
  return pascal.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// Renders the spec as the YAML-ish DNA text shown in the panel — the
// simplified projection (see the block comment above). Non-core steps and
// action detail beyond the name (type, method) stay in the spec (for
// deriveRaci, deriveAgents, deriveApp/deriveApi) but are left out of this text.
function renderDnaText(spec: ProcessSpec): string {
  const { resource } = spec;
  const lines: string[] = [
    `resource: ${resource.name}`,
    `domain: ${resource.domain}`,
    'attributes:',
    ...resource.attributes.map((a) => {
      const type = a.type === 'enum' ? `enum [${(a.values ?? []).join(', ')}]` : a.type;
      return `  - ${a.name}: ${type}${a.required ? ' (required)' : ''}`;
    }),
    'actions:',
    ...resource.actions.map((a) => `  - ${a.name}`),
    `process: ${spec.process}`,
    `operator: ${spec.operator}`,
    `sla: ${spec.sla}`,
    'triggers:',
    ...spec.triggers.map((t) => `  - ${t}`),
    'steps:',
    ...spec.steps.filter((s) => s.core).map((s) => `  - ${s.id}`),
  ];
  return lines.join('\n');
}

function deriveProcessFlow(spec: ProcessSpec): ProcessFlowResult {
  return {
    type: 'process-flow',
    process: spec.process,
    steps: spec.steps
      .filter((s) => s.core)
      .map((s) => ({ name: s.label, owner: s.actor === 'agent' ? 'Auto' : s.owner, timing: s.timing })),
  };
}

function deriveSop(spec: ProcessSpec): SopResult {
  return {
    type: 'sop',
    title: `${spec.title} SOP`,
    owner: spec.operatorLabel,
    steps: spec.steps.filter((s) => s.core).map((s) => s.label),
    sla: spec.sla,
  };
}

// Full step list (core + agent-only automation) — the fuller DNA that backs
// this tab, vs. the core-only subset shown in Process Flow/SOP/the 02 panel.
function deriveAgents(spec: ProcessSpec): AgentsResult {
  return {
    type: 'agents',
    process: spec.process,
    steps: spec.steps.map((s) => ({
      name: s.label,
      actor: s.actor,
      owner: s.actor === 'human' ? s.owner : undefined,
      timing: s.timing,
    })),
  };
}

// Only actions with a declared `method` are exposed over the API — the rest
// are internal Operations invoked by Tasks within the process.
function deriveApi(resource: DnaResource): AppApiEndpoint[] {
  const exposed = resource.actions.filter((a): a is DnaAction & { method: ApiMethod } => !!a.method);
  if (!exposed.length) return [];
  const base = `/api/${kebabCase(resource.name)}s`;
  return exposed.map((a) => {
    const path = ['Create', 'List'].includes(a.name)
      ? base
      : ['Get', 'Update', 'Delete'].includes(a.name)
        ? `${base}/{id}`
        : `${base}/{id}/${kebabCase(a.name)}`;
    return { method: a.method, path, description: a.description };
  });
}

// The App's UI is generated straight from the Resource's attributes[]; its
// API from whichever actions[] declare a method (see deriveApi). Same
// Resource, two surfaces — matches product/core/{resource,action}.json.
function deriveApp(spec: ProcessSpec): AppResult {
  const api = deriveApi(spec.resource);
  if (spec.app.kind === 'none') {
    return { type: 'app', kind: 'none', emptyMessage: spec.app.emptyMessage };
  }
  if (spec.app.kind === 'stepper') {
    const label = (name: string) => spec.resource.attributes.find((a) => a.name === name)?.label ?? name;
    return {
      type: 'app',
      kind: 'stepper',
      title: spec.app.title,
      steps: spec.app.uiSteps.map((s) => ({ name: s.name, fields: s.fields.map(label) })),
      api,
    };
  }
  const { label: labelKey, value: valueKey, flagged: flaggedKey } = spec.app.reviewFields;
  return {
    type: 'app',
    kind: 'review',
    title: spec.app.title,
    reviewItems: (spec.resource.examples ?? []).map((ex) => ({
      label: String(ex[labelKey] ?? ''),
      value: String(ex[valueKey] ?? ''),
      flagged: flaggedKey ? Boolean(ex[flaggedKey]) : undefined,
    })),
    api,
  };
}

const PROCESS_FLOW_BY_PROCESS: Record<ProcessKey, ProcessFlowResult> = {
  onboarding: deriveProcessFlow(PROCESS_SPECS.onboarding),
  launch: deriveProcessFlow(PROCESS_SPECS.launch),
  close: deriveProcessFlow(PROCESS_SPECS.close),
};

const SOP_BY_PROCESS: Record<ProcessKey, SopResult> = {
  onboarding: deriveSop(PROCESS_SPECS.onboarding),
  launch: deriveSop(PROCESS_SPECS.launch),
  close: deriveSop(PROCESS_SPECS.close),
};

const AGENTS_BY_PROCESS: Record<ProcessKey, AgentsResult> = {
  onboarding: deriveAgents(PROCESS_SPECS.onboarding),
  launch: deriveAgents(PROCESS_SPECS.launch),
  close: deriveAgents(PROCESS_SPECS.close),
};

const APP_BY_PROCESS: Record<ProcessKey, AppResult> = {
  onboarding: deriveApp(PROCESS_SPECS.onboarding),
  launch: deriveApp(PROCESS_SPECS.launch),
  close: deriveApp(PROCESS_SPECS.close),
};

const RUNBOOK: RunbookResult = {
  type: 'runbook',
  groups: [
    { area: 'Sales', processes: ['Lead qualification', 'Handoff to success'] },
    {
      area: 'Customer Success',
      processes: ['Customer onboarding', 'QBR process', 'Churn escalation'],
    },
    { area: 'Finance', processes: ['Monthly close', 'Invoice approval'] },
    { area: 'Operations', processes: ['Vendor review', 'Headcount request'] },
  ],
};

// ── Public API ─────────────────────────────────────────────────────────────

export async function convert(args: { from: From; to: To }): Promise<ConvertResult> {
  const { from, to } = args;

  // Simulated latency so loading states are visible.
  await delay(400 + Math.random() * 400);

  if (shouldSimulateFailure(to.type)) {
    throw new ConvertError('Something went wrong while generating this artifact. Give it another try.');
  }

  if (!from.content || !from.content.trim()) {
    throw new ConvertError('Add some transcript text before converting.');
  }

  const key: ProcessKey = from.type === 'transcript' ? pickProcess(from.content) : detectProcessFromDna(from.content);

  switch (to.type) {
    case 'dna':
      return { type: 'dna', content: renderDnaText(PROCESS_SPECS[key]) };
    case 'process-flow':
      return PROCESS_FLOW_BY_PROCESS[key];
    case 'raci':
      return deriveRaci(PROCESS_SPECS[key]);
    case 'sop':
      return SOP_BY_PROCESS[key];
    case 'runbook':
      return RUNBOOK;
    case 'agents':
      return AGENTS_BY_PROCESS[key];
    case 'app':
      return APP_BY_PROCESS[key];
    default: {
      const _exhaustive: never = to.type;
      throw new ConvertError('Unsupported output type.', _exhaustive);
    }
  }
}
