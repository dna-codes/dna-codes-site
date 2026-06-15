// SINGLE SWAP POINT for the eventual live API integration.
//
// Today this module is a pure in-browser stub: no network requests are issued.
// When `https://api.dna.codes/convert` ships, replace the body of `convert()`
// with a `fetch(...)` call that posts `{ from, to }` as JSON. The exported
// signature (`convert`, `ConvertError`, and the `From` / `To` / `*Result`
// types) is the contract every call site already depends on, so the swap
// should not require changes anywhere else.

export type FromType = 'transcript' | 'dna';
export type ToType = 'dna' | 'process-flow' | 'raci' | 'sop' | 'runbook';

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

export type ConvertResult = DnaResult | ProcessFlowResult | RaciResult | SopResult | RunbookResult;

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
// Derived from src/components/widgets/OperationsLayerC.astro so the playground
// reads as a continuation of the homepage demo.

// The DNA spec is the single source of truth for each process. RACI lives
// *inside* the spec — every step carries its R/A/C/I assignment against the
// process roles — so the RACI matrix can be derived directly from the spec
// rather than maintained as a parallel, drift-prone table. The DNA text shown
// in the panel and the RACI matrix are both generated from these objects, so
// they can never disagree.

interface StepRaci {
  // Exactly one role is Accountable; one or more are Responsible. Consulted /
  // Informed are optional. A role may appear as both A and R — Accountable wins
  // when the matrix cell is rendered (see PRECEDENCE below).
  responsible: string[];
  accountable: string;
  consulted?: string[];
  informed?: string[];
}

interface ProcessStepSpec {
  step: string; // kebab-case step id, e.g. "welcome-email"
  raci: StepRaci;
}

interface ProcessSpec {
  process: string;
  owner: string;
  sla: string;
  roles: string[]; // column order of the RACI matrix
  triggers: string[];
  steps: ProcessStepSpec[];
}

