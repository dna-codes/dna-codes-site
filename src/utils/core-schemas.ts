// Discovers Operational DNA (structure/v1 + behaviour/v1) from the core schema
// tree. A new definition under definitions/{structure,behaviour}/*/v1 appears
// on the next build without a hand-maintained import.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { requireStability, type SchemaDoc, type Stability } from './schema-doc.ts';
import { resolveCoreSchemasRoot } from './resolve-core-schemas.ts';

export type Vocabulary = 'structure' | 'behaviour';

export interface DocumentedPrimitive {
  name: string;
  schema: SchemaDoc;
  stability: Stability;
  example: string | null;
  exampleSource: string | null;
}

export interface DocumentedGroup {
  label: 'Structure' | 'Behaviour';
  description: string;
  primitives: DocumentedPrimitive[];
}

export interface CorpusExcerpt {
  source: string;
  json: string;
}

interface StabilityLedger {
  definitions?: Record<string, { status?: unknown }>;
}

const PREFERRED_ORDER: Record<Vocabulary, string[]> = {
  structure: ['domain', 'entity', 'attribute', 'relationship'],
  behaviour: ['behaviour', 'action', 'operation', 'workflow', 'condition', 'policy'],
};

const GROUP_COPY: Record<Vocabulary, { label: DocumentedGroup['label']; description: string }> = {
  structure: {
    label: 'Structure',
    description:
      'What the organization is: vocabularies, the kinds of things in them, the facts those things hold, and the edges between them.',
  },
  behaviour: {
    label: 'Behaviour',
    description:
      'What the organization does with that structure: actions, who performs them, the workflows that sequence them, and the policies that decide them.',
  },
};

const readJson = (file: string): unknown => JSON.parse(readFileSync(file, 'utf8')) as unknown;

const sortNames = (vocabulary: Vocabulary, names: string[]): string[] => {
  const preferred = PREFERRED_ORDER[vocabulary];
  return [...names].sort((a, b) => {
    const ia = preferred.indexOf(a);
    const ib = preferred.indexOf(b);
    const ra = ia === -1 ? preferred.length : ia;
    const rb = ib === -1 ? preferred.length : ib;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });
};

const discoverNames = (root: string, vocabulary: Vocabulary): string[] => {
  const dir = path.join(root, 'definitions', vocabulary);
  if (!existsSync(dir)) {
    throw new Error(`Core schemas at ${root} have no definitions/${vocabulary}.`);
  }
  const names = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  for (const name of names) {
    const schemaPath = path.join(dir, name, 'v1', 'schema.json');
    if (!existsSync(schemaPath)) {
      throw new Error(`${vocabulary}/${name} has no v1/schema.json under ${root}.`);
    }
  }
  return sortNames(vocabulary, names);
};

const smallestExample = (dir: string): string | null => {
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort();
  if (files.length === 0) return null;
  let best = files[0];
  let bestSize = readFileSync(path.join(dir, best)).length;
  for (const name of files.slice(1)) {
    const size = readFileSync(path.join(dir, name)).length;
    if (size < bestSize) {
      best = name;
      bestSize = size;
    }
  }
  return path.join(dir, best);
};

const shrinkValue = (value: unknown): unknown => {
  const text = JSON.stringify(value);
  if (text.length <= 1800 || !value || typeof value !== 'object' || Array.isArray(value)) return value;
  const obj = value as Record<string, unknown>;
  const brief: Record<string, unknown> = {};
  for (const key of ['dna', 'id', 'name', 'description', 'domain', 'entity', 'type']) {
    if (obj[key] !== undefined) brief[key] = obj[key];
  }
  return Object.keys(brief).length > 0 ? brief : value;
};

/** A short, still-JSON slice of a corpus document: identity fields plus one collection. */
export function excerptDocument(doc: unknown): unknown {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return doc;
  const source = doc as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of ['dna', 'id', 'name', 'description', 'domain', 'uses']) {
    if (source[key] !== undefined) out[key] = source[key];
  }
  for (const key of ['entities', 'relationships', 'actions', 'operations', 'workflows', 'policies']) {
    const value = source[key];
    if (Array.isArray(value) && value.length > 0) {
      out[key] = [shrinkValue(value[0])];
      break;
    }
  }
  return Object.keys(out).length > 0 ? out : source;
}

const corpusExample = (
  root: string,
  vocabulary: Vocabulary,
  name: string
): { example: string | null; exampleSource: string | null } => {
  const file = smallestExample(path.join(root, 'examples', vocabulary, name));
  if (!file) return { example: null, exampleSource: null };
  const relative = path.relative(root, file).split(path.sep).join('/');
  const json = JSON.stringify(excerptDocument(readJson(file)), null, 2);
  return { example: json, exampleSource: relative };
};

const loadVocabulary = (root: string, vocabulary: Vocabulary): DocumentedPrimitive[] => {
  const ledger = readJson(path.join(root, 'stability', `${vocabulary}.json`)) as StabilityLedger;
  return discoverNames(root, vocabulary).map((name) => {
    const schemaPath = path.join(root, 'definitions', vocabulary, name, 'v1', 'schema.json');
    const parsed = readJson(schemaPath) as SchemaDoc;
    const status = ledger.definitions?.[name]?.status;
    const stability = requireStability(status, `${vocabulary}/${name}`);
    const { example, exampleSource } = corpusExample(root, vocabulary, name);
    return {
      name,
      schema: { ...parsed, stability },
      stability,
      example,
      exampleSource,
    };
  });
};

export function loadOperationalGroups(fromDir = process.cwd()): DocumentedGroup[] {
  const root = resolveCoreSchemasRoot(fromDir);
  return (['structure', 'behaviour'] as const).map((vocabulary) => ({
    ...GROUP_COPY[vocabulary],
    primitives: loadVocabulary(root, vocabulary),
  }));
}

export function latestCorpusVersion(root: string, domain: string): string {
  const dir = path.join(root, 'examples', domain);
  if (!existsSync(dir)) throw new Error(`Reference domain not found: examples/${domain} under ${root}.`);
  const versions = readdirSync(dir)
    .filter((name) => /^v\d+$/.test(name))
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  const latest = versions[versions.length - 1];
  if (!latest) throw new Error(`examples/${domain} has no vN folder under ${root}.`);
  return latest;
}

export function loadCorpusExcerpt(root: string, relativePath: string): CorpusExcerpt {
  const file = path.join(root, relativePath);
  if (!existsSync(file)) {
    throw new Error(`Reference-domain excerpt not found: ${relativePath} under ${root}.`);
  }
  return {
    source: relativePath,
    json: JSON.stringify(excerptDocument(readJson(file)), null, 2),
  };
}

export function coreSchemasRoot(fromDir = process.cwd()): string {
  return resolveCoreSchemasRoot(fromDir);
}
