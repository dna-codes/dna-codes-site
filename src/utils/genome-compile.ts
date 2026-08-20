// The compiler: authored genome → canonical DNA documents.
//
// This is the module that makes the landing page's claim true. A genome is authored as an
// outline; what the renderers read — and what the build validates against the published
// schemas — is the canonical DNA that comes out of here.
//
// Two properties matter and both are tested by scripts/validate-genomes.mjs:
//
//   Deterministic — ids are hashed from (genome key, primitive type, name), never generated.
//                   Compiling twice produces byte-identical output, so a genome edit shows up
//                   in a diff as the edit and nothing else.
//   Total         — everything the schemas require is filled in here. An author never writes a
//                   UUID or a version string, which is the whole reason the format is small
//                   enough for a seventh industry to be an hour's work.

import versions from '~schemas/operational/versions.json';
import type {
  AuthoredGenome,
  AuthoredNoun,
  CompiledGenome,
  DnaMembership,
  DnaNoun,
  DnaOperation,
  DnaProcess,
  DnaRule,
  DnaStep,
  DnaTask,
  DnaTrigger,
  OperationalDna,
  ProductDna,
  TechnicalDna,
} from '~/utils/genome-types';

const VERSIONS = versions as Record<string, string>;

const versionFor = (type: string): string => VERSIONS[type] ?? '1';

// --- Deterministic identity -------------------------------------------------

/**
 * A UUID-shaped, stable identifier derived from a seed string.
 *
 * Not a real UUIDv5 — there is no MD5/SHA here and none is warranted, because these ids
 * identify sample primitives on a marketing page, not records in anyone's database. What they
 * must be is *stable*: the same seed yields the same id on every machine and every build, so
 * compiled output is reproducible and a genome diff stays readable. The version and variant
 * nibbles are set so the result satisfies the schemas' `format: uuid`.
 */
