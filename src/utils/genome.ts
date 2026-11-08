// Derivation: compiled DNA → the twelve view-models the landing page renders.
//
// Every function here takes a CompiledGenome and returns a plain data structure. None of them
// knows which industry it is looking at, and none of them may ever learn — that constraint is a
// requirement in the industry-dna-landing spec, and it is the whole demonstration. The same
// twelve functions produce six industries' worth of artifacts because the difference between
// those industries lives entirely in the genome.
//
// This module deliberately does not touch src/utils/lens-demo.ts. That module serves
// /operations and its four flat-graph samples; generalising it in place would have put the
// homepage's demo at risk to save a hundred lines here.

import type { CompiledGenome, DnaNoun, DnaRule } from '~/utils/genome-types';
import { humanize } from '~/utils/genome-compile';
import type { OutputId } from '~/data/industries';

// --- Shared helpers ---------------------------------------------------------

const roles = (g: CompiledGenome): DnaNoun[] => g.operational.domain.roles ?? [];
const resources = (g: CompiledGenome): DnaNoun[] => g.operational.domain.resources ?? [];
const rules = (g: CompiledGenome): DnaRule[] => g.operational.rules ?? [];
const theProcess = (g: CompiledGenome) => g.operational.processes?.[0];

const split = (name: string): string => name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ');

/**
 * Sentence case, for things that read as a phrase: field names and rule names.
 * `enterpriseValue` → `Enterprise value`. `PaymentClearsBeforeStockMoves` → `Payment clears
 * before stock moves`, which is the sentence the rule is.
 */
