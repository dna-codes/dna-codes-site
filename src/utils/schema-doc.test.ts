import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadOperationalGroups, latestCorpusVersion, loadCorpusExcerpt } from './core-schemas.ts';
import { isCoreSchemasRoot, resolveCoreSchemasRoot } from './resolve-core-schemas.ts';
import { extractFields } from './schema-doc.ts';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const vendor = path.join(siteRoot, 'vendor', 'core-schemas');
const sibling = path.join(process.env.HOME ?? '', 'Apps', 'dna-codes', 'dna-codes-platform', 'packages', 'schemas');

const readSchema = (root: string, vocabulary: string, name: string) =>
  JSON.parse(readFileSync(path.join(root, 'definitions', vocabulary, name, 'v1', 'schema.json'), 'utf8'));

const field = (rows: { name: string }[], name: string) => {
  const row = rows.find((candidate) => candidate.name === name);
  assert.ok(row, `missing field ${name}`);
  return row as { name: string; type: string; required: boolean; description: string };
};

test('vendor snapshot is a core schema tree, not the legacy operational package', () => {
  assert.equal(isCoreSchemasRoot(vendor), true);
  assert.equal(existsSync(path.join(vendor, 'operational', 'person.json')), false);
});

test('resolver prefers a sibling platform tree and refuses a bad DNA_CORE_SCHEMAS', () => {
  const previous = process.env.DNA_CORE_SCHEMAS;
  delete process.env.DNA_CORE_SCHEMAS;
  try {
    if (isCoreSchemasRoot(sibling)) {
      assert.equal(resolveCoreSchemasRoot(siteRoot), sibling);
    } else {
      assert.equal(resolveCoreSchemasRoot(siteRoot), vendor);
    }
  } finally {
    if (previous === undefined) delete process.env.DNA_CORE_SCHEMAS;
    else process.env.DNA_CORE_SCHEMAS = previous;
  }

  process.env.DNA_CORE_SCHEMAS = path.join(siteRoot, 'node_modules');
  try {
    assert.throws(() => resolveCoreSchemasRoot(siteRoot), /DNA_CORE_SCHEMAS/);
  } finally {
    if (previous === undefined) delete process.env.DNA_CORE_SCHEMAS;
    else process.env.DNA_CORE_SCHEMAS = previous;
  }
});

test('configured vendor root resolves and does not read operational/person.json', () => {
  const previous = process.env.DNA_CORE_SCHEMAS;
  process.env.DNA_CORE_SCHEMAS = vendor;
  try {
    const root = resolveCoreSchemasRoot(siteRoot);
    assert.equal(root, path.resolve(vendor));
    const domain = readSchema(root, 'structure', 'domain');
    assert.equal(domain.$id, 'https://dna.codes/schemas/structure/domain/v1');
    assert.equal(existsSync(path.join(root, 'operational', 'person.json')), false);
  } finally {
    if (previous === undefined) delete process.env.DNA_CORE_SCHEMAS;
    else process.env.DNA_CORE_SCHEMAS = previous;
  }
});

test('Entity and Action fields follow $ref and $defs', () => {
  const entity = readSchema(vendor, 'structure', 'entity');
  const entityFields = extractFields(entity);
  const id = field(entityFields, 'id');
  assert.equal(id.type, 'string');
  assert.equal(id.required, true);
  assert.match(id.description, /^Stable id/);
  const attributes = field(entityFields, 'attributes');
  assert.equal(attributes.type, 'Attribute[]');
  assert.equal(attributes.required, false);
  const instances = field(entityFields, 'instances');
  assert.equal(instances.type, 'instance[]');
  assert.equal(field(entityFields, 'name').type, 'string');

  const action = readSchema(vendor, 'behaviour', 'action');
  const actionFields = extractFields(action);
  const actionId = field(actionFields, 'id');
  assert.equal(actionId.type, 'string');
  assert.match(actionId.description, /Unique among the Actions/);
  assert.equal(field(actionFields, 'input').type, 'Attribute[]');
  assert.equal(field(actionFields, 'output').type, 'Attribute[]');
  const transition = field(actionFields, 'transition');
  assert.equal(transition.type, 'object');
  assert.match(transition.description, /state change/);
  assert.equal(field(actionFields, 'entity').type, 'string');

  const attribute = readSchema(vendor, 'structure', 'attribute');
  const attributeType = field(extractFields(attribute), 'type');
  assert.match(attributeType.type, /"state"/);
  assert.equal(attributeType.required, true);
});

test('discovered Operational groups are structure and behaviour, with ledger stability', () => {
  const previous = process.env.DNA_CORE_SCHEMAS;
  process.env.DNA_CORE_SCHEMAS = vendor;
  try {
    const groups = loadOperationalGroups(siteRoot);
    assert.deepEqual(
      groups.map((group) => group.label),
      ['Structure', 'Behaviour']
    );
    const structure = groups[0].primitives.map((primitive) => primitive.name);
    const behaviour = groups[1].primitives.map((primitive) => primitive.name);
    assert.deepEqual(structure, ['domain', 'entity', 'attribute', 'relationship']);
    assert.deepEqual(behaviour, ['behaviour', 'action', 'operation', 'workflow', 'condition', 'policy']);
    assert.equal(
      groups.flatMap((group) => group.primitives).every((primitive) => primitive.stability === 'stable'),
      true
    );
    assert.equal(
      groups.some((group) => group.primitives.some((primitive) => primitive.name === 'person')),
      false
    );
    const entity = groups[0].primitives.find((primitive) => primitive.name === 'entity');
    assert.ok(entity?.example);
    assert.match(entity.exampleSource ?? '', /^examples\/structure\/entity\/.+\.json$/);

    const version = latestCorpusVersion(path.resolve(vendor), 'checkout');
    assert.match(version, /^v\d+$/);
    const excerpt = loadCorpusExcerpt(path.resolve(vendor), `examples/checkout/${version}/commerce.json`);
    assert.match(excerpt.json, /"dna": "structure\/v1"/);
    assert.match(excerpt.source, /^examples\/checkout\/v\d+\/commerce\.json$/);
  } finally {
    if (previous === undefined) delete process.env.DNA_CORE_SCHEMAS;
    else process.env.DNA_CORE_SCHEMAS = previous;
  }
});
