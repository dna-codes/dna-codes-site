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

export interface SchemaNode {
  type?: string | string[];
  const?: string | number | boolean;
  enum?: (string | number | boolean)[];
  $ref?: string;
  oneOf?: SchemaNode[];
  allOf?: SchemaNode[];
  items?: SchemaNode;
  description?: string;
  properties?: Record<string, SchemaNode>;
  required?: string[];
  $defs?: Record<string, SchemaNode>;
  examples?: unknown[];
  title?: string;
}

interface JsonSchema {
  title?: string;
  description?: string;
  required?: string[];
  properties?: Record<string, SchemaNode>;
  examples?: unknown[];
  $defs?: Record<string, SchemaNode>;
  oneOf?: SchemaNode[];
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

const titleFromRef = (ref: string): string => {
  const parts = ref.split('/').filter(Boolean);
  let name = parts[parts.length - 1] ?? 'any';
  if (/^v\d+$/.test(name) && parts.length >= 2) name = parts[parts.length - 2] ?? name;
  return name.slice(0, 1).toUpperCase() + name.slice(1);
};

const localDefName = (prop: SchemaNode): string | null => {
  if (typeof prop.$ref === 'string' && prop.$ref.startsWith('#/$defs/')) return prop.$ref.slice('#/$defs/'.length);
  return null;
};

/** Follow local `$ref` / `allOf` so a field's type and description survive `$defs`. */
export function deref(node: SchemaNode, root: SchemaNode, depth = 0): SchemaNode {
  if (!node || depth > 12) return node ?? {};
  if (typeof node.$ref === 'string' && node.$ref.startsWith('#/$defs/')) {
    const target = root.$defs?.[node.$ref.slice('#/$defs/'.length)];
    if (!target) return node;
    const overlay = { ...node };
    delete overlay.$ref;
    return deref({ ...deref(target, root, depth + 1), ...overlay }, root, depth + 1);
  }
  if (Array.isArray(node.allOf)) {
    let merged: SchemaNode = {};
    for (const part of node.allOf) merged = { ...merged, ...deref(part, root, depth + 1) };
    const overlay = { ...node };
    delete overlay.allOf;
    return deref({ ...merged, ...overlay }, root, depth + 1);
  }
  return node;
}

const formatType = (prop: SchemaNode, root: SchemaNode): string => {
  const resolved = deref(prop, root);
  if (resolved.const !== undefined) return JSON.stringify(resolved.const);
  if (resolved.enum) return resolved.enum.map((v) => JSON.stringify(v)).join(' | ');
  if (typeof resolved.$ref === 'string' && !resolved.$ref.startsWith('#')) return titleFromRef(resolved.$ref);
  if (resolved.oneOf) return resolved.oneOf.map((part) => formatType(part, root)).join(' | ');
  if (resolved.type === 'array') {
    const inner = resolved.items ? formatType(resolved.items, root) : 'any';
    return `${inner}[]`;
  }
  if (resolved.type === 'object' && localDefName(prop)) return localDefName(prop) as string;
  if (Array.isArray(resolved.type)) return resolved.type.join(' | ');
  if (resolved.type) return resolved.type;
  return 'any';
};

/** Legacy operational schemas used `type: { const: "person" }` as a discriminator, not a field. */
const isLegacyDiscriminator = (name: string, def: SchemaNode, root: SchemaNode): boolean => {
  if (name !== 'type') return false;
  const resolved = deref(def, root);
  return resolved.const !== undefined && !resolved.enum;
};

interface FieldSource {
  properties: Record<string, SchemaNode>;
  required: string[];
}

const fieldSources = (schema: SchemaNode): FieldSource[] => {
  if (schema.properties && Object.keys(schema.properties).length > 0) {
    return [{ properties: schema.properties, required: schema.required ?? [] }];
  }
  const sources: FieldSource[] = [];
  for (const branch of schema.oneOf ?? []) {
    const resolved = deref(branch, schema);
    if (resolved.properties && Object.keys(resolved.properties).length > 0) {
      sources.push({ properties: resolved.properties, required: resolved.required ?? [] });
    }
  }
  return sources;
};

/**
 * Extract the docs-friendly field list from a JSON Schema.
 * Local `$ref` / `$defs` / `allOf` are resolved. A `oneOf` grammar (Condition)
 * contributes the fields of each branch. A const `type` discriminator is skipped;
 * an enum `type` field, such as Attribute's, is kept.
 */
export function extractFields(schema: JsonSchema): FieldRow[] {
  const root = schema as SchemaNode;
  const sources = fieldSources(root);
  const names: string[] = [];
  const byName = new Map<string, { def: SchemaNode; requiredIn: number; presentIn: number }>();

  for (const source of sources) {
    for (const [name, def] of Object.entries(source.properties)) {
      if (isLegacyDiscriminator(name, def, root)) continue;
      const row = byName.get(name);
      if (!row) {
        names.push(name);
        byName.set(name, {
          def,
          presentIn: 1,
          requiredIn: source.required.includes(name) ? 1 : 0,
        });
        continue;
      }
      row.presentIn += 1;
      if (source.required.includes(name)) row.requiredIn += 1;
      if (!row.def.description && def.description) row.def = def;
    }
  }

  return names.map((name) => {
    const row = byName.get(name)!;
    const resolved = deref(row.def, root);
    return {
      name,
      type: formatType(row.def, root),
      required: row.presentIn > 0 && row.requiredIn === row.presentIn,
      description: row.def.description ?? resolved.description ?? '',
    };
  });
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
 * Slugify a primitive name to a stable anchor id (e.g. "Domain" -> "domain").
 */
export function slugify(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Heading id for a vocabulary group, distinct from a primitive that shares the name (Behaviour). */
export function vocabularyAnchor(label: string): string {
  return `${slugify(label)}-vocabulary`;
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
// Each primitive carries a maturity signal, surfaced as a pill on the
// reference pages. Operational DNA sets `stability` from
// `stability/{structure,behaviour}.json` before render. A schema that still
// declares its own `stability` is used when nothing was attached.
// ---------------------------------------------------------------------------

export type Stability = 'experimental' | 'beta' | 'stable' | 'deprecated';

/** Maturity ramp (then deprecated). Drives legend/display order. */
export const STABILITY_ORDER: Stability[] = ['experimental', 'beta', 'stable', 'deprecated'];

const STABILITY_DEFAULT: Stability = 'stable';

const isStability = (v: unknown): v is Stability =>
  v === 'experimental' || v === 'beta' || v === 'stable' || v === 'deprecated';

/**
 * Resolve a primitive's stability: the attached or declared value when it is
 * one of the known levels, otherwise `stable`.
 */
export function getStability(schema: { stability?: unknown }): Stability {
  return isStability(schema.stability) ? schema.stability : STABILITY_DEFAULT;
}

/** Ledger status for a discovered definition. Throws when the entry is missing or unknown. */
export function requireStability(value: unknown, label: string): Stability {
  if (isStability(value)) return value;
  throw new Error(`No usable stability for ${label} (got ${JSON.stringify(value)}).`);
}
