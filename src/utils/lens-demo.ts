// Lens-demo data layer — reads the resource-graph DNA sample and shapes it into
// the four view-models the homepage demo renders: org chart, process flow,
// runbook, and job descriptions. The sample uses the same resources[]+
// relationships[] format as the graph-studio lens examples.

import sample from '~/data/lens-demo-sample.json';
import peopleLens from '~lenses/people.json';
import executionLens from '~lenses/execution.json';
import { lensNodes, type LensDoc } from '~/utils/lens-doc';

interface ResourceItem {
  id: string;
  type: string;
  name: string;
  description?: string;
}

interface RelationshipItem {
  id: string;
  type: string;
  from: string;
  to: string;
}

interface ResourceGraph {
  name: string;
  description?: string;
  resources: ResourceItem[];
  relationships: RelationshipItem[];
}

const graph = sample as unknown as ResourceGraph;

/** The lens definitions this demo renders through (used for labels + provenance). */
export const peopleLensDef = peopleLens as unknown as LensDoc;
export const executionLensDef = executionLens as unknown as LensDoc;

const lensTypes = (lens: LensDoc): string[] => lensNodes(lens).map((n) => n.type);

// Shared lookup helpers
function byId(g: ResourceGraph) {
  return new Map(g.resources.map((r) => [r.id, r]));
}

// --- Org chart view-model --------------------------------------------------

export interface OrgRole {
  name: string;
  description?: string;
  holders: string[];
  reports: OrgRole[];
}

export interface OrgChart {
  groupName: string;
  roots: OrgRole[];
  unaffiliated: { name: string }[];
  selects: string[];
}

export function getOrgChart(): OrgChart {
  const lookup = byId(graph);
  const positions = graph.resources.filter((r) => r.type === 'position');

  // fills: position id → person names
  const fillsMap = new Map<string, string[]>();
  // reports_to: child position id → parent position id
  const reportsTo = new Map<string, string>();
  // fills: person ids that are placed
  const placedPersons = new Set<string>();

  for (const rel of graph.relationships) {
    if (rel.type === 'fills') {
      const person = lookup.get(rel.from);
      if (person?.type === 'person') {
        const list = fillsMap.get(rel.to) ?? [];
        list.push(person.name);
        fillsMap.set(rel.to, list);
        placedPersons.add(rel.from);
      }
    }
    if (rel.type === 'reports_to') {
      reportsTo.set(rel.from, rel.to);
    }
  }

  const build = (posId: string): OrgRole => {
    const pos = lookup.get(posId)!;
    return {
      name: pos.name,
      description: pos.description,
      holders: fillsMap.get(posId) ?? [],
      reports: positions.filter((p) => reportsTo.get(p.id) === posId).map((p) => build(p.id)),
    };
  };

  const roots = positions.filter((p) => !reportsTo.has(p.id)).map((p) => build(p.id));
  const unaffiliated = graph.resources
    .filter((r) => r.type === 'person' && !placedPersons.has(r.id))
    .map((r) => ({ name: r.name }));

  const dept = graph.resources.find((r) => r.type === 'department' || r.type === 'company');

  return { groupName: dept?.name ?? graph.name, roots, unaffiliated, selects: lensTypes(peopleLensDef) };
}

// --- Process flow view-model -----------------------------------------------

export interface FlowStep {
  id: string;
  title: string;
  description?: string;
  actor?: string;
}

export interface ProcessFlow {
  processName: string;
  description?: string;
  steps: FlowStep[];
  selects: string[];
}

