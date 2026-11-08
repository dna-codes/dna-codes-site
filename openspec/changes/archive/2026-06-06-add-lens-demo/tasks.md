# Tasks — add-lens-demo

## 1. Sample DNA document

- [x] 1.1 Author a small, realistic operational DNA sample (working path `src/data/lens-demo-sample.json`) in a recognizable domain (decide lending vs. hiring per design O3): a handful of People/Roles/Groups + Memberships, and one Process with Tasks + a Trigger
- [x] 1.2 Validate it as operational DNA at authoring time (check against `@dna-codes/dna-core`'s `DnaValidator` / the schemas); keep the validated JSON as a static asset
- [x] 1.3 Add a typed accessor/import for the sample so the component reads it without re-validating at runtime

## 2. Diagram rendering component

- [x] 2.1 Create `src/components/widgets/LensDemo.astro` — owns tab state, the two live views, the teased tabs, the auto-cycle, and the CTA
- [x] 2.2 Org chart view — render People/Role/Group/Membership from the sample as a connected SVG/HTML diagram (hand-rolled per design D2), with the selection driven by the People lens (`~lenses/people.json` via `lens-doc.ts`), not hardcoded
- [x] 2.3 Process view — render Process/Task/Trigger from the sample as a flow diagram, selection driven by the Execution lens (`~lenses/execution.json`)
- [x] 2.4 Style both views on-brand (match `OperationsLayerC` / `DnaHelix` visual language: primary accent, slate surfaces, rounded cards)

## 3. Tabs, auto-cycle, accessibility

- [x] 3.1 Render three live, selectable tabs — Org chart, Process flow, Runbook (real buttons, ARIA selected/controls). (Revised: the teased Product/Technology tabs were dropped in favor of three simple live views — see design D3.)
- [x] 3.2 Idle auto-cycle advancing through the three live views (~10s each); first interaction cancels it permanently for the session
- [x] 3.3 Gate the auto-cycle on `prefers-reduced-motion: reduce` (no cycle when reduce is set); demo fully usable via tabs without it
- [x] 3.4 Inline section CTA "Build your own" → `/playground`

## 4. Homepage integration

- [x] 4.1 Place `<LensDemo />` as a standalone framed section in `src/pages/index.astro`, between the hero and `<OperationsLayerC />` (revised from the original in-place plan — see design D3; `OperationsLayerC` left intact, including its Act 3 cards)
- [x] 4.2 Confirm hero and bottom `CallToAction` are unchanged; primary CTAs remain Playground + Docs (no waitlist)

## 5. Verify

- [x] 5.1 `npm run build` succeeds and the homepage emits with the demo
- [x] 5.2 `npm run check` (astro check + ESLint + Prettier) passes
- [x] 5.3 Manually verify: both ops views render as diagrams from the one sample; tab switching works; Product/Technology tabs are inert; auto-cycle runs when idle, stops on interaction, and is off under reduced-motion; CTA routes to `/playground`
- [x] 5.4 Quick responsive/lightweight check — the demo reads on mobile and adds no heavy dependency
