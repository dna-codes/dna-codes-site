# Tasks — add-industry-dna-landing

Ordered so the page is provable before the corpus is expensive: build every renderer against two
genomes (§2–§6), then author the remaining four against a contract that is already proven (§7).

## 1. Industry metadata and the ontology contract

- [x] 1.1 Create `src/data/industries.ts` — one entry per industry with `key`, `name`,
      `valueProp`, `spotlight[]`, and `spotlightReason`. Six keys: `ecommerce`, `healthcare`,
      `ma`, `security`, `financial`, `professional`. M&A and E-commerce value props verbatim per
      design D3.
- [x] 1.2 Define the output-type catalog in the same module — twelve outputs across the three
      layers (design D5), each with `id`, `label`, `layer`, and a one-line description.
- [x] 1.3 Write the authored-genome contract as typed interfaces in `src/utils/genome-types.ts` —
      compact, no UUIDs, no version strings (design D4 as revised).
- [x] 1.4 Write `src/utils/genome-compile.ts` — expands an authored genome into canonical
      Operational, Product, and Technical documents; deterministic UUIDv5-style ids hashed over
      genome key + primitive type + name; `version` stamped from
      `~schemas/operational/versions.json`.
- [x] 1.5 Add `scripts/validate-genomes.mjs` — compiles every genome and validates each document
      with Ajv against `@dna-codes/dna-schemas`, plus the D4 minimum bar and referential integrity
      (task actors resolve to roles, steps resolve to tasks, rules resolve to operations, routes
      resolve to pages, connections resolve to cells). Wire into `npm run build` so an invalid
      genome fails the build.

## 2. First two genomes

- [x] 2.1 Author `src/data/genome/ecommerce.genome.ts` — the operational story behind the existing
      `lens-demo-ecommerce.json` raised to the D4 bar, plus Product (catalog/inventory/order core
      resources with fields and sample values, an API namespace, admin list/detail/action pages)
      and Technical (storefront and fulfillment cells) layers.
- [x] 2.2 Author `src/data/genome/ma.genome.ts` — diligence and valuation: roles (deal lead,
      diligence lead, financial analyst, integration lead), a diligence-to-close process, rules
      covering approval thresholds and disclosure, target/entity/synergy/valuation-model core
      resources, and a data-room technical footprint.
- [x] 2.3 Run the validator against both; fix until clean.
- [x] 2.4 Sanity-read both as a practitioner would: do the roles, steps, and resources describe
      work that industry actually does (spec: names are industry-recognisable)?

## 3. Derivation layer

- [x] 3.1 `src/utils/genome.ts` — loads compiled documents and exposes typed accessors over them.
      Generalise the patterns in `src/utils/lens-demo.ts` **without modifying it**; `/operations`
      must not regress.
- [x] 3.2 Operations view-models: process flow, SOP/runbook, key positions, RACI matrix,
      policies & rules. **Deviation:** these derive straight from the compiled canonical DNA
      (`domain.roles[]`, `processes[].steps[]`, `rules[]`) rather than through the lens JSONs in
      `~lenses/`. Those lenses are written against the flat resource-graph vocabulary the lens
      demo uses (`position`, `fills`, `reports_to`); canonical DNA has no such nodes, so applying
      them here would have meant translating canonical DNA _back_ into the demo's shape purely to
      re-derive what it already states directly. Revisit if the published lenses gain canonical
      bindings.
- [x] 3.3 Product view-models: data model (resources + fields + relationships), screen map
      (routes → pages), example UI (a core resource's fields → table columns and form controls,
      rows from genome-declared sample values), API surface (endpoints grouped by namespace).
- [x] 3.4 Technology view-models: architecture diagram (cells + connections), environment
      topology, access-control matrix.
- [x] 3.5 Unit-check each derivation against both genomes — every view-model non-empty, no
      dangling ids, deterministic ordering.

## 4. `generate()` — the live-API seam

- [x] 4.1 `src/utils/generate.ts` — export `generate({ genome, lenses })` returning artifacts
      keyed by output id, with real loading/error states. In-browser derivation for now; the
      signature is what a network call will take.
