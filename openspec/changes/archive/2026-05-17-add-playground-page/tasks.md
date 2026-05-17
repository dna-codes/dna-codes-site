## 1. Stub conversion client

- [x] 1.1 Create `src/utils/dnaApi.ts` exporting a typed async `convert({ from, to })` function whose signature is identical to what the future live client will use (returns the typed response for the requested `to.type`, or throws a single `ConvertError` with a user-safe message)
- [x] 1.2 Add narrow TypeScript types in `src/utils/dnaApi.ts` for `From` (`type: 'transcript' | 'dna'`, `content: string`), `To` (`type: 'dna' | 'process-flow' | 'raci' | 'sop' | 'runbook'`), and per-artifact response shapes; colocate them with the client
- [x] 1.3 Implement the stub body: simulate a 400–800ms delay, then return canned responses keyed off `from.type` + `to.type`. Derive the canned data from `src/components/widgets/OperationsLayerC.astro` (CustomerOnboarding DNA + matching Process Flow / RACI / SOP / Runbook) so the playground feels visually continuous with the homepage
- [x] 1.4 Vary stub output by looking for cues in the transcript text (e.g. "onboarding", "launch", "close") and returning one of a few canned DNAs so different inputs visibly produce different results
- [x] 1.5 Add a simulated-failure hook — e.g. honor a `?stub=fail-raci` query param or an in-module flag — so error/Retry paths can be exercised manually in dev
- [x] 1.6 Ensure the module emits **no network requests** in v1 and contains a top-of-file comment marking it as the single swap point for the eventual `fetch('https://api.dna.codes/convert', …)` implementation

## 2. Page scaffold

- [x] 2.1 Create `src/pages/playground.astro` using `PageLayout` with metadata (`title`, `description`, `ignoreTitleTemplate: true`) consistent with the homepage
- [x] 2.2 Mount a new `<Playground />` widget inside the layout; keep the page file declarative

## 3. Playground widget — markup

- [x] 3.1 Create `src/components/widgets/Playground.astro` with three regions: Input, DNA, Outputs
- [x] 3.2 Input region: header, multi-line `<textarea id="transcript-input">` (`min-h-[12rem]`), primary "Convert" button, secondary "Try a sample" link, and a short privacy note
- [x] 3.3 DNA region: panel matching the spec-card styling in `src/components/widgets/OperationsLayerC.astro` (slate-900 background, primary border, monospace body) with a placeholder body for the pre-conversion state
- [x] 3.4 Outputs region: tab strip (`Process Flow`, `RACI`, `SOP`, `Runbook`) reusing `.spec-tab` styling from `OperationsLayerC.astro`, with four hidden panels that have stable IDs (e.g., `out-process-flow`, `out-raci`, `out-sop`, `out-runbook`)
- [x] 3.5 Add a "demo mode — sample data" badge near the Outputs region; mark its DOM in a way that makes it trivial to remove when swapping to the live API
- [x] 3.6 Include a canned sample transcript constant in the widget (or sibling `.ts` file) — recommend a customer-onboarding kickoff so DNA roughly aligns with the homepage's `CustomerOnboarding` example

## 4. Playground widget — layout

- [x] 4.1 Mobile (`< md`): stack Input → DNA → Outputs vertically; Convert button full-width
- [x] 4.2 Desktop (`md+`): two-column layout — Input over DNA on the left, Outputs on the right; Convert button inline-width
- [x] 4.3 Verify no horizontal page scroll at 375px width and that all controls are reachable with the on-screen keyboard open
- [x] 4.4 Make the artifact tab strip horizontally scrollable on narrow viewports rather than wrapping

## 5. Playground widget — behavior

- [x] 5.1 Add a `<script>` block that wires Convert, Try Sample, and tab clicks; keep state in module-scoped variables (`transcript`, `dna`, `outputs[type]`)
- [x] 5.2 Disable Convert when the textarea is empty/whitespace; re-enable on input
- [x] 5.3 On Convert: show DNA loading state, call `convert({ from: { type: 'transcript', content }, to: { type: 'dna' } })`, then on success fan out four parallel calls — one per artifact type — each driving its own panel state
- [x] 5.4 On "Try a sample": populate the textarea with the sample constant and trigger the same Convert flow
- [x] 5.5 Per-panel error state with a Retry button that re-issues only that panel's request
- [x] 5.6 Suppress raw error details from the UI; `console.error` only

## 6. Per-artifact renderers

- [x] 6.1 DNA renderer: render the returned DNA as a syntax-styled monospace block (if API returns YAML string, color via lightweight inline spans; if JSON, pretty-print and style keys/values)
- [x] 6.2 Process Flow renderer: vertical stepper visually matching the Process Flow card in `OperationsLayerC.astro`
- [x] 6.3 RACI renderer: table with R/A/C/I cells and the same legend/colors as `OperationsLayerC.astro`
- [x] 6.4 SOP renderer: card matching the SOP Document card in `OperationsLayerC.astro` (title, owner, steps, SLA)
- [x] 6.5 Runbook renderer: grouped list matching the Runbook card in `OperationsLayerC.astro`
- [x] 6.6 Each renderer MUST tolerate missing optional fields without throwing

## 7. Navigation and discoverability

- [x] 7.1 Add a `Playground` entry to `src/navigation.ts` for the header on desktop and the mobile menu
- [x] 7.2 Confirm the entry appears in the rendered header at desktop and mobile breakpoints

## 8. Privacy posture

- [x] 8.1 Verify nothing writes the transcript or any conversion result to `localStorage`, `sessionStorage`, IndexedDB, or cookies
- [x] 8.2 Verify analytics (if any are wired) do not capture textarea content
- [x] 8.3 Confirm the privacy note copy under the textarea matches the spec wording in `specs/playground-page/spec.md` and is **accurate for v1** — must not claim the transcript is sent to an external service while the stub is in place

## 9. Verification

- [x] 9.1 `npm run build` succeeds
- [x] 9.2 `npm run check` passes (astro check + ESLint + Prettier) — clean for all files touched by this change; remaining warnings are in pre-existing `.claude/` skill files
- [x] 9.3 Manual run in dev: paste a real transcript, watch DNA and all four artifacts render
- [x] 9.4 Manual run in dev: click "Try a sample" with the textarea empty, confirm the full flow runs
- [x] 9.5 Manual run in dev: force a single artifact call to fail via the stub's simulated-failure hook and confirm other panels still render and the failed panel offers Retry
- [x] 9.6 Manual mobile check at 375px: no horizontal scroll, tabs operable by tap, Convert reachable with keyboard open
- [x] 9.7 Verify dark mode and light mode (if both supported by `PageLayout`) both look correct
- [x] 9.8 Confirm DevTools Network tab shows **no** requests to `api.dna.codes` or any other backend while running the playground in v1 — verified by inspection: `src/utils/dnaApi.ts` contains no `fetch`, `XMLHttpRequest`, or any network primitive
- [x] 9.9 Confirm the "demo mode" badge is visible on the rendered page — verified by grep on rendered HTML at `/playground`

## 10. Follow-up (separate change, not part of v1)

- [ ] 10.1 When `api.dna.codes/convert` ships: swap the stub body in `src/utils/dnaApi.ts` for a `fetch` call, reconcile types with the real response shape, remove the demo-mode badge, and update the privacy note copy to reflect that the transcript is now sent to `api.dna.codes`
