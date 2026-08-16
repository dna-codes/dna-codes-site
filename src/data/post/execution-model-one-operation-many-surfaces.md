---
publishDate: 2026-09-20T00:00:00Z
series:
  name: The Future of Programming
  layer: 'Layer 05: Execution Model'
author: Tim Kleier
title: 'The Execution Model: Your API and Your MCP Tool Should Not Be Written Twice'
excerpt: 'A REST endpoint, an MCP tool, a workflow step and a button are four descriptions of the same operation, written by four people, drifting apart from the day they ship. They should be projections of one definition — same preconditions, same effects, same errors, by construction.'
image: '~/assets/images/abstraction-layers.png' # PLACEHOLDER — replace before publish
draft: true
category: Engineering
tags:
  - mcp
  - api design
  - ai agents
  - architecture
---

<!--
BRIEF — Series: The Future of Programming, layer 05 of 08.
Delete this block when the draft is written.

This is the most immediately practical piece in the series and the one most tied
to the current moment. Anyone who has shipped an MCP server in the last year has
felt this exact pain. Lead with recognition, not theory.

THESIS
An API, an MCP tool, a workflow step and a UI button should not each define what
an operation does. They are projections of the same definition — and the industry
is currently building the fourth hand-written copy of every operation it owns.

THE SPINE
1. Open on the MCP moment concretely. A team with a working REST API bolts on an
   MCP server. The tool description is written by hand, from memory, by whoever
   drew the ticket. It says the amount is optional. The endpoint has required it
   since March. An agent calls what it was told exists, not what actually does —
   and the failure surfaces as a model that "hallucinated," which it did not.
2. Generalize the shape: four surfaces, four hand-written contracts, four
   independent drift rates. Endpoint, MCP tool, queue consumer, UI command.
3. Why the existing contract formats do not solve it — the important section.
   OpenAPI describes an endpoint. A JSON Schema describes a payload. An MCP tool
   definition describes a tool. Each is a faithful description of one surface;
   none is upstream of the others. Contract-first development moved the artifact
   earlier without making it singular. Codegen from OpenAPI generates a client,
   not the operation's other faces.
4. What projection means mechanically. One operation — Pay Invoice, defined two
   pieces back — and the four surfaces derived from it. Show the precondition
   `status: Issued` appearing as: a 409 in the endpoint, a refusal in the tool's
   error contract, a guard on the workflow step, a disabled button. One source,
   four expressions. Then change the precondition once and show all four move.
5. The agent-safety argument, which is the sharpest version of the case. The gap
   between what a tool description claims and what the operation enforces is not
   a documentation problem — it is the surface an agent probes first. An agent
   will find the seam between your API and your UI before your QA does.
6. Honest limits: surfaces are not fully interchangeable. A UI needs affordances
   and copy; a queue consumer needs idempotency and retry semantics; an MCP tool
   needs a description written for a model's benefit. Projection settles the
   contract, not the presentation. Saying this out loud is what makes the rest
   credible.
7. THE HANDOFF SECTION (required in every piece — see planned_posts.md).
   In, from the Operational Model — "Projection": each surface inherits the
   operation's contract rather than restating it. Walk `status: Issued` becoming a
   409, a tool-level refusal, a workflow guard and a disabled button — one
   precondition, four expressions, none of them authored separately.
   Out, to Code — "Generation": this is the handoff the industry has actually
   built. Contract-first codegen from OpenAPI already works and is unglamorous,
   which is the point — it is the first handoff on the way up that got engineered
   until it went boring. Use it as the existence proof for everything above it.

PRIOR ART
OpenAPI, GraphQL SDL, protobuf/gRPC, AsyncAPI, JSON Schema, MCP tool definitions.
Also: Smithy and AWS's model-first API generation, which is the closest existing
example of one model projecting many surfaces and deserves explicit credit.

DNA'S ONE NOVEL CLAIM
The industry already accepts that one model can project many *protocol* surfaces
(Smithy proves it). The claim here is that the model being projected from should
be the operation — carrying its preconditions and effects — rather than a
transport shape carrying only its payload. That is what makes the projection
reach the permission check and the error taxonomy, and not just the wire format.

FIGURE — interactive (house standard; see planned_posts.md)
One operation fanning into four surfaces: REST endpoint, MCP tool, workflow step,
UI button. The reader edits the operation once — change a precondition, rename a
field, make an optional argument required — and all four panels update together.

Then the payoff move, which is what makes it an argument rather than a diagram: a
"hand-written" toggle that unpins the four surfaces and lets the reader edit one
in isolation, so the MCP tool can be made to claim the amount is optional while
the endpoint still requires it. Show the drift appearing, then show the agent call
that fails because of it. Projection vs. four hand-written copies, demonstrated
rather than asserted.

Shares most of its machinery with the flagship's figure two weeks earlier — build
them as one component with two configurations if the shapes line up. Check
`OperationsDemo.astro` first. Rename to .mdx.

LINKEDIN HOOK
"Your REST endpoint and your MCP tool are two hand-written descriptions of the
same operation. They agreed on the day you shipped them. Do they agree now?
When an agent finds the gap, that gets called a hallucination."

LINKS
Series map. Previous piece (Operational Model) — this one leans on it directly.
/operations demo.
-->
