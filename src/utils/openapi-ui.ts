// Row chrome for the API Operations visuals.
//
// **Three tones, and they mean one thing each.**
//
//   ok        a rule governs this
//   none      nothing governs this, and nobody has claimed otherwise
//   gap       nothing governs this, and that is a finding
//
// The difference between `none` and `gap` is whether there is a model to have a gap *in*. A bundled
// sample has one, so an ungoverned endpoint there is a real finding and earns red. A document a
// visitor pasted does not: the only controls that exist for it are the ones they add in the panel,
// so an endpoint they have not reached yet is uncontrolled, not damning. Painting those red would be
// asserting something about their estate we have not checked.
//
// This distinction was added after the panel was reported to "turn a lot of endpoints from green to
// red" when the first control was applied. It did — every unassigned row flipped the moment the
// governance map stopped being null. The colour was the symptom; the cause was that `none` and `gap`
// were the same state.
//
// An earlier version used Swagger's method palette — blue GET, green POST, orange PUT, red DELETE.
// Recognisable, and that was the problem: five hues carrying information the reader does not need
// here, competing with the one that matters. A red DELETE row beside a red *ungoverned* row is a
// page where red means two things, which is a page where red means nothing.

export type Tone = 'ok' | 'none' | 'gap';

/** `--aw-color-primary`, as a hex literal because these are inline styles rather than classes. */
export const PRIMARY = '#0d9488';

/** rose-500. The site already spends this family on absence — the Overlay's ungoverned rows do too. */
export const GAP = '#f43f5e';

/** slate-500. Present, unremarkable, not a verdict. */
export const NONE = '#64748b';

const COLOR: Record<Tone, string> = { ok: PRIMARY, none: NONE, gap: GAP };

/** The tinted, left-barred block. */
export function rowStyle(tone: Tone = 'ok'): string {
  const c = COLOR[tone];
  return `background:${c}14;border:1px solid ${c}${tone === 'gap' ? '55' : '38'};border-left:4px solid ${c}`;
}

export function pillStyle(tone: Tone = 'ok'): string {
  return `background:${COLOR[tone]}`;
}
