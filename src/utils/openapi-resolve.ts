// Resolves the operations in an OpenAPI 3.x document to a resource and an action.
//
// This is the whole of API Operations' rung zero: a customer's spec is already a manifest of
// every address in their system, so the reading a visitor gets before they have an account is
// computable from the document alone. See openspec/changes/add-api-operations/design.md §1.
//
// The one rule that governs every decision below: **unresolved is a first-class result and is
// never guessed into a plausible name.** A resolver that filed everything ambiguous under its
// best guess would be wrong quietly, which is the worst way to be wrong — and it would report a
// flattering number on a page whose entire argument is that the number is honest. Where the
// heuristics run out, they stop, and `rule` records which one got there so the demo can show its
// work rather than assert a verdict.

export type ResolutionRule = 'x-dna' | 'operationId' | 'path';

/** Why an operation could not be resolved. Shown in the demo; also the interesting half of a real spec. */
export type UnresolvedReason =
  | 'no-resource' // no non-parameter segment to name a resource with
  | 'rpc' // an RPC-shaped route: a call, not a resource
  | 'unknown-verb' // a trailing segment we will not classify as either an action or a sub-resource
  | 'unknown-method'; // a method with no conventional action

export interface ResolvedOperation {
  method: string;
  path: string;
  operationId?: string;
  /** PascalCase, singular. `null` when unresolved. */
  resource: string | null;
  /** PascalCase. `null` when unresolved. */
  action: string | null;
  /** `Payment.Create`. `null` when unresolved. */
  operation: string | null;
  /** Which rule produced the answer, or `null` when none did. */
  rule: ResolutionRule | null;
  reason?: UnresolvedReason;
  /** The `target` expression from `x-dna`, when one was declared. */
  target?: string;
  /**
   * Whether the document says a caller must present *some* credential — the operation's own
   * `security`, or the document's if the operation is silent.
   *
   * This is the one governance-adjacent fact an OpenAPI document actually contains, and it is worth
   * reading precisely because of what it is not. `security: [BearerAuth]` says a caller must be
   * authenticated. It does not say *which* caller, under what conditions, or whether anything is
   * recorded. That gap — a token proves who you are, not that you may — is the product argument, and
   * it is better made with the reader's own numbers than asserted.
   */
  secured: boolean;
}

export interface ResolveReading {
  total: number;
  resolved: number;
  /** How many operations require a credential. */
  secured: number;
  /** Whether the document declares any authentication anywhere. If not, `secured` means nothing. */
  declaresSecurity: boolean;
  /** Of the resolved, how many were declared outright rather than inferred. */
  declared: number;
  operations: ResolvedOperation[];
  byRule: Record<ResolutionRule, number>;
  byReason: Record<UnresolvedReason, number>;
}

const METHODS = ['get', 'put', 'post', 'delete', 'patch', 'head', 'options', 'trace'];

// Method → action for a route that ends in a collection, and for one that ends in a single item.
// The split is the only reason `GET /customers` and `GET /customers/{id}` are different acts, and
// it is a distinction every governance question cares about: listing is not reading one.
const COLLECTION_ACTION: Record<string, string> = { get: 'List', post: 'Create' };
const ITEM_ACTION: Record<string, string> = {
  get: 'Read',
  put: 'Replace',
  patch: 'Update',
  delete: 'Delete',
  post: 'Create',
};

// Verbs we will accept as an act when they appear as a trailing path segment or lead an
// operationId. Deliberately a closed list: an open one ("any segment after a parameter is an
// action") is how a resolver starts inventing acts. Anything not here is reported unresolved,
// which is a real finding rather than a failure.
const VERBS = new Set([
  'accept',
  'activate',
  'approve',
  'archive',
  'assign',
  'cancel',
  'capture',
  'clone',
  'close',
  'complete',
  'confirm',
  'convert',
  'copy',
  'deactivate',
  'decline',
  'disable',
  'dismiss',
  'dispatch',
  'download',
  'duplicate',
  'enable',
  'execute',
  'expire',
  'export',
  'finalize',
  'follow',
  'generate',
  'grant',
  'import',
  'invite',
  'lock',
  'login',
  'logout',
  'merge',
  'move',
  'pause',
  'publish',
  'register',
  'reject',
  'release',
  'renew',
  'reopen',
  'reset',
  'resend',
  'restore',
  'resume',
  'retry',
  'revoke',
  'rollback',
  'run',
  'send',
  'share',
  'start',
  'stop',
  'submit',
  'subscribe',
  'sync',
  'transfer',
  'trigger',
  'unarchive',
  'unfollow',
  'unlock',
  'unpublish',
  'unsubscribe',
  'upload',
  'validate',
  'verify',
  'void',
  'refund',
]);

