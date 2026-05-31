// Lens-demo data layer — reads the bundled sample operational DNA and shapes it
// into the two view-models the homepage demo renders: an org chart (People lens)
// and a process flow (Execution lens).
//
// The sample is validated as operational DNA at authoring time (see the
// add-lens-demo change), so we treat it as trusted here and do not re-validate
// at runtime. Which node types each view pulls is driven by the lens
// definitions in @dna-codes/dna-core (people.json / execution.json), so the
// views stay honest to what each lens actually selects.

import sample from '~/data/lens-demo-sample.json';
import peopleLens from '~lenses/people.json';
import executionLens from '~lenses/execution.json';
import { lensNodes, type LensDoc } from '~/utils/lens-doc';

// --- minimal structural types for the bits the demo renders ----------------

interface Person {
  name: string;
  description?: string;
}
interface Group {
  name: string;
  description?: string;
}
interface Role {
  name: string;
  description?: string;
  parent?: string;
  scope?: string;
}
interface Membership {
  name: string;
  person: string;
  role: string;
  group?: string;
}
interface Operation {
  name: string;
  target?: string;
  action?: string;
}
interface Task {
  name: string;
  description?: string;
  actor?: string;
  operation?: string;
}
interface ProcessStep {
  id: string;
  task: string;
  depends_on?: string[];
}
interface Process {
  name: string;
  description?: string;
  operator?: string;
  startStep?: string;
  steps: ProcessStep[];
}
interface Trigger {
  name: string;
  process?: string;
  operation?: string;
  source: string;
  description?: string;
}

interface OperationalSample {
  domain: {
    name: string;
    persons?: Person[];
    groups?: Group[];
    roles?: Role[];
  };
  memberships?: Membership[];
  operations?: Operation[];
  tasks?: Task[];
  processes?: Process[];
  triggers?: Trigger[];
}

const dna = sample as unknown as OperationalSample;

/** The lens definitions this demo renders through (used for labels + provenance). */
export const peopleLensDef = peopleLens as unknown as LensDoc;
export const executionLensDef = executionLens as unknown as LensDoc;

/** Node-type names a lens selects (e.g. People -> ["Person","Group"]). */
const lensTypes = (lens: LensDoc): string[] => lensNodes(lens).map((n) => n.type);

// --- Org chart view-model (People lens) ------------------------------------

export interface OrgRole {
  name: string;
  description?: string;
  holders: string[]; // person names holding this role (via Membership)
  reports: OrgRole[]; // child roles (via role.parent)
}

export interface OrgChart {
  groupName: string;
  /** Role hierarchy roots (roles with no parent inside the group). */
  roots: OrgRole[];
  /** People not placed in the role tree (e.g. external actors). */
  unaffiliated: Person[];
  /** Node types the People lens selects — drives what this view shows. */
  selects: string[];
}

export function getOrgChart(): OrgChart {
  const roles = dna.domain.roles ?? [];
  const memberships = dna.memberships ?? [];
  const persons = dna.domain.persons ?? [];
  const group = dna.domain.groups?.[0];

  const holdersOf = (roleName: string): string[] => memberships.filter((m) => m.role === roleName).map((m) => m.person);

  const placedPeople = new Set(memberships.map((m) => m.person));

  const build = (role: Role): OrgRole => ({
    name: role.name,
    description: role.description,
    holders: holdersOf(role.name),
    reports: roles.filter((r) => r.parent === role.name).map(build),
  });

  const roots = roles.filter((r) => !r.parent).map(build);
  const unaffiliated = persons.filter((p) => !placedPeople.has(p.name));

  return {
    groupName: group?.name ?? dna.domain.name,
    roots,
    unaffiliated,
    selects: lensTypes(peopleLensDef),
  };
}

// --- Process flow view-model (Execution lens) ------------------------------

/** Humanize a kebab/snake identifier for display, e.g. "underwrite-loan" -> "Underwrite loan". */
export function humanize(name: string): string {
  const spaced = name.replace(/[-_]+/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export interface FlowStep {
  id: string;
  taskName: string;
  title: string; // humanized task name for display
  description?: string;
  actor?: string;
  operation?: string;
}

export interface ProcessFlow {
  processName: string;
  description?: string;
  operator?: string;
  trigger?: { name: string; source: string; description?: string };
  steps: FlowStep[]; // ordered from startStep along depends_on
  selects: string[];
}

export function getProcessFlow(): ProcessFlow {
  const process = dna.processes?.[0];
  const tasks = dna.tasks ?? [];
  const triggers = dna.triggers ?? [];
  const taskByName = new Map(tasks.map((t) => [t.name, t]));

  const ordered = orderSteps(process?.steps ?? [], process?.startStep);
  const steps: FlowStep[] = ordered.map((s) => {
    const t = taskByName.get(s.task);
    return {
      id: s.id,
      taskName: s.task,
      title: humanize(s.task),
      description: t?.description,
      actor: t?.actor,
      operation: t?.operation,
    };
  });

  const trig = triggers.find((t) => t.process === process?.name) ?? triggers[0];

  return {
    processName: process?.name ?? '',
    description: process?.description,
    operator: process?.operator,
    trigger: trig ? { name: trig.name, source: trig.source, description: trig.description } : undefined,
    steps,
    selects: lensTypes(executionLensDef),
  };
}

// --- Runbook view-model (same Execution data, as an operating procedure) ----

export interface RunbookItem {
  n: number;
  title: string;
  owner?: string;
  detail?: string; // what happens in this step (task description)
  operation?: string; // the operation it performs
}

export interface Runbook {
  processName: string;
  items: RunbookItem[];
}

/** The same process, rendered as a numbered "who does what" operating procedure. */
export function getRunbook(): Runbook {
  const flow = getProcessFlow();
  return {
    processName: flow.processName,
    items: flow.steps.map((s, i) => ({
      n: i + 1,
      title: s.title,
      owner: s.actor,
      detail: s.description,
      operation: s.operation,
    })),
  };
}

/** Order steps from startStep, following depends_on; falls back to declared order. */
function orderSteps(steps: ProcessStep[], startStep?: string): ProcessStep[] {
  if (steps.length === 0) return [];
  const byId = new Map(steps.map((s) => [s.id, s]));
  const ordered: ProcessStep[] = [];
  const seen = new Set<string>();
  let current = startStep ? byId.get(startStep) : steps[0];
  while (current && !seen.has(current.id)) {
    ordered.push(current);
    seen.add(current.id);
    current = steps.find((s) => (s.depends_on ?? []).includes(current!.id));
  }
  // Append any steps not reached by the linear walk, in declared order.
  for (const s of steps) if (!seen.has(s.id)) ordered.push(s);
  return ordered;
}
