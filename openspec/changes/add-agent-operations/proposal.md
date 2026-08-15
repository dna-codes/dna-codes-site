# Agent Operations on dna.codes

> The product this page is about is designed in [`design.md`](./design.md), by taking the Overlay's
> shape — adapter, manifest, coverage number, facet panel, edge enforcement — and asking what each
> part is when the actor is an agent. Four of the five need no new code. The page below is written
> to that design, and the two must be edited together.

## Why

The homepage already makes the claim: _"The future of work is humans + agents."_ Nothing below it
supports the second noun. Operations compiles knowledge into a model and emits an "Agent Workflow"
artifact; the Overlay governs controls a human presses; `/pricing` teases a third pillar called
**Run** whose one-line description — _"operational agents under gates"_ — is the only place on the
site where the agent story exists at all, and it is a caption on a greyed-out card.

Meanwhile the platform has the whole thing built and unshown. `packages/agent-runtime` composes an
agent from graph nodes, `packages/schemas` carries `Agent` as a first-class resource with its own
persona and model, and `definitions/seeds/finance/invoice-approval.json` is a working
end-to-end demonstration: an AI worker picks up a queue of invoices, approves the ones its governing
policy delegates to it, and hands the rest to the CFO — **with no code written for any of it.**

**The wedge is accountability, not capability.** Nobody needs to be sold on agents doing work; they
already have three running. What they cannot answer is the set of questions any organization asks of
any worker:

- What is this agent allowed to do — not "what can its API key reach", but _what is its job_?
- Whose authority is it acting under when it does something consequential?
- What happens at the edge of that authority — does it stop, or does it proceed and apologize?
- Who turned it on, who can turn it off, and is turning it off a deploy?
- What did it actually do, in a record that survives the log retention window?

Today the honest answers are: whatever the key reaches; nobody's; it proceeds; an engineer, an
engineer, and yes; and a log file that does not know which human the work was for. **An agent, as
most companies run it, is an actor nobody hired.** It has capability without a position, instructions
without a version, and authority without a grant.

This platform's answer is unusually clean and it is already in the schemas: **an agent is an actor in
the same graph as your people, under the same edges.** `OWNED_BY` — the edge that gives a Position an
Action — admits an `Agent` unchanged. The v7 schema says why in its own description: _"Reusing
OWNED_BY rather than minting an AI-only edge keeps human and AI performers interchangeable:
reassigning work between the CFO and an agent is an edge rewrite, and every consumer keeps one
query."_

That sentence is the product. Everything below is how to sell it.

## Naming

**Ship as "Agent Operations." Path `/agent-operations`.**

It is the literal thing: Operations, extended to a second kind of actor. It inherits the parent
product's recognition, it survives a skim, and it is what the buyer will type. It also names the
_category_ rather than the mechanism, which matters because the mechanism (policy-gated tool calls
over a graph) is not a phrase anybody searches.

Candidates considered and rejected:

- **_Run_** — the current pillar name. Says nothing on its own; it is a verb looking for an object,
  and the same objection that killed _DNA Live_ on the Overlay launch applies unchanged. Keep it as
  the **verb**, not the product name — see below.
- **_DNA Agents_** — reads as "we sell agents," which invites a comparison against every agent
  framework on earth and loses on features. We do not sell the worker; we sell the terms of
  employment.
- **_Agent Governance_** — accurate, and the exact register of a product nobody champions. It also
  collides with the Overlay's territory.
- **_Workforce_ / _Digital Workforce_** — the enterprise-consultant register, and it promises
  headcount replacement, which is a claim we cannot support and would not want to.

**Related decision: fix the pillar names, which currently disagree with the products.**
`/pricing` publishes three pillars — **Design · Overlay · Run** — while the Products nav publishes
two products, **Operations** and **Overlay**. So the site already ships two names for one thing
(_Design_ and _Operations_) and one name for a thing with no page (_Run_). Adding a third product
without resolving that ships three inconsistencies instead of one.

**Decision: the pillars are named for the products, and the verbs stay the verbs.**

| Product              | Verb       | Status       |
| -------------------- | ---------- | ------------ |
| **Operations**       | Model it   | Live demo    |
| **Overlay**          | Govern it  | Early access |
| **Agent Operations** | **Run it** | In build     |

