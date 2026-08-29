// Markup for the /api-operations demo, as strings.
//
// It lives here rather than in the component because the same rows are rendered twice: once in
// ApiOpsDemo's frontmatter, so the panel is real HTML for a visitor with no JavaScript, and once in
// the browser every time somebody pastes a document or picks a different sample. Two
// implementations of one row would drift, and the thing they would drift about is the number the
// whole page argues from.
//
// The rows keep Swagger's *shape* — method pill, path, tinted left-barred block, tag groupings,
// click to expand — and drop its palette. See openapi-ui.ts for why colour is spent only on the
// finding.
//
// **Expansion is a native `<details>`, deliberately.** No listeners, no state, no re-binding after
// the rows are replaced by innerHTML, and keyboard and screen-reader behaviour that is correct
// without being written. An earlier version drew a bar of ticks above the list; it was removed
// because it invited a click it could not answer. Everything here that looks interactive is.
//
// **The panel has two states, and keeping them apart is the honesty requirement in the spec.**
//
//   With a model (the bundled samples)  a gap report: 22 of 26 governed, and here are the 4 that
//                                       are not. This is the default, because it is what a security
//                                       or compliance reader is looking for — nobody needs to be
//                                       told an API exists, they need to be told what nothing covers.
//   Without one (a pasted document)     naming only, and governance stated as unknown rather than
//                                       as zero. We have not checked; saying "none" would be a
//                                       claim about the reader's estate that we cannot support.

import type { ResolveReading, ResolvedOperation } from './openapi-resolve';
import type { Governance } from '~/data/openapi-samples/governance';
import { RULES, STARTER_RULES } from '~/data/openapi-samples/governance';
import type { Tone } from './openapi-ui';
import { rowStyle, pillStyle } from './openapi-ui';

/**
 * The document, shown verbatim, for the "View spec" panel.
 *
 * Capped: a visitor may paste 8 MB, and putting 8 MB of text in the DOM would hang the tab. What is
 * cut is stated, and the sentence makes clear that only the *display* was truncated — the reading
 * above it was computed over the whole document, and a reader who thought otherwise would distrust
 * the number.
 */
export const SOURCE_LIMIT = 120_000;

export function sourceHtml(text: string): string {
  if (text.length <= SOURCE_LIMIT) return esc(text);
  const rest = text.length - SOURCE_LIMIT;
  return `${esc(text.slice(0, SOURCE_LIMIT))}\n\n… ${rest.toLocaleString('en-US')} more characters not shown. The whole document was read; only this view is truncated.`;
}

/** Paths and operation names come out of a pasted document, so nothing reaches the DOM unescaped. */
export function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const REASON_LABEL: Record<string, string> = {
  'no-resource': 'no resource in the path',
  rpc: 'RPC call, not a resource',
  'unknown-verb': 'resource or act?',
  'unknown-method': 'no act for this method',
};

const REASON_HELP: Record<string, string> = {
  'no-resource': 'There is no path segment naming a thing this acts on.',
  rpc: 'The path names a procedure rather than a resource, so no resource and act can be read from it.',
  'unknown-verb': 'The last segment could be a sub-resource or an act, and nothing in the document decides which.',
  'unknown-method': 'This method has no conventional act, so guessing one would be inventing it.',
};

/** What the panel knows about one endpoint once the model has been consulted — or has not been. */
type Verdict = 'governed' | 'gap' | 'uncontrolled' | 'unnamed';

/**
 * `editable` means the document is the visitor's own, so the only controls that can exist for it are
 * the ones they add here. An endpoint they have not reached is **uncontrolled**, never a gap: a gap
 * is a finding against a model, and their model is not something this page has seen.
 *
 * Keeping those apart is also what stops the panel repainting itself. When both were `gap`, applying
 * the first control flipped every other row from teal to red at once — the reader did one
 * constructive thing and the screen appeared to get much worse.
 */
function verdictOf(op: ResolvedOperation, gov: Governance | null, editable = false): Verdict {
  if (!op.rule) return 'unnamed';
  if (gov?.[op.operation!]) return 'governed';
  return editable || !gov ? 'uncontrolled' : 'gap';
}

