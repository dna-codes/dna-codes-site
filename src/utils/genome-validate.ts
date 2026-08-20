// Genome validation — the gate that makes the /whats-your-dna page's claim checkable.
//
// Four passes, in the order a failure is most useful to read:
//
//   1. Schema     — every compiled document validated against @dna-codes/dna-schemas with Ajv.
//                   This is the pass that matters: if it goes green, the artifacts on the
//                   landing page really did come out of documents our own published schemas
//                   accept.
//   2. Integrity  — cross-references the schemas cannot express. A task's actor must be a
//                   declared Role; a route's page must exist; a connection's endpoints must be
//                   cells. JSON Schema validates shape, not whether a name points anywhere.
//   3. Minimums   — the ontology bar from design D4. Keeps "strong ontology foundation" from
//                   degrading into four resources and a stub process on the fifth industry
//                   nobody had time for.
//   4. Derivation — every one of the twelve outputs derives and renders for every genome.
//                   Catches the empty card a spot-check misses and a visitor does not.
//   5. Distinctness — no domain noun may appear in three or more genomes, and every genome must
//                   name the published vocabularies it draws on. This is the pass that keeps
//                   "specific to the industry" true a year from now: the cheapest way to add a
//                   seventh genome is to copy the sixth, and this fails the build when someone
//                   does. CRUD verbs are exempt — `List` is not a domain noun.
//
// Run by scripts/validate-genomes.mjs, which is wired into `npm run build`.

import { compileGenome } from '~/utils/genome-compile';
import { GENOME_SOURCES } from '~/data/genome';
import { DERIVATIONS } from '~/utils/genome';
import { renderArtifact } from '~/utils/genome-render';
import type { OutputId } from '~/data/industries';
import type { AuthoredGenome, CompiledGenome } from '~/utils/genome-types';

export interface GenomeIssue {
  genome: string;
  pass: 'schema' | 'integrity' | 'minimums' | 'derivation' | 'distinctness';
  where: string;
  message: string;
}

interface AjvLike {
  addSchema(s: object): void;
  compile(s: object): (data: unknown) => boolean;
  errorsText?(errors: unknown, opts?: object): string;
}

/** The document schemas each compiled layer is checked against, by `$id`. */
const DOC_SCHEMA_IDS = {
  operational: 'https://dna.codes/schemas/operational',
  productCore: 'https://dna.codes/schemas/product/core',
  productApi: 'https://dna.codes/schemas/product/api',
  productUi: 'https://dna.codes/schemas/product/ui',
  technical: 'https://dna.codes/schemas/technical',
};

function schemaPass(ajv: AjvLike, schemasById: Map<string, object>, name: string, c: CompiledGenome): GenomeIssue[] {
  const issues: GenomeIssue[] = [];
  const docs: [string, string, unknown][] = [
    ['operational', DOC_SCHEMA_IDS.operational, c.operational],
    ['product.core', DOC_SCHEMA_IDS.productCore, c.product.core],
    ['product.api', DOC_SCHEMA_IDS.productApi, c.product.api],
    ['product.ui', DOC_SCHEMA_IDS.productUi, c.product.ui],
    ['technical', DOC_SCHEMA_IDS.technical, c.technical],
  ];

  for (const [label, id, doc] of docs) {
    const schema = schemasById.get(id);
    if (!schema) {
      issues.push({ genome: name, pass: 'schema', where: label, message: `no published schema found for ${id}` });
      continue;
    }
    let validate: (d: unknown) => boolean;
    try {
      validate = ajv.compile(schema);
    } catch (e) {
      issues.push({ genome: name, pass: 'schema', where: label, message: `schema failed to compile: ${String(e)}` });
      continue;
    }
    if (!validate(doc)) {
      const errs = (validate as unknown as { errors?: unknown[] }).errors ?? [];
      for (const err of errs.slice(0, 12)) {
        const e = err as { instancePath?: string; message?: string; params?: Record<string, unknown> };
        const params = e.params ? ` ${JSON.stringify(e.params)}` : '';
        issues.push({
          genome: name,
          pass: 'schema',
          where: `${label}${e.instancePath ?? ''}`,
          message: `${e.message ?? 'invalid'}${params}`,
        });
      }
    }
  }
  return issues;
}