The tagline **"Model it. Govern it. Run it."** is untouched, which is the point: the verbs were
always the durable half, and now each one has a product answering to it. _Design_ disappears as a
public name; it was never on a page.

**Cross-repo impact, same as last time.** `master-plan.md` §8.2 records the vision art's _"Model it.
Share it. Run it. Together."_ The Overlay launch already accepted the divergence by replacing
_Share_ with _Govern_. This change makes no new divergence — it only puts a product behind _Run_.

## Where it goes: its own page, not a section of `/operations`

The brief describes Agent Operations as _"an extension of the Operations product,"_ which is
architecturally true and is exactly the reason it must not be a section of `/operations` today.

- **`/operations` has one job and does it well.** Its argument is _knowledge in, operating model
  out_, carried by a demo that runs a transcript into a spec. Bolting an execution story onto the
  end changes the page's buyer mid-scroll — the same objection that put Prototype behind a toggle
  on `/overlay` rather than in its scroll path.
- **The parallel with Overlay is the reader's own.** The Overlay is also "an extension of the
  Operations product" — it is the model read where the work happens — and it earned its own page for
  the same reason: a surface a visitor can evaluate on its own terms is a page.
- **A section cannot carry a demo, and the demo is the argument.** The invoice run needs a full
  viewport and about ninety seconds. Nothing shorter proves that the agent's behaviour changed
  without anybody touching the agent.

What `/operations` gets instead is **one paragraph and one link**, placed after `OperationsLayerC`,
in the shape `OverlayTeaser` was specified for: eyebrow, one sentence, one shot, one link. One
sentence, and it is the thesis: _the same model that tells a person what to do can tell an agent —
and refuse it._

