# Tasks

## 1. Core schema wiring

- [ ] 1.1 Add a build-time alias that resolves core `definitions/` + `stability/` from the platform schemas tree (sibling and/or published export), and verify a structure schema import resolves without reading the legacy Person/Resource `operational/` tree
- [ ] 1.2 Extend `src/utils/schema-doc` (or a sibling loader) to discover definitions per vocabulary, attach stability from `stability/{structure,behaviour}.json`, and extract fields for nested `$ref`/`$defs`; verify unit coverage against Entity and Action schemas

## 2. Operational DNA reference (Structure + Behaviour inside)

- [ ] 2.1 Rewrite `/docs/operational` to generate Structure and Behaviour groups from discovered core schemas + stability; verify Domain/Entity/Attribute/Relationship and all six behaviour definitions render with heading, description, fields, and stability
- [ ] 2.2 Update Sidebar so Reference's live child is Operational only, expanding to Structure and Behaviour anchors; verify Product and Technical are gone from the live sidebar
- [ ] 2.3 Drop hand-maintained legacy primitive imports (Person, Resource, Process, etc.) from the Operational page and verify the page no longer documents them

## 3. Landing, redirects, and deferred layers

- [ ] 3.1 Rewrite `/docs` cards so Reference points at Operational (Structure · Behaviour) and add a Coming soon section for Product and Technology; verify `#coming-soon` and no live Product/Technical reference links
- [ ] 3.2 Redirect or soft-land `/docs/product` and `/docs/technical` to `/docs#coming-soon` (or equivalent); verify those URLs no longer render full layer reference
- [ ] 3.3 Remove or gut `product.astro` / `technical.astro` and verify `npm run build` no longer emits them as reference content

## 4. Hand-authored narrative + examples

- [ ] 4.1 Rewrite Getting Started so Operational DNA = structure + behaviour, with Product/Technology as forthcoming; verify links target `/docs/operational` and the sample matches core document shape
- [ ] 4.2 Retarget `/docs/examples` to checkout, origination, diligence, and agent-registration with corpus excerpts; verify excerpts resolve at build time

## 5. Apex agent copy, lenses park, gate

- [ ] 5.1 Update apex `llms.txt` (`src/pages/llms.txt.ts`) so it describes Operational DNA as structure + behaviour, links `/docs/getting-started`, `/docs/operational`, and `/docs/examples`, and does not present Product/Technical as live reference; verify the built `/llms.txt` matches
- [ ] 5.2 Park or trim Lenses layer groups that document Product/Technical as current; verify the page builds
- [ ] 5.3 Run `npm run build` and `npm run check` (legacy package OK for genomes if still required) and verify both succeed

## Workflow follow-up

- Archive the change after review once the docs ship.
- Apply platform companion `point-agents-at-site-docs` (agent-host generated docs + listing skills) in the same release train so agents get the same `/docs` URLs — do not ship those links before the pages are live.
- Follow-up: publish core schemas to the preferred npm export; realign lenses and industry genomes.
