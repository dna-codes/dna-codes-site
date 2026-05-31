## Context

The `/docs` Reference (built by `add-docs-section`) is schema-driven: each per-layer page (`operational`, `product`, `technical`) imports primitive JSON Schemas from the published `@dna-codes/dna-schemas` package via the `~schemas` alias and renders them with `PrimitiveSection`. The governing rule is **npm only, never a sibling checkout** (enforced by the `generate-docs` skill, which also verifies the lockfile resolves from `registry.npmjs.org`).

Lenses are a different shape than primitives and a different source. A Lens definition is `{ name, nodes[], edges[], sentence? }` composing the LensType base (`https://dna.codes/lenses/base`) — not a JSON Schema with `properties`/`examples`. The six core lenses ship inside **`@dna-codes/dna-core`** under `lenses/` (in that package's published `files`), exported as `lenses` / `allLenses()`. They are **not** in `@dna-codes/dna-schemas` today (which ships only `operational`, `product`, `technical`, `README`).

This change adds a single `/docs/lenses` page, a lens-specific rendering component, and the alias/dependency wiring to pull lens JSON from npm. It reverses decision D8 of `add-docs-section` (which dropped lenses while they were exploratory) now that the Lens is first-class in the DSL.

## Goals / Non-Goals

**Goals:**

- A canonical `/docs/lenses` page explaining the Lens concept and rendering the six core lenses, generated from their JSON definitions at build time (no hand-transcription of nodes/edges/sentences).
- Source lens JSON from a published npm package, consistent with the existing "npm only" rule.
- A rendering component that fits a lens (sentence + node-slot table + edge table; layer lenses degrade to a grouped type list) rather than forcing the primitive-shaped `PrimitiveSection`.
- Keep the static build self-contained — import JSON, never execute the lens package's JS.

**Non-Goals:**

- Domain-specific lenses authored inside a DNA document's `lenses:` block (this page covers the _core_ lenses + the contract).
- An interactive graph/diagram visualizer (tables for v1).
- Lens execution semantics beyond explaining query vs. command directions (no runtime to demo).
- Reworking the per-layer reference pages.

## Decisions

### D1 — Source lens JSON from `@dna-codes/dna-core`, JSON-only, via a `~lenses` alias

Add `@dna-codes/dna-core` as a dependency and add a `~lenses` alias (in `astro.config.ts` and `tsconfig.json`) resolving to `node_modules/@dna-codes/dna-core/lenses`. The page imports `~lenses/access-control.json`, etc. — exactly mirroring how the layer pages import `~schemas/operational/resource.json`.

- **Why:** It is the only path that satisfies "npm only" **today** — the core lenses are published in `dna-core`'s `lenses/` dir right now. Importing JSON files does not load the package's JS entry point or its `ajv`/`ajv-formats` deps, so the static build stays self-contained (the requirement "build does not load a JS runtime for lenses").
- **Alternatives considered:**
  - _Wait for lenses in `@dna-codes/dna-schemas`_ and reuse the `~schemas` alias. Cleanest long-term (one alias, one "schemas/lenses" source), but blocked on an upstream packaging change that does not exist yet. Rejected for v1; revisit and migrate the alias if/when `dna-schemas` absorbs lenses (see Open Questions).
  - _A dedicated `@dna-codes/dna-lenses` package_ (named in the dna repo's `add-lenses-package` proposal). Not built — the implementation shipped lenses inside `dna-core` instead. Rejected as nonexistent.
  - _Vendor/copy the lens JSON into the site repo._ Violates the npm-only rule and reintroduces drift. Rejected.

### D2 — New `LensSection` component, do not reuse `PrimitiveSection`

`PrimitiveSection` renders `description` + a `FieldsTable` over JSON-Schema `properties` + a JSON `example`. A lens has none of those. Add `src/components/docs/LensSection.astro` that renders: the lens `name` as an `H3` anchor; the `sentence` with `{{slot}}` markers highlighted (each marker styled and tied to its slot); a **node-slot table** (slot · ResourceType); and an **edge table** (from → to · via RelationshipType). When `edges` is empty, omit the edge table and render the nodes as a grouped type list (the layer-lens case).

- **Why:** A lens is structurally distinct; bending `PrimitiveSection` to fit would degrade both. The sentence/slots/edges presentation is the natural reading of the pattern.
- **Alternative:** Generalize `PrimitiveSection` to also handle lenses. Rejected — it couples two unrelated shapes and complicates the primitive pages for no benefit.

### D3 — Lens-doc helpers parallel to `schema-doc.ts`

Add small pure helpers — either a new `src/utils/lens-doc.ts` or an extension of `schema-doc.ts` — to extract the docs view from a raw lens definition: split `sentence` into text + slot tokens, list node slots, list edges, and reuse the existing `slugify()` for anchors. Provide a loose `LensDoc` structural type (mirroring `SchemaDoc`) so the page can type its array of imported JSON.

- **Why:** Keeps the component declarative and matches the existing `schema-doc.ts` separation of extraction from rendering. `slugify()` already exists and gives stable anchors.

### D4 — Page IA: one `/docs/lenses` page, grouped layer vs. subgraph

A single scrollable page (consistent with the per-layer pages' "one scrollable page, anchors for deep links" pattern from `add-docs-section` D1). Structure: concept intro + LensType contract, then two groups — **Layer lenses** (operational, product, technical) and **Subgraph & traversal lenses** (people, access-control, execution). Sidebar anchors derive from the rendered lens list (the `group` field reused by the sidebar exactly as the Operational page groups People/Structures/Activities).

- **Why:** Mirrors the established reference-page shape, so the sidebar's existing grouped-anchor logic works unchanged.

### D5 — Sidebar placement: a top-level "Lenses" entry

Add `Lenses` to `Sidebar.astro`'s `sections` as its own top-level entry (sibling to Getting Started / Reference / Examples / Frameworks), with `href: '/docs/lenses'`, expanding inline to per-lens anchors when active.

- **Why:** A lens is cross-cutting — it spans layers (it references ResourceTypes from any layer) — so nesting it _under_ Reference (which is organized strictly by layer) would misrepresent it. A peer entry reads correctly. Lightweight to revisit if IA feedback says otherwise.

### D6 — `generate-docs` skill covers the core lens set

Extend the `generate-docs` skill so its reconciliation step also diffs the set of core lenses (`node_modules/@dna-codes/dna-core/lenses/*.json`) against what `/docs/lenses` imports, the same way it diffs the per-layer schema set. The page lists its lenses by hand, so an added/removed/renamed lens requires a page edit; the skill must catch that.

## Risks / Trade-offs

- **Adding `@dna-codes/dna-core` pulls a heavier dependency (ajv, ajv-formats) into the tree.** → Only its `lenses/*.json` files are imported; the JS entry point and its transitive runtime deps are never bundled into the static output. A build-time check (and the spec's self-contained-build scenario) guards this.
- **Two sources for one Reference area (`dna-schemas` for primitives, `dna-core` for lenses).** → Documented in the `generate-docs` skill; the `~lenses` alias is isolated so a future migration to a single source is a one-line alias change. Tracked in Open Questions.
- **Anchor stability across lens renames.** → Same trade-off accepted for primitives in `add-docs-section` (O4): anchors derive from the lens name; a rename breaks deep links. Acceptable pre-1.0.
- **`dna-core` and `dna-schemas` version skew** (core's installed `dna-schemas` peer may differ from the site's). → The site only reads `dna-core`'s static lens JSON, which doesn't depend on the schema version at read time; pin `dna-core` explicitly in `package.json` and verify the lockfile resolves from the registry (reuse the `generate-docs` lockfile check).

## Open Questions

- **O1 — Long-term source.** Should the core lenses be folded into `@dna-codes/dna-schemas` so the site has one schema/lens source and one alias? If so, this change's `~lenses` alias migrates to `~schemas/lenses/*` and the `dna-core` dependency drops. Pending an upstream decision in the dna repo.
- **O2 — Pinned `dna-core` version.** Which published `@dna-codes/dna-core` version to depend on (the lenses landed around 0.11.0). Resolve when wiring the dependency; verify the target version's published tarball actually contains `lenses/*.json`.
- **O3 — Visual diagram.** A small node/edge diagram per subgraph lens would aid comprehension. Deferred; tables ship first.