const TONE: Record<Verdict, Tone> = { governed: 'ok', gap: 'gap', uncontrolled: 'none', unnamed: 'none' };

export interface Reading {
  total: number;
  named: number;
  governed: number;
  secured: number;
  declaresSecurity: boolean;
  gaps: ResolvedOperation[];
  hasModel: boolean;
  /** The document is the visitor's own, so "not governed" means "not yet", not "a finding". */
  editable: boolean;
}

export function read(reading: ResolveReading, gov: Governance | null, editable = false): Reading {
  return {
    total: reading.total,
    named: reading.resolved,
    secured: reading.secured,
    declaresSecurity: reading.declaresSecurity,
    governed: gov ? reading.operations.filter((o) => verdictOf(o, gov, editable) === 'governed').length : 0,
    gaps: gov ? reading.operations.filter((o) => verdictOf(o, gov, editable) === 'gap') : [],
    hasModel: gov !== null,
    editable,
  };
}

const field = (label: string, value: string, tone = 'text-slate-200') =>
  `<div class="flex gap-3"><dt class="text-[13px] text-slate-400 w-28 flex-shrink-0">${label}</dt><dd class="text-[13px] font-mono ${tone}">${value}</dd></div>`;

/** What opening a row is worth. Different per verdict, because each one raises a different question. */
function detailHtml(op: ResolvedOperation, gov: Governance | null, editable: boolean): string {
  const verdict = verdictOf(op, gov, editable);

  if (verdict === 'governed') {
    const key = gov![op.operation!];
    const rule = RULES[key];
    return `<dl class="space-y-1">
      ${field('Operation', esc(op.operation!))}
      ${field('Rule', esc(rule?.name ?? '—'), 'text-primary')}
      ${field('Required', esc(rule?.roles ?? '—'))}
      ${field('Scope', esc(rule?.scope ?? '—'))}
      ${rule?.feature ? field('Feature', esc(rule.feature)) : ''}
      ${field('Audit', esc(rule?.audit ?? '—'))}
    </dl>
    ${key.startsWith('starter-') ? governControl(op, key) : ''}`;
  }

  // `gap` can only be a bundled sample now: a visitor's own document resolves to `uncontrolled`,
  // which is the editable branch below. So this one never offers a picker — the sample's gaps are
  // part of its argument, not an exercise.
  if (verdict === 'gap') {
    return `<dl class="space-y-1">
      ${field('Operation', esc(op.operation!))}
      ${field('Rule', 'none', 'text-rose-300')}
      ${field('Required', 'nobody — any caller the edge authenticates', 'text-rose-300')}
      ${field('Scope', 'unbounded', 'text-rose-300')}
      ${field('Audit', 'nothing is recorded', 'text-rose-300')}
    </dl>
    <p class="mt-2 pt-2 border-t border-white/10 text-[12px] text-slate-300 leading-snug">
      Not a weaker rule — no rule. Nobody decided this one was safe to leave open; it was never considered, and nothing
      in the stack was in a position to notice.
    </p>`;
  }

  if (verdict === 'uncontrolled') {
    return `<dl class="space-y-1">
      ${field('Operation', esc(op.operation!))}
      ${field('Authentication', op.secured ? 'a credential is required' : 'none declared', op.secured ? 'text-slate-200' : 'text-rose-300')}
      ${field('Controls', 'none', 'text-rose-300')}
    </dl>
    <p class="mt-2 text-[12px] text-slate-300 leading-snug">${
      op.secured
        ? 'Your document says a caller must present a credential. It does not say <em>which</em> caller may perform this, under what conditions, or what is recorded.'
        : 'Your document declares no authentication for this operation, and nothing that says who may perform it.'
    }</p>
    ${governControl(op)}`;
  }

  return `<dl class="space-y-1">
      ${field('Path', esc(op.path))}
      ${field('Why', esc(REASON_LABEL[op.reason ?? ''] ?? 'cannot be named'), 'text-slate-300')}
    </dl>
    <p class="mt-2 text-[12px] text-slate-300 leading-snug">${esc(REASON_HELP[op.reason ?? ''] ?? '')}</p>
    <pre class="mt-2 rounded bg-slate-950 p-2 text-[12px] font-mono text-slate-300 overflow-x-auto"><code>${esc(
      'x-dna:\n  operation: resource.act'
    )}</code></pre>`;
}