export function getProcessFlow(): ProcessFlow {
  const lookup = byId(graph);
  const process = graph.resources.find((r) => r.type === 'process');
  if (!process) return { processName: '', steps: [], selects: lensTypes(executionLensDef) };

  // Steps belonging to this process
  const stepIds = new Set(
    graph.relationships.filter((r) => r.type === 'belongs_to' && r.to === process.id).map((r) => r.from)
  );

  // next_step chain within this process
  const nextMap = new Map<string, string>();
  for (const rel of graph.relationships) {
    if (rel.type === 'next_step' && stepIds.has(rel.from) && stepIds.has(rel.to)) {
      nextMap.set(rel.from, rel.to);
    }
  }

  // assigned_to: step id → position name
  const assignedMap = new Map<string, string>();
  for (const rel of graph.relationships) {
    if (rel.type === 'assigned_to' && stepIds.has(rel.from)) {
      const pos = lookup.get(rel.to);
      if (pos) assignedMap.set(rel.from, pos.name);
    }
  }

  // Order steps: start from the one not pointed to by any next_step
  const pointedTo = new Set(nextMap.values());
  const start = graph.resources.find((r) => stepIds.has(r.id) && !pointedTo.has(r.id));
  const ordered: ResourceItem[] = [];
  let cur: ResourceItem | undefined = start;
  const seen = new Set<string>();
  while (cur && !seen.has(cur.id)) {
    ordered.push(cur);
    seen.add(cur.id);
    const nextId = nextMap.get(cur.id);
    cur = nextId ? lookup.get(nextId) : undefined;
  }
  // Append any orphaned steps in declared order
  for (const r of graph.resources) {
    if (stepIds.has(r.id) && !seen.has(r.id)) ordered.push(r);
  }

  const steps: FlowStep[] = ordered.map((s) => ({
    id: s.id,
    title: s.name,
    description: s.description,
    actor: assignedMap.get(s.id),
  }));

  return { processName: process.name, description: process.description, steps, selects: lensTypes(executionLensDef) };
}

// --- Runbook view-model ----------------------------------------------------

export interface RunbookItem {
  n: number;
  title: string;
  owner?: string;
  detail?: string;
}

export interface Runbook {
  processName: string;
  items: RunbookItem[];
}

export function getRunbook(): Runbook {
  const flow = getProcessFlow();
  return {
    processName: flow.processName,
    items: flow.steps.map((s, i) => ({ n: i + 1, title: s.title, owner: s.actor, detail: s.description })),
  };
}

// --- Job description view-model --------------------------------------------

export interface JobDescStep {
  title: string;
  description?: string;
}

export interface JobDescEntry {
  positionId: string;
  role: string;
  description?: string;
  holder?: string;
  department: string;
  reportsTo?: string;
  responsibilities: JobDescStep[];
}

export interface JobDescriptions {
  groupName: string;
  entries: JobDescEntry[];
}

export function getJobDescriptions(): JobDescriptions {
  const lookup = byId(graph);
  const positions = graph.resources.filter((r) => r.type === 'position');

  // fills: position id → person name
  const fillsMap = new Map<string, string>();
  for (const rel of graph.relationships) {
    if (rel.type === 'fills') {
      const person = lookup.get(rel.from);
      if (person?.type === 'person') fillsMap.set(rel.to, person.name);
    }
  }

  // reports_to: child position id → parent position id
  const reportsToMap = new Map<string, string>();
  for (const rel of graph.relationships) {
    if (rel.type === 'reports_to') reportsToMap.set(rel.from, rel.to);
  }

  // department: walk belongs_to up from position until dept/company
  function deptOf(posId: string): string {
    for (const rel of graph.relationships) {
      if (rel.type === 'belongs_to' && rel.from === posId) {
        const parent = lookup.get(rel.to);
        if (parent && (parent.type === 'department' || parent.type === 'company')) return parent.name;
      }
    }
    return '';
  }

  // assigned steps: position id → steps (in process order)
  const flow = getProcessFlow();
  const stepsByPos = new Map<string, JobDescStep[]>();
  for (const rel of graph.relationships) {
    if (rel.type === 'assigned_to') {
      const step = lookup.get(rel.from);
      if (step?.type === 'step') {
        // Use the ordered flow step to get description
        const flowStep = flow.steps.find((s) => s.id === step.id);
        const list = stepsByPos.get(rel.to) ?? [];
        list.push({ title: step.name, description: flowStep?.description ?? step.description });
        stepsByPos.set(rel.to, list);
      }
    }
  }

  const dept = graph.resources.find((r) => r.type === 'department' || r.type === 'company');

  const entries: JobDescEntry[] = positions.map((pos) => {
    const reportsToId = reportsToMap.get(pos.id);
    return {
      positionId: pos.id,
      role: pos.name,
      description: pos.description,
      holder: fillsMap.get(pos.id),
      department: deptOf(pos.id),
      reportsTo: reportsToId ? lookup.get(reportsToId)?.name : undefined,
      responsibilities: stepsByPos.get(pos.id) ?? [],
    };
  });

  return { groupName: dept?.name ?? graph.name, entries };
}

/** Humanize a kebab/snake identifier for display. */
export function humanize(name: string): string {
  const spaced = name.replace(/[-_]+/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