const PROCESS_SPECS: Record<ProcessKey, ProcessSpec> = {
  onboarding: {
    process: 'CustomerOnboarding',
    owner: 'CustomerSuccess',
    sla: '24h response',
    roles: ['CustomerSuccess', 'Sales', 'Ops', 'Finance'],
    triggers: ['new-signup', 'plan-upgrade'],
    steps: [
      {
        step: 'welcome-email',
        raci: { accountable: 'CustomerSuccess', responsible: ['Ops'], informed: ['Sales', 'Finance'] },
      },
      {
        step: 'account-setup',
        raci: {
          accountable: 'CustomerSuccess',
          responsible: ['CustomerSuccess'],
          consulted: ['Sales'],
          informed: ['Ops', 'Finance'],
        },
      },
      {
        step: 'intro-call',
        raci: { accountable: 'CustomerSuccess', responsible: ['Sales'], consulted: ['Ops'], informed: ['Finance'] },
      },
      {
        step: '30-day-check-in',
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
    owner: 'Product',
    sla: '90-day cycle',
    roles: ['Product', 'Engineering', 'Sales', 'CustomerSuccess'],
    triggers: ['roadmap-approval', 'exec-signoff'],
    steps: [
      {
        step: 'market-validation',
        raci: {
          accountable: 'Product',
          responsible: ['Product'],
          consulted: ['Engineering', 'Sales'],
          informed: ['CustomerSuccess'],
        },
      },
      {
        step: 'engineering-build',
        raci: {
          accountable: 'Product',
          responsible: ['Engineering'],
          consulted: ['Product'],
          informed: ['Sales', 'CustomerSuccess'],
        },
      },
      {
        step: 'gtm-prep',
        raci: {
          accountable: 'Product',
          responsible: ['Sales'],
          consulted: ['CustomerSuccess'],
          informed: ['Engineering'],
        },
      },
      {
        step: 'launch-day',
        raci: { accountable: 'Product', responsible: ['Engineering', 'Sales'], consulted: ['CustomerSuccess'] },
      },
      {
        step: 'post-launch-review',
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
    owner: 'Finance',
    sla: '5-day close',
    roles: ['Finance', 'Operations', 'Leadership', 'Audit'],
    triggers: ['month-end', 'quarter-end'],
    steps: [
      {
        step: 'close-books',
        raci: {
          accountable: 'Finance',
          responsible: ['Finance'],
          consulted: ['Operations'],
          informed: ['Leadership', 'Audit'],
        },
      },
      {
        step: 'reconcile-accounts',
        raci: {
          accountable: 'Finance',
          responsible: ['Finance'],
          consulted: ['Operations', 'Audit'],
          informed: ['Leadership'],
        },
      },
      {
        step: 'review-variance',
        raci: {
          accountable: 'Operations',
          responsible: ['Operations'],
          consulted: ['Finance'],
          informed: ['Leadership', 'Audit'],
        },
      },
      {
        step: 'exec-report',
        raci: {
          accountable: 'Finance',
          responsible: ['Finance'],
          consulted: ['Operations'],
          informed: ['Leadership', 'Audit'],
        },
      },
      {
        step: 'board-package',
        raci: { accountable: 'Leadership', responsible: ['Finance'], consulted: ['Operations'], informed: ['Audit'] },
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

// "welcome-email" → "Welcome email", "30-day-check-in" → "30 day check in"
function prettyStep(step: string): string {
  const spaced = step.replace(/-/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function deriveRaci(spec: ProcessSpec): RaciResult {
  return {
    type: 'raci',
    roles: spec.roles,
    rows: spec.steps.map((s) => ({
      process: prettyStep(s.step),
      cells: spec.roles.map((role) => raciCell(role, s.raci)),
    })),
  };
}

// Renders the spec as the YAML-ish DNA text shown in the panel. RACI is shown
// per step so the on-screen spec visibly contains what the matrix is built from.
function renderDnaText(spec: ProcessSpec): string {
  const fmtList = (xs?: string[]) => (xs && xs.length ? xs.join(', ') : '—');
  const lines: string[] = [
    `process: ${spec.process}`,
    `owner: ${spec.owner}`,
    `sla: ${spec.sla}`,
    'roles:',
    ...spec.roles.map((r) => `  - ${r}`),
    'triggers:',
    ...spec.triggers.map((t) => `  - ${t}`),
    'steps:',
  ];
  for (const s of spec.steps) {
    lines.push(`  - step: ${s.step}`);
    lines.push(`    responsible: ${fmtList(s.raci.responsible)}`);
    lines.push(`    accountable: ${s.raci.accountable}`);
    lines.push(`    consulted: ${fmtList(s.raci.consulted)}`);
    lines.push(`    informed: ${fmtList(s.raci.informed)}`);
  }
  return lines.join('\n');
}

const PROCESS_FLOW_BY_PROCESS: Record<ProcessKey, ProcessFlowResult> = {
  onboarding: {
    type: 'process-flow',
    process: 'CustomerOnboarding',
    steps: [
      { name: 'Welcome email sent', owner: 'Auto', timing: 'on trigger' },
      { name: 'Account setup call', owner: 'Customer Success', timing: 'within 24h' },
      { name: 'Intro walkthrough', owner: 'Customer Success', timing: 'day 3' },
      { name: '30-day check-in', owner: 'Customer Success', timing: 'day 30' },
    ],
  },
  launch: {
    type: 'process-flow',
    process: 'ProductLaunch',
    steps: [
      { name: 'Market validation', owner: 'Product', timing: 'week 1' },
      { name: 'Engineering build', owner: 'Engineering', timing: 'weeks 2–10' },
      { name: 'GTM prep', owner: 'Sales', timing: 'week 11' },
      { name: 'Launch day', owner: 'Cross-functional', timing: 'week 12' },
      { name: 'Post-launch review', owner: 'Product', timing: 'week 14' },
    ],
  },
  close: {
    type: 'process-flow',
    process: 'MonthlyClose',
    steps: [
      { name: 'Close books', owner: 'Finance', timing: 'day 1' },
      { name: 'Reconcile accounts', owner: 'Finance', timing: 'day 2' },
      { name: 'Review variance', owner: 'Operations', timing: 'day 3' },
      { name: 'Exec report', owner: 'Finance', timing: 'day 4' },
      { name: 'Board package', owner: 'Leadership', timing: 'day 5' },
    ],
  },
};

const SOP_BY_PROCESS: Record<ProcessKey, SopResult> = {
  onboarding: {
    type: 'sop',
    title: 'Customer Onboarding SOP',
    owner: 'Customer Success Team',
    steps: ['Welcome email', 'Account setup', 'Intro call', '30-day check-in'],
    sla: '24h response guaranteed',
  },
  launch: {
    type: 'sop',
    title: 'Product Launch SOP',
    owner: 'Product Team',
    steps: ['Market validation', 'Engineering build', 'GTM prep', 'Launch day', 'Post-launch review'],
    sla: '90-day cycle',
  },
  close: {
    type: 'sop',
    title: 'Monthly Close SOP',
    owner: 'Finance Team',
    steps: ['Close books', 'Reconcile accounts', 'Review variance', 'Exec report', 'Board package'],
    sla: '5-day close',
  },
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
    default: {
      const _exhaustive: never = to.type;
      throw new ConvertError('Unsupported output type.', _exhaustive);
    }
  }
}
