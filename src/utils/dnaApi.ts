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

const DNA_BY_PROCESS: Record<ProcessKey, string> = {
  onboarding: `process: CustomerOnboarding
  owner: CustomerSuccess
  steps:
    - welcome-email
    - account-setup
    - intro-call
    - 30-day-check-in
  triggers:
    - new-signup
    - plan-upgrade
  sla: 24h response`,
  launch: `process: ProductLaunch
  owner: ProductTeam
  steps:
    - market-validation
    - engineering-build
    - gtm-prep
    - launch-day
    - post-launch-review
  owners:
    - Product
    - Engineering
    - Sales
    - CustomerSuccess
  triggers:
    - roadmap-approval
    - exec-signoff
  sla: 90-day cycle`,
  close: `process: MonthlyClose
  owner: Finance
  steps:
    - close-books
    - reconcile-accounts
    - review-variance
    - exec-report
    - board-package
  owners:
    - Finance
    - Operations
    - Leadership
  triggers:
    - month-end
    - quarter-end
  sla: 5-day close`,
};

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

const RACI_BY_PROCESS: Record<ProcessKey, RaciResult> = {
  onboarding: {
    type: 'raci',
    roles: ['Ops', 'Sales', 'Customer Success', 'Finance'],
    rows: [
      { process: 'Onboarding', cells: ['A', 'C', 'R', 'I'] },
      { process: 'Lead handoff', cells: ['I', 'R', 'A', 'I'] },
      { process: 'Monthly close', cells: ['A', 'I', 'I', 'R'] },
      { process: 'Vendor review', cells: ['R', 'C', 'I', 'A'] },
    ],
  },
  launch: {
    type: 'raci',
    roles: ['Product', 'Engineering', 'Sales', 'Customer Success'],
    rows: [
      { process: 'Market validation', cells: ['R', 'C', 'I', 'I'] },
      { process: 'Engineering build', cells: ['A', 'R', 'I', 'I'] },
      { process: 'GTM prep', cells: ['C', 'I', 'R', 'A'] },
      { process: 'Launch day', cells: ['A', 'R', 'R', 'R'] },
    ],
  },
  close: {
    type: 'raci',
    roles: ['Finance', 'Operations', 'Leadership', 'Audit'],
    rows: [
      { process: 'Close books', cells: ['R', 'C', 'I', 'A'] },
      { process: 'Reconcile accounts', cells: ['R', 'A', 'I', 'C'] },
      { process: 'Variance review', cells: ['C', 'R', 'A', 'I'] },
      { process: 'Board package', cells: ['A', 'I', 'R', 'I'] },
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
      return { type: 'dna', content: DNA_BY_PROCESS[key] };
    case 'process-flow':
      return PROCESS_FLOW_BY_PROCESS[key];
    case 'raci':
      return RACI_BY_PROCESS[key];
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
