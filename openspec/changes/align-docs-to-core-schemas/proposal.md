# Align docs to core schemas

## Why

The public `/docs` section still teaches the old three-layer DNA model and renders Operational primitives from `@dna-codes/dna-schemas` that no longer match the platform. Operational DNA is still the right layer name — what an organization is and does — but its content is now **structure/v1** (Domain, Entity, Attribute, Relationship) plus **behaviour/v1** (Behaviour, Action, Operation, Workflow, Condition, Policy), not Person/Resource/Process. Product and Technology remain real layers conceptually, but they are not ready to document.

The Operational reference SHOULD be **generated from the core schemas** (and stability ledgers / reference-domain corpus). Do not hand-rewrite field tables to catch up.

## What Changes

- **Keep Operational DNA** as the live reference layer. **Structure and Behaviour live inside it** as the two vocabularies that make up Operational DNA — not as sibling layers that replace Operational.
- **Generate** the Operational reference from `definitions/structure/*/v1` and `definitions/behaviour/*/v1`, with stability from `stability/{structure,behaviour}.json`. Discover primitives from the schema tree / ledger so a new definition appears on rebuild.
- **Prefer** example snippets from the reference-domain corpus (checkout, origination, diligence, agent-registration).
- **BREAKING (docs IA):** remove Product and Technical (Technology) from the live reference and sidebar. Redirect or soft-land those URLs; summarize the concepts in a **Coming soon** section on `/docs`.
- **Rewrite** Getting Started so the mental model is: Operational DNA = structure + behaviour; Product and Technology are forthcoming.
- **Retarget** Examples at the core reference domains.
- **Adjust** sidebar, landing cards, and the site apex `llms.txt` so they describe Operational DNA as structure + behaviour and point agents at `/docs/operational`, `/docs/getting-started`, and `/docs/examples` (not Product/Technical as live docs).
- **Coordinate** with the platform companion change `point-agents-at-site-docs` (agent-host generated docs + listing skills) so agents learn the same URLs once these pages ship — schemas/`describe` remain authoritative.
- **Out of scope:** publishing Product/Technical docs; rewriting industry genomes; full Lenses realignment beyond parking outdated layer lenses; stuffing `/docs` URLs into every MCP tool description.

## Capabilities

### New Capabilities

- _(none)_ — retarget the existing schema-driven docs surface.

### Modified Capabilities

- `docs-section`: live Reference is Operational DNA only (Structure + Behaviour inside it); Product and Technology appear only as Coming soon on the landing page; Getting Started and Examples retargeted; apex `llms.txt` points agents at the live `/docs` Operational reference.
- `schema-driven-reference`: Operational reference is generated from core structure and behaviour schemas; Product and Technical layer pages leave the generated reference.

## Impact

- **`dna-codes-site`**: `/docs/operational`, Sidebar, landing, Getting Started / Examples, schema wiring, apex `llms.txt`.
- **Schema source**: platform core schemas (`packages/schemas`), not the legacy `operational/` Person/Resource tree.
- **Readers / agents**: `/docs/operational` keeps its URL and layer name; its contents and anchors change to structure/behaviour definitions. `/docs/product` and `/docs/technical` stop being live reference. Agents discover the site docs via apex `llms.txt` and (via the platform companion) agent-surface docs and skills.
- **Companion**: `dna-codes-platform` change `point-agents-at-site-docs` updates generated agent documents and listing skills; ship after or with these pages so links are not stale.