export function labelFor(name: string): string {
  const spaced = split(name);
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/**
 * Title case, for proper nouns: roles, groups, entities, pages. `ManagingPartner` →
 * `Managing Partner`. A job title in sentence case reads like a typo, and these are the strings
 * a visitor scans first.
 */
export function titleFor(name: string): string {
  return split(name)
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Steps in declared order, with the task that runs each one resolved. */
function orderedSteps(g: CompiledGenome) {
  const proc = theProcess(g);
  if (!proc) return [];
  const taskByName = new Map((g.operational.tasks ?? []).map((t) => [t.name, t]));
  return proc.steps.map((s) => ({
    id: s.id,
    title: g.stepTitles[s.id] ?? humanize(s.id),
    description: s.description,
    task: taskByName.get(s.task),
    actor: taskByName.get(s.task)?.actor ?? '',
    operation: taskByName.get(s.task)?.operation ?? '',
    consulted: g.consulted[s.id] ?? [],
  }));
}

// --- Operations layer -------------------------------------------------------

export interface ProcessFlowVm {
  processName: string;
  description?: string;
  operator: string;
  steps: { id: string; title: string; actor: string; operation: string; description?: string }[];
}

export function processFlow(g: CompiledGenome): ProcessFlowVm {
  const proc = theProcess(g);
  return {
    processName: proc ? titleFor(proc.name) : '',
    description: proc?.description,
    operator: titleFor(proc?.operator ?? ''),
    steps: orderedSteps(g).map((s) => ({
      id: s.id,
      title: s.title,
      actor: titleFor(s.actor),
      operation: s.operation,
      description: s.description,
    })),
  };
}

export interface SopVm {
  processName: string;
  purpose?: string;
  owner: string;
  trigger?: string;
  steps: { n: number; title: string; actor: string; instruction: string }[];
}

export function sop(g: CompiledGenome): SopVm {
  const proc = theProcess(g);
  const starter = (g.operational.triggers ?? []).find((t) => t.process === proc?.name);
  return {
    processName: proc ? titleFor(proc.name) : '',
    purpose: proc?.description,
    owner: titleFor(proc?.operator ?? ''),
    trigger: starter?.description,
    steps: orderedSteps(g).map((s, i) => ({
      n: i + 1,
      title: s.title,
      actor: titleFor(s.actor),
      instruction: s.description ?? `Perform ${s.operation}.`,
    })),
  };
}

export interface PositionNode {
  name: string;
  description?: string;
  /** Steps of the process this role performs. Answers "what is this job, actually". */
  owns: string[];
  reports: PositionNode[];
}

export interface KeyPositionsVm {
  groupName: string;
  roots: PositionNode[];
}

export function keyPositions(g: CompiledGenome): KeyPositionsVm {
  const all = roles(g);
  const steps = orderedSteps(g);
  const build = (role: DnaNoun): PositionNode => ({
    name: titleFor(role.name),
    description: role.description,
    owns: steps.filter((s) => s.actor === role.name).map((s) => s.title),
    reports: all.filter((r) => r.parent === role.name).map(build),
  });
  return {
    groupName: titleFor(g.operational.domain.groups?.[0]?.name ?? g.operational.domain.name),
    roots: all.filter((r) => !r.parent).map(build),
  };
}

export interface RaciVm {
  roles: string[];
  rows: { step: string; cells: ('R' | 'A' | 'C' | '')[] }[];
}

/**
 * Responsible is the task's actor. Accountable is the process operator — one per process, which
 * is what makes a RACI matrix worth reading. Consulted comes from the step's declared list plus
 * any role an access rule on that step's operation permits: if a rule says you may perform it,
 * you are at minimum consulted on it.
 */
export function raci(g: CompiledGenome): RaciVm {
  const steps = orderedSteps(g);
  const proc = theProcess(g);
  const roleNames = roles(g).map((r) => r.name);
  const allowByOperation = new Map<string, Set<string>>();
  for (const r of rules(g)) {
    if (r.rule_type !== 'access') continue;
    const set = allowByOperation.get(r.operation) ?? new Set<string>();
    for (const a of r.allow ?? []) if (a.role) set.add(a.role);
    allowByOperation.set(r.operation, set);
  }

  return {
    roles: roleNames.map(titleFor),
    rows: steps.map((s) => {
      const consulted = new Set([...s.consulted, ...(allowByOperation.get(s.operation) ?? [])]);
      return {
        step: s.title,
        cells: roleNames.map((role) => {
          if (role === s.actor) return 'R';
          if (role === proc?.operator) return 'A';
          return consulted.has(role) ? 'C' : '';
        }),
      };
    }),
  };
}

export interface PoliciesVm {
  rules: { name: string; operation: string; kind: string; description?: string; allow: string[] }[];
}

export function policies(g: CompiledGenome): PoliciesVm {
  return {
    rules: rules(g).map((r) => ({
      name: labelFor(r.name),
      operation: r.operation,
      kind: r.rule_type ?? 'condition',
      description: r.description,
      allow: (r.allow ?? []).map((a) => titleFor(a.role ?? '')).filter(Boolean),
    })),
  };
}

// --- Product layer ----------------------------------------------------------

export interface DataModelVm {
  entities: {
    name: string;
    description?: string;
    fields: { name: string; type: string; required: boolean; values?: string[] }[];
    actions: string[];
  }[];
}

export function dataModel(g: CompiledGenome): DataModelVm {
  return {
    entities: resources(g).map((r) => ({
      name: titleFor(r.name),
      description: r.description,
      fields: (r.attributes ?? []).map((a) => ({
        name: a.name,
        type: a.type,
        required: !!a.required,
        values: a.values,
      })),
      actions: (r.actions ?? []).map((a) => a.name),
    })),
  };
}

export interface ScreenMapVm {
  layout: string;
  screens: {
    route: string;
    page: string;
    resource: string;
    description?: string;
    protectedRoute: boolean;
    blocks: string[];
  }[];
}

export function screenMap(g: CompiledGenome): ScreenMapVm {
  const ui = g.product.ui;
  const pageByName = new Map(ui.pages.map((p) => [p.name, p]));
  return {
    layout: ui.layout.name,
    screens: ui.routes.map((r) => {
      const page = pageByName.get(r.page);
      return {
        route: r.path,
        page: titleFor(r.page),
        resource: titleFor(page?.resource ?? ''),
        description: r.description ?? page?.description,
        protectedRoute: !!r.protected,
        blocks: ((page?.blocks ?? []) as { type: string }[]).map((b) => b.type),
      };
    }),
  };
}

export interface ExampleUiVm {
  resource: string;
  title: string;
  columns: { name: string; label: string; type: string }[];
  rows: Record<string, string | number | boolean>[];
  /** The detail form, from the same fields. */
  form: { name: string; label: string; type: string; required: boolean; readonly: boolean; values?: string[] }[];
  actions: string[];
}

/**
 * The one output that has to look like software rather than a diagram, so it is the one most
 * exposed to invention. It is not allowed any: columns come from the genome's declared fields
 * and every row is a sample the genome declares. A genome with no samples renders an empty
 * table, which is the honest result.
 */
export function exampleUi(g: CompiledGenome): ExampleUiVm {
  const api = g.product.api;
  // The resource behind the first page that lists something — that is the screen an operator
  // opens first, so it is the screen worth showing.
  const listPage = g.product.ui.pages.find((p) =>
    (p.blocks as { type: string }[] | undefined)?.some((b) => b.type === 'table')
  );
  const target = api.resources.find((r) => r.name === listPage?.resource) ?? api.resources[0];
  const fields = target?.fields ?? [];

  return {
    resource: target?.name ?? '',
    title: titleFor(listPage?.name ?? target?.name ?? ''),
    columns: fields.map((f) => ({ name: f.name, label: f.label ?? labelFor(f.name), type: f.type })),
    rows: g.samples[target?.name ?? ''] ?? [],
    form: fields.map((f) => ({
      name: f.name,
      label: f.label ?? labelFor(f.name),
      type: f.type,
      required: !!f.required,
      readonly: !!f.readonly,
      values: f.values,
    })),
    actions: (target?.actions ?? []).map((a) => a.name),
  };
}

export interface ApiSurfaceVm {
  namespace: string;
  basePath: string;
  description?: string;
  endpoints: { method: string; path: string; operation: string; description?: string }[];
}

export function apiSurface(g: CompiledGenome): ApiSurfaceVm {
  const api = g.product.api;
  return {
    namespace: api.namespace.name,
    basePath: api.namespace.path,
    description: api.namespace.description,
    endpoints: api.endpoints.map((e) => ({
      method: e.method,
      path: `${api.namespace.path}${e.path}`,
      operation: e.operation,
      description: e.description,
    })),
  };
}

// --- Technology layer -------------------------------------------------------

export interface ArchitectureVm {
  cells: { name: string; adapter: string; dna: string; description?: string; kind: string }[];
  edges: { source: string; target: string; type: string; label?: string }[];
}

export function architecture(g: CompiledGenome): ArchitectureVm {
  return {
    cells: g.technical.cells.map((c) => {
      const adapter = (c.adapter ?? {}) as { type?: string; version?: string };
      return {
        name: c.name,
        adapter: [adapter.type, adapter.version].filter(Boolean).join(' '),
        dna: c.dna,
        description: c.description,
        // The DNA a cell runs already says what kind of thing it is. Reading it here beats
        // asking an author to label every cell twice.
        kind: c.dna.includes('.Web')
          ? 'web'
          : c.dna.includes('.Api')
            ? 'service'
            : c.dna.includes('.Core')
              ? 'data'
              : 'worker',
      };
    }),
    edges: (g.technical.connections ?? []).map((c) => ({
      source: c.source,
      target: c.target,
      type: c.type,
      label: c.label,
    })),
  };
}

export interface EnvironmentsVm {
  environments: {
    name: string;
    description?: string;
    providers: { name: string; type: string; region?: string }[];
    cells: string[];
  }[];
}

export function environments(g: CompiledGenome): EnvironmentsVm {
  return {
    environments: (g.technical.environments ?? []).map((e) => ({
      name: e.name,
      description: e.description,
      providers: (e.providers ?? []).map((p) => ({ name: p.name, type: p.type, region: p.region })),
      cells: g.technical.cells.filter((c) => c.environment === e.name).map((c) => c.name),
    })),
  };
}

export interface AccessControlVm {
  roles: string[];
  operations: { name: string; rows: boolean[]; governedBy?: string }[];
  /** Operations no access rule mentions. The interesting column on this artifact. */
  ungoverned: string[];
}

/**
 * Derived, not declared — the phrase is on the card and it has to be true. Every operation in
 * the genome is listed, and a role gets a mark only where an access rule names it. Operations no
 * rule mentions come out as ungoverned, which is usually the most useful thing on the screen.
 */
export function accessControl(g: CompiledGenome): AccessControlVm {
  const roleNames = roles(g).map((r) => r.name);
  const accessRules = rules(g).filter((r) => r.rule_type === 'access');
  const ops = (g.operational.operations ?? []).map((o) => o.name);

  const operations = ops.map((name) => {
    const governing = accessRules.filter((r) => r.operation === name);
    const allowed = new Set(governing.flatMap((r) => (r.allow ?? []).map((a) => a.role).filter(Boolean) as string[]));
    return {
      name,
      rows: roleNames.map((r) => allowed.has(r)),
      governedBy: governing[0] ? labelFor(governing[0].name) : undefined,
    };
  });

  return {
    roles: roleNames.map(titleFor),
    operations: operations.filter((o) => o.governedBy),
    ungoverned: operations.filter((o) => !o.governedBy).map((o) => o.name),
  };
}

// --- The registry -----------------------------------------------------------

/** Every output id mapped to the derivation that produces it. */
export const DERIVATIONS: Record<OutputId, (g: CompiledGenome) => unknown> = {
  'process-flow': processFlow,
  sop,
  'key-positions': keyPositions,
  raci,
  policies,
  'data-model': dataModel,
  'screen-map': screenMap,
  'example-ui': exampleUi,
  'api-surface': apiSurface,
  architecture,
  environments,
  'access-control': accessControl,
};