/**
 * The layering affordance: pick a rule and this endpoint becomes governed, in the visitor's own
 * browser, on their own document.
 *
 * It is the smallest honest version of what the product does — bind an operation to a rule — and it
 * is the moment the demo stops describing a gap report and produces one. Nothing is saved and
 * nothing is sent; the assignment lives in a variable until the page is left, which the label says.
 */
function governControl(op: ResolvedOperation, current = ''): string {
  // `selected` on the option that is actually in force. Without it every re-render rebuilt the
  // select with the empty option first, so applying a rule left the row teal and the detail naming
  // the rule while the dropdown underneath still read "no control" — a control contradicting the
  // thing it had just done.
  const option = (value: string, label: string) =>
    `<option value="${esc(value)}"${value === current ? ' selected' : ''}>${esc(label)}</option>`;
  return `<label class="mt-2 pt-2 border-t border-white/10 flex items-center gap-2 text-[12px] text-slate-300">
    <span class="flex-shrink-0">Govern with</span>
    <select data-govern="${esc(op.operation ?? '')}" class="flex-1 min-w-0 rounded border border-white/15 bg-slate-900 px-2 py-1 text-[12px] text-slate-200 focus:border-primary/60 focus:outline-none">
      ${option('', '— no control —')}
      ${STARTER_RULES.map((key) => option(key, RULES[key].name)).join('')}
    </select>
  </label>`;
}

function rowHtml(op: ResolvedOperation, gov: Governance | null, editable: boolean): string {
  const verdict = verdictOf(op, gov, editable);
  const tone = TONE[verdict];
  // A switch rather than an object indexed by verdict. The object literal evaluated *every* branch
  // before picking one, so the governed branch dereferenced `gov` even when there was no model —
  // which is every document a visitor pastes. It threw on the first row, after the headline had
  // already been written, leaving the previous spec's rows under the new spec's number. Lazy is not
  // an optimisation here; it is the difference between the paste working and not.
  let right: string;
  if (verdict === 'governed') {
    right = `<span class="text-[12px] text-primary">${esc(RULES[gov![op.operation!]]?.name ?? '')}</span>`;
  } else if (verdict === 'gap') {
    right = `<span class="text-[12px] font-semibold text-rose-300">nothing governs this</span>`;
  } else if (verdict === 'uncontrolled') {
    // A count of secured endpoints in the headline is a statistic; a reader auditing an API needs to
    // see *which* ones, on the row, without opening anything. Public is the rose one: an endpoint
    // with neither a credential nor a control is the worst square on the board, and it should be the
    // one the eye finds first.
    right = op.secured
      ? `<span class="rounded border border-white/20 px-1.5 py-0.5 text-[11px] text-slate-300">credential</span>
         <span class="text-[12px] text-slate-400">no controls</span>`
      : `<span class="rounded border border-rose-400/40 px-1.5 py-0.5 text-[11px] text-rose-300">public</span>
         <span class="text-[12px] text-slate-400">no controls</span>`;
  } else {
    right = `<span class="text-[12px] text-slate-400">${esc(REASON_LABEL[op.reason ?? ''] ?? 'cannot be named')}</span>`;
  }

  return `<details class="group rounded overflow-hidden" data-op="${esc(op.method)} ${esc(op.path)}" style="${rowStyle(tone)}">
    <summary class="flex items-center gap-3 px-2 py-1.5 cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:bg-white/5">
      <span class="rounded px-1.5 py-0.5 text-[11px] font-bold text-white w-16 text-center flex-shrink-0" style="${pillStyle(
        tone
      )}">${esc(op.method)}</span>
      <span class="font-mono text-[13px] ${verdict === 'gap' ? 'text-white' : 'text-slate-200'} truncate" title="${esc(
        op.path
      )}">${esc(op.path)}</span>
      <span class="ml-auto flex items-center gap-2 flex-shrink-0 pl-2">
        ${right}
        <svg class="w-3 h-3 text-slate-400 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5.5 7.5 10 12l4.5-4.5"/></svg>
      </span>
    </summary>
    <div class="px-2.5 pb-2.5 pt-1 bg-slate-950/50">${detailHtml(op, gov, editable)}</div>
  </details>`;
}

