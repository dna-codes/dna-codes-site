// The authored genome format — what a human writes, and the canonical DNA it compiles into.
//
// Two vocabularies live in this file and they must not be confused:
//
//   Authored*  — the compact format. Names and edges. No UUIDs, no schema versions, no
//                duplicated joins. This is what src/data/genome/*.genome.ts files declare.
//   Dna*       — the canonical documents published by @dna-codes/dna-schemas. Every operational
//                primitive carries a UUID and a `version`; names are PascalCase; task ids are
//                kebab-case; operations are `Target.Action`.
//
// src/utils/genome-compile.ts is the only thing that turns the first into the second. Renderers
// read the second, never the first — see the industry-genomes spec.
//
// The economy here is deliberate. An author writes a process step once, as
// `{ id, actor, operation }`, and the compiler emits both the Task and the Step that references
// it. Steps and tasks therefore cannot drift out of sync, because there is nowhere for them to
// drift to.

import type { IndustryKey } from '~/data/industries';

// --- Authored format -------------------------------------------------------

/** A field on a noun primitive. Mirrors the operational Attribute enum exactly. */
export interface AuthoredAttribute {
  name: string;
  type: 'string' | 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'enum' | 'reference';
  description?: string;
  required?: boolean;
  /** Required by the schema when `type` is 'enum'. */
  values?: string[];
}

export interface AuthoredAction {
  /** PascalCase. */
  name: string;
  description?: string;
  type?: 'read' | 'write' | 'destructive';
}

/** A noun — Resource, Person template, Role, or Group all share this shape. */
export interface AuthoredNoun {
  /** PascalCase. */
  name: string;
  description?: string;
  attributes?: AuthoredAttribute[];
  actions?: AuthoredAction[];
  /** PascalCase name of the parent noun of the same kind. Roles use this for the hierarchy. */
  parent?: string;
}

export interface AuthoredMembership {
  /** PascalCase. */
  name: string;
  /** PascalCase Person template name. */
  person: string;
  /** PascalCase Role name. */
  role: string;
  /** PascalCase Group name. */
  group?: string;
  description?: string;
}

export interface AuthoredOperation {
  /** PascalCase noun name. */
  target: string;
  /** PascalCase verb. */
  action: string;
  description?: string;
}

/**
 * One step of the process. Compiles to a Task *and* the Step that runs it, which is why the
 * author supplies the actor and operation here rather than in a separate tasks[] block.
 */
export interface AuthoredStep {
  /** kebab-case, unique within the process. Becomes both the step id and the task name. */
  id: string;
  /** Sentence-case label for display. Derived from `id` when omitted. */
  title?: string;
  /** PascalCase Role that performs this step. */
  actor: string;
  /** `Target.Action`, referencing a declared operation. */
  operation: string;
  description?: string;
  /** Roles consulted on this step. Feeds the Consulted column of the RACI matrix. */
  consulted?: string[];
}

export interface AuthoredProcess {
  /** PascalCase. */
  name: string;
  description?: string;
  /** PascalCase Role that owns the process. Accountable in the RACI matrix. */
  operator: string;
  steps: AuthoredStep[];
}

export interface AuthoredRule {
  /** PascalCase. */
  name: string;
  /** `Target.Action`. */
  operation: string;
  description?: string;
  ruleType?: 'access' | 'condition';
  /** Roles permitted to perform the operation. Drives the access-control matrix. */
  allow?: { role: string; ownership?: boolean }[];
}

export interface AuthoredTrigger {
  source: 'user' | 'schedule' | 'webhook' | 'operation';
  description?: string;
  /** PascalCase Process name. */
  process?: string;
  /** `Target.Action`. */
  operation?: string;
  /** `Target.Action` this fires after. Required by the schema when `source` is 'operation'. */
  after?: string;
  schedule?: string;
  event?: string;
}

export interface AuthoredField {
  name: string;
  label?: string;
  type:
    | 'string'
    | 'text'
    | 'number'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'email'
    | 'phone'
    | 'url'
    | 'enum'
    | 'reference';
  description?: string;
  required?: boolean;
  readonly?: boolean;
  /** Required by the schema when `type` is 'enum'. */
  values?: string[];
}

