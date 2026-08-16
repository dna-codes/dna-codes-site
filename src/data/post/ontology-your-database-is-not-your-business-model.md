---
publishDate: 2026-08-30T00:00:00Z
series:
  name: The Future of Programming
  layer: 'Layer 03: Ontology'
author: Tim Kleier
title: 'Ontology: Your Database Is Not Your Business Model'
excerpt: 'A schema tells you how your business stores things. An ontology tells you what your business believes exists. Most teams have only ever written the first one down — and then read it backwards, hoping to recover the second.'
image: '~/assets/images/abstraction-layers.png' # PLACEHOLDER — replace before publish
draft: true
category: Engineering
tags:
  - ontology
  - knowledge graphs
  - architecture
  - ai agents
---

<!--
BRIEF — Series: The Future of Programming, layer 03 of 08.
Delete this block when the draft is written.

THESIS
A database tells you how your business stores things. An ontology tells you what
your business believes exists. The industry has spent thirty years deriving the
second from the first, and that arrow points the wrong way.

THE SPINE
1. Open with a schema read as an artifact: a nullable column added in 2023, a
   join table nobody can explain, a status enum with a value that means "legacy
   import." The schema is an archaeology of past tickets, not a model of the
   business — and it is the only written record of what exists.
2. Say what an ontology is, plainly, before assuming it. "Ontology" is the most
   obscure word in the series — it carries a philosophy-department smell and a
   semantic-web-in-2006 smell, and both will lose readers. Kill those associations
   fast: it is the list of things your business believes exist and how they connect,
   nothing more. The Semantics piece has the model for this passage — see its
   "What semantics means here" section.
3. The inversion. Today: schema → (inferred) ontology. What it should be:
   ontology → schema. State the arrow flip plainly, early. It is the whole piece.
4. What the schema cannot express even when it is clean. Storage decisions —
   normalization, denormalization for read performance, soft deletes, sharding —
   are answers to "how do we store this," and they permanently contaminate any
   attempt to read "what is this" back out. A `deleted_at` column is not an
   ontological fact about invoices.
5. What an ontology states: Customer → owns → Invoice. Invoice → settled_by →
   Payment. Entities, what each holds, what it points at. Then show the same
   schema falling out of it — and a second, different schema also falling out of
   it, for a different storage decision. That is the proof the layers are distinct.
6. Prior art, generously. This is the layer where the traditions are deepest and
   the piece has the most to lose by sounding naive. See below.
7. Why now: agents. A retrieval index over your tables gives an agent the storage
   model and asks it to infer the business. The gap it fills is exactly the gap
   this layer exists to close. Reference the AI Engineer World's Fair ontology
   talk the manifesto already cites.
8. THE HANDOFF SECTION (required in every piece — see planned_posts.md).
   In, from Semantics — "Structuring": the bound definitions become entities and
   relationships. Read the Invoice definition from last week ("a demand for
   payment issued against a completed order") and pull Invoice, Order and the
   `issued_against` relationship straight out of the sentence. The point is that
   you do not invent the structure, you read it out of definitions that were
   written precisely enough to be read.
   Out, to the Operational Model — "Derivation": the entities and their states
   are what operations are written against. `Invoice.status` has to exist as a
   property before `Pay Invoice` can name `Issued` as a precondition. Knowing
   what exists still tells you nothing about who may do what — which is the
   flagship, next week.

PRIOR ART
OWL, RDF, SPARQL — decades old, standardized, and mostly ignored by application
developers, which is itself worth a sentence. Knowledge graphs in production
search. Palantir, which built a company on programming against "the ontology"
and is the closest commercial precedent — treat it as evidence the layer is
real, not as a competitor to swat. schema.org. ER modeling and Chen's 1976 paper.
Event storming's aggregates.

DNA'S ONE NOVEL CLAIM
Not the ontology itself — OWL got there in 2004. The claim is that the ontology
should be the source the schema is generated from rather than a parallel
description maintained beside it. Semantic-web tooling made ontologies
authoritative for *reasoning*; almost nothing made them authoritative for
*building*. And that ontologies should be small, business-legible, and continuous
with the operations above them — not a separate specialist artifact.

FIGURE — interactive (house standard; see planned_posts.md)
One ontology, two schemas. The reader holds the ontology fixed — Customer → owns
→ Invoice, Invoice → settled_by → Payment — and switches the storage decision:
normalized vs. denormalized, soft delete vs. hard, single-table vs. split. The
schema below redraws each time; the ontology above never moves.

That is the entire argument in one control, and it is the best interaction
opportunity in the series after the flagship: it proves the two layers are
distinct by letting the reader change one without touching the other. Then invert
it — same schema, two defensible ontologies read back out of it — to show why the
inference direction fails. Rename to .mdx.

LINKEDIN HOOK
"Your database tells you how your business stores things. It does not tell you
what your business thinks exists. Most teams have only ever written down the
first one — and then read it backwards for twenty years."

LINKS
Back to the series map. /docs/operational if the ontology maps cleanly to it.
-->
