// Two view-models for the genome gallery: the genome map, and the three questions a genome
// answers.
//
// Both read a CompiledGenome and nothing else. Neither knows which genome it is looking at, the
// same constraint the twelve Playground derivations in ./genome keep. Relative imports only, so
// `node --test` can load this file directly.

import type { CompiledGenome, DnaNoun, DnaRule } from './genome-types';
import { humanize, labelFor, titleFor } from './genome-labels.ts';

// --- Shared reads -------------------------------------------------------------

const rolesOf = (g: CompiledGenome): DnaNoun[] => g.operational.domain.roles ?? [];
const resourcesOf = (g: CompiledGenome): DnaNoun[] => g.operational.domain.resources ?? [];
const rulesOf = (g: CompiledGenome): DnaRule[] => g.operational.rules ?? [];
const targetOf = (operation: string): string => operation.split('.')[0] ?? '';

const allowedRoles = (r: DnaRule): string[] => (r.allow ?? []).map((a) => a.role).filter((x): x is string => !!x);

/** Every process with its steps in declared order and each step's task resolved. */
function processesOf(g: CompiledGenome) {
  const taskByName = new Map((g.operational.tasks ?? []).map((t) => [t.name, t]));
  return (g.operational.processes ?? []).map((p) => ({
    name: p.name,
    description: p.description,
    operator: p.operator,
    steps: p.steps.map((s) => {
      const task = taskByName.get(s.task);
      return {
        id: s.id,
        title: g.stepTitles[s.id] ?? humanize(s.id),
        actor: task?.actor ?? '',
        operation: task?.operation ?? '',
      };
    }),
  }));
}

/** Keeps the first occurrence of each value, in order. */
const unique = (xs: string[]): string[] => [...new Set(xs)];

/** Sorts names in declared role order, so every answer lists roles the same way. */
const inRoleOrder = (g: CompiledGenome, names: Iterable<string>): string[] => {
  const want = new Set(names);
  return rolesOf(g)
    .map((r) => r.name)
    .filter((n) => want.has(n));
};

// --- Genome map -----------------------------------------------------------------

export interface GenomeMapRole {
  name: string;
  label: string;
  description?: string;
  children: GenomeMapRole[];
}

export interface GenomeMapStep {
  id: string;
  title: string;
  actor: string;
  actorLabel: string;
  operation: string;
  /** The declared resource the step's operation acts on, when its target is a resource. */
  resource?: string;
  /** Names of the rules that govern this step's operation. */
  rules: string[];
}

export interface GenomeMapProcess {
  name: string;
  label: string;
  description?: string;
  operator: string;
  operatorLabel: string;
  steps: GenomeMapStep[];
}

export interface GenomeMapResource {
  name: string;
  label: string;
  description?: string;
}

export interface GenomeMapRule {
  name: string;
  label: string;
  operation: string;
  kind: string;
  description?: string;
  /** Role names the rule allows. */
  allow: string[];
  /** Step ids this rule sits on. Empty when no step performs its operation. */
  steps: string[];
}

/** What a role touches. The client script highlights these when the role is selected. */
export interface RoleReach {
  steps: string[];
  rules: string[];
  resources: string[];
}

export interface GenomeMapVm {
  roles: GenomeMapRole[];
  processes: GenomeMapProcess[];
  resources: GenomeMapResource[];
  rules: GenomeMapRule[];
  /** Rules whose operation no step performs, in declared order. */
  unattached: string[];
  /** Role name → reach, for every role. */
  reach: Record<string, RoleReach>;
}

export function genomeMap(g: CompiledGenome): GenomeMapVm {
  const roles = rolesOf(g);
  const resourceNames = new Set(resourcesOf(g).map((r) => r.name));
  const rules = rulesOf(g);
  const processes = processesOf(g);
  const allSteps = processes.flatMap((p) => p.steps);

  const rulesByOperation = new Map<string, string[]>();
  for (const r of rules) rulesByOperation.set(r.operation, [...(rulesByOperation.get(r.operation) ?? []), r.name]);

  const roleNames = new Set(roles.map((r) => r.name));
  const buildRole = (r: DnaNoun): GenomeMapRole => ({
    name: r.name,
    label: titleFor(r.name),
    description: r.description,
    children: roles.filter((c) => c.parent === r.name).map(buildRole),
  });

  const resourceFor = (operation: string) => {
    const t = targetOf(operation);
    return resourceNames.has(t) ? t : undefined;
  };

  const reach: Record<string, RoleReach> = {};
  for (const role of roles) {
    const steps = allSteps.filter((s) => s.actor === role.name);
    reach[role.name] = {
      steps: steps.map((s) => s.id),
      rules: rules.filter((r) => allowedRoles(r).includes(role.name)).map((r) => r.name),
      resources: unique(steps.map((s) => resourceFor(s.operation)).filter((x): x is string => !!x)),
    };
  }

  const mapRules: GenomeMapRule[] = rules.map((r) => ({
    name: r.name,
    label: labelFor(r.name),
    operation: r.operation,
    kind: r.rule_type ?? 'condition',
    description: r.description,
    allow: allowedRoles(r),
    steps: allSteps.filter((s) => s.operation === r.operation).map((s) => s.id),
  }));

  return {
    // A role whose parent is not declared would otherwise vanish from the tree.
    roles: roles.filter((r) => !r.parent || !roleNames.has(r.parent)).map(buildRole),
    processes: processes.map((p) => ({
      name: p.name,
      label: titleFor(p.name),
      description: p.description,
      operator: p.operator,
      operatorLabel: titleFor(p.operator),
      steps: p.steps.map((s) => ({
        id: s.id,
        title: s.title,
        actor: s.actor,
        actorLabel: titleFor(s.actor),
        operation: s.operation,
        resource: resourceFor(s.operation),
        rules: rulesByOperation.get(s.operation) ?? [],
      })),
    })),
    resources: resourcesOf(g).map((r) => ({ name: r.name, label: titleFor(r.name), description: r.description })),
    rules: mapRules,
    unattached: mapRules.filter((r) => !r.steps.length).map((r) => r.name),
    reach,
  };
}