**Out of scope:** a self-serve agent runtime; a public `@dna/agent-runtime` install path; an agent
console; `/docs/agents` (see [Impact](#impact) — the published schema package cannot back it yet).

## What Changes

- **NEW** `src/pages/agent-operations.astro` — a product page in **five sections**. See
  [Cut to five](#cut-to-five) for what the first draft had and why it does not.
- **NEW** `AgentOpsDemo` component — the scripted invoice run, following the stub-first pattern
  established on `/playground` and `/overlay`: real shapes, staged data, a `Demo mode` badge where
  the real console shows the signed-in person. Lives in the hero's `image` slot.
- **NEW** `AgentCoveragePanel` — the coverage reading, rendered in three places (the homepage card,
  the wedge, the demo's first beat) so the number cannot disagree with itself.
- **NEW** `AgentOpsActor` — the parity table and the occurrence reading. One section, because they
  are the same argument seen twice.
- **NEW** `AgentOpsGate` — enforcement, the four outcomes, the install, and what it does to an agent
  you already run. One section, because those are one objection.
- **NEW** `AgentOpsTeaser` on `/operations`, after `OperationsLayerC`.
- **MODIFIED** `src/data/products.ts` — a third `Product`; the `key` union gains
  `'agent-operations'`.
- **MODIFIED** `src/components/widgets/ProductsHighlight.astro` — three cards, not two; heading
  becomes "Three products, one model."
- **MODIFIED** `src/components/widgets/WaitlistForm.astro` — a third interest, and the conditional
  qualification field generalized (today it is Overlay-only).
- **MODIFIED** `src/pages/pricing.astro` — the pillar strip renamed per the decision above; a new
  **Agents** row group in `src/data/pricing.ts`.
- **MODIFIED** `src/pages/index.astro` — nothing structural. The hero already says _humans +
  agents_; it finally becomes a link.
- `src/navigation.ts` and `Footer` — **no change needed.** Both map over `PRODUCTS`.

## The page: `/agent-operations`

**Four content sections between the hero and the close, alternating side to side** so the eye has
somewhere new to land each time:

```
Hero + AgentOpsDemo                            the argument, in motion
 1. The wedge          prose ◀ │ ▶ visual      most of your agent is ungoverned
 2. AgentOpsActor      visual ◀ │ ▶ prose      an agent is an actor
 3. AgentOpsGate       prose ◀ │ ▶ visual      the decision, made outside the model
 4. AgentOpsInstall    visual ◀ │ ▶ prose      what it costs to put in front of one
Close                                          FAQ, then the waitlist
```

Every visual is a **specific thing** rather than an illustration of a category: a coverage reading
being computed, one act with one edge forking to two kinds of actor, three calls through one rule
landing on different outcomes, and the whole install at five lines. A reader who only looks at the
right-hand column should still come away with the argument.

### Cut to five

The first draft of this page had eight sections in `/overlay`'s shape. That shape is right for a
product with an install path and two shipped modes; this one has neither yet, and copying the
skeleton rather than the reasoning produced a page that argued the same things twice. What came out,
and why — the cuts are the design:

- **Rehearse, and the modes toggle with it.** A second mode, one click off the scroll path,
  describing something still being built. It stays in [`design.md`](./design.md) §3 and it is still
  last in the build order; it belongs on the page when it belongs in the product. Cutting it also
  removes the tablist, which was the page's only stateful component after the demo.
- **"An agent nobody hired."** A prose restatement of the wedge, and the only block on the page with
  no artifact beside it. The proposal's own argument for leading with the number — _a sentence is
  easier to argue with_ — was an argument for the number replacing it, not for running both. Its one
  load-bearing sentence moved into §2.
- **The escalation section.** The demo already shows a rule delegating six invoices and reserving
  four. Arguing it again in prose two screens later taught the reader that the page repeats itself,
  which is the most expensive thing a long page can teach.
- **Install as its own section.** It was always the second half of the enforcement objection — _is
  this real, and what does it cost me_ — so it is now the second half of §4 rather than a section
  that re-introduces a reader who had stopped caring.
- **The standalone pricing strip and `SocialProof`.** Both fold into the close: pricing becomes an
  FAQ answer with a link, and the design-partner line becomes a sentence above the form.
- **Four of the eight trust claims.** Sampling policy, the recorder's failure mode, whether a key may
  ratify, and the whitelist rule are FAQ answers rather than page copy, and two of them already are.
  The four that stayed are the ones a buyer asks unprompted: latency, staleness, fail-closed, and
  what a refusal looks like to the model.

**Hero.**

Headline: **"Give your agents a job, not an API key."**
Sub: _An agent in your model is an actor like any other. It holds the operations you grant it, under
the policies you wrote for everyone, and every action it takes is recorded with whose authority it
used._
Actions: `Join the waitlist` (primary) · `Watch a run` (anchor to the demo).

The headline works because "API key" is the reader's actual current answer and they know it is a bad
one. It names the defect in four words without naming a competitor, and _job_ sets up every section
below — position, authority, escalation, record.

Alternates, in order: _"An agent is an actor. Treat it like one."_ (cleanest statement of the
thesis; weaker hook, no defect named); _"Your agents, under the same rules as everyone else."_
(safest, and the one to fall back to if "API key" tests as too narrow for a non-engineering reader);
_"The org chart has a new kind of box in it."_ (best line on the page, wrong altitude for a hero —
**hold it for the `AgentOpsTeaser` on `/operations`**, where one sentence has to do everything).
Rejected: _"Autonomous, accountable."_ — a pair of adjectives is not a claim.

**1. Most of your agent is ungoverned.**

**The wedge is absence, and now it is a number.** The design's §5 gives this page the thing the
earlier draft of this proposal lacked and the Overlay launch had from the start: a coverage line
computed on the reader's own surface.

> **_6 of 14 of this agent's tools are governed by something._**
>
> Not badly governed — **ungoverned**. No rule about whether it may, no flag, no record that it ever
> did. Most teams have never seen that figure for an agent they are already running, because nothing
> they own is in a position to compute it. A framework does not know what an approval limit is.

Same three properties that made it work on `/overlay`, and they all survive the transposition:
absence rather than distance (so the ask is addition, not replacement), a figure nobody else can
produce, and a denominator that moves — **so the copy must say it moves.** A marketing page implying
a fixed score gets caught by the first person who runs it against their own agent.

The rhetorical version is the second beat, not the first, because a sentence is easier to argue with
than a number. Deliberately not a feature list and deliberately not fear: the register is _you would
never onboard a person this way_, which is recognisable rather than alarming.

Copy, roughly:

> You would not give a new hire root and a Slack channel and call it onboarding. But that is roughly
> the shape of every agent deployment: its authority is whatever its key can reach, its instructions
> are a string in a repository, its off-switch is a deploy, and its audit trail is a log that does
> not know which human the work was for.
>
> The gap is not that agents are dangerous. It is that your organization already has answers to all
> of this for people — positions, delegated limits, escalation, approval, a record — and none of it
> reaches the agent, because the agent was never in the model.

**2. `AgentOpsModes` — Inspect ⇄ Rehearse.**

The toggle under the wedge, in the shape `OverlayModes` already ships. **Inspect is the default and
carries the four beats below**; **Rehearse** is one click away rather than in the scroll path, for
the reason the Overlay's Prototype toggle exists: it changes the buyer, and a platform lead must
never have to read the deployment pitch to reach the FAQ.

**Rehearse**, in four sentences and one artifact: run the agent against today's graph with every
effect suppressed; it produces real verdicts and real routing and writes nothing; the output is a
one-page answer to _should we turn this on_ — _of 200 items, 143 would be performed, 51 assigned to
three positions, 6 blocked on state, 0 unevaluable._ Say **rehearsal**, never **simulation**: it
reaches the same evaluator against the same rules, and the only thing suppressed is the effect.

The rest of this section is the Inspect half.

**2a. An agent is an actor. Same edges, same rules.**

The parity table, which is the beat. Left column: what a Position has. Right column: what an
Agent has. The point is that the right column is not a translation — it is the **same edge name**.

| For a person                                          | For an agent                                           |
| ----------------------------------------------------- | ------------------------------------------------------ |
| Holds operations via `Action -[:OWNED_BY]-> Position` | `Action -[:OWNED_BY]-> Agent` — the same edge          |
| Governed by a `Policy` on the action                  | The same `Policy`, unchanged                           |
| Its work lands in a queue                             | `WorkItem -[:ASSIGNED_TO]-> Agent`, same as a Position |
| Its acts are recorded as `Operation` occurrences      | The same occurrences, `PERFORMED_BY` the agent         |
| Carries a job description                             | Carries `instructions` and a `model`, in the graph     |

Then the line the section exists for, lifted almost verbatim from the schema's own reasoning:
**reassigning work between the CFO and an agent is an edge rewrite.** Not a migration, not a
refactor, not a new integration. One edge, and every report, every lens and every audit query keeps
working because none of them had two code paths to begin with.

And the consequence people will not expect: _an agent's instructions live in the graph, so changing
how it behaves is a change to your model — reviewable, ratifiable, and versioned like every other
change. It is not a pull request against a prompt._

**2b. The gate is outside the model.**

The most important beat on the page and the one a technical buyer will read twice. Every
"guardrail" story a reader has heard is a prompt asking a model nicely. This is not that.

- The agent's tools are **derived from the actions it owns**. It cannot call something it was not
  granted, because the tool does not exist on it.
- Each governing policy is **carried through to the executor and re-checked at call time**. Putting
  the rule in the prompt is not enough and the runtime says so in its own comments.
- The policy is judged against **what the graph says the target is**, never what the caller claimed
  it is. A model that calls the approval tool with an invented amount is judged on the real one.
- There is deliberately **no "who is asking" parameter**. Routing is decided from the graph and the
  policy alone, so an agent cannot nominate itself.
- A step **refuses to act unless the target is in the state that step advances from**, so an agent
  cannot skip a review it was supposed to wait for.
- And the one a reader will not have thought of, straight out of `@dna/guard`: **being told who
  should perform an act is not permission to perform it.** `route` and `require_approval` are
  refusals at the edge, because treating them as information lets anything bypass an escalation by
  ignoring where it was sent. That is a description of the failure mode of every agent that has ever
  talked itself into an action, and the platform wrote the rule down before it was thinking about
  agents at all.

Four outcomes, and naming all four is the honesty that sells it: **performed · assigned · blocked ·
unevaluable.** The fourth is the good one — when two policies tie and nothing can break it, the
runtime reports that it cannot decide rather than guessing. _A system that always has an answer is a
system that is sometimes making one up._

**2c. What happens at the limit is the product.**

The escalation story, told on the demo's own numbers. A policy delegates approval below a limit and
reserves the rest; the agent works the whole queue, approves what it may, and **assigns** the rest to
the position that owns it. The work does not fail and it does not proceed — it lands in a person's
queue with the reason attached.

Then the beat that closes the section: **change the limit and re-run.** The agent's behaviour
changes and nobody touched the agent. No redeploy, no prompt edit, no code review. _That_ is what
"feature flags for agents" actually means here — the platform has one governance primitive, and a
release policy is a policy whose category says so, which is why turning an agent capability off is
the same act as turning a button off in the Overlay.

**2d. Two questions, two edges: what the audit answers.**

Every occurrence an agent produces records **`PERFORMED_BY` the agent** and, when it acted for
somebody, **`ON_BEHALF_OF` that person** — two edges rather than one, and the schema explains itself
better than marketing copy will:

> _"'which agent did this' and 'on whose authority' are different questions, and an audit trail that
> can only answer one of them answers neither well."_

Put that on the page as a pull quote, attributed to the schema. It is the single most credible
sentence available to us, because it is a design note we wrote for ourselves before anyone was
watching.

Alongside it, the rest of one occurrence read as a row: which action it executed, what it acted on,
which state transition it caused, and — via `VIA` — which system it arrived through. And the
absence case, which is the part an auditor cares about: an act the platform could not attribute is
written **without** a performer rather than dropped, because _the missing participant is itself the
finding._

**3. It installs in one wrapper, and it will not touch your agent.**

Install and trust are one objection — _what does this cost me to try, and what does it do to the
thing I already run_ — so they are one section, exactly as on `/overlay`. For an agent the second
half is the sharper one, and it is three questions: what does this do to my latency, to my failure
mode, and to my agent's behaviour when **your** service is down.

The three rungs from the design, a customer stopping at any of them:

1. **Declare** — `Operation("invoice.approve", { target, perform })`. The same operative term the
   Overlay and the design system use, with the props each surface needs, and a tool
   with no act is complete rather than half-declared.
2. **Publish** — the agent posts its tool manifest at startup, the way a build posts its addresses.
   That is where the coverage number in §1 comes from.
3. **Enforce** — one call in the tool path. `if (!verdict.permitted) return verdict.detail`.

Then the claims, as a tight list — the beat most likely to close a technical buyer, and every one of
them already enforced in `@dna/guard` or `@dna/agent-runtime` rather than promised:

- **There is no network call at the moment of decision.** The rules are a local snapshot, not a
  fetcher — it could not call out even in principle. So your agent's latency is unchanged and your
  agent does not stop when we do.
- **Staleness is reported on every verdict and is never a reason to permit.** Refusing on staleness
  would turn a slow refresh into your outage; permitting on it would make the bound an attack.
- **Drawing fails open, binding fails closed.** What may be _offered_ leaves your agent as it was
  when it cannot decide. What may _happen_ refuses. A thing that permits when it cannot decide
  authorizes nothing.
- **`permitted` is a whitelist.** A verdict we add later cannot permit anything until it is
  explicitly admitted.
- **The refusal comes back as a sentence, not an exception**, so the model reads why and escalates
  instead of retrying. Where the rule routes the work, the sentence names the handoff.
- **Refusals are never sampled, at any rate.** Permitted acts may be, and where they are the record
  says so, so a count is never read as exhaustive when it was one in two.
- **The recorder is off the critical path.** Its return value is ignored and anything it throws is
  swallowed: a collector having a bad day may not become your outage.
- **An agent key may never hold `ratify` or `govern`.** An agent that can put its own rules in force
  has no rules. _A machine may observe; a person decides._

**And the population that installs nothing: point your existing agent at it.** `apps/mcp` — Claude,
Cursor, your own loop — reaches the same operating model through MCP tools rather than a bespoke
integration. It gets the business, with policy and authority attached, instead of a prompt describing
the business.

**Written to what is true today, and today that is the read side.** See [What is true, and what is
not](#what-is-true-and-what-is-not). The claim we can make now, and it is a good one: _asking is free
and unlimited_ — an agent that can only read your operating model costs nothing, on any plan, exactly
as an inspector does. The claim we cannot yet make is per-caller identity at the MCP edge.

**Closing: pricing pointer, FAQ, waitlist.** Same shape as `/overlay` — a bordered strip pointing at
`/pricing`, six FAQs, then the waitlist form with `agent-operations` pre-ticked.

## The demo: `AgentOpsDemo`

Stub-first, per the pattern that has now shipped twice: the real component signature and staged data
in the browser, a `Demo mode` badge, no network.

**Two beats, and both of them move.**

1. **Coverage.** The agent's eight tools are judged one at a time, the counter climbing to _"3 of 8
   governed"_ as the segments fill. The five ungoverned ones are named rather than counted, and two
   of them move money out. This is the wedge in §1, watched being computed rather than asserted.
2. **The run.** Eight invoices resolve one at a time against a $10,000 delegated limit: five
   approved by the agent, three assigned to the CFO — including the one for exactly $10,000.

It had six. The four that went were a static agent card, a static grants list, a static occurrence
reading, and a second run at a raised limit. **The first three were stills**, and a reader watching
an unchanging frame for seven seconds concludes the thing is broken; three in a row taught them to
look away before the run started. The fourth was the same animation with a different number, which
is a rail step a reader has already learned to skip — its claim (_change the policy and the split
moves, with nothing touched on the agent_) survives as one line under the counters, where it costs a
sentence instead of ten seconds.

**Counts are small enough to check by eye, deliberately.** Eight tools with all eight rows on screen
beats fourteen with six shown and a footnote about the rest: the number is the whole wedge, and it
should not require trusting an ellipsis. The static `AgentCoveragePanel` on the homepage card, the
`/operations` teaser and this page's §1 must agree with it exactly.

**Blocking detail: the seed's own numbers do not agree with its policy, and the copy must not
inherit the error.** `invoice-approval.json` describes a run that _"auto-approves seven and suspends
three."_ Its policy condition is `amount < 10000`, and the ten seeded invoices are 4250, 880, 1500,
320, 9800, **10000**, 2400, 18750, 42000, 12300 — so a real run approves **six** and assigns
**four**. The invoice at exactly $10,000 is on the wrong side of a strict `lt`.

**Resolved on the site's side; still open on the platform's.** Rather than wait, the page publishes
what the policy _actually does_ and never what the seed's prose claims. The demo narrates eight of
the ten — dropping the $320 and the $12,300, which add a row each and no argument — and its split is
**five approved, three assigned**, which is that subset judged by `amount < 10000`.

The boundary invoice was kept and **made the point rather than hidden**: the one at exactly $10,000
escalating is what proves the limit is a rule rather than a vibe, and it is the row left open in the
enforcement panel because it is the one where a reader's intuition is wrong and the rule is not.

What remains for `dna-codes-platform` is unchanged: decide whether the limit is `lt` or `lte` and
correct the seed's description to match. Nothing on the site depends on that decision, but the seed
currently ships prose that its own policy contradicts, and the next person to read it will believe
the prose.

**Second discrepancy, same file.** The seed's description says payment _"escalates to the
Controller,"_ but `pol-payment-authority` allows every amount (`amount >= 0`) and its escalation
branch is `not(>= 0)`, which nothing satisfies. `Pay Invoice` is also marked `automatable: false`
while being owned by the agent. Nothing on the page may claim a payment escalation until that seed
is fixed; the approval step alone carries the argument, so the demo should simply stop at approval.

## Pricing: agents light up rows, they do not add a SKU

The Overlay launch committed to one ladder priced on meters all three pillars share, and explicitly
flagged the risk this change now realizes: _"Run's natural meter is agents, cells and
environments."_ Honoring that commitment is worth more than any revenue this could capture early.

**Decision: an agent that may act is an editor seat.**

It follows from the principle already published on `/pricing` — _charge for authority, not for
looking_ — and from the thesis of the product itself. If a human and an agent holding the same
`OWNED_BY` edge are interchangeable, then charging differently for them contradicts the pitch on the
page above it. It needs no new meter, no usage billing, and no negotiation about what counts as a
run.

Its corollary is the better half: **an agent that only reads is an inspector, and inspectors are
unlimited on every plan, forever.** A read-only agent pointed at your model through MCP costs
nothing. That is the right incentive in every direction — it is how the habit spreads, and reading is
where the value compounds.

Rejected: per-run or per-token pricing. We would be metering the customer's own success and giving
them a reason to automate less, which is the identical argument that ruled out MAU metering. It also
prices a cost that is not ours — bring your own model key.

What `src/data/pricing.ts` gains is one row group, and only rows the platform can actually enforce:

| Agents                                   | Free              | Starter   | Team      | Business  | Enterprise |
| ---------------------------------------- | ----------------- | --------- | --------- | --------- | ---------- |
| Acting agents (count against editors)    | 1, non-production | ✓         | ✓         | ✓         | ✓          |
| Read-only agents / MCP                   | Unlimited         | Unlimited | Unlimited | Unlimited | Unlimited  |
| Policy-gated execution, human escalation | ✓                 | ✓         | ✓         | ✓         | ✓          |
| Bring your own model key                 | ✓                 | ✓         | ✓         | ✓         | ✓          |

Agent occurrence history needs no row of its own: it is occurrence history, which the table already
meters. That is the whole point.

## Waitlist

A third interest — `agent-operations`, blurb _"Put agents to work under our own rules"_, mark
matching `products.ts`.

And a fix the form needs anyway: the conditional field is currently hard-coded to Overlay (_"What is
your application built with?"_). Generalize it to a per-interest optional question, and Agent
Operations asks the one that qualifies best:

> **What are your agents doing today, and what stops them?** _Optional._
> Placeholder: _"Two Claude agents in a Python service. Nothing stops them, honestly — they use a
> service account with the same permissions as our admin."_

That answer is a qualified design-partner conversation in one line, exactly as the Overlay's
governance question was.

## What is true, and what is not

The Overlay launch shipped a claims register because §3 made seven falsifiable statements about
platform behaviour. This page makes more, and its riskiest ones are about a runtime rather than a
plugin. Everything in §3 and §4 is enforced in `@dna/policy`, `@dna/guard`, `packages/agent-runtime` and
is re-checkable against the invoice seed. These are the exceptions, and the page must be written
around them rather than through them.

- **The MCP edge has no per-caller identity yet.** `apps/mcp/src/identity.ts` ships
  `anonymousIdentity` — an allow-all context, with a documented TODO to replace it with real
  OAuth 2.1 / ID-JAG resolution. So §4's closing panel may say _your agent reaches the same model through the same
  tools_ and must **not** say _under the same gates, as itself_. That sentence becomes true when the
  identity provider lands, and it is the single highest-value unlock for this page.
- **`executionState` and `lastHeartbeat` are modelled, not driven.** The `Agent` schema carries them
  and the web app renders an attention overlay from them, but nothing on the run path writes a
  heartbeat. No "live agent status" claim, and no green dot in the demo that implies one.
- **`ON_BEHALF_OF` is written by the API's occurrence writer**, on the delegated-act path. It is real,
  and it is the one edge on this page whose absence would be most quietly damaging — re-check it
  before any edit to §3's occurrence reading.
- **There is no agent console.** Composition, policy authoring and runs are seed-and-service level
  today. The page sells design partners and a waitlist, and the status badge says **In build** — not
  Early access, which is Overlay's word and means an install path exists.
- **Three things on the page do not exist yet and are named as future work in the design**: the
  coverage computation and the two extra manifest outcomes (`ungranted` / `unexposed`), **Rehearse**
  mode, and the `ratify`/`govern` refusal for agent actors. The enforcement they sit on top of does
  exist — `@dna/policy` and `@dna/guard` ship today and the invoice seed exercises the runtime — so
  §4 and its claims list are safe, and §2's number is the one place the page describes a thing we
  are building. Rehearse left the page entirely rather than be qualified on it. Do not let that
  distinction blur in the copy; it is the difference between early and untrue.
- **The published schema package cannot back this vocabulary.** `@dna-codes/dna-schemas@0.7`, which
  `/docs/operational` is generated from, ships `action / role / rule / task / trigger` — it has no
  `Agent`, no `Policy`, no `Position`. So nothing on this page may link a primitive to a reference
  page, because those pages do not exist. Either the package bumps first (`/generate-docs`) or the
  page carries its own inline definitions. **Recommend the latter, and ship the page without a docs
  dependency.**

## Impact

- **`ProductsHighlight` goes from two cards to three,** and its comment block is explicit that the
  two-card symmetry is load-bearing (_"asymmetry here would read as one product mattering more"_).
  Three at `md:grid-cols-3` makes each 4:3 screenshot noticeably smaller; on a narrow laptop the
  strip becomes a wall. Alternative if it does not survive review: two cards plus a full-width band
  underneath, which also reads as _the newest one_ without saying so.
- **The third card needs a real screenshot,** taken from `AgentOpsDemo` itself, on a dark surface —
  the same constraint that forced the Overlay's shot to be recaptured from its own miniature.
- **`/pricing` pillar rename is a copy change with a naming decision inside it.** Do not let it ship
  as a typo fix; _Design_ disappearing as a public name is the decision.
- **The Products dropdown at three entries** is where a nav starts wanting descriptions to carry
  weight. They already exist in `products.ts` and already render — verify the third does not push
  the menu past the fold on a 13" screen.
- **Product mark.** `tabler:robot` is the legible default and the one a stranger parses instantly.
  `tabler:affiliate` is the alternate and the more honest one — a node joined to other nodes, which
  is what the product actually claims an agent is. Recommend `tabler:robot` for the nav and reserve
  the affiliate glyph if the robot ever reads as toy. Verify whichever ships is in the installed
  icon set before committing.
- **Blog.** `planned_posts.md` has no agent post in it. The obvious one, and the best long-tail entry
  point to this page, is **"An agent is an actor: what your org chart is missing."** A second, more
  technical: **"Guardrails in the prompt are not guardrails"** — the §4 argument at length, with the
  runtime's own comments as evidence.
- **Claims register.** §3 and §4 assert behaviour of packages under active development in
  another repository. Re-run the invoice seed before any material edit to those sections, exactly as
  `/overlay` requires re-walking the demo.

## Build order

1. **Resolve the seed discrepancies** (`lt` vs `lte`; the payment-escalation description). Blocks
   every number on the page and the demo script. Cheapest item here and the only true blocker.
2. **`products.ts` + `ProductsHighlight` + pricing pillar rename.** The suite becomes three-shaped
   before anything new is written into it, so the page lands in a site that already expects it.
3. **`/agent-operations` static sections** — the wedge, `AgentOpsActor`, `AgentOpsGate`, FAQ,
   waitlist. The page is publishable at this point.
4. **Waitlist third interest + the generalized qualification field.** Small, and it makes the page
   convert the day it ships.
5. **`AgentOpsDemo`.** The largest piece, and deliberately after publication — same call as
   `OverlayDemo`, for the same reason.
6. **`AgentOpsTeaser` on `/operations`,** once there is a screenshot worth cropping from beat 0 or 5.
7. **The blog post,** as the long-tail entry.
8. **Rehearse, and a second mode to put it in.** Off the page until it is in the product. When it
   lands it wants the `OverlayModes` treatment rather than a sixth section — which is the same order
   the Overlay took with Prototype, and for the same reason.

## Open questions

- **Does `Run` survive anywhere?** The recommendation retires it as a public product name and keeps
  it as a verb. If the platform intends `Run` to eventually cover live architecture and cells as well
  as agents, then Agent Operations is a _child_ of Run and the pillar strip needs a different fix.
  Worth a decision now, because it is much cheaper before a page exists than after.
- **Do we say "agent" or "AI worker"?** The schemas say both — the `Agent` type's description is
  _"An AI worker executing a queue of work items."_ The page above uses **agent** throughout and
  reaches for _worker_ only where the parity argument needs it. If the buyer is an operations leader
  rather than a platform lead, that ratio may want to invert.
- **How far does the parity claim go before it needs a caveat?** The table in §3 is true at the edge
  level. It is not true that an agent can hold a `Membership`, and somebody will ask. Either state
  the boundary on the page or be ready to state it on a call.