export interface AuthoredProductResource {
  name: string;
  description?: string;
  /** PascalCase operational Resource this projects. */
  resource?: string;
  fields: AuthoredField[];
  actions?: { name: string; description?: string }[];
  /**
   * Rows for the Example UI renderer, keyed by field name. Declared here so that no renderer
   * ever invents a value — every cell on screen traces to this genome.
   */
  samples?: Record<string, string | number | boolean>[];
}

export interface AuthoredEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  /** `Target.Action`. */
  operation: string;
  description?: string;
}

/** The block types the published UI schema allows. Anything else fails validation. */
export type BlockType = 'list' | 'detail' | 'form' | 'survey' | 'actions' | 'table' | 'summary' | 'empty-state';

export interface AuthoredPage {
  name: string;
  /** Product resource name this page is about. */
  resource: string;
  description?: string;
  blocks?: { name: string; type: BlockType; operation?: string }[];
}

export interface AuthoredRoute {
  path: string;
  /** Page name. */
  page: string;
  description?: string;
  protected?: boolean;
}

export interface AuthoredProduct {
  resources: AuthoredProductResource[];
  namespace: { name: string; path: string; description?: string };
  endpoints: AuthoredEndpoint[];
  layout?: { name: string; type: 'sidebar' | 'topnav' | 'blank' | string };
  pages: AuthoredPage[];
  routes: AuthoredRoute[];
}

export interface AuthoredCell {
  name: string;
  /** Which DNA this cell runs. */
  dna: string;
  adapter: { type: string; runtime?: string; [k: string]: unknown };
  description?: string;
  environment?: string;
}

export interface AuthoredConnection {
  /** Cell name. */
  source: string;
  /** Cell name. */
  target: string;
  type: 'depends-on' | 'data-flow' | 'communicates-with' | 'publishes-to';
  label?: string;
}

export interface AuthoredTechnical {
  providers: {
    name: string;
    type: 'cloud' | 'auth' | 'payments' | 'database' | 'storage' | 'messaging' | 'monitoring' | 'other';
    description?: string;
    region?: string;
  }[];
  environments: { name: 'dev' | 'staging' | 'prod'; description?: string; providers?: string[] }[];
  cells: AuthoredCell[];
  connections: AuthoredConnection[];
}

/**
 * A published vocabulary this genome is modelled on. Named on the page, because "we made up
 * plausible-sounding nouns" and "these are the nouns the industry's own standard uses" look
 * identical from the outside — and only one of them is worth anything.
 */
export interface OntologyRef {
  /** Short name as practitioners say it aloud, e.g. `FHIR R4`. */
  name: string;
  /** What this genome takes from it, concretely. */
  note: string;
}

export interface AuthoredGenome {
  key: IndustryKey;
  /** The standards this genome's vocabulary is drawn from. At least two — see the validator. */
  ontologies: OntologyRef[];
  /** PascalCase root domain name. */
  domain: string;
  /** Dot-separated domain path from the platform root, e.g. `brightbox.commerce`. */
  domainPath: string;
  /** The organisation this genome describes, shown on screen so nobody mistakes it for theirs. */
  orgName: string;
  description: string;

  resources: AuthoredNoun[];
  persons: AuthoredNoun[];
  roles: AuthoredNoun[];
  groups: AuthoredNoun[];
  memberships: AuthoredMembership[];
  operations: AuthoredOperation[];
  process: AuthoredProcess;
  rules: AuthoredRule[];
  triggers: AuthoredTrigger[];

  product: AuthoredProduct;
  technical: AuthoredTechnical;
}

// --- Canonical DNA (the compiler's output) ---------------------------------
//
// Structural types only — the schemas are the authority, and the validator checks against them.
// These exist so the derivation layer is type-safe over compiled documents.

export interface DnaBase {
  id: string;
  type: string;
  name: string;
  version: string;
  description?: string;
}

