## Why

Visitors land on dna.codes, read the pitch ("transcript → DNA → any artifact"), and have no way to feel the product before joining the waitlist. A `/playground` page lets them paste a real transcript and watch it become a DNA spec plus the same outputs teased on the homepage (Process Flow, RACI, SOP, Runbook). It converts curiosity into a tangible "I get it" moment and gives the team a live demo surface to share in conversations, on social, and in sales calls — well before the full product ships.

## What Changes

- Add a new route `src/pages/playground.astro` reachable at `/playground`.
- Add a `Playground` widget (`src/components/widgets/Playground.astro`) that hosts a three-panel flow:
  1. **Input** — paste-a-transcript textarea with a "Try a sample" affordance and a primary "Convert" action.
  2. **DNA** — the generated DNA spec (YAML-style, syntax-highlighted), mirroring the look of `OperationsLayerC.astro`'s spec card.
  3. **Outputs** — tabbed views for Process Flow, RACI Matrix, SOP Document, and Runbook, rendered from the DNA result.
- Wire conversion through a single typed client function `convert({ from, to })` that locks in the eventual API contract — `from: { type: "transcript" | "dna", content: … }`, `to: { type: "dna" | "process-flow" | "raci" | "sop" | "runbook" }` — but is implemented as an **in-browser stub** for v1. The stub returns canned responses (with a short simulated delay) keyed off the input so the full UX, including loading and error paths, is exercised end-to-end. Swapping to live `POST https://api.dna.codes/convert` is a single-file change once the API ships.
- Make the layout mobile-first: panels stack vertically on small viewports, become a two- or three-column arrangement on `md+`, with the textarea reachable without horizontal scroll and outputs tab-switchable rather than side-by-side on mobile.
- Add a "Playground" nav entry (header desktop + mobile menu) so the page is discoverable.
- Surface clear UX states: empty, loading, error (API down / rate-limited), and success.
- No auth, no persistence in v1 — input is held in memory only and a privacy line under the textarea makes that explicit.

## Capabilities

### New Capabilities

- `playground-page`: A public, interactive page at `/playground` that converts a pasted transcript into a DNA spec and then into multiple downstream artifact views (Process Flow, RACI, SOP, Runbook) by calling the DNA Codes Convert API. Includes mobile-first layout, sample-transcript seeding, loading/error states, and a no-persistence privacy posture.

### Modified Capabilities

<!-- None — no existing specs in openspec/specs/ to modify. -->

## Impact

- **New files**: `src/pages/playground.astro`, `src/components/widgets/Playground.astro`, and (likely) a small `src/utils/dnaApi.ts` client wrapper for the `api.dna.codes/convert` calls.
- **Modified files**: `src/navigation.ts` (add Playground link to the primary header nav and mobile menu).
- **External dependency**: None at runtime in v1 — the conversion is stubbed in the browser. The real dependency on `https://api.dna.codes/convert` is deferred until the API ships; switching to it is a one-file swap inside `dnaApi.ts`.
- **Build/deploy**: Page is statically rendered by Astro; the stub runs entirely in the browser. No new server routes, no new npm dependencies.
- **Risk**: The stub drifts from the API's eventual response shape. Mitigated by keeping types and request/response shapes defined in `dnaApi.ts` (the same module the live client will use) and revisiting the types the moment the API contract is published.
- **Out of scope (v1)**: Auth, saving runs, sharing links, file upload, multi-process transcripts, editing the DNA before generating outputs, **live API integration**.
