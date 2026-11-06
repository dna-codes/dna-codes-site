// Locates the core structure/v1 and behaviour/v1 schemas the Operational reference
// is generated from. Never falls through to the legacy operational/ Person/Resource
// tree in @dna-codes/dna-schemas (genomes still read that package on their own).
//
// Order:
//   1. DNA_CORE_SCHEMAS, when set (must be a core tree, or resolution fails)
//   2. A published package that actually ships definitions/structure
//   3. A sibling dna-codes-platform checkout
//   4. vendor/core-schemas, the snapshot committed so a clean CI checkout can build

import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

const MARKER = path.join('definitions', 'structure', 'domain', 'v1', 'schema.json');

export function isCoreSchemasRoot(dir: string): boolean {
  return existsSync(path.join(dir, MARKER));
}

export function resolveCoreSchemasRoot(fromDir = process.cwd()): string {
  const siteRoot = path.resolve(fromDir);

  if (process.env.DNA_CORE_SCHEMAS) {
    const configured = path.resolve(process.env.DNA_CORE_SCHEMAS);
    if (isCoreSchemasRoot(configured)) return configured;
    throw new Error(
      `DNA_CORE_SCHEMAS=${configured} is not a core schemas tree (missing ${MARKER}). ` +
        'Refusing to document the legacy operational/ Person/Resource schemas.'
    );
  }

  const published = path.join(siteRoot, 'node_modules', '@dna-codes', 'dna-schemas');
  if (isCoreSchemasRoot(published)) return published;

  const siblings = [
    path.resolve(siteRoot, '..', 'dna-codes-platform', 'packages', 'schemas'),
    path.resolve(siteRoot, '..', '..', 'dna-codes-platform', 'packages', 'schemas'),
    path.resolve(siteRoot, '..', '..', '..', 'dna-codes-platform', 'packages', 'schemas'),
    path.join(homedir(), 'Apps', 'dna-codes', 'dna-codes-platform', 'packages', 'schemas'),
  ];
  for (const dir of siblings) {
    if (isCoreSchemasRoot(dir)) return dir;
  }

  const vendor = path.join(siteRoot, 'vendor', 'core-schemas');
  if (isCoreSchemasRoot(vendor)) return vendor;

  throw new Error(
    'Core structure and behaviour schemas were not found. Set DNA_CORE_SCHEMAS to a platform ' +
      'packages/schemas tree, publish definitions/structure in the schema package, or keep ' +
      'vendor/core-schemas. Refusing to document the legacy operational/ Person/Resource schemas.'
  );
}