function integrityPass(name: string, a: AuthoredGenome, c: CompiledGenome): GenomeIssue[] {
  const issues: GenomeIssue[] = [];
  const fail = (where: string, message: string) => issues.push({ genome: name, pass: 'integrity', where, message });

  const roleNames = new Set(a.roles.map((r) => r.name));
  const personNames = new Set(a.persons.map((p) => p.name));
  const groupNames = new Set(a.groups.map((g) => g.name));
  const resourceNames = new Set(a.resources.map((r) => r.name));
  const operationNames = new Set(a.operations.map((o) => `${o.target}.${o.action}`));

  for (const r of a.roles) {
    if (r.parent && !roleNames.has(r.parent)) fail(`role ${r.name}`, `parent role "${r.parent}" is not declared`);
  }
  for (const o of a.operations) {
    if (!resourceNames.has(o.target) && !personNames.has(o.target) && !roleNames.has(o.target)) {
      fail(`operation ${o.target}.${o.action}`, `target "${o.target}" is not a declared noun`);
    }
  }
  for (const m of a.memberships) {
    if (!personNames.has(m.person)) fail(`membership ${m.name}`, `person "${m.person}" is not declared`);
    if (!roleNames.has(m.role)) fail(`membership ${m.name}`, `role "${m.role}" is not declared`);
    if (m.group && !groupNames.has(m.group)) fail(`membership ${m.name}`, `group "${m.group}" is not declared`);
  }
  if (!roleNames.has(a.process.operator)) {
    fail(`process ${a.process.name}`, `operator "${a.process.operator}" is not a declared role`);
  }
  const stepIds = new Set<string>();
  for (const s of a.process.steps) {
    if (stepIds.has(s.id)) fail(`step ${s.id}`, 'duplicate step id');
    stepIds.add(s.id);
    if (!roleNames.has(s.actor)) fail(`step ${s.id}`, `actor "${s.actor}" is not a declared role`);
    if (!operationNames.has(s.operation)) fail(`step ${s.id}`, `operation "${s.operation}" is not declared`);
    for (const role of s.consulted ?? []) {
      if (!roleNames.has(role)) fail(`step ${s.id}`, `consulted role "${role}" is not declared`);
    }
  }
  for (const r of a.rules) {
    if (!operationNames.has(r.operation)) fail(`rule ${r.name}`, `operation "${r.operation}" is not declared`);
    for (const allow of r.allow ?? []) {
      if (!roleNames.has(allow.role)) fail(`rule ${r.name}`, `allow role "${allow.role}" is not declared`);
    }
  }
  for (const t of a.triggers) {
    if (t.operation && !operationNames.has(t.operation)) fail('trigger', `operation "${t.operation}" is not declared`);
    if (t.process && t.process !== a.process.name) fail('trigger', `process "${t.process}" is not declared`);
  }

  // Product layer
  const productResourceNames = new Set(a.product.resources.map((r) => r.name));
  const pageNames = new Set(a.product.pages.map((p) => p.name));
  for (const r of a.product.resources) {
    if (r.resource && !resourceNames.has(r.resource)) {
      fail(`product resource ${r.name}`, `projects "${r.resource}", which is not a declared operational resource`);
    }
    for (const f of r.fields) {
      if (f.type === 'enum' && !f.values?.length) fail(`product field ${r.name}.${f.name}`, 'enum field has no values');
    }
    const fieldNames = new Set(r.fields.map((f) => f.name));
    for (const [i, row] of (r.samples ?? []).entries()) {
      for (const k of Object.keys(row)) {
        if (!fieldNames.has(k)) fail(`product resource ${r.name} sample ${i}`, `column "${k}" is not a declared field`);
      }
    }
  }
  for (const e of a.product.endpoints) {
    if (!operationNames.has(e.operation))
      fail(`endpoint ${e.method} ${e.path}`, `operation "${e.operation}" is not declared`);
  }
  for (const p of a.product.pages) {
    if (!productResourceNames.has(p.resource)) fail(`page ${p.name}`, `resource "${p.resource}" is not declared`);
    for (const b of p.blocks ?? []) {
      if (b.operation && !operationNames.has(b.operation)) {
        fail(`page ${p.name} block ${b.name}`, `operation "${b.operation}" is not declared`);
      }
    }
  }
  for (const r of a.product.routes) {
    if (!pageNames.has(r.page)) fail(`route ${r.path}`, `page "${r.page}" is not declared`);
  }

  // Technical layer
  const cellNames = new Set(a.technical.cells.map((c2) => c2.name));
  const providerNames = new Set(a.technical.providers.map((p) => p.name));
  const envNames = new Set<string>(a.technical.environments.map((e) => e.name));
  for (const c2 of a.technical.cells) {
    if (c2.environment && !envNames.has(c2.environment)) {
      fail(`cell ${c2.name}`, `environment "${c2.environment}" is not declared`);
    }
  }
  for (const conn of a.technical.connections) {
    if (!cellNames.has(conn.source)) fail('connection', `source cell "${conn.source}" is not declared`);
    if (!cellNames.has(conn.target)) fail('connection', `target cell "${conn.target}" is not declared`);
  }
  for (const e of a.technical.environments) {
    for (const p of e.providers ?? []) {
      if (!providerNames.has(p)) fail(`environment ${e.name}`, `provider "${p}" is not declared`);
    }
  }

  // The compiler must not silently drop anything.
  if ((c.operational.tasks?.length ?? 0) !== a.process.steps.length) {
    fail('compiler', 'compiled task count does not match authored step count');
  }

  return issues;
}

