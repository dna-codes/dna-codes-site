## Context

The homepage (`src/pages/index.astro`) is message-led: a hero ("Process docs that keep up with your business", DnaHelix background, Playground/Docs CTAs), then `OperationsLayerC.astro` — a 579-line scroll-revealed narrative in three acts (**01 Collect** sources → **02 Structure** into DNA → **03 Execute**) — then a closing `CallToAction`. `ProductLayer.astro` and `TechnologyLayer.astro` are scaffolded but commented out, staged for when those modules ship. The narrative is strong but its payoff is _told_: the visitor never sees that "Structure" yields something real.

Lenses (shipped in `@dna-codes/dna-core`, documented at `/docs/lenses`) let us _show_ it: render one sample DNA document as an org chart and a process diagram, one click apart. This change adds that interactive demo as the payoff of the existing narrative, ops-first, with Product/Technology teased. It reuses the lens plumbing from `add-lenses-reference` (the `~lenses` alias, `src/utils/lens-doc.ts`) but needs new _diagram_ rendering — `LensSection` only renders tables.

## Goals / Non-Goals

**Goals:**

- Make "one model, many views" _visible_: the same sample DNA rendered as an org chart and a process flow, switchable in one click.
- Lead with the two views operations leaders care about; tease Product/Technology so the whole-business vision is credible without overpromising.
- Preserve the Collect → Structure narrative; the demo is its payoff, not a replacement.
- Stay lightweight and client-side; respect `prefers-reduced-motion`; keep CTAs as Playground + Docs.
- Reuse existing lens plumbing; add a dependency only if clearly justified.

**Non-Goals:**

- Rendering Product/Technology diagrams (teased tabs only until those modules ship).
- Connecting the demo to the live Playground stub so a visitor's own DNA renders (follow-up phase).
- Executing lens query/command semantics — the demo draws static patterns.
- Touching the hero.

## Decisions

### D1 — A new diagram component; do not reuse `LensSection`

`LensSection.astro` renders a lens as node/edge **tables** — right for docs, wrong for a marketing demo. Add a new homepage demo component (working name `LensDemo.astro`) that renders **diagrams**: the Org chart view as a people/role/group tree, the Process view as a left-to-right (or top-down) task flow with triggers. It owns the tab state, the auto-cycle, and the CTA.

- **Why:** The two presentations have nothing in common visually; sharing a component would help neither.
- **Reuse:** It still consumes `src/utils/lens-doc.ts` (`LensDoc`, `parseSentence`, `lensNodes`, `lensEdges`) to read the lens definitions, and imports `people.json` / `execution.json` via `~lenses` — the lens defines _which_ nodes/edges to pull from the sample DNA.

### D2 — Hand-rolled SVG/HTML rendering, no graph library (O1)

Render the two ops diagrams with hand-authored SVG/HTML + Tailwind, not a graph/flow library.

- **Why:** Both views are small and structurally simple (an org tree of a handful of roles/people; a linear-ish process of a few tasks). A layout library (d3, dagre, a flow lib) is a heavy dependency and fights the site's hand-tuned visual style (cf. `DnaHelix`, `OperationsLayerC`). Hand-rolled keeps full brand control and zero new deps, consistent with the site's existing bespoke widgets.
- **Trade-off:** More layout code by hand, and it doesn't auto-scale to arbitrary graphs. Acceptable because the sample DNA is fixed and small. **Revisit (O1)** if/when the Product/Technology views need richer auto-layout — at that point a small layout lib may earn its place.
- **Alternative considered:** a flow/graph lib for "free" layout — rejected for v1 on dependency weight and styling friction.

### D3 — Standalone framed section between hero and steps (O2) — REVISED

**Decided during implementation (reverses the original in-place plan):** the demo ships as its own lightly-framed section placed directly **between the hero and the `OperationsLayerC` steps**, with a short intuitive headline ("One model. Every view."). `OperationsLayerC` is left fully intact — including its original Act 3 "Generate" output cards.

- **Why the change:** the in-place edit (folding the demo into Act 3) buried the demo three scroll-steps down and removed the well-liked "Generate" artifact cards. The product owner wanted the demo as a simple, intuitive framing bridge right under the hero — and to keep step 3 as it was. A standalone section reads as the thesis statement before the how-it-works steps, rather than competing with them.
- **Original plan (rejected):** fold the demo into Act 3, replacing the prose/cards payoff. Rejected on placement (too deep) and because it sacrificed liked content.
- **Implementation:** the section lives in `src/pages/index.astro` between `<Hero>` and `<OperationsLayerC />`; `OperationsLayerC.astro` is unchanged.

### D4 — Sample DNA: one small, realistic, valid operational document

Author a single sample operational DNA JSON in `src/` (working location `src/data/lens-demo-sample.json` or a `src/content`/util module). It needs enough to make both views meaningful: a handful of **People/Roles/Groups + Memberships** (for the org chart) and one **Process with Tasks + a Trigger** (for the flow), in a recognizable domain (e.g. lending or hiring).

- **Why:** A single source proves the thesis — switching views changes the lens, not the data. Keeping it small keeps the hand-rolled layout tractable and the page fast.
- **Validation:** It SHALL validate as operational DNA. Since the site doesn't depend on `dna-core`'s validator at runtime, validate it at authoring time (e.g. a one-off check against the schemas / `DnaValidator`) and keep it as a static asset. The lens definitions (`people`, `execution`) describe which node types and edges each view selects from this document.

### D5 — Interaction model: tabs + idle auto-cycle, accessible

Tabs for Org chart / Process (live) and Product / Technology (dimmed, inert). Idle auto-cycle alternates the two live views; the first interaction cancels it; `prefers-reduced-motion: reduce` disables it. Tabs are real buttons with appropriate ARIA; the demo is fully usable without the auto-cycle.

- **Why:** Auto-cycle gives the "there's more than one view" signal without a busy hero; interaction-yields and reduced-motion keep it from being annoying or inaccessible.

## Risks / Trade-offs

- **Hand-rolled diagrams drift from real lens semantics.** → The views are _driven by_ the lens definitions (`people.json` / `execution.json` node & edge sets) read through `lens-doc.ts`, not by ad-hoc hardcoding, so they stay honest to what a lens selects. Layout is bespoke; the _selection_ is lens-derived.
- **Page weight on the most-visited page.** → No new dependency (D2), client-side only, small fixed sample. Auto-cycle is cheap and motion-gated.
- **Sample DNA going stale vs. evolving schemas.** → It's a fixed marketing asset, not generated; validate at authoring time and re-check if schemas make a breaking change. Lower stakes than the docs reference pages, which are generated.
- **Losing the current section's A/B baseline by editing in place (D3).** → If measurement matters, ship standalone first (the documented O2 alternative) and merge after.

## Open Questions

- **O1 — Rendering tech if views grow.** Hand-rolled SVG is right for the two simple ops views; revisit a small layout library when Product/Technology (denser graphs) need rendering.
- **O2 — In-place vs. A/B.** Default is in-place evolution of `OperationsLayerC` (D3). If the team wants to measure lift, ship the demo as a standalone section first and merge later.
- **O3 — Sample domain.** Lending vs. hiring vs. another recognizable ops domain — pick the one whose org chart and process read most instantly to an operations leader.
- **O4 — Exact host beat in `OperationsLayerC`.** Confirm which act/markup block the demo replaces when applying (the file is long; the Collect/Structure intro stays, the payoff beat is the target).
