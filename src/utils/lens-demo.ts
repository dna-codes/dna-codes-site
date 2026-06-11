// Lens-demo data layer — reads resource-graph DNA samples and shapes each into
// four view-models: org chart, process flow, runbook, and job descriptions.

import lendingSample from '~/data/lens-demo-sample.json';
import clinicSample from '~/data/lens-demo-clinic.json';
import ecommerceSample from '~/data/lens-demo-ecommerce.json';
import softwareSample from '~/data/lens-demo-software.json';
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

export const peopleLensDef = peopleLens as unknown as LensDoc;
export const executionLensDef = executionLens as unknown as LensDoc;

const lensTypes = (lens: LensDoc): string[] => lensNodes(lens).map((n) => n.type);

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

function buildOrgChart(graph: ResourceGraph): OrgChart {
  const lookup = byId(graph);
  const positions = graph.resources.filter((r) => r.type === 'position');

  const fillsMap = new Map<string, string[]>();
  const reportsTo = new Map<string, string>();
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

function buildProcessFlow(graph: ResourceGraph): ProcessFlow {
  const lookup = byId(graph);
  const process = graph.resources.find((r) => r.type === 'process');
  if (!process) return { processName: '', steps: [], selects: lensTypes(executionLensDef) };

  const stepIds = new Set(
    graph.relationships.filter((r) => r.type === 'belongs_to' && r.to === process.id).map((r) => r.from)
  );

  const nextMap = new Map<string, string>();
  for (const rel of graph.relationships) {
    if (rel.type === 'next_step' && stepIds.has(rel.from) && stepIds.has(rel.to)) {
      nextMap.set(rel.from, rel.to);
    }
  }

  const assignedMap = new Map<string, string>();
  for (const rel of graph.relationships) {
    if (rel.type === 'assigned_to' && stepIds.has(rel.from)) {
      const pos = lookup.get(rel.to);
      if (pos) assignedMap.set(rel.from, pos.name);
    }
  }

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

function buildRunbook(graph: ResourceGraph): Runbook {
  const flow = buildProcessFlow(graph);
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

function buildJobDescriptions(graph: ResourceGraph): JobDescriptions {
  const lookup = byId(graph);
  const positions = graph.resources.filter((r) => r.type === 'position');
  const flow = buildProcessFlow(graph);

  const fillsMap = new Map<string, string>();
  for (const rel of graph.relationships) {
    if (rel.type === 'fills') {
      const person = lookup.get(rel.from);
      if (person?.type === 'person') fillsMap.set(rel.to, person.name);
    }
  }

  const reportsToMap = new Map<string, string>();
  for (const rel of graph.relationships) {
    if (rel.type === 'reports_to') reportsToMap.set(rel.from, rel.to);
  }

  function deptOf(posId: string): string {
    for (const rel of graph.relationships) {
      if (rel.type === 'belongs_to' && rel.from === posId) {
        const parent = lookup.get(rel.to);
        if (parent && (parent.type === 'department' || parent.type === 'company')) return parent.name;
      }
    }
    return '';
  }

  const stepsByPos = new Map<string, JobDescStep[]>();
  for (const rel of graph.relationships) {
    if (rel.type === 'assigned_to') {
      const step = lookup.get(rel.from);
      if (step?.type === 'step') {
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

// --- Multi-sample API -------------------------------------------------------

export interface DemoSample {
  key: string;
  label: string;
  org: OrgChart;
  flow: ProcessFlow;
  runbook: Runbook;
  jd: JobDescriptions;
}

const SAMPLE_DEFS: { key: string; label: string; raw: unknown }[] = [
  { key: 'clinic', label: 'Healthcare', raw: clinicSample },
  { key: 'shop', label: 'E-commerce', raw: ecommerceSample },
  { key: 'software', label: 'Engineering', raw: softwareSample },
  { key: 'lending', label: 'Lending', raw: lendingSample },
];

export function getAllDemoSamples(): DemoSample[] {
  return SAMPLE_DEFS.map(({ key, label, raw }) => {
    const graph = raw as unknown as ResourceGraph;
    return {
      key,
      label,
      org: buildOrgChart(graph),
      flow: buildProcessFlow(graph),
      runbook: buildRunbook(graph),
      jd: buildJobDescriptions(graph),
    };
  });
}

/** Humanize a kebab/snake identifier for display. */
export function humanize(name: string): string {
  const spaced = name.replace(/[-_]+/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