// operationId verbs, mapped onto the canonical acts. `list` and `search` collapse because a
// governed model does not distinguish them; `add` and `create` collapse for the same reason.
//
// `index` is deliberately absent. Rails spells its list action that way, but as the *last* word of
// an operationId it is far more often a noun — `rebuildIndex` resolved to `Rebuild.List`, which is
// not a thing. A verb list that has to be right in both positions cannot afford a word that is
// usually a noun in one of them.
const VERB_ALIASES: Record<string, string> = {
  add: 'Create',
  create: 'Create',
  insert: 'Create',
  new: 'Create',
  post: 'Create',
  delete: 'Delete',
  destroy: 'Delete',
  remove: 'Delete',
  fetch: 'Read',
  get: 'Read',
  read: 'Read',
  retrieve: 'Read',
  show: 'Read',
  all: 'List',
  find: 'List',
  list: 'List',
  query: 'List',
  search: 'List',
  put: 'Replace',
  replace: 'Replace',
  set: 'Replace',
  edit: 'Update',
  modify: 'Update',
  patch: 'Update',
  update: 'Update',
};

// Segments that name plumbing rather than a resource, and are skipped when looking for one.
const SKIP_SEGMENTS = new Set(['api', 'apis', 'rest', 'v1', 'v2', 'v3', 'v4', 'services', 'service']);

const isVersion = (s: string) => /^v\d+([._-]?\d+)*$/i.test(s) || /^\d{4}-\d{2}-\d{2}$/.test(s);
const isParam = (s: string) => s.startsWith('{') && s.endsWith('}');

// Words ending in "s" that are already singular. Without this, `Status` becomes `Statu` and the
// demo prints a word that does not exist, which is the single most credibility-destroying thing a
// resolver can put on screen.
const SINGULAR_S = new Set([
  'address',
  'analysis',
  'business',
  'bus',
  'class',
  'dns',
  'gas',
  'ids',
  'news',
  'process',
  'progress',
  'sms',
  'status',
  'success',
  'this',
]);