/**
 * The rows, grouped the way Swagger groups them by tag — here by the resource we resolved, because
 * that is the tag the document did not write down.
 *
 * Groups containing a gap sort first. On a real specification the gaps are scattered through
 * hundreds of rows, and a report that makes an auditor scroll for its own findings is a report
 * nobody finishes. Capped, and what is dropped is stated: a list that quietly stops is a list a
 * reader assumes is complete.
 */
export function rowsHtml(reading: ResolveReading, gov: Governance | null, editable = false, limit = 32): string {
  const groups = new Map<string, ResolvedOperation[]>();
  for (const op of reading.operations) {
    const key = op.resource ?? 'Unresolved';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(op);
  }

  const hasGap = (ops: ResolvedOperation[]) => ops.some((o) => verdictOf(o, gov, editable) === 'gap');
  const ordered = [...groups.entries()].sort((a, b) => Number(hasGap(b[1])) - Number(hasGap(a[1])));

  let budget = limit;
  let dropped = 0;
  const blocks: string[] = [];

  for (const [name, ops] of ordered) {
    if (budget <= 0) {
      dropped += ops.length;
      continue;
    }
    const shown = ops.slice(0, budget);
    dropped += ops.length - shown.length;
    budget -= shown.length;
    const gaps = shown.filter((o) => verdictOf(o, gov, editable) === 'gap').length;
    blocks.push(`<div class="pt-1">
        <div class="flex items-baseline gap-2 border-b border-white/10 pb-1 mb-1.5">
          <span class="text-[14px] font-semibold text-slate-200">${esc(name)}</span>
          <span class="text-[12px] text-slate-400">${shown.length}</span>
          ${gaps ? `<span class="ml-auto text-[12px] font-semibold text-rose-300">${gaps} gap${gaps > 1 ? 's' : ''}</span>` : ''}
        </div>
        <div class="space-y-1">${shown.map((o) => rowHtml(o, gov, editable)).join('')}</div>
      </div>`);
  }

  return dropped > 0
    ? `${blocks.join('')}<p class="pt-2 text-[12px] text-slate-400">and ${dropped} more, counted above and not listed here.</p>`
    : blocks.join('');
}

/**
 * The headline, on one line. Two stacked lines read as two separate findings; they are one — a count
 * and its remainder, and the sentence only means something with both halves in the eye at once.
 */
export function headlineHtml(r: Reading): string {
  if (!r.hasModel) {
    // The second half is read from the document's own `security` blocks, and it is the sharpest
    // sentence this page can say about a stranger's API: a token proves who you are, not that you
    // may. Where a document declares no authentication at all, say that instead — it is a bigger
    // finding than the one it replaces.
    const second = !r.declaresSecurity
      ? 'No authentication declared, and no operational controls.'
      : `${r.secured} require a credential — none have operational controls.`;
    return `<p class="text-base font-bold leading-snug"><span class="text-white">${r.named} of ${r.total} endpoints can be named.</span>
      <span class="text-rose-300">${second}</span></p>`;
  }
  // Every endpoint that is not governed is a gap, including the ones we could not name — an endpoint
  // nobody can name is certainly not one anybody is governing. Counting only the named ones would
  // put two numbers on screen that do not subtract to each other.
  const without = r.total - r.governed;

  // On the visitor's own document the remainder is "not yet", not "a finding" — the same distinction
  // the row tones make. Calling it a gap would claim we had audited their estate and found holes,
  // when all we have seen is what they have typed into this panel in the last minute.
  if (r.editable) {
    return `<p class="text-base font-bold leading-snug"><span class="text-white">${r.governed} of ${r.total} endpoints have controls.</span>
      <span class="text-slate-300">${without} still don't.</span></p>`;
  }

  return `<p class="text-base font-bold leading-snug"><span class="text-white">${r.governed} of ${r.total} endpoints are governed.</span>
    <span class="text-rose-300">${without === 0 ? 'No gaps.' : `${without} ${without === 1 ? 'gap' : 'gaps'}.`}</span></p>`;
}
