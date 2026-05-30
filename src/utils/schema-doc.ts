// Schema-doc helpers — extract documentation-friendly views from a JSON Schema
// (the kind of schemas published in @dna-codes/dna-schemas on npm).
//
// Each schema is JSON Schema Draft 2020-12 with rich `description` fields and
// `examples[]`. These helpers pull out the parts a docs page wants to render
// without each page reimplementing extraction.

export interface FieldRow {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface JsonSchemaProperty {
  type?: string | string[];
  const?: string | number | boolean;
  enum?: (string | number | boolean)[];
  $ref?: string;
  oneOf?: JsonSchemaProperty[];
  items?: JsonSchemaProperty;
  description?: string;
  default?: unknown;
  pattern?: string;
}

interface JsonSchema {
  title?: string;
  description?: string;
  required?: string[];
  properties?: Record<string, JsonSchemaProperty>;
  examples?: unknown[];
}

/**
 * Loose structural view of a primitive schema, for typing the arrays of
 * imported `*.json` schemas on the reference pages. Each schema file has a
 * different concrete shape, so a nominal `typeof oneSchema` annotation would
 * reject the others — this captures only the fields the docs read.
 */
export interface SchemaDoc {
  $id?: string;
  title?: string;
  description?: string;
  required?: string[];
  properties?: Record<string, unknown>;
  examples?: unknown[];
  stability?: unknown;
}

const refName = (ref: string): string => {
  const parts = ref.split('/');
  return parts[parts.length - 1];
};

const formatType = (prop: JsonSchemaProperty): string => {
  if (prop.const !== undefined) return JSON.stringify(prop.const);
  if (prop.enum) return prop.enum.map((v) => JSON.stringify(v)).join(' | ');
  if (prop.$ref) return refName(prop.$ref);
  if (prop.oneOf) return prop.oneOf.map((p) => formatType(p)).join(' | ');
  if (prop.type === 'array') {
    const inner = prop.items ? formatType(prop.items) : 'any';
    return `${inner}[]`;
  }
  if (Array.isArray(prop.type)) return prop.type.join(' | ');
  if (prop.type) return prop.type;
  return 'any';
};

/**
 * Extract the docs-friendly field list from a JSON Schema's `properties`.
 * Skips the internal `type` discriminator field.
 */
export function extractFields(schema: JsonSchema): FieldRow[] {
  const required = new Set(schema.required ?? []);
  const props = schema.properties ?? {};
  return Object.entries(props)
    .filter(([name]) => name !== 'type')
    .map(([name, def]) => ({
      name,
      type: formatType(def),
      required: required.has(name),
      description: def.description ?? '',
    }));
}

/**
 * Split a multi-paragraph schema description into paragraphs.
 * The first paragraph reads as a punchy lead; subsequent ones add context.
 */
export function splitDescription(description: string | undefined): string[] {
  if (!description) return [];
  return description
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Slugify a primitive name to a stable anchor id (e.g. "Person" -> "person").
 */
export function slugify(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Pick the first example from a schema's `examples[]`, formatted as a JSON string.
 */
export function firstExample(schema: JsonSchema): string | null {
  if (!schema.examples || schema.examples.length === 0) return null;
  return JSON.stringify(schema.examples[0], null, 2);
}

// ---------------------------------------------------------------------------
// Stability
//
// Every primitive carries a maturity signal — experimental, beta, or stable —
// surfaced as a pill on the reference pages. The canonical source is a
// top-level `stability` field on each schema, shipping to
// @dna-codes/dna-schemas soon. Until then we read from an interim curated
// stub keyed by the schema `$id` path. As soon as a schema declares its own
// `stability`, that live value wins over the stub (see getStability).
// ---------------------------------------------------------------------------

export type Stability = 'experimental' | 'beta' | 'stable';

/** Least → most mature. Useful for sorting or "at least beta" comparisons. */
export const STABILITY_ORDER: Stability[] = ['experimental', 'beta', 'stable'];

const STABILITY_DEFAULT: Stability = 'experimental';

const isStability = (v: unknown): v is Stability => v === 'experimental' || v === 'beta' || v === 'stable';

/** Strip the registry prefix from a schema `$id` → e.g. "operational/person". */
const idPath = (id: string | undefined): string =>
  (id ?? '').replace(/^https?:\/\/[^/]+\/schemas\//, '').replace(/\.json$/, '');

/**
 * Interim stability ratings keyed by `$id` path. This is a stub standing in
 * for the per-schema `stability` field until it ships to npm — once a schema
 * declares its own value, getStability() prefers that over this map.
 */
const STABILITY_STUB: Record<string, Stability> = {
  // Operational — the oldest, most exercised layer.
  'operational/person': 'stable',
  'operational/role': 'stable',
  'operational/group': 'stable',
  'operational/membership': 'beta',
  'operational/resource': 'stable',
  'operational/attribute': 'stable',
  'operational/relationship': 'beta',
  'operational/domain': 'stable',
  'operational/operation': 'stable',
  'operational/action': 'stable',
  'operational/process': 'beta',
  'operational/task': 'beta',
  'operational/trigger': 'experimental',
  'operational/rule': 'experimental',
  // Product — actively stabilizing.
  'product/core/resource': 'beta',
  'product/core/action': 'beta',
  'product/core/operation': 'beta',
  'product/core/field': 'beta',
  'product/api/endpoint': 'beta',
  'product/api/namespace': 'beta',
  'product/api/param': 'beta',
  'product/api/schema': 'beta',
  'product/web/layout': 'experimental',
  'product/web/page': 'experimental',
  'product/web/route': 'experimental',
  'product/web/block': 'experimental',
  // Technical — newest, still moving.
  'technical/cell': 'beta',
  'technical/construct': 'experimental',
  'technical/connection': 'experimental',
  'technical/environment': 'beta',
  'technical/node': 'experimental',
  'technical/zone': 'experimental',
  'technical/provider': 'experimental',
  'technical/variable': 'experimental',
  'technical/output': 'experimental',
  'technical/view': 'experimental',
};

interface StabilitySchema {
  $id?: string;
  stability?: unknown;
  'x-stability'?: unknown;
}

/**
 * Resolve a primitive's stability. Precedence:
 *   1. the schema's own `stability` (or `x-stability`) field — the live source,
 *   2. the interim curated stub keyed by `$id` path,
 *   3. a conservative `experimental` default.
 */
export function getStability(schema: StabilitySchema): Stability {
  const declared = schema.stability ?? schema['x-stability'];
  if (isStability(declared)) return declared;
  const stub = STABILITY_STUB[idPath(schema.$id)];
  if (stub) return stub;
  return STABILITY_DEFAULT;
}
