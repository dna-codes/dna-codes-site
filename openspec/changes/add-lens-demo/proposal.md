# Add an interactive lens demo to the homepage

## Why

The strongest story DNA has is **"one model, many views"**: describe a business once, and a _lens_ projects that single graph into an org chart, a process diagram, a product skeleton — views that can't drift because they're all reads of the same document. Today the homepage only _tells_ this. The live below-hero section (`OperationsLayerC`) walks through **Collect → Structure → Execute**, but the payoff is asserted in prose — a visitor never _sees_ that "Structure" produces something real.

Lenses are now first-class (shipped in `@dna-codes/dna-core`, documented at `/docs/lenses`), so we can finally _show_ it. Rendering one realistic DNA document as both an **org chart** and a **process diagram** — one click apart — is the visual proof of the thesis, and it doubles as the trailer for the Playground (the real product surface). It also makes the long-term "map of your entire business" vision credible from day one: the same engine that draws the two operations views will later draw the Product and Technology views as those modules ship.

Near-term audience is **operations leaders**; the demo leads with the two views they care about (org chart, process) and teases Product/Technology as coming.

## What Changes

- **NEW** An interactive, client-side lens demo on the homepage: a tab/toggle that re-renders **one sample operational DNA document** through different lenses — **Org chart** (People lens) and **Process** (Execution lens) live; **Product** and **Technology** shown as dimmed "coming" tabs.
- **NEW** A diagram-rendering component for the demo. The existing `LensSection` renders a lens as _tables_ for the docs; the homepage needs _diagrams_ (an org/role tree and a process flow). This is a new visual component, not a reuse of `LensSection`.
- **NEW** A small, realistic sample operational DNA document (static JSON in `src/`) that validates and is rich enough to render both views meaningfully (people + roles/groups + a process with tasks/triggers).
- **NEW** An idle auto-cycle between the two live views (the subtle "there's more than one view" signal), fully interruptible by interaction and disabled under `prefers-reduced-motion`.
- **MODIFIED** `OperationsLayerC` (or the homepage section composition) — the **Collect → Structure** narrative spine is kept; its final "payoff" beat becomes the live lens switcher instead of prose. (In-place evolution vs. a separate A/B section is a design decision — see design.md.)
- **NEW** An inline section CTA — **"Build your own → /playground"** — making the demo the on-ramp to the Playground.

**Out of scope** (deferred):

- Rendering the **Product** and **Technology** lens diagrams — those tabs are teased/dimmed only until the corresponding modules ship.
- Wiring the demo to the live Playground stub so a visitor's _own_ DNA renders through the lenses — a follow-up phase.
- Lens query/command _execution_ semantics — the demo renders static patterns, it does not execute them.
- Hero changes — the message-led hero stays exactly as is; the demo sits below it.

## Capabilities

### New Capabilities

- `lens-demo`: an interactive homepage marketing section that renders one sample DNA document through multiple lenses as visual diagrams (org chart, process), with ops-first live tabs, teased future-module tabs, idle auto-cycle, and a Playground CTA. Distinct from the docs-oriented `lens-reference` capability (tables, reference content).

### Modified Capabilities

<!-- None. The homepage/hero and OperationsLayerC are not committed OpenSpec specs, so this change introduces a new capability rather than editing existing requirements; the section-composition touch is captured in Impact. -->

## Impact

- **Homepage (`src/pages/index.astro`)**: the below-hero section gains the interactive demo; the Collect → Structure spine is preserved, its payoff upgraded. Hero and bottom CTA unchanged. CTAs stay **Playground + Docs** (no waitlist).
- **New components + data**: a diagram component (and any small sub-parts) plus a sample-DNA JSON asset in `src/`.
- **Reuses existing building blocks** from `add-lenses-reference`: the `~lenses` alias (npm-only lens JSON), and `src/utils/lens-doc.ts` helpers (`LensDoc`, `parseSentence`, `lensNodes`, `lensEdges`). No new dependency if diagrams are hand-rolled SVG (the recommended approach).
- **Performance/UX**: client-side only, no backend; must respect `prefers-reduced-motion` and stay lightweight (the homepage is the most-visited page).
- **Sets up future phases**: the same demo becomes the surface that lights up Product/Technology lens tabs and connects to the Playground as those land.