function minimumsPass(name: string, a: AuthoredGenome): GenomeIssue[] {
  const issues: GenomeIssue[] = [];
  const need = (ok: boolean, where: string, message: string) => {
    if (!ok) issues.push({ genome: name, pass: 'minimums', where, message });
  };

  need(a.roles.length >= 4, 'roles', `needs at least 4 roles, has ${a.roles.length}`);
  need(
    a.roles.some((r) => !!r.parent),
    'roles',
    'needs at least one role nested under another, so a reporting hierarchy exists'
  );
  need(a.groups.length >= 1, 'groups', 'needs at least 1 group');
  need(a.persons.length >= 2, 'persons', `needs at least 2 person templates, has ${a.persons.length}`);
  need(a.memberships.length >= 3, 'memberships', `needs at least 3 memberships, has ${a.memberships.length}`);
  need(a.resources.length >= 4, 'resources', `needs at least 4 resources, has ${a.resources.length}`);
  need(
    a.resources.filter((r) => (r.attributes?.length ?? 0) > 0).length >= 4,
    'resources',
    'needs at least 4 resources carrying attributes'
  );
  need(a.operations.length >= 6, 'operations', `needs at least 6 operations, has ${a.operations.length}`);
  need(a.process.steps.length >= 5, 'process', `needs at least 5 steps, has ${a.process.steps.length}`);
  need(a.rules.length >= 3, 'rules', `needs at least 3 rules, has ${a.rules.length}`);
  need(a.triggers.length >= 1, 'triggers', 'needs at least 1 trigger');

  need(a.product.resources.length >= 4, 'product.resources', `needs at least 4, has ${a.product.resources.length}`);
  for (const r of a.product.resources) {
    need(r.fields.length >= 3, `product.resources.${r.name}`, `needs at least 3 fields, has ${r.fields.length}`);
  }
  need(a.product.endpoints.length >= 4, 'product.endpoints', `needs at least 4, has ${a.product.endpoints.length}`);
  need(a.product.pages.length >= 3, 'product.pages', `needs at least 3, has ${a.product.pages.length}`);
  need(a.product.routes.length >= a.product.pages.length, 'product.routes', 'every page needs a route to reach it');
  need(a.technical.cells.length >= 4, 'technical.cells', `needs at least 4, has ${a.technical.cells.length}`);
  need(a.technical.connections.length >= 1, 'technical.connections', 'needs connections between cells');
  need(a.technical.environments.length >= 2, 'technical.environments', 'needs at least 2 environments');
  need(a.technical.providers.length >= 1, 'technical.providers', 'needs at least 1 provider');

  // At least one page has to cover each of list, detail, and action, or the Screen map and
  // Example UI outputs have nothing to show.
  const blockTypes = new Set(a.product.pages.flatMap((p) => (p.blocks ?? []).map((b) => b.type)));
  need(blockTypes.has('table'), 'product.pages', 'needs a page with a table block (the list view)');
  need(blockTypes.has('form'), 'product.pages', 'needs a page with a form block (the detail view)');
  need(blockTypes.has('actions'), 'product.pages', 'needs a page with an actions block');

  return issues;
}

/**
 * Every output derives, and derives to something. This is what stops the page from shipping a
 * card that renders as an empty box for one industry because its genome happened to be missing
 * the piece that output reads — the failure mode a spot-check misses and a visitor does not.
 *
 * Twelve outputs × every genome, checked on every build.
 */
function derivationPass(name: string, c: CompiledGenome): GenomeIssue[] {
  const issues: GenomeIssue[] = [];
  for (const [output, derive] of Object.entries(DERIVATIONS)) {
    let vm: unknown;
    try {
      vm = derive(c);
    } catch (e) {
      issues.push({ genome: name, pass: 'derivation', where: output, message: `threw: ${String(e)}` });
      continue;
    }
    if (!vm || typeof vm !== 'object') {
      issues.push({ genome: name, pass: 'derivation', where: output, message: 'produced no view-model' });
      continue;
    }
    // Every one of these view-models is a set of lists. If they are all empty, the artifact is
    // an empty box no matter how well it renders.
    const lists = Object.values(vm as Record<string, unknown>).filter(Array.isArray);
    if (lists.length && lists.every((l) => (l as unknown[]).length === 0)) {
      issues.push({ genome: name, pass: 'derivation', where: output, message: 'every collection is empty' });
    }

    let html: string;
    try {
      html = renderArtifact(output as OutputId, vm);
    } catch (e) {
      issues.push({ genome: name, pass: 'derivation', where: output, message: `renderer threw: ${String(e)}` });
      continue;
    }
    if (html.trim().length < 40) {
      issues.push({ genome: name, pass: 'derivation', where: output, message: 'renderer produced no markup' });
    }
  }
  return issues;
}

