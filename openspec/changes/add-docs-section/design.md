# Design — add-docs-section

## Decisions captured from explore session

### D1 — Four-bucket IA with seven pages

The docs section has 4 buckets in the user's mental model (matches the landing's 4-card layout), realized as 7 pages because the reference bucket is split per layer to keep page length manageable:

```
/docs                 ─── landing (4-card grid + brief intro)
/docs/getting-started ─── onboarding (hand-authored)
/docs/operational     ─── reference, schema-driven
/docs/product         ─── reference, schema-driven
/docs/technical       ─── reference, schema-driven
/docs/examples        ─── applied examples from dna/examples/
/docs/frameworks      ─── ported from dna/docs/frameworks/
```

Rejected: per-primitive page URLs (`/docs/operational/person`). Reasoning: the content is dense enough that a single scrollable per-layer page reads better; deep links work via anchors (`#person`); maintenance is one file per layer instead of 36+.

### D2 — Schema-driven reference content

Each `/docs/<layer>` Astro page imports JSON Schemas directly from `~/schemas/<layer>/*.json` and renders one section per primitive using a shared `PrimitiveSection` component. The schemas' `title`, `description`, `properties`, and `examples` fields are documentation-grade — no hand-authoring required, no drift possible.

The schemas live in `dna/packages/schemas` (sibling repo). For local dev, an `astro.config.ts` path alias maps `~/schemas` → `../dna/packages/schemas`. For production builds, the alias swaps to the published `@dna-codes/dna-schemas` npm package once the cross-repo workflow is wired (see open question O3 below).

Rejected: a separate pre-build script (`scripts/generate-docs.ts`) emitting MDX into `src/content/docs/`. Reasoning: Astro pages can import JSON directly at build time; a separate generator adds a step without benefit.

### D3 — Sidebar pattern C ("sidebar IS the TOC")

```
▾ Getting Started
▾ Reference
   ▾ Operational         ◀── current page, expanded
       People
       ├ Person · Role · Group · Membership
       Structures
       ├ Resource · Attribute · Relationship · Domain
       Activities
       └ Operation · Action · Process · Task · Trigger · Rule
   ▸ Product
   ▸ Technical
▸ Examples
▸ Frameworks
```

Sidebar is a single component that:

- Knows the static structure of the 4 buckets (the layer/primitive list).
- Detects current page from `Astro.url.pathname`.
- For the current layer page, expands inline anchors derived from the schema list (or hand-written for non-reference pages).
- For non-current sections, collapses to a single link.

Sub-groupings inside Operational (People / Structures / Activities) follow the main README's prose categories — they break a 14-item flat list into teachable chunks. Product splits Core / API / UI. Technical is flat (only 10 items).

### D4 — Per-primitive section template (hybrid)

Each primitive section in a reference page renders as:

````
### <PascalCase name>                  ◀── H3 anchor `#<lowercase-name>`

[Lead paragraph: schema.description, first sentence as punchy summary,
 second paragraph if context warrants.]

Fields                                 ◀── concise table, not prose
┌─────────┬────────┬──────────┬────────────────────┐
│ name    │ string │ required │ PascalCase singular│
│ ...     │ ...    │ ...      │ ...                │
└─────────┴────────┴──────────┴────────────────────┘

```json
[schema.examples[0]]
````

Related: <other primitives, linked to their anchors>

```

Hybrid because: pure-narrative balloons to 2000+ lines per layer; pure-reference discards the schemas' good prose. Lead + table + example is what every good API docs page does.

### D5 — Landing-page card grid

Four cards in a 2×2 grid (responsive: 1 column on mobile, 2 on tablet+). Each card:
- Title (e.g. "Reference")
- One-line description
- Key contents listed inline (e.g. "Operational · Product · Technical")
- "View →" link to the bucket's entry page

The Reference card links to `/docs/operational` as the default entry; Examples and Frameworks link to their respective single pages.

### D6 — Frameworks: absorb full, not summary

The six framework comparison markdown files in `dna/docs/frameworks/` migrate into `/docs/frameworks` as full content (one H2 per framework, the existing body as-is). Reasoning: a summary-and-link-out pattern sends readers off to GitHub mid-flow, breaking the docs experience. Maintenance cost is the same six files either way.

Once migrated, `dna/docs/frameworks/README.md` becomes a redirect notice to `https://dna.codes/docs/frameworks`.

### D7 — Examples: render from JSON, light prose

`/docs/examples` shows one section per cross-domain example. Each section:
- Title (e.g. "Lending")
- Brief description (what the example demonstrates — from `dna/README.md`'s existing table)
- A code excerpt highlighting the relevant primitives
- Link to the full file in the dna repo

Frameworks/Examples are NOT generated from schemas — they are hand-authored, but they are not deeply schema-coupled either.

### D8 — Concepts/Lens/Composition dropped from v1

The prior exploratory work in `dna/docs/concepts/` introduced primitives (User, Position, Domain-as-distinct-from-Group, Action-as-RT, State, Event, Transition, Module, Initiative, Epic, Story, Agent, Capability), pair-anchored Relationship Types, Lenses, and Compositions that do not match the DSL. The user explicitly chose the DSL as the authority. v1 docs adhere strictly to the schemas; Lens, Composition, and pair-anchored Relationship Types are not reintroduced.

If a "navigation perspectives" concept reemerges, it should derive from the DSL (e.g. from `Relationship` declarations and `$ref` references in the schemas), not from the abandoned concepts/ catalog.

## Component breakdown

- `src/layouts/DocsLayout.astro` — wraps `Layout.astro` with sidebar + content grid.
- `src/components/docs/Sidebar.astro` — the pattern-C nav; takes current pathname and layer-specific anchor list.
- `src/components/docs/PrimitiveSection.astro` — renders one schema as a section (H3, description, fields table, example, related).
- `src/components/docs/FieldsTable.astro` — render `schema.properties` as a 4-column table.
- `src/components/docs/Card.astro` — landing-page card.
- `src/pages/docs/index.astro` — landing.
- `src/pages/docs/getting-started.astro` — hand-authored content collection page.
- `src/pages/docs/operational.astro` — imports operational schemas, renders sections.
- `src/pages/docs/product.astro` — imports product schemas (core, api, ui).
- `src/pages/docs/technical.astro` — imports technical schemas.
- `src/pages/docs/examples.astro` — hand-authored or content collection.
- `src/pages/docs/frameworks.astro` — hand-authored content collection.

## Open questions

- **O1: Search.** Pagefind drops in as a build step and indexes everything; client-side fuzzy is lighter but worse. Deferred to v2.
- **O2: Mobile nav.** Sidebar collapses to a drawer below `lg:`. Implementation pattern matches AstroWind's existing header drawer; reuse the same toggle.
- **O3: Production schema source.** Local dev uses path alias to sibling repo. Production needs either a published `@dna-codes/dna-schemas` npm dep with a known version, or schemas vendored into the site at deploy time. Resolved as: use npm dep once `dna-schemas@1.0` ships; for v1, build runs against the alias.
- **O4: Anchor stability across schema renames.** If a schema's `name` field changes (e.g. `person` → `individual`), the anchor changes too and breaks deep links. Acceptable for pre-1.0; revisit when schemas freeze.
```
