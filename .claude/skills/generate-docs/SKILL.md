---
name: generate-docs
description: Use this skill when the user says "/generate-docs", "regenerate the docs", "update the schema package", "bump dna-schemas", "update the dna-codes schemas", "pull the latest schemas", or "regenerate the docs from new schemas". Bumps the @dna-codes/dna-schemas npm version, reconciles the reference pages with any added/removed primitives, and rebuilds the schema-driven docs.
argument-hint: Optional target version (e.g. 0.7.0); defaults to the latest published
allowed-tools:
  - Bash(npm view:*)
  - Bash(npm install:*)
  - Bash(npm run build:*)
  - Bash(npm run build)
  - Bash(npm run check:*)
  - Bash(npm run check)
  - Bash(npm run fix:*)
  - Bash(npm run fix)
  - Bash(git status:*)
  - Bash(git diff:*)
  - Bash(ls:*)
  - Bash(grep:*)
  - Bash(rm:*)
  - Read
  - Edit
---

# Generate-Docs Skill

Bump the `@dna-codes/dna-schemas` package to a new published version and regenerate the docs from it. The docs site pulls schemas **only from the npm package** (never a local sibling checkout) — the reference pages import `~schemas/**/*.json`, which resolves to `node_modules/@dna-codes/dna-schemas` via the `~schemas` alias in `astro.config.ts` and the `~schemas/*` path in `tsconfig.json`.

"Regenerating the docs" is just `npm run build`: the pages read the imported JSON at build time, so field and description changes flow through automatically. The one thing that does NOT flow automatically is the **set** of primitives — each reference page imports and lists its primitives by hand. Adding, removing, or renaming a schema therefore requires editing a page. This skill's real job is catching that.

