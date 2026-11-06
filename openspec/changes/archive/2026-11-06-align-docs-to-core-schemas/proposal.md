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
- **Adjust** sidebar, landing cards, `llms.txt` / agent copy that still describe the old Operational primitive set or Product/Technical as live docs.
- **Out of scope:** publishing Product/Technical docs; rewriting industry genomes; full Lenses realignment beyond parking outdated layer lenses.

## Capabilities

### New Capabilities

- _(none)_ — retarget the existing schema-driven docs surface.

### Modified Capabilities

- `docs-section`: live Reference is Operational DNA only (Structure + Behaviour inside it); Product and Technology appear only as Coming soon on the landing page; Getting Started and Examples retargeted.
- `schema-driven-reference`: Operational reference is generated from core structure and behaviour schemas; Product and Technical layer pages leave the generated reference.

## Impact

- **`dna-codes-site`**: `/docs/operational`, Sidebar, landing, Getting Started / Examples, schema wiring, agent copy.
- **Schema source**: platform core schemas (`packages/schemas`), not the legacy `operational/` Person/Resource tree.
- **Readers**: `/docs/operational` keeps its URL and layer name; its contents and anchors change to structure/behaviour definitions. `/docs/product` and `/docs/technical` stop being live reference.