function singularize(word: string): string {
  const lower = word.toLowerCase();
  if (SINGULAR_S.has(lower) || !lower.endsWith('s')) return word;
  if (lower.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (lower.endsWith('sses') || lower.endsWith('shes') || lower.endsWith('ches') || lower.endsWith('xes')) {
    return word.slice(0, -2);
  }
  if (lower.endsWith('ss')) return word;
  return word.slice(0, -1);
}

/** Is this segment a plural noun — i.e. a collection, and therefore a resource rather than an act? */
function isPlural(word: string): boolean {
  const lower = word.toLowerCase();
  if (SINGULAR_S.has(lower)) return false;
  return lower.endsWith('s');
}

/** `payment-methods` / `payment_methods` / `paymentMethods` → `PaymentMethod`. */
function toPascal(segment: string): string {
  return segment
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .split(/[-_\s.]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

/** `payment.refund` / `Payment.Refund` / `payment_refund` → `{ resource: 'Payment', action: 'Refund' }`. */
function splitDeclared(value: string): { resource: string; action: string } | null {
  const parts = value.split(/[._/:]/).filter(Boolean);
  if (parts.length < 2) return null;
  const action = toPascal(parts[parts.length - 1]);
  const resource = toPascal(parts.slice(0, -1).join('-'));
  if (!action || !resource) return null;
  return { resource, action };
}

/**
 * Rule 2 — the operationId, where it is written in a shape we recognise.
 *
 * Verb-first (`createPayment`, `payments.create` read either way) covers most generators. A shape
 * we do not recognise falls through to the path rather than being forced, because an operationId
 * is free text and a great many of them are not names of acts at all.
 */
/**
 * A resource name built out of four or more words, or one that repeats a word, is almost always an
 * operationId generated by concatenating the path rather than by naming an act:
 * `PostTestHelpersIssuingAuthorizationsAuthorizationIncrement` → `TestHelpersIssuingAuthorizations…`.
 * Those are the answers that make a reader distrust every other row on the screen, so we refuse
 * them and let the operation be reported unresolved instead.
 */
function looksGenerated(resource: string): boolean {
  const words = resource.split(/(?=[A-Z])/).filter(Boolean);
  if (words.length >= 4) return true;
  const seen = new Set<string>();
  for (const w of words) {
    const key = singularize(w.toLowerCase());
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

function fromOperationId(operationId: string): { resource: string; action: string } | null {
  const words = operationId
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .split(/[-_\s./]+/)
    .filter(Boolean);
  if (words.length < 2) return null;

  const first = words[0].toLowerCase();
  const last = words[words.length - 1].toLowerCase();

  // Trailing qualifiers a generator adds and a model does not care about: getUserById, listReposForOrg.
  const trimmed = [...words];
  while (
    trimmed.length > 2 &&
    ['by', 'for', 'of', 'in', 'with', 'id', 'ids'].includes(trimmed[trimmed.length - 1].toLowerCase())
  ) {
    trimmed.pop();
  }
  const stripQualifier = (ws: string[]) => {
    const out = [...ws];
    const tailIdx = out.findIndex((w) => ['by', 'for', 'of', 'in', 'with'].includes(w.toLowerCase()));
    return tailIdx > 0 ? out.slice(0, tailIdx) : out;
  };

  if (VERB_ALIASES[first] || VERBS.has(first)) {
    const rest = stripQualifier(trimmed.slice(1));
    if (!rest.length) return null;
    const resource = toPascal(singularize(rest.join('-')));
    const action = VERB_ALIASES[first] ?? toPascal(first);
    return resource && !looksGenerated(resource) ? { resource, action } : null;
  }

  if (VERB_ALIASES[last] || VERBS.has(last)) {
    const rest = stripQualifier(trimmed.slice(0, -1));
    if (!rest.length) return null;
    const resource = toPascal(singularize(rest.join('-')));
    const action = VERB_ALIASES[last] ?? toPascal(last);
    return resource && !looksGenerated(resource) ? { resource, action } : null;
  }

  return null;
}

/**
 * Rule 3 — method and path, which is the rule REST has been arguing for twenty years and mostly
 * meaning. Walks the path right to left:
 *
 *   POST   /payments               → Payment.Create   (collection)
 *   GET    /customers/{id}         → Customer.Read    (item)
 *   GET    /customers/{id}/invoices→ Invoice.List     (sub-resource, last resource wins)
 *   POST   /payments/{id}/refund   → Payment.Refund   (trailing verb beats the method)
 *   POST   /rpc/doThing            → unresolved
 */
function fromPath(method: string, path: string): { resource: string; action: string } | { reason: UnresolvedReason } {
  const segments = path.split('/').filter(Boolean);
  if (segments.some((s) => s.toLowerCase() === 'rpc')) return { reason: 'rpc' };

  const meaningful = segments
    .filter((s) => !isVersion(s) && !SKIP_SEGMENTS.has(s.toLowerCase()))
    // Twilio's whole API is `/Accounts/{AccountSid}/Messages.json`. A representation suffix says
    // how the answer is encoded, not what the act is, so it comes off before anything reads the
    // segment — otherwise `Messages.json` is not plural and the collection rule never fires.
    // A `#fragment` disambiguates two operations on one path in a few real specs (Box does this).
    // It is not part of the resource name.
    .map((s) => s.split('#')[0])
    .map((s, i, all) => (i === all.length - 1 ? s.replace(/\.(json|xml|ya?ml|csv)$/i, '') : s))
    .filter(Boolean);
  if (!meaningful.length) return { reason: 'no-resource' };

  // A single segment carrying dots is a method name, not a route: Slack's whole Web API is
  // `/chat.postMessage`, `/admin.apps.approve`, `/conversations.list`. Read as a path it looks
  // like a singleton resource and yields `AdminAppsApprove.Create`, which is how an earlier run
  // of this resolver scored Slack at 100% while producing nothing usable. It is RPC and we say so.
  if (meaningful.length === 1 && meaningful[0].includes('.')) return { reason: 'rpc' };

  const tail = meaningful[meaningful.length - 1];

  // A trailing non-parameter segment is either an act on the resource before it, or a
  // sub-collection. Plural says collection; a known verb says act; anything else we decline.
  if (!isParam(tail)) {
    // `/releases/generate-notes` is an act on releases, not a collection of GenerateNotes. The
    // leading word decides, and it is checked before the plural rule because the object of the
    // verb is usually plural and would otherwise win.
    const head = tail.toLowerCase().split(/[-_]/)[0];
    if (tail.includes('-') && VERBS.has(head)) {
      const owner = [...meaningful]
        .slice(0, -1)
        .reverse()
        .find((s) => !isParam(s));
      if (owner) return { resource: toPascal(singularize(owner)), action: toPascal(tail) };
    }

    if (!isPlural(tail)) {
      if (VERBS.has(head) || VERB_ALIASES[head]) {
        const owner = [...meaningful]
          .slice(0, -1)
          .reverse()
          .find((s) => !isParam(s));
        if (!owner) return { reason: 'no-resource' };
        return { resource: toPascal(singularize(owner)), action: VERB_ALIASES[head] ?? toPascal(tail) };
      }
      // A singular trailing noun at the root — /account, /me, /health — is a singleton resource.
      // There is no collection to say whether it is one or many, so the item actions apply.
      if (meaningful.length === 1) {
        const action = ITEM_ACTION[method];
        if (!action) return { reason: 'unknown-method' };
        return { resource: toPascal(singularize(tail)), action };
      }

      // A singular trailing noun directly after a parameter, under a writing method, is an act on
      // that item — `POST /invoices/{id}/pay`, `PUT /databases/{id}/resize`. The method carries the
      // signal the verb list cannot: nobody POSTs to a noun they are reading, so this reaches the
      // long tail of domain-specific verbs (`pay`, `resize`, `escalate`) without an ever-growing
      // list of every act any customer might name.
      const previous = meaningful[meaningful.length - 2];
      if (isParam(previous) && (method === 'post' || method === 'put' || method === 'patch')) {
        const owner = [...meaningful]
          .slice(0, -1)
          .reverse()
          .find((s) => !isParam(s));
        if (owner) return { resource: toPascal(singularize(owner)), action: toPascal(tail) };
      }

      // Otherwise it is genuinely ambiguous: `GET /orgs/{org}/public-key` is a singleton
      // sub-resource and `GET /enterprises/{id}/reports/latest` is neither a resource nor an act,
      // and nothing in the document distinguishes them. We decline. This branch produces most of
      // the honest unresolved count, and it is the one an earlier draft of this resolver got wrong
      // — it filed both under the item actions and reported a resolution rate that meant nothing.
      return { reason: 'unknown-verb' };
    }

    const action = COLLECTION_ACTION[method] ?? ITEM_ACTION[method];
    if (!action) return { reason: 'unknown-method' };
    return { resource: toPascal(singularize(tail)), action };
  }

  // The path ends in a parameter, so it addresses one item of the resource before it.
  const owner = [...meaningful].reverse().find((s) => !isParam(s));
  if (!owner) return { reason: 'no-resource' };
  const action = ITEM_ACTION[method];
  if (!action) return { reason: 'unknown-method' };
  return { resource: toPascal(singularize(owner)), action };
}

/** Resolve one operation. Exported so the demo can show a single row's reasoning. */
export function resolveOperation(
  method: string,
  path: string,
  operation: Record<string, unknown> | undefined,
  documentSecurity?: unknown
): ResolvedOperation {
  // An operation's own `security` wins, including an empty array — which is how a document says
  // "this one is deliberately public" and must not be read as "inherits the global requirement".
  const own = operation?.security;
  const effective = Array.isArray(own) ? own : documentSecurity;
  const secured = Array.isArray(effective) && effective.length > 0;

  const base: ResolvedOperation = {
    secured,
    method: method.toUpperCase(),
    path,
    operationId: typeof operation?.operationId === 'string' ? operation.operationId : undefined,
    resource: null,
    action: null,
    operation: null,
    rule: null,
  };

  // Rule 1 — an explicit declaration always wins. This is the escape hatch that makes the other
  // two rules allowed to be conservative: a spec whose naming does not survive them says so once
  // in YAML rather than being second-guessed by a heuristic.
  const xdna = operation?.['x-dna'] as { operation?: string; target?: string } | undefined;
  if (xdna && typeof xdna.operation === 'string') {
    const split = splitDeclared(xdna.operation);
    if (split) {
      return {
        ...base,
        ...split,
        operation: `${split.resource}.${split.action}`,
        rule: 'x-dna',
        target: typeof xdna.target === 'string' ? xdna.target : undefined,
      };
    }
  }

  // Rule 2 — method and path, and it goes *before* the operationId deliberately. An operationId is
  // free text; a path is a structured thing under a convention the industry mostly keeps. Measured
  // on real corpora the ordering matters more than any other decision in this file: Stripe's
  // operationIds are generated from its own paths (`PostAccountsAccountPersons`), so parsing them
  // as verb-plus-noun produced names like `TestHelpersIssuingPersonalizationDesignsReject.Create`
  // while the path beside it read cleanly as `Person.Create`. It also fixes a whole class of
  // wrong-but-plausible answers: `GET /v1/customers` is `Customer.List`, and only the path knows
  // that the route ends in a collection.
  const byPath = fromPath(method, path);
  if (!('reason' in byPath)) {
    return { ...base, ...byPath, operation: `${byPath.resource}.${byPath.action}`, rule: 'path' };
  }

  // Rule 3 — the operationId, as the fallback for the paths the convention does not reach: RPC
  // routes and ambiguous tails. Where it is written as a name of an act it rescues them.
  if (base.operationId) {
    const byId = fromOperationId(base.operationId);
    if (byId) return { ...base, ...byId, operation: `${byId.resource}.${byId.action}`, rule: 'operationId' };
  }

  return { ...base, reason: byPath.reason };
}

export class OpenApiParseError extends Error {}

/**
 * Read a parsed OpenAPI 3.x document and resolve every operation in it.
 *
 * Throws rather than returning an empty reading when the input is not an OpenAPI document: a page
 * that renders "0 of 0" for a pasted package.json has told the visitor something false about their
 * API. See the spec's malformed-input scenario.
 */
export function resolveSpec(doc: unknown): ResolveReading {
  if (!doc || typeof doc !== 'object') throw new OpenApiParseError('That is not an OpenAPI document.');
  const spec = doc as Record<string, unknown>;
  if (!spec.openapi && !spec.swagger) {
    throw new OpenApiParseError(
      'No `openapi` or `swagger` version field — this does not look like an API description.'
    );
  }
  const paths = spec.paths;
  if (!paths || typeof paths !== 'object') {
    throw new OpenApiParseError('The document has no `paths`, so there are no operations to read.');
  }

  const operations: ResolvedOperation[] = [];
  for (const [path, item] of Object.entries(paths as Record<string, unknown>)) {
    if (!item || typeof item !== 'object') continue;
    for (const method of METHODS) {
      const op = (item as Record<string, unknown>)[method];
      if (!op || typeof op !== 'object') continue;
      operations.push(resolveOperation(method, path, op as Record<string, unknown>, spec.security));
    }
  }

  const byRule: Record<ResolutionRule, number> = { 'x-dna': 0, operationId: 0, path: 0 };
  const byReason: Record<UnresolvedReason, number> = {
    'no-resource': 0,
    rpc: 0,
    'unknown-verb': 0,
    'unknown-method': 0,
  };
  for (const op of operations) {
    if (op.rule) byRule[op.rule] += 1;
    else if (op.reason) byReason[op.reason] += 1;
  }

  const schemes = (spec.components as { securitySchemes?: object } | undefined)?.securitySchemes;
  const declaresSecurity =
    (Array.isArray(spec.security) && spec.security.length > 0) ||
    operations.some((o) => o.secured) ||
    (!!schemes && Object.keys(schemes).length > 0);

  return {
    total: operations.length,
    resolved: operations.filter((o) => o.rule !== null).length,
    secured: operations.filter((o) => o.secured).length,
    declaresSecurity,
    declared: byRule['x-dna'],
    operations,
    byRule,
    byReason,
  };
}