/** Verbs that carry no industry meaning, so sharing them across genomes proves nothing. */
const GENERIC_ACTIONS = new Set(['List', 'Read', 'Create', 'Update', 'Delete', 'Approve', 'Close', 'Submit']);

/**
 * Cross-genome distinctness. Runs once over the whole corpus rather than per genome, because the
 * thing it is checking is a relationship between genomes: a noun that shows up in half of them
 * is a noun nobody in any of those industries actually says.
 */
function distinctnessPass(genomes: AuthoredGenome[]): GenomeIssue[] {
  const issues: GenomeIssue[] = [];
  const seen = new Map<string, string[]>();
  const note = (kind: string, name: string, key: string) => {
    const k = `${kind}:${name}`;
    seen.set(k, [...(seen.get(k) ?? []), key]);
  };

  for (const g of genomes) {
    if ((g.ontologies?.length ?? 0) < 2) {
      issues.push({
        genome: g.key,
        pass: 'distinctness',
        where: 'ontologies',
        message: `needs at least 2 published vocabularies, has ${g.ontologies?.length ?? 0}`,
      });
    }
    for (const o of g.ontologies ?? []) {
      if (!o.name?.trim() || !o.note?.trim()) {
        issues.push({
          genome: g.key,
          pass: 'distinctness',
          where: 'ontologies',
          message: 'an entry is missing a name or note',
        });
      }
    }

    g.resources.forEach((r) => note('resource', r.name, g.key));
    g.roles.forEach((r) => note('role', r.name, g.key));
    g.persons.forEach((r) => note('person', r.name, g.key));
    g.groups.forEach((r) => note('group', r.name, g.key));
    g.process.steps.forEach((st) => note('step', st.id, g.key));
    g.rules.forEach((r) => note('rule', r.name, g.key));
    g.technical.cells.forEach((c) => note('cell', c.name, g.key));
    g.technical.providers.forEach((pr) => note('provider', pr.name, g.key));
    g.product.pages.forEach((pg) => note('page', pg.name, g.key));
    for (const o of g.operations) {
      if (!GENERIC_ACTIONS.has(o.action)) note('action', o.action, g.key);
    }
  }

  for (const [k, keys] of seen) {
    if (keys.length < 3) continue;
    const [kind, name] = k.split(':');
    issues.push({
      genome: keys.join(' + '),
      pass: 'distinctness',
      where: `${kind} ${name}`,
      message: `shared by ${keys.length} genomes — too generic to be anyone's industry vocabulary`,
    });
  }
  return issues;
}

/**
 * Compile and check every genome. `schemas` is every schema document published by
 * @dna-codes/dna-schemas; the runner reads them off disk and hands them in, so this module
 * stays free of filesystem access and can run anywhere.
 */
export function validateGenomes(ajv: AjvLike, schemas: object[]): GenomeIssue[] {
  const schemasById = new Map<string, object>();
  for (const s of schemas) {
    const id = (s as { $id?: string }).$id;
    if (!id) continue;
    schemasById.set(id, s);
    try {
      ajv.addSchema(s);
    } catch {
      // Already registered — harmless, the map above is the lookup that matters.
    }
  }

  const issues: GenomeIssue[] = [];
  for (const authored of GENOME_SOURCES) {
    const name = authored.key;
    let compiled: CompiledGenome;
    try {
      compiled = compileGenome(authored);
    } catch (e) {
      issues.push({ genome: name, pass: 'schema', where: 'compile', message: `compiler threw: ${String(e)}` });
      continue;
    }

    // Determinism: the same source must compile to the same bytes twice.
    if (JSON.stringify(compiled) !== JSON.stringify(compileGenome(authored))) {
      issues.push({ genome: name, pass: 'schema', where: 'compile', message: 'compilation is not deterministic' });
    }

    issues.push(...schemaPass(ajv, schemasById, name, compiled));
    issues.push(...integrityPass(name, authored, compiled));
    issues.push(...minimumsPass(name, authored));
    issues.push(...derivationPass(name, compiled));
  }
  issues.push(...distinctnessPass(GENOME_SOURCES));
  return issues;
}