The same applies to the **Lenses** page (`src/pages/docs/lenses.astro`). Lenses ship in a _different_ package — `@dna-codes/dna-core` under `lenses/` — and resolve via the `~lenses` alias (`node_modules/@dna-codes/dna-core/lenses`) in `astro.config.ts` and `tsconfig.json`. Only the lens JSON is imported (never dna-core's JS runtime). The lenses page lists its six core lenses by hand, so an added/removed/renamed core lens needs a page edit too — reconcile it alongside the schema set (Phase 2 + Phase 4 below).

## Steps

### Phase 1 — Pick the target version

1. Determine the version to install:
   - If the user named one, use it.
   - Otherwise default to latest: `npm view @dna-codes/dna-schemas version` (and `npm view @dna-codes/dna-schemas versions` to show the user the options).
2. Read the currently installed version from `package.json` (`@dna-codes/dna-schemas`) and report old → new. If they already match, confirm with the user before reinstalling.

### Phase 2 — Snapshot the current schema set

Before changing anything, record which primitives the docs currently cover, so you can diff after the bump:

```bash
ls -R node_modules/@dna-codes/dna-schemas/{operational,product,technical} | grep '\.json$' | sort
grep -rhoE "~schemas/[a-zA-Z0-9/_-]+\.json" src/pages/docs | sort -u
```

The second command is the set of schemas the reference pages actually import. Keep both lists.

If you are also bumping `@dna-codes/dna-core` (or just verifying the lenses page), snapshot the lens set the same way:

```bash
ls node_modules/@dna-codes/dna-core/lenses/*.json | xargs -n1 basename | sort
grep -hoE "~lenses/[a-zA-Z0-9/_-]+\.json" src/pages/docs/lenses.astro | sort -u
```

`base.json` is the LensType contract, not a renderable lens — the page documents it in prose, so it is expected to appear in the package listing but **not** among the page's imports.

### Phase 3 — Install the new version

3. Update the dependency and lockfile:

   ```bash
   npm install @dna-codes/dna-schemas@<version>
   ```

   This updates `package.json` to the new version and re-resolves the lockfile.

4. **Verify it resolved from the npm registry, not a local link.** This has bitten us before — a stale `file:` link silently wins. Confirm the lockfile entry's `resolved` is a `registry.npmjs.org` URL:

   ```bash
   grep -A3 '"node_modules/@dna-codes/dna-schemas"' package-lock.json
   ```

   If you see `"resolved": "../dna/..."` or `"link": true`, force a clean fetch:

   ```bash
   rm -rf node_modules/@dna-codes/dna-schemas
   npm install @dna-codes/dna-schemas@<version>
   ```

### Phase 4 — Reconcile the reference pages

5. Re-run the Phase 2 listing against the freshly installed package and diff against the snapshot. For each layer (`operational`, `product`, `technical`):
   - **New schema files** that no page imports → add them. Each layer page (`src/pages/docs/{operational,product,technical}.astro`) imports the JSON, adds an entry to its `primitives`/`groups` array with sensible `related` links, and the sidebar `anchors` derive automatically. Match the existing grouping (e.g. Product's Core/API/UI sub-layers).
   - **Removed/renamed files** that a page still imports → the build will fail on the missing module. Remove or rename the import and its array entry.
   - **Unchanged set** → no page edits needed; field/description changes are picked up by the rebuild alone.

   For **lenses** (`src/pages/docs/lenses.astro`), diff the Phase 2 lens snapshot the same way (ignoring `base.json`): a new lens → add an import and an entry to the right group (`Layer lenses` for node-only lenses, `Subgraph & traversal lenses` for ones with edges); a removed/renamed lens → fix the import or the build fails. Node/edge/sentence changes within an existing lens flow through on rebuild with no edit. The sidebar anchors derive automatically from the page's lens list.

6. **Stability field.** The pages render a stability pill resolved by `getStability()` in `src/utils/schema-doc.ts`: it reads a schema's own top-level `stability` value (enum `experimental | beta | stable | deprecated`, defined in the schemas' base) and otherwise treats the primitive as `stable`. There is no curated map — the schema is the only source. Check which schemas actually declare a value:

   ```bash
   grep -rl '"stability"\s*:\s*"' node_modules/@dna-codes/dna-schemas
   ```

   (Note: `base.json` always matches because it _defines_ the `stability` property; that's the enum definition, not a declared value. You're looking for leaf schemas that set `"stability": "..."`.) No code change is needed here — declared values flow into the pills automatically on rebuild. Just report which primitives, if any, now carry a non-default (non-`stable`) value.

### Phase 5 — Regenerate and verify

7. Rebuild the docs and run the checks:

   ```bash
   npm run build
   npm run check
   ```

   - `npm run build` regenerates every docs page from the new schemas. A missing-module error here means a removed/renamed schema is still imported (Phase 4, step 5).
   - `npm run check` (astro check + ESLint + Prettier) must pass. If Prettier flags files, run `npm run fix`. If `astro check` reports type errors on a newly added page entry, fix them directly.

8. Sanity-check the output — confirm the new/changed primitives actually render:

   ```bash
   grep -o "Experimental\|Beta\|Stable" dist/docs/operational/index.html | sort | uniq -c
   ```

   Spot-check whichever layer page you touched.

### Phase 6 — Report

9. Summarize:
   - Version bump (old → new), and confirmation the lockfile resolves from the npm registry.
   - Primitives added / removed / renamed and the pages edited (or "schema set unchanged").
   - Which primitives, if any, now declare a non-default stability value (the rest render `stable`).
   - Build + check result.
10. Do NOT commit or push automatically. Offer to run `/commit-push`, which will commit, push, and watch the deploy through to completion.

## Notes

- npm-only is a hard rule: never reintroduce a `file:../dna/...` dependency or a sibling-repo checkout to generate docs. If a schema you need isn't published yet, say so rather than reaching for the local repo.
- The schema-driven pages are `src/pages/docs/operational.astro`, `product.astro`, and `technical.astro` (from `@dna-codes/dna-schemas`), plus `lenses.astro` (generated from `@dna-codes/dna-core`'s `lenses/`). Prose pages (`getting-started.astro`, `frameworks.astro`, `examples.astro`, `index.astro`) are not schema-driven — only update them if the user asks.
- npm-only applies to lenses too: the lens JSON must resolve from `node_modules/@dna-codes/dna-core/lenses` via the published package, never a sibling checkout.
- If the user gives a version that isn't published yet, `npm install` will fail — surface the available versions from `npm view ... versions` instead of guessing.
