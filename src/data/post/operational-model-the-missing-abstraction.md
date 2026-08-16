---
publishDate: 2026-09-06T00:00:00Z
series:
  name: The Future of Programming
  layer: 'Layer 04: Operational Model'
author: Tim Kleier
title: 'The Operational Model: The Missing Abstraction for What a Business Can Do'
excerpt: 'Software has abstractions for what things are and abstractions for how they are exposed. It has never had a standard abstraction for what a business is actually allowed to do. That layer exists in every system — dissolved across a precondition here, a status transition there, a permission check three files away.'
image: '~/assets/images/abstraction-layers.png' # PLACEHOLDER — replace before publish
draft: true
category: Engineering
tags:
  - operational model
  - architecture
  - ai agents
  - abstraction
---

<!--
BRIEF — Series: The Future of Programming, layer 04 of 08. THE FLAGSHIP.
Delete this block when the draft is written.

This is the category-creation piece. Everything before it earns the reader's
attention; everything after it draws consequences. Give it the most room, the
best figure, and the longest editing pass. If one article in the series gets
cited a year from now, this is the one it needs to be.

SCHEDULING: do not write this one in its own week. It lands three weeks out and
Semantics and Ontology are being written in the same window — start drafting it
in parallel, now. If it is not ready by Sep 6, swap it with the HackerNoon week
(Sep 13) rather than shipping it thin. Those two weeks are interchangeable by
design; nothing else in the calendar is.

THESIS
Software has abstractions for what things are (types, schemas, ontologies) and
abstractions for how things are exposed (OpenAPI, GraphQL, MCP). It has never had
a standard abstraction for what a business can actually do. The target is not
"here is what DNA calls an operational model" — it is "wait, that's a missing
layer."

THE SPINE
1. Open by showing the layer already exists and is simply not written down.
   Take `Pay Invoice` in a normal codebase and locate its pieces: a status guard
   in the service, an amount check in a validator, a role check in middleware, a
   state transition inside an ORM callback, an edge case that survives only
   because someone remembered it in review. Five files, no name. That is a layer
   dissolved into its implementation.
2. Name the primitive:
       Actor + Action + Resource + Preconditions + State transition
   Pay Invoice — actor Customer · target Invoice where status: Issued · rule:
   payment equals amount due · effect: Invoice.status → Paid.
   Build it up one clause at a time, and after each clause show what that clause
   buys: who can, what it applies to, when it is legal, what is true afterward.
3. The compounding demonstration — this is the section that has to land. Once the
   operation is explicit, show what falls out of it mechanically rather than by
   being written again: the authorization check, the API contract, the state
   machine, the audit record, the test cases for each precondition, the error
   taxonomy, the documentation. Each one is currently hand-written from an
   unstated shared understanding. Each one drifts independently.
4. The consistency argument. Every consumer today re-derives the rules for
   itself, which is why the API permits a payment the UI forbids. Not a bug in
   either — a bug in the absence of a layer.
5. Prior art, at length and without defensiveness. See below. The honest framing:
   the industry has modeled this layer many times, one slice at a time, and never
   as the layer itself.
6. Agents, both directions. Generation: an agent that derives operations from an
   ontology and hands you a diff you can read is doing short, checkable hops.
   Delegation: an agent that *runs* operations needs this layer to know what it
   is permitted to do and what its actions mean. Prose in a system prompt is a
   bad substitute for a definition. This is where the series' argument and the
   product's argument finally touch — and it should still read as an argument
   about software, not about DNA.
7. THE HANDOFF SECTION (required in every piece — see planned_posts.md).
   In, from Ontology — "Derivation": operations are written against entities that
   already exist. `Invoice.status` had to be a property before `Pay Invoice` could
   name `Issued` as a precondition, and `Customer` had to be one entity before it
   could be an actor. Show an operation being derived from the ontology rather
   than invented next to it — the CRUD default is what you get when nobody does.
   Out, to the Execution Model — "Projection": the operation is what the surfaces
   are generated from. Same preconditions, same effects, same errors, four faces.
   An operation nobody can reach is theoretical; that is the next piece.

PRIOR ART
BPMN (models the flow, not the operation's contract). Statecharts and XState
(model the transitions, scoped to one machine). Temporal and Camunda (durable
execution of a flow that was already decided elsewhere). DDD aggregates and
commands (the closest ancestor — commands with invariants — but scoped inside one
bounded context and expressed in code, not as a portable definition). OPA, Cedar,
Zanzibar (model permission in isolation from the operation it permits). CRUD
scaffolding. Event storming.

DNA'S ONE NOVEL CLAIM
Every prior art above models one slice of an operation: the flow, or the
transition, or the permission, or the durability. None of them is a single
definition that names actor, target, precondition and effect *together* and is
authoritative for everything downstream. The claim is unification and
directionality: one operation, stated once, that the permission check and the API
contract and the state machine are all projections of — not four artifacts that
happen to agree today.

FIGURE — interactive, and the most important one in the series
This piece lives or dies on the reader manipulating an operation and watching
everything downstream move. Build the Pay Invoice operation as a live definition:

  actor      Customer
  target     Invoice where status: Issued
  rule       payment equals amount due
  effect     Invoice.status → Paid

Each clause is editable or removable. Below it, the artifacts that derive from it
update live — the permission check, the API contract, the state machine, the
error taxonomy, the test cases. Drop the `status: Issued` precondition and watch
a 409 disappear from the contract, a test case vanish, and a double-payment path
open up. That is the "wait, that's a missing layer" moment, and no paragraph
produces it.

Check `OperationsDemo.astro` first — /operations already lets you define resources
and actions and watch the API surface fall out, which is most of this. Extending
it beats building a second one, and reuse keeps the article and the product demo
telling the same story. Rename to .mdx.

Build this figure first and write the prose around it. If the interaction works,
the article is already half-argued; if it doesn't, better to find out before
20,000 words of scaffolding depend on it.

LINKEDIN HOOK
"Software has abstractions for data. For APIs. For code. Where is the abstraction
for what your business is actually allowed to do?
It's in your codebase right now — spread across a status check, a permission
guard, and a comment someone left in 2023."

LINKS
Series map. /docs/operational. /operations demo — this is the one article where a
product link is unambiguously earned, because the reader will want to poke at it.
Still: at most two, and never before the argument has landed.
-->