export function stableId(seed: string): string {
  // Four independently-seeded FNV-1a passes give 16 bytes with enough spread that collisions
  // across a few hundred primitives per genome are not a practical concern.
  const words: number[] = [];
  for (let pass = 0; pass < 4; pass++) {
    let h = 0x811c9dc5 ^ (pass * 0x9e3779b9);
    const input = `${pass}:${seed}`;
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    words.push(h >>> 0);
  }
  const hex = words.map((w) => w.toString(16).padStart(8, '0')).join('');
  const bytes = hex.slice(0, 32).split('');
  // Version 4 marker, and the RFC 4122 variant bits.
  bytes[12] = '4';
  bytes[16] = ((parseInt(bytes[16], 16) & 0x3) | 0x8).toString(16);
  const s = bytes.join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`;
}

const identity = (key: string, type: string, name: string) => ({
  id: stableId(`${key}:${type}:${name}`),
  type,
  name,
  version: versionFor(type),
});

// --- Helpers ----------------------------------------------------------------

/** `receive-order` → `Receive order`. Used wherever a kebab id has to face a human. */
export function humanize(id: string): string {
  const s = id.replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const dropUndefined = <T extends object>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;

function compileNoun(key: string, type: 'resource' | 'person' | 'role' | 'group', n: AuthoredNoun): DnaNoun {
  return dropUndefined({
    ...identity(key, type, n.name),
    description: n.description,
    parent: n.parent,
    attributes: n.attributes?.map((a) => dropUndefined({ ...a })),
    actions: n.actions?.map((a) => dropUndefined({ ...a })),
  }) as DnaNoun;
}

// --- Compile ----------------------------------------------------------------

export function compileGenome(g: AuthoredGenome): CompiledGenome {
  const key = g.key;

  const operations: DnaOperation[] = g.operations.map((o) =>
    dropUndefined({
      ...identity(key, 'operation', `${o.target}.${o.action}`),
      target: o.target,
      action: o.action,
      description: o.description,
    })
  ) as DnaOperation[];

  // One authored step becomes a Task and a Step. `depends_on` chains the steps in declared
  // order, which is what makes the process a readable line rather than an unordered bag.
  const tasks: DnaTask[] = g.process.steps.map((s) =>
    dropUndefined({
      ...identity(key, 'task', s.id),
      actor: s.actor,
      operation: s.operation,
      description: s.description,
    })
  ) as DnaTask[];

  const steps: DnaStep[] = g.process.steps.map((s, i) =>
    dropUndefined({
      id: s.id,
      task: s.id,
      description: s.description,
      depends_on: i === 0 ? undefined : [g.process.steps[i - 1].id],
    })
  ) as DnaStep[];

  const processes: DnaProcess[] = [
    dropUndefined({
      ...identity(key, 'process', g.process.name),
      description: g.process.description,
      operator: g.process.operator,
      startStep: g.process.steps[0]?.id,
      steps,
    }) as DnaProcess,
  ];

  const memberships: DnaMembership[] = g.memberships.map((m) =>
    dropUndefined({
      ...identity(key, 'membership', m.name),
      person: m.person,
      role: m.role,
      group: m.group,
      description: m.description,
    })
  ) as DnaMembership[];

  const rules: DnaRule[] = g.rules.map((r) =>
    dropUndefined({
      ...identity(key, 'rule', r.name),
      operation: r.operation,
      description: r.description,
      rule_type: r.ruleType,
      allow: r.allow?.map((a) => dropUndefined({ ...a })),
    })
  ) as DnaRule[];

  // Triggers have no required name in the schema but do carry the base contract, so they need
  // one anyway. Their identity is what they fire and from where.
  const triggers: DnaTrigger[] = g.triggers.map((t, i) =>
    dropUndefined({
      ...identity(key, 'trigger', `${t.process ?? t.operation ?? 'Trigger'}${t.source}${i}`),
      source: t.source,
      process: t.process,
      operation: t.operation,
      after: t.after,
      schedule: t.schedule,
      event: t.event,
      description: t.description,
    })
  ) as DnaTrigger[];

  const operational: OperationalDna = {
    domain: dropUndefined({
      name: g.domain,
      description: g.description,
      resources: g.resources.map((n) => compileNoun(key, 'resource', n)),
      persons: g.persons.map((n) => compileNoun(key, 'person', n)),
      roles: g.roles.map((n) => compileNoun(key, 'role', n)),
      groups: g.groups.map((n) => compileNoun(key, 'group', n)),
    }),
    memberships,
    operations,
    tasks,
    processes,
    rules,
    triggers,
  };

  // Product core is the materialized operational slice — the schema is explicit that it is
  // derived, never hand-authored, and that its resources are operational primitives flattened
  // out of the domain hierarchy. So it is built from what the operational compile already
  // produced rather than from anything an author wrote twice.
  const product: ProductDna = {
    core: {
      domain: dropUndefined({ name: g.domain, path: g.domainPath, description: g.description }),
      resources: operational.domain.resources ?? [],
      // The product-layer Operation names its subject `resource`, where the operational one
      // names it `target`. Same pair, different noun — projected here rather than asking an
      // author to write it twice.
      operations: g.operations.map((o) =>
        dropUndefined({
          name: `${o.target}.${o.action}`,
          resource: o.target,
          action: o.action,
          description: o.description,
        })
      ),
    },
    api: {
      namespace: dropUndefined({ ...g.product.namespace }),
      resources: g.product.resources.map((r) =>
        dropUndefined({
          name: r.name,
          description: r.description,
          resource: r.resource,
          fields: r.fields.map((f) => dropUndefined({ ...f })),
          actions: r.actions?.map((a) => dropUndefined({ ...a })),
        })
      ),
      endpoints: g.product.endpoints.map((e) => dropUndefined({ ...e })),
    },
    ui: {
      layout: g.product.layout ?? { name: 'AdminShell', type: 'sidebar' },
      pages: g.product.pages.map((p) =>
        dropUndefined({
          name: p.name,
          resource: p.resource,
          description: p.description,
          blocks: p.blocks?.map((b) => dropUndefined({ ...b })),
        })
      ),
      routes: g.product.routes.map((r) => dropUndefined({ ...r })),
    },
  };

  // An environment's `providers` is an array of full Provider objects in the schema, but an
  // author names them — the provider is already declared once at the top level and repeating it
  // per environment is exactly the kind of duplication the authored format exists to remove.
  const providers = g.technical.providers.map((p) => dropUndefined({ ...p }));
  const providerByName = new Map(providers.map((p) => [p.name, p]));

  const technical: TechnicalDna = {
    cells: g.technical.cells.map((c) => dropUndefined({ ...c })),
    connections: g.technical.connections.map((c) =>
      dropUndefined({
        id: stableId(`${key}:connection:${c.source}->${c.target}:${c.type}`),
        source: c.source,
        target: c.target,
        type: c.type,
        label: c.label,
      })
    ),
    environments: g.technical.environments.map((e) =>
      dropUndefined({
        name: e.name,
        description: e.description,
        providers: e.providers?.map((n) => providerByName.get(n)).filter(Boolean) as TechnicalDna['providers'],
      })
    ),
    providers,
  };

  const samples: CompiledGenome['samples'] = {};
  for (const r of g.product.resources) {
    if (r.samples?.length) samples[r.name] = r.samples;
  }

  const consulted: Record<string, string[]> = {};
  const stepTitles: Record<string, string> = {};
  for (const s of g.process.steps) {
    if (s.consulted?.length) consulted[s.id] = s.consulted;
    stepTitles[s.id] = s.title ?? humanize(s.id);
  }

  return {
    key,
    orgName: g.orgName,
    description: g.description,
    ontologies: g.ontologies,
    operational,
    product,
    technical,
    samples,
    consulted,
    stepTitles,
  };
}
