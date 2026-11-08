# Add docs section at /docs

## Why

`dna.codes` is currently a landing/marketing site. The DNA project's documentation lives across three places — the main `dna/README.md`, `dna/docs/frameworks/*.md`, and an aspirational `dna/docs/concepts/` directory authored in a separate session — but there is no canonical reader-facing docs surface. The original plan in `navigation.ts` was a separate `docs.dna.codes` subdomain (the commented-out links still hint at it); we are pulling the docs into this site at `/docs` for v1 to ship sooner and consolidate the docs experience.

The reference content (one section per DSL primitive) must stay synchronized with `@dna-codes/dna-schemas` — the JSON Schemas are the canonical source of truth for what DNA can express, and their `description` / `properties` / `examples` fields are already documentation-grade. Any hand-authoring would drift the moment a schema changes.

## What Changes

- **NEW** `/docs` section with 7 pages: a landing, Getting Started, three layer-reference pages (Operational / Product / Technical), Examples, and Frameworks.
- **NEW** Generated reference pages — `/docs/operational`, `/docs/product`, `/docs/technical` import schemas from `@dna-codes/dna-schemas` at build time and render one section per primitive using a shared `PrimitiveSection` component. No hand-written field tables.
- **NEW** Sidebar nav component (pattern "sidebar IS the TOC") — top-level nav has 4 entries (Getting Started, Reference, Examples, Frameworks); Reference expands to show the current layer's primitive anchors when on a layer page.
- **NEW** Hand-authored content for the buckets schemas can't generate: landing page (4-card teaser grid), Getting Started (welcome + quickstart + walkthrough), Examples (one section per cross-domain example from `dna/examples/*`), Frameworks (port the six markdown files in `dna/docs/frameworks/*` as canonical here).
- **MODIFIED** `src/content.config.ts` — add a `docs` content collection for the hand-authored buckets.
- **MODIFIED** `astro.config.ts` — add a path alias `~/schemas` pointing at `dna-codes/dna/packages/schemas` for local dev. Production switches to the published `@dna-codes/dna-schemas` npm package.
- **MODIFIED** `src/navigation.ts` — add Docs link to header.

**Out of scope** (deferred):

- A separate `docs.dna.codes` subdomain (will revisit once content stabilizes; routes are designed to be portable).
- Search (client-side fuzzy search or Pagefind integration — punt to v2).
- A schema-drift CI linter — generation makes drift impossible for reference content, so the linter is unnecessary unless hand-authored content references schema fields directly.
- Per-primitive page URLs (`/docs/operational/person`) — explored, rejected; deep linking is via anchors (`/docs/operational#person`) because the content is dense enough that scrollable layer pages serve the reader better and require less navigation friction.

## Capabilities

### New Capabilities

- `docs-section` — a `/docs/*` URL space inside the AstroWind site, with a 4-bucket information architecture (Getting Started, Reference, Examples, Frameworks). Includes a `DocsLayout` and a sidebar component shared across all docs pages.
- `schema-driven-reference` — primitive reference content is generated at build time from `@dna-codes/dna-schemas` JSON Schemas. No drift possible. Generation lives in the page components themselves (each layer page imports its schemas directly) rather than as a separate pre-build step.

### Modified Capabilities

- `navigation` — header gains a Docs link; commented-out subdomain links removed (the docs are in this site now).

## Impact

- **`dna-codes-site` build**: gains schema imports at build time. Adds a local file alias for v1 (`~/schemas` → `../dna/packages/schemas`); production-portable via switch to the published `@dna-codes/dna-schemas` npm package when ready.
- **`dna` repo**: `docs/frameworks/*.md` becomes scaffolding for the site's `/docs/frameworks` page; can be deprecated to a README pointer once the site lands. The exploratory `docs/concepts/` directory authored in a prior session is _not_ migrated — its model diverged from the DSL, and the user explicitly chose the DSL as the authority.
- **Readers**: a single canonical docs URL (`dna.codes/docs`) that survives content moves; per-bucket anchors give stable deep links.