// --- Questions --------------------------------------------------------------------

export interface QuestionSubject {
  name: string;
  label: string;
}

export interface GenomeQuestionsVm {
  operations: QuestionSubject[];
  roles: QuestionSubject[];
  resources: QuestionSubject[];
  /** Operation → role labels an access rule allows, and labels of every rule on it. */
  whoMay: Record<string, { roles: string[]; rules: string[] }>;
  /** Role → the steps it performs and the processes it operates. */
  stalls: Record<string, { steps: { title: string; process: string }[]; processes: string[] }>;
  /** Resource → role labels that act on it, by a step or by an access rule. */
  touches: Record<string, { roles: string[] }>;
  defaults: { operation: string; role: string; resource: string };
}

/**
 * The subject with the highest score. A tie goes to the name that sorts first, so two builds of
 * one genome always pick the same default.
 */
function pickDefault(names: string[], score: (name: string) => number): string {
  let best = '';
  let bestScore = -1;
  for (const name of [...names].sort()) {
    const s = score(name);
    if (s > bestScore) {
      best = name;
      bestScore = s;
    }
  }
  return best;
}

export function genomeQuestions(g: CompiledGenome): GenomeQuestionsVm {
  const roles = rolesOf(g);
  const resources = resourcesOf(g);
  const rules = rulesOf(g);
  const operations = (g.operational.operations ?? []).map((o) => o.name);
  const processes = processesOf(g);
  const steps = processes.flatMap((p) => p.steps.map((s) => ({ ...s, process: titleFor(p.name) })));
  const access = rules.filter((r) => r.rule_type === 'access');

  const whoMay: GenomeQuestionsVm['whoMay'] = {};
  const allowCount: Record<string, number> = {};
  for (const op of operations) {
    const allowed = inRoleOrder(g, access.filter((r) => r.operation === op).flatMap(allowedRoles));
    allowCount[op] = allowed.length;
    whoMay[op] = {
      roles: allowed.map(titleFor),
      rules: rules.filter((r) => r.operation === op).map((r) => labelFor(r.name)),
    };
  }

  const stalls: GenomeQuestionsVm['stalls'] = {};
  for (const role of roles) {
    stalls[role.name] = {
      steps: steps.filter((s) => s.actor === role.name).map((s) => ({ title: s.title, process: s.process })),
      processes: processes.filter((p) => p.operator === role.name).map((p) => titleFor(p.name)),
    };
  }

  const touches: GenomeQuestionsVm['touches'] = {};
  const stepCount: Record<string, number> = {};
  for (const res of resources) {
    const acting = steps.filter((s) => targetOf(s.operation) === res.name);
    stepCount[res.name] = acting.length;
    const byRule = access.filter((r) => targetOf(r.operation) === res.name).flatMap(allowedRoles);
    touches[res.name] = { roles: inRoleOrder(g, [...acting.map((s) => s.actor), ...byRule]).map(titleFor) };
  }

  return {
    operations: operations.map((name) => ({ name, label: name })),
    roles: roles.map((r) => ({ name: r.name, label: titleFor(r.name) })),
    resources: resources.map((r) => ({ name: r.name, label: titleFor(r.name) })),
    whoMay,
    stalls,
    touches,
    defaults: {
      operation: pickDefault(operations, (op) => allowCount[op]),
      role: pickDefault(
        roles.map((r) => r.name),
        (name) => stalls[name].steps.length
      ),
      resource: pickDefault(
        resources.map((r) => r.name),
        (name) => stepCount[name]
      ),
    },
  };
}