- [x] 4.2 Simulated pacing: genome beat, then one beat per lens (~300–500ms), total capped near
      3s regardless of lens count. Collapse to a single state change under
      `prefers-reduced-motion: reduce`.
- [x] 4.3 Per-output error isolation — one failing derivation renders an error card and the rest
      still render.
- [x] 4.4 Demo-mode marker exposed from this module (not hardcoded in components), matching the
      `/playground` posture.

## 5. Industry selector

- [x] 5.1 ~~Export rung geometry from `src/utils/dnaHelix.ts`.~~ **Reverted.** Written and used by
      the per-rung connectors, removed with them (design D2). The shared module ends this change
      byte-identical to how it started — the additions had no second caller.
- [x] 5.2 `src/components/widgets/IndustryHelix.astro` — one prominent listbox labelled
      **Select Model**, each option carrying its industry's value proposition, with the helix
      behind the whole section as background the way the homepage uses it.
- [x] 5.3 Listbox behaviour, hand-rolled because macOS ignores page styles on native option
      popups: `aria-haspopup`/`aria-expanded` on the button, focus held by the listbox with
      `aria-activedescendant`, Up/Down, Home/End, Enter, Escape, Tab-to-close, click-outside, and
      focus returned to the button on close.
- [x] 5.4 Reduced motion: the background strand is a single static frame from
      `renderDnaHelixSvg()`, with no canvas and no animation loop started at all.
- [x] 5.5 The strand is held back to 0.3 opacity under a centre-weighted radial scrim — at full
      strength its nodes ran through the heading. **Contrast still needs a real eye — see §8.**

## 6. Page, acts, and the sticky bar

- [x] 6.1 `src/components/widgets/GenomeBar.astro` — DNA mark linking home, headline region
      ("What's your DNA?" → `<Industry> · <value prop>` with a crossfade), three-dot act
      indicator, persistent **Get Started**. Truncates to the industry name at small widths.
- [x] 6.2 `src/pages/whats-your-dna.astro` — `PageLayout` with `GenomeBar` passed into the named
      `header` slot (site header suppressed, footer retained), three full-height act sections.
- [x] 6.3 `src/components/widgets/LensPicker.astro` — three columns by layer, spotlight
      pre-selection from `industries.ts`, refusal to drop to zero selected, **Go** enabled once an
      industry exists. The spotlight-reason line was built and cut (design D6 as revised).
- [x] 6.4 `src/components/widgets/GenomeGenerator.astro` — one pane with a tab strip that grows
      as the run proceeds (design D7 as revised). Every selected lens gets a pending tab up front
      and fills in as its derivation lands; the pane follows the newest tab until the visitor
      picks one themselves. Closes straight on **Create your DNA** — the artifact-count summary
      was built and cut.
- [x] 6.5 One renderer per output, as pure `(view-model) => string` functions in
      `src/utils/genome-render.ts`. **Deviation from "Astro components under
      `src/components/genome/`":** generation happens in the browser after the visitor chooses, so
      there is no server render pass to put a component in. The hard constraint holds and is worth
      more than the file layout — **no renderer branches on industry and none contains
      industry-specific copy**, enforced by review and by the fact that all six genomes were
      authored (§7) without a single renderer edit.
- [x] 6.6 Act transitions: industry selection scrolls to Act II, **Go** scrolls to Act III; free
      scrolling never blocked, no scroll-jacking, browser back preserved.
- [x] 6.7 Changing the industry after the fact re-seeds the lens picker to the new spotlight set
      and updates the bar.
- [x] 6.8 Add `APP_HREF` to `src/navigation.ts` as the single source for **Get Started** and
      **Create your DNA**, set to `https://app.dna.codes` (open question 1, resolved). The page is
      campaign-only per D10 — do **not** link it from the header, footer, or homepage.
- [x] 6.9 URL state: `?industry=&lenses=` written with `history.replaceState`, restored on load,
      unknown values ignored; the same parameters forwarded to `APP_HREF`.
- [x] 6.10 Lazy-load genomes on industry selection so the initial payload is metadata only.

