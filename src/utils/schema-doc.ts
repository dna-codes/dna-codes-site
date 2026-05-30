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
// Each primitive carries a maturity signal — surfaced as a pill on the
// reference pages. The source of truth is the optional top-level `stability`
// field defined in the schemas' base (enum: experimental | beta | stable |
// deprecated). When a schema declares it, we render that value; when it
// doesn't, the primitive is treated as `stable`.
// ---------------------------------------------------------------------------

export type Stability = 'experimental' | 'beta' | 'stable' | 'deprecated';

/** Maturity ramp (then deprecated). Drives legend/display order. */
export const STABILITY_ORDER: Stability[] = ['experimental', 'beta', 'stable', 'deprecated'];

const STABILITY_DEFAULT: Stability = 'stable';

const isStability = (v: unknown): v is Stability =>
  v === 'experimental' || v === 'beta' || v === 'stable' || v === 'deprecated';

/**
 * Resolve a primitive's stability: the schema's own `stability` field when it
 * declares one, otherwise `stable`.
 */
export function getStability(schema: { stability?: unknown }): Stability {
  return isStability(schema.stability) ? schema.stability : STABILITY_DEFAULT;
}
