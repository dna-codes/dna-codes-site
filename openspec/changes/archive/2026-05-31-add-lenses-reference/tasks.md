# Tasks — add-lenses-reference

## 1. Source wiring (npm-only)

- [x] 1.1 Add `@dna-codes/dna-core` as a dependency in `package.json`, pinned to a published version whose tarball contains `lenses/*.json` (verify with `npm view @dna-codes/dna-core@<v>` / inspect the installed `node_modules/@dna-codes/dna-core/lenses`)
- [x] 1.2 Confirm the lockfile entry resolves from `registry.npmjs.org` (not a `file:`/`link:` to a sibling checkout), reusing the `generate-docs` lockfile check
- [x] 1.3 Add a `~lenses` alias → `node_modules/@dna-codes/dna-core/lenses` in `astro.config.ts`
- [x] 1.4 Add the matching `~lenses/*` path in `tsconfig.json`

## 2. Lens-doc helpers

- [x] 2.1 Add a `LensDoc` structural type (loose view: `$id?`, `name`, `nodes[]`, `edges[]`, `sentence?`) — in a new `src/utils/lens-doc.ts` or alongside `schema-doc.ts`
- [x] 2.2 Add a helper that splits a `sentence` into ordered text + `{{slot}}` token parts for highlighting
- [x] 2.3 Add helpers that return the node-slot list and edge list in render order; reuse `slugify()` from `schema-doc.ts` for lens anchors

## 3. LensSection component

- [x] 3.1 Create `src/components/docs/LensSection.astro` — renders lens `name` as an `H3` anchor, the highlighted sentence, a node-slot table (slot · ResourceType), and an edge table (from → to · via RelationshipType)
- [x] 3.2 Handle the layer-lens case: when `edges` is empty, omit the edge table and render nodes as a grouped ResourceType list (no sentence required)

## 4. Lenses page

- [x] 4.1 Create `src/pages/docs/lenses.astro` using `DocsLayout`; author the concept intro + LensType contract prose (node slots, edges, sentence; query vs. command directions)
- [x] 4.2 Import the six core lens JSON files from `~lenses/*` and group them: Layer lenses (operational, product, technical) and Subgraph & traversal lenses (people, access-control, execution)
- [x] 4.3 Render each lens via `LensSection`; derive sidebar anchors (with `group` attribution) from the lens list, matching the per-layer pages' pattern

## 5. Sidebar / navigation

- [x] 5.1 Add a top-level `Lenses` entry (`href: '/docs/lenses'`) to `sections` in `src/components/docs/Sidebar.astro`, with inline per-lens anchor expansion when active
- [x] 5.2 Confirm the header `Docs` link path is unaffected (no change expected in `src/navigation.ts`)

## 6. generate-docs skill

- [x] 6.1 Extend the `generate-docs` skill so its reconciliation step also diffs the core lens set (`node_modules/@dna-codes/dna-core/lenses/*.json`) against what `/docs/lenses` imports, flagging added/removed/renamed lenses

## 7. Verify

- [x] 7.1 `npm run build` succeeds and `/docs/lenses` resolves with HTTP 200
- [x] 7.2 Confirm the build is self-contained — produced from lens JSON imports alone, without executing the lens package's JS entry point
- [x] 7.3 `npm run check` (astro check + ESLint + Prettier) passes
- [x] 7.4 Manually verify: all six lenses render; access-control shows highlighted slots + node-slot table + edge table; operational renders as a grouped type list with no empty edge table; sidebar Lenses entry expands to per-lens anchors and deep links work
