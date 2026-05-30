# Tasks — add-docs-section

## Phase 1: Scaffolding

- [x] Add `~/schemas` path alias in `astro.config.ts` (points at sibling `dna/packages/schemas` for local dev)
- [x] Extend `src/content.config.ts` with a `docs` content collection for hand-authored buckets
- [x] Create `src/layouts/DocsLayout.astro`
- [x] Create `src/components/docs/Sidebar.astro` (pattern C — current page expands inline)
- [x] Create `src/components/docs/PrimitiveSection.astro` (lead + fields table + example + related)
- [x] Create `src/components/docs/FieldsTable.astro`
- [x] Create `src/components/docs/Card.astro` (landing-page card)
- [x] Add nav entry in `src/navigation.ts`

## Phase 2: Landing & Getting Started

- [x] `src/pages/docs/index.astro` — 4-card grid + intro
- [x] `src/pages/docs/getting-started.astro` — welcome + quickstart + walkthrough

## Phase 3: Reference (schema-driven)

- [x] `src/pages/docs/operational.astro` — import all 14 operational schemas, render via `PrimitiveSection`, group by People / Structures / Activities
- [x] `src/pages/docs/product.astro` — import 4+4+4 product schemas (Core / API / UI), render via `PrimitiveSection`
- [x] `src/pages/docs/technical.astro` — import 10 technical schemas, render via `PrimitiveSection`

## Phase 4: Examples & Frameworks (hand-authored)

- [x] `src/pages/docs/examples.astro` — render one section per cross-domain example with code excerpts
- [x] `src/pages/docs/frameworks.astro` — port six framework markdown files from `dna/docs/frameworks/*` as full content

## Phase 5: Verify

- [x] `npm run build` succeeds without errors
- [x] All 7 docs URLs resolve
- [x] Sidebar nav links work; current-page expansion works
- [x] Landing cards link to correct destinations

## Phase 6: Cleanup

- [ ] Mark `dna/docs/frameworks/README.md` as superseded by `https://dna.codes/docs/frameworks` (in dna repo, separate change)
- [ ] Decide on the fate of `dna/docs/concepts/` (in dna repo, separate decision — likely retire or shrink to a README pointing at the dna.codes/docs link)

## Out of v1

- Search (Pagefind or client-side fuzzy)
- Switch from local schema path alias to published `@dna-codes/dna-schemas` npm dep (production deploy step)
- Per-primitive page URLs (decided against — anchors are sufficient)
- Drift linter (generation makes it unnecessary)
