# Add Lenses reference to /docs

## Why

`dna-core` now ships the **Lens** as a first-class DNA metamodel concept — a named graph pattern (typed node slots + directed edges + an optional human-readable sentence) that governs both querying the graph and asserting bindings into it. Six core lenses ship with the package, but the docs site has no surface for them: the `/docs` Reference covers only the per-layer primitives. Readers can't learn what a Lens is, see the LensType contract, or browse the core lenses.

The existing `add-docs-section` change explicitly deferred lenses (decision D8) because the then-exploratory `dna/docs/concepts/` work had diverged from the DSL. That justification no longer holds — lenses are now defined in the DSL itself (`@dna-codes/dna-core`, LensType base at `https://dna.codes/lenses/base`), with the dna repo's `add-lenses-package` change as the upstream source of truth. This change reverses D8 and brings the now-canonical Lens concept into the docs.

## What Changes

- **NEW** `/docs/lenses` page — explains the Lens concept (named graph pattern, query + command directions, the node/edge/sentence model) and renders the six core lenses that ship with `dna-core`, generated from their JSON definitions at build time.
- **NEW** A `LensSection` docs component (lenses don't fit `PrimitiveSection`, which renders JSON-Schema `properties`/`examples`). It renders a lens's name, its `sentence` with `{{slot}}` markers highlighted, a node-slot table (slot · ResourceType), and an edge table (from → to · via RelationshipType). Layer lenses (nodes, zero edges) render as a grouped type list.
- **NEW** Lens-doc helpers in `src/utils/` (or extensions to `schema-doc.ts`) to extract the docs-friendly view from a lens definition (slots, edges, sentence parts).
- **MODIFIED** `src/components/docs/Sidebar.astro` — add a Lenses entry so the page is reachable; expands inline to the per-lens anchors when on the page.
- **MODIFIED** schema sourcing — lens JSON is pulled from the published npm package (consistent with the "npm only, never a sibling checkout" rule). Source resolution is a design decision (see design.md): either add `@dna-codes/dna-core` as a dependency with a new alias to its `lenses/` dir, or consume lenses once they are folded into `@dna-codes/dna-schemas`. `astro.config.ts` / `tsconfig.json` gain the corresponding alias.
- **MODIFIED** the `generate-docs` skill — document that the Lenses page imports lens definitions by hand (same as the per-layer reference pages), so an added/removed/renamed core lens requires a page edit.

**Out of scope** (deferred):

- Domain-specific lenses declared inside a DNA document's `lenses:` block — the page documents the _core_ lenses and the LensType contract, not user-authored lenses.
- Any interactive lens visualizer / graph rendering — node and edge **tables** for v1; a visual diagram can follow.
- Lens query/command _execution_ semantics beyond explaining the two directions — there is no runtime to demo.

## Capabilities

### New Capabilities

- `lens-reference`: a `/docs/lenses` page that documents the Lens metamodel concept and renders the core lens definitions (layer lenses and subgraph/traversal lenses) generated from their npm-sourced JSON, with a dedicated lens-rendering component and sidebar entry.

### Modified Capabilities

<!-- None. The docs-section and navigation capabilities from add-docs-section are not yet archived specs, so this change does not edit committed requirements; the sidebar/nav touches are implementation impact, captured below. -->

## Impact

- **`dna-codes-site` build**: gains lens JSON imports at build time and a new npm-resolved alias for the lens source. If `@dna-codes/dna-core` is chosen as the source, it joins `@dna-codes/dna-schemas` in `package.json` (note: only its `lenses/*.json` files are imported — the JS runtime/ajv is never loaded by the build).
- **Docs IA**: the Reference area of `/docs` grows from three per-layer pages to also include a cross-cutting Lenses page; the sidebar gains one entry.
- **`generate-docs` skill**: its reconciliation step must now also cover the set of core lenses, not just the per-layer schema set.
- **Readers**: a canonical explanation of Lenses on `dna.codes/docs/lenses`, kept in sync with the shipped definitions by build-time generation.