## 7. Remaining four genomes

- [x] 7.1 `healthcare.genome.ts` — care pathway (intake → triage → diagnose → order → discharge),
      clinical and administrative roles, consent/privacy/escalation rules, patient/encounter/
      order/care-plan core resources.
- [x] 7.2 `security.genome.ts` — control framework mapped to the operations it governs: control,
      evidence, finding, exception core resources; an evidence-collection-to-attestation process;
      approval and segregation-of-duty rules.
- [x] 7.3 `financial.genome.ts` — product, application, approval authority, and the exposure they
      create; an origination-to-servicing process; limit and delegation rules.
- [x] 7.4 `professional.genome.ts` — engagement, staffing, deliverable, and utilisation; a
      scope-to-invoice process; staffing and change-order rules.
- [x] 7.5 Validator clean on all six. Coverage is no longer a spot-check: a fourth validator
      pass derives **and renders every one of the twelve outputs for every genome on every
      build** (72 artifacts), failing if any produces an empty view-model or no markup.
- [x] 7.6 Confirm no renderer changed during §7 — none did, which is the industry-agnostic
      constraint holding under real pressure.
- [x] 7.7 Ground every genome in its industry's published vocabulary and declare it (design D4a):
      FHIR R4/LOINC/ICD-10 for the clinic, FIBO/BIAN/Basel III/ISO 20022 for the bank, SOC 2
      TSC/NIST 800-53/OSCAL for the auditor, GS1/EDI X12 for the retailer, ASC 805/QoE for the
      acquirer, PMBOK/SOW for the practice. Surface the list under the generated artifacts.
- [x] 7.8 Add the `distinctness` validator pass — fails the build when any non-CRUD name is shared
      by 3+ genomes, or a genome declares fewer than 2 vocabularies. Verified by deliberately
      introducing a shared provider and watching the build fail, then reverting.

## 8. Verify

> **Not verified: anything requiring a real browser.** No headless browser is available in this
> environment (no Playwright, no Puppeteer), so 8.3, 8.4, 8.5, and 8.7 are unchecked and need a
> human pass. Everything asserted below them was verified headlessly — build, checks, emitted
> markup, bundle contents, and all 72 artifacts rendering — but nobody has watched a run build up
> the tab strip, driven the listbox by keyboard, or opened the page at 375px.
>
> **Two pieces carry the most risk, both hand-rolled to replace native behaviour:** the Act I
> listbox (§5.3) and the Act III tab strip (§6.4). Keyboard interaction, focus return, and
> `aria-activedescendant` are exactly the things that look fine and are not. Drive both with the
> mouse unplugged before this ships.

- [x] 8.1 `npm run build` succeeds and emits `/whats-your-dna`; genome validation runs in the
      build.
- [x] 8.2 `npm run check` passes (astro check + ESLint + Prettier).
- [ ] 8.3 Walk all three acts for at least three industries: selection, header update, spotlight
      pre-selection, Go, paced generation, artifact correctness, terminal CTA with query
      parameters.
- [ ] 8.4 Accessibility pass: keyboard-only completion of all three acts, focus visible and
      sensibly ordered across act transitions, selected states announced, reduced-motion honoured
      in both the helix and the generation sequence.
- [ ] 8.5 Mobile pass at 375px: three acts usable, sticky bar readable, every artifact readable or
      scrollable in its own container.
- [x] 8.6 Regression: homepage, `/operations`, `/overlay`, `/agent-operations`, and
      `/pricing` verified byte-identical to a pre-change build once content-hashed asset
      filenames are normalised. The shared `Layout` CSS grows ~3.5KB (+2.3%) on every page from
      Tailwind picking up the new components' utility classes; the artifact CSS (14KB) is
      page-scoped to `/whats-your-dna` and does not touch the shared bundle.
- [ ] 8.7 Deep-link pass: share a configured URL, open it cold, confirm the state restores; open
      one with a garbage industry key and confirm it degrades quietly.
- [x] 8.8 Confirm the demo-mode marker and the named genome are visible wherever artifacts are.
