# Design — align-docs-to-core-schemas

## Context

See proposal.md for why. Today `/docs/operational` imports the legacy Person/Resource/Process schemas and peers with Product/Technical. Operational DNA remains the layer; its contents become structure/v1 + behaviour/v1 from `dna-codes-platform/packages/schemas`.

## Goals / Non-Goals

**Goals:**

- Generate `/docs/operational` from core structure + behaviour schemas and stability ledgers, grouped as **Structure** and **Behaviour inside Operational DNA**.
- Drop Product/Technical as live docs; summarize as Coming soon on `/docs`.
- Point Getting Started and Examples at Operational DNA (structure + behaviour) and the reference-domain corpus.

**Non-Goals:**

- Replacing "Operational" with "Structure" as the layer name or top-level IA.
- Publishing Product/Technical docs; migrating genomes/lenses fully; a separate MDX dump of schemas.

## Decisions

### D1. Operational DNA is the layer; Structure and Behaviour are its vocabularies

Keep `/docs/operational` as the canonical Operational DNA URL. On that page (or as child routes under it if length demands), present two groups:

1. **Structure** — Domain, Entity, Attribute, Relationship
2. **Behaviour** — Behaviour, Action, Operation, Workflow, Condition, Policy

Sidebar: Reference → Operational only (live). Expanded anchors use Structure / Behaviour group labels (same pattern as the old People / Structures / Activities groups).

**Alternative considered:** promote Structure and Behaviour to top-level Reference peers (replacing Operational). Rejected — user direction: they stay inside Operational DNA; Product/Technology remain the other layers, just not documented yet.

**Alternative considered:** `/docs/structure` and `/docs/behaviour` as separate top-level routes. Rejected for the same reason; optional later if the single Operational page grows too long — prefer one page with groups first (ten primitives is comparable to the old fourteen).

### D2. Generate reference from schemas; discover primitives

1. Load every `schema.json` under `definitions/structure/*/v1` into the Structure group.
2. Load every `schema.json` under `definitions/behaviour/*/v1` into the Behaviour group.
3. Attach stability from `stability/structure.json` and `stability/behaviour.json`.
4. Render via `PrimitiveSection` / `FieldsTable` / `StabilityPill`; extend `schema-doc` for `$ref` / `$defs` as needed.
5. Discover via `import.meta.glob` (or an index) — no hand-maintained import list per primitive.

### D3. Product and Technical leave the live reference

| Route               | Fate                                            |
| ------------------- | ----------------------------------------------- |
| `/docs/operational` | Rebuild contents (Structure + Behaviour groups) |
| `/docs/product`     | Redirect or soft-land → `/docs#coming-soon`     |
| `/docs/technical`   | Same                                            |

Landing Reference card: "Operational — Structure · Behaviour". Coming soon section names Product and Technology.

### D4. Examples from the reference-domain corpus

`/docs/examples`: checkout, origination, diligence, agent-registration with corpus excerpts. Genomes keep the legacy package until a separate change.

### D5. Schema resolution

Alias to platform `packages/schemas` (`definitions/` + `stability/` + optional `examples/`). Do not fall back to the legacy `operational/` Person/Resource tree for docs. Genome scripts may still use `@dna-codes/dna-schemas` separately.

### D6. Getting Started

Operational DNA = describe the business in structure, then attach behaviour. Product and Technology are mentioned as forthcoming layers, not as install targets. First sample uses `dna: "structure/v1"` (and a small behaviour companion), not `validateOperational`.

### D7. Lenses — park, don't block

Hide or deprecate Product/Technical layer lenses; do not block Operational docs on a full lens rewrite.

### D8. Apex `llms.txt` points at live `/docs` (agents learn the site)

Update `src/pages/llms.txt.ts` so the site description for models lists Getting started, Operational DNA (structure + behaviour), and Examples — not Product/Technical as live layers. Link `https://dna.codes/docs/operational` (and siblings) clearly.

Do **not** put `/docs` URLs into MCP tool descriptions. The platform companion change `point-agents-at-site-docs` updates agent-host `llms.txt` / `definitions.md` and listing skills (`dna-operational`, etc.) to the same URLs once these pages ship. Schemas and `describe` remain authoritative; the site is the readable companion.

## Risks / Trade-offs

- **[Risk] Core schemas not on npm** → Alias to platform tree; fail loudly rather than documenting legacy Operational primitives.
- **[Risk] Nested `$ref` field extraction** → Test helpers against Entity and Action before shipping the page.
- **[Risk] Old Operational deep links (`#person`)** → Accept churn; Structure/Behaviour anchors are the new contract.
- **[Risk] Genome build still needs old package** → Keep dual dependency until genomes migrate.

## Migration Plan

1. Wire core schema alias + discovery loader + stability attachment.
2. Rewrite `/docs/operational` as Structure + Behaviour groups; update sidebar.
3. Landing Coming soon; redirect Product/Technical; remove those page modules.
4. Getting Started + Examples; apex `llms.txt`; park lenses.
5. `npm run build` / `npm run check`.
6. Same release train: apply platform `point-agents-at-site-docs` after (or with) live pages.

## Open Questions

- npm export path for core schemas (does not change the Operational-contains-Structure/Behaviour IA).
- Whether Lenses stays on the landing card grid in this change.