export interface DnaAttribute {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  values?: string[];
}

export interface DnaNoun extends DnaBase {
  attributes?: DnaAttribute[];
  actions?: { name: string; description?: string; type?: string }[];
  parent?: string;
  domain?: string;
}

export interface DnaMembership extends DnaBase {
  person: string;
  role: string;
  group?: string;
}

export interface DnaOperation extends DnaBase {
  target: string;
  action: string;
}

export interface DnaTask extends DnaBase {
  actor: string;
  operation: string;
}

export interface DnaStep {
  id: string;
  task: string;
  description?: string;
  depends_on?: string[];
}

export interface DnaProcess extends DnaBase {
  operator: string;
  startStep: string;
  steps: DnaStep[];
}

export interface DnaRule extends DnaBase {
  operation: string;
  rule_type?: 'access' | 'condition';
  allow?: { role?: string; ownership?: boolean }[];
}

export interface DnaTrigger extends DnaBase {
  source: string;
  process?: string;
  operation?: string;
  schedule?: string;
  event?: string;
}

export interface DnaDomain {
  name: string;
  description?: string;
  path?: string;
  resources?: DnaNoun[];
  persons?: DnaNoun[];
  roles?: DnaNoun[];
  groups?: DnaNoun[];
  domains?: DnaDomain[];
}

export interface OperationalDna {
  domain: DnaDomain;
  memberships?: DnaMembership[];
  operations?: DnaOperation[];
  tasks?: DnaTask[];
  processes?: DnaProcess[];
  rules?: DnaRule[];
  triggers?: DnaTrigger[];
}

/**
 * Product core is the *materialized* slice of operational DNA — the schema's own words. Its
 * resources are operational Resource primitives, flattened out of the domain hierarchy, not the
 * field-based product resources. Those live on the API document below.
 */
export interface ProductCoreDna {
  domain: { name: string; path: string; description?: string };
  resources: DnaNoun[];
  /** The product-layer Operation names its subject `resource`, not `target`. */
  operations: { name: string; resource: string; action: string; description?: string }[];
}

export interface ProductApiDna {
  namespace: { name: string; path: string; description?: string };
  /** The field-based product resources — what a screen actually renders. */
  resources: {
    name: string;
    description?: string;
    resource?: string;
    fields?: AuthoredField[];
    actions?: { name: string; description?: string }[];
  }[];
  endpoints: { method: string; path: string; operation: string; description?: string }[];
}

export interface ProductUiDna {
  layout: { name: string; type: string };
  pages: { name: string; resource: string; description?: string; blocks?: unknown[] }[];
  routes: { path: string; page: string; description?: string; protected?: boolean }[];
}

export interface ProductDna {
  core: ProductCoreDna;
  api: ProductApiDna;
  ui: ProductUiDna;
}

export interface DnaProvider {
  name: string;
  type: string;
  description?: string;
  region?: string;
}

export interface TechnicalDna {
  cells: { name: string; dna: string; adapter: object; description?: string; environment?: string }[];
  connections?: { id: string; source: string; target: string; type: string; label?: string }[];
  /** The schema inlines full Provider objects here; the compiler resolves them from names. */
  environments?: { name: string; description?: string; providers?: DnaProvider[] }[];
  providers?: DnaProvider[];
}

/**
 * The compiler's whole output for one industry: three canonical documents, plus the sample rows
 * the Example UI renderer needs. Samples ride alongside rather than inside the documents so the
 * canonical output stays exactly what the published schemas describe and nothing more.
 */
export interface CompiledGenome {
  key: IndustryKey;
  orgName: string;
  description: string;
  ontologies: OntologyRef[];
  operational: OperationalDna;
  product: ProductDna;
  technical: TechnicalDna;
  /** Product resource name → rows, each row keyed by field name. */
  samples: Record<string, Record<string, string | number | boolean>[]>;
  /** Step id → roles consulted, carried through for the RACI derivation. */
  consulted: Record<string, string[]>;
  /** Step id → display title. */
  stepTitles: Record<string, string>;
}
