# Agent Operations — the product, designed on the Overlay's pattern

The [proposal](./proposal.md) argues for the page. This designs the thing the page is about, by
taking the Overlay's shape and asking what each of its parts is when the actor is an agent rather
than a person at a screen.

That is not an analogy for the sake of a document. The Overlay's shape is the platform's one answer
to _"govern something we did not write"_, and it decomposes into five parts that are each already
implemented as a package. Agent Operations needs the same five. **Four of them need no new code at
all** — which is the finding that should drive the build order, and the claim the page is entitled
to make.

## 1. The pattern, stated without the word "overlay"

Read the Overlay generically and it is this:

1. **A small adapter makes a thing the platform did not write _declarable_** — every element gets an
   address, and an element may declare the act it performs. (`@dna/react`)
2. **The build tells the platform what it declared**, and the platform reconciles the declaration
   against what it already holds, four ways: created · corroborated · disagreed · unresolved. _A
   machine may observe; a person decides._
3. **A coverage number, computed on the surface the reader is looking at** — _"2 of 3 controls are
   governed by something"_ — and the sentence that lands underneath it: _"nothing governs this
   control."_
4. **A panel that answers on the thing itself**, seven facets, the verdict on the closed row and the
   reasoning inside it.
5. **Enforcement at the host's own edge**, reaching the _same_ decision the platform reaches rather
   than an approximation of it. (`@dna/guard` over `@dna/policy`)

Every one of those transposes. Here is the whole design in one table; the rest of this document is
the detail.

| #   | Overlay (a control in an application)           | Agent Operations (a tool call by an agent)                                                                                           | New code?        |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| 1   | `@dna/react` stamps an address on every element | The agent's tools **are** the acts it owns (`composeAgentSpec`), or a wrapper names the act per tool for an agent we did not compose | **Adapter only** |
| 2   | The build publishes a manifest; four outcomes   | The agent publishes its **tool manifest**; the same four outcomes, plus two that only agents need                                    | **Small**        |
| 3   | _"2 of 3 controls are governed by something"_   | _"6 of 14 of this agent's tools are governed by something"_                                                                          | **Small**        |
| 4   | Seven facets on a picked control                | The same seven facets on a picked **grant**                                                                                          | **New surface**  |
| 5   | `@dna/guard` refuses at the host's edge         | `@dna/guard`, unchanged, in the tool-call path                                                                                       | **None**         |

## 2. What an agent installs

The Overlay's install is famous inside the demo for being two lines and touching nothing. Agent
Operations has three rungs, and a customer may stop at any of them — which is the property that
makes it sellable pre-GA, exactly as the Overlay's was.

### Rung one — declare

Two populations, and they arrive differently.

**Agents composed from your DNA.** Nothing to declare. `composeAgentSpec` derives one tool per
`Action` the agent owns and carries each action's governing policies through to the executor.
A tool the agent was not granted does not exist on it — the strongest form of "may not", and it is
already built.

**Agents you already run.** The wrapper, and it is deliberately the smallest thing that can work:

```ts
import { Operation } from '@dna/agent-ops';

export const approveInvoice = Operation('invoice.approve', {
  target: (args) => args.invoiceId,
  perform: async (args) => {
    /* your existing tool, untouched */
  },
});
```

**`Operation` is the operative term on every surface; only the props differ.** The design system
gates a control with `<Operation operation="order.place" subject={order}>`, a host application
stamps one on an element with `dna({ address, operation })`, and this binds the same concept to a
tool call. An earlier draft named it `governed()`, which named what we do to the thing rather than
the thing — and this platform names things (Action, Anchor, Key, Lens, Operation) because the whole
argument is that an operation is the unit and a surface is only where you meet it.

**The wrapper is the enforcement.** It resolves the target, reaches the same evaluator, and refuses
before `perform` runs — so there is no second step in which the caller also consults the guard.
`guard.decide` stays public for call sites the wrapper does not fit, as an alternative rather than
a sequel.

**One cost, recorded rather than hidden:** `@dna/ui-library` already exports an `Operation`, so a
file importing both needs an alias. That is the price of one word for one concept across surfaces,
and it is the right trade — but it is a real one, and it should be a decision rather than a surprise
the first person to hit it discovers.

The vocabulary is three words and it is the whole contract — the same table the Overlay's install
section prints, with `route` replaced by `tool`:

| Declared               | The tool                               | The question it raises          |
| ---------------------- | -------------------------------------- | ------------------------------- |
| `operation` only       | performs an act                        | may this agent perform it       |
| `operation` + `target` | performs it **on something**           | may it perform it _on this one_ |
| neither                | is a tool the platform does not govern | none — declared, ungoverned     |

**The field is `operation`, matching the rest of the suite.** `dna({ address, operation })` is what
the Overlay stamps on an element and `<Operation operation=…>` is what `@dna/ui-library` gates a
trigger with; a third spelling for the concept the platform is organised around would be the first
thing a careful reader distrusted. Prose may still say _act_ — the Overlay's own walkthrough does.

**A tool with no act is complete, not half a declaration.** It is the read-only case and it is the
common one. Nothing is reported missing and no act is inferred, for the same reason the Overlay
refuses to infer a verb: a reconciler that filed every unlabelled thing under "broken" would report
most of a real deployment as broken.

### Rung two — publish

At startup the agent posts its tool manifest, the way a build posts its addresses. Same endpoint,
same write path (`POST /v1/graph`, the platform's one write path — there is deliberately no endpoint
per type), same key discipline: nothing publishes without a key, publishing never takes the agent
down, and the key is never printed including in transport errors.

Same four outcomes, and they mean the same things:

| Outcome          | What the platform did                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **created**      | nothing was bound to that act, so a `planned`, inert binding was written, attributed to the key and the agent              |
| **corroborated** | already bound; agreement recorded, **nothing moved**                                                                       |
| **disagreed**    | the tool names a different act than the grant reaches — reported for a person to settle, and **the binding does not move** |
| **unresolved**   | the declared act is one the platform does not hold; it is **not invented**                                                 |

And two outcomes an agent needs that a build does not, because a build declares what it drew while
an agent declares what it can _do_:

| Outcome       | Meaning                                                       | Why it is the interesting one                                                      |
| ------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **ungranted** | the agent exposes a tool for an act it does not own           | Not an error. It is **the finding** — this is where the coverage number comes from |
| **unexposed** | the graph grants the agent an act its manifest does not carry | Authority nobody wired. The mirror of an `unimplemented` anchor                    |

_A machine may observe; a person decides_ holds unchanged and matters more here. An agent's manifest
may create an inert binding. It may never decide anything is live, and it may never move a binding
somebody else made — because an agent that could re-point its own grants has no grants.

### Rung three — enforce

`@dna/guard`, as it ships today, in the tool-call path:

```ts
const verdict = guard.decide('invoice.approve', { actor, target, context });
if (!verdict.permitted) return verdict.detail; // handed back to the model, in words
```

This is the rung that needs no new package, and it is worth stating why in the design rather than
discovering it later: **`@dna/guard` was written for HTTP routes and already implements agent
governance correctly.** Read its rules with an agent in mind —

- **Only `allow` permits.** `route` and `require_approval` are refusals _here_. The README's own
  sentence is the escalation semantics agents need, stated before anyone was thinking about agents:
  _"Being told who should perform an act is not permission for you to perform it, and treating it as
  permission lets anybody bypass an escalation by ignoring where they were sent."_ That is a
  description of the failure mode of every agent that has ever talked itself into an action.
- **`permitted` is a whitelist, not a check for `deny`.** A future outcome must be explicitly
  admitted before it can permit. An agent-shaped system that defaults to permitted on an unrecognised
  verdict is one bad enum away from an incident.
- **Subjects arrive resolved.** `decide` never asks who anybody is, because _"a caller that could
  describe its own actor could route its own work to itself."_ The agent does not get to say who it
  is acting for; the host resolves it.
- **The rules are a local snapshot, never a fetch.** It cannot make a network call at the moment of
  decision even in principle, so there is no unreachable-at-request-time case to fail open for.
  Staleness is reported on every verdict, bounded, and is never a reason to permit.
- **Unratified rules reach the edge and decide nothing**, filtered through the platform's own
  `rulesInForce`, so the edge and the centre cannot disagree about whether planned DNA takes effect.
- **Refusals are never sampled, at any rate.** For an agent this is the entire audit: the rare
  interesting event is the one that was stopped.

Two engineering notes, both small and both real:

- `Bindings.routes` is `Record<string, string>` — an opaque key — so passing tool names works today
  and the refusal message interpolates the key, reading _"refused invoice.approve: …"_ unaided. What
  wants widening is the **vocabulary**, not the type: `routes` → a neutral term, and `GuardVerdict.route`
  with it. A rename, and worth doing before the second consumer hardens the name.
- **The refusal must come back as a sentence, not a boolean.** A refusal a model cannot read is a
  retry loop, and a retry loop against a governance gate is an incident that looks like a bug.
  `verdict.detail` is already a sentence; the design commitment is that the tool handler returns it
  rather than throwing. Better still, when the outcome is `route` or `require_approval`, the sentence
  should name the handoff: _"Approving this invoice is reserved to the CFO. It has been assigned to
  them."_ That converts a refusal into a completed step from the model's point of view, which is the
  difference between an agent that escalates gracefully and one that thrashes.

## 3. The two modes

The Overlay ships Inspect and Prototype behind a toggle. Agent Operations takes the same pair and
the same reason for pairing them: one mode reads what is, the other places what is not yet.

**Inspect** — the default, and the half the wedge is argued on. Pick an agent, pick one of its
grants, and read the facets. Everything in §4 below.

**Rehearse** — the Prototype analogue. Run an agent against today's graph with every effect
suppressed. It produces real verdicts and real routing decisions, writes no occurrence, and changes
nothing. It answers the question a customer actually has before switching an agent on: _what would
this thing be allowed to do if I turned it on this afternoon, and how much of its queue would land
on a person?_

Rehearse is not a simulator and must never be described as one. It reaches the same
`evaluateGovernance` against the same rules; the only thing suppressed is `performAction` and the
occurrence write. That is the identical relationship Prototype has to the running product — a real
address against a real host — and it is why the platform's existing distinction covers it: an agent
at `proposed` or `planned` renders **provisional and inert**, exactly as an unratified surface does,
and no permission or flag promotes it.

The output of a rehearsal is worth designing as an artifact rather than a log, because it is what a
design partner will forward internally: _of 200 items, 143 would be performed, 51 assigned to three
positions, 6 blocked on state, 0 unevaluable._ A one-page answer to "should we turn this on."

## 4. The facets

The Overlay's panel is seven rows with the verdict on the closed row and the reasoning inside it.
The transposition is one-to-one, which is the strongest evidence that the pattern is real and not
retrofitted.

| Overlay facet (a control)                                | Agent Operations facet (a grant)                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Address** — `chrome.fulfillment-link`                  | **Grant** — the tool name and the act it reaches                                     |
| **Operation** — the act, the subject every rule is about | **Operation** — unchanged                                                            |
| **Outcome** — routed to somebody else                    | **Outcome** — performed · assigned · blocked · unevaluable                           |
| **Access** — who may, and who holds it                   | **Authority** — whose authority this runs on, and `ON_BEHALF_OF` whom when delegated |
| **Policies** — attached rules                            | **Policies** — unchanged                                                             |
| **Use** — how often, by how many, last 7 days            | **Use** — calls, distinct targets, **refusals**, last 7 days                         |
| **Activity** — what has happened, refusals included      | **Activity** — unchanged                                                             |

Two deliberate differences:

- **Access becomes Authority**, because the question changed. For a control the question is _may this
  person_; for an agent it is _on whose behalf_. The row must show both edges the platform writes —
  `PERFORMED_BY` the agent and `ON_BEHALF_OF` the person — and it must show the second one's
  **absence** as a distinct state rather than a blank. An agent acting on nobody's behalf is a
  legitimate thing (a scheduled job) and an alarming one (a delegation nobody set up), and the panel
  is not entitled to guess which.
- **Use puts refusals on the closed row.** On a control, refusals are interesting. On an agent, they
  are the metric: an agent whose refusal count is zero either has nothing governing it or is not
  reaching its limits.

And the sentence the whole surface exists to say, transposed unchanged from the Overlay's best beat:

> **"Nothing governs this tool — no access rule, no flag, no recorded use."**

On a button that sentence is a finding. On a tool that can move money it is a resignation letter.
Same panel, same code path, materially more force — which is the argument for building this second
rather than first.

It must stay distinct from the panel saying nothing because it could not ask. A stale snapshot, a
refused key or an unreachable endpoint must never render as a governance gap.

## 5. The coverage number

**"N of M of this agent's tools are governed by something."**

Computed per agent, from the manifest reconciliation in §2: M is the tools the agent declares, N is
those whose act carries at least one rule in force. It is the Overlay's opening line with the
denominator changed, and it inherits the Overlay's honesty constraint exactly: **the denominator
moves**, per agent and per graph, so nothing published may imply a fixed score.

Per agent, never per organization. A single org-wide percentage is unactionable and invites being
gamed by deleting tools.

One number the Overlay does not have and this should: **delegation depth** — of the acts this agent
performed, how many ran on somebody's authority versus its own. It is cheap (both edges are already
written), it is not available anywhere else, and it is the number that makes a compliance
conversation short.

## 6. Credentials, and the one rule that falls out of them

The Overlay's two-key model is publishable (printed in a page, may mint a session and nothing else)
versus secret (held by a backend, may act). An agent is a backend. It holds a **secret** key whose
`actor` is the `Agent` node — the schema already argues for this in its own words: _"A machine is not
a person but it is an actor, and an audit trail saying 'the build agent did this' is worth more than
one saying 'somebody holding this key did this'."_

Everything the `Key` schema already enforces applies unchanged and is worth listing on the page,
because each one is a question a security reviewer will ask: capabilities from a closed set, an
environment the gate checks first, `productionPermitted` explicit and never inherited, `rotatesTo`
so rotation is not an outage, `revokedAt` retained so an incident stays answerable, and no property
anywhere that could hold the secret itself.

**One new rule, and it is a design decision rather than a discovery: an Agent actor may hold
`inspect` and `write`. It may never hold `ratify` or `govern`.**

`ratify` puts a rule in force and `govern` changes the rules. An agent that can ratify its own
grants has no grants, and an agent that can govern is not governed — the same sentence the platform
already commits to for build manifests (_a machine may observe; a person decides_), applied to the
credential rather than the write. The `Key` schema permits all four today, so this needs either a
conditional in the schema or a refusal at issuance. **Recommend the schema**, because a rule enforced
only at issuance is one a seed can walk around.

## 7. What is new, honestly

The page may claim the first column. It may not claim the third until it ships.

| Exists and is enforced today                                                                                               | Thin adapter over what exists                                                            | Genuinely new                                                   |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `@dna/policy` — the one decision, reachable by every edge                                                                  | `@dna/agent-ops` wrapper (`Operation`) — declares operation + target on an existing tool | The console surface: agent list, grants, facets                 |
| `@dna/guard` — refuse at the edge, fail closed, never sample refusals                                                      | Manifest publish for agents, reusing the build path                                      | **Rehearse** mode and its one-page artifact                     |
| `@dna/agent-runtime` — tools derived from grants, policies re-checked at call time, no self-nomination, `fromState` guards | The two extra reconciliation outcomes (`ungranted`, `unexposed`)                         | The coverage + delegation-depth computation                     |
| `Agent`, `OWNED_BY` v7, `PERFORMED_BY` v2, `ON_BEHALF_OF`, `VIA`, `Key.actor`                                              | Widening `Bindings.routes` vocabulary                                                    | The `ratify`/`govern` refusal for agent actors                  |
| The occurrence writer that records both performer and authority                                                            |                                                                                          | Per-caller identity at the MCP edge (`anonymousIdentity` today) |

The last row of the third column is the one that gates the "bring your own agent" story, as the
proposal's claims register already records. Everything else on this page is reachable without it.

## 8. What this changes in the proposal

The design sharpens the page in three places, and the proposal has been updated to match.

- **The wedge becomes measurable.** _"An agent nobody hired"_ is a good sentence and a rhetorical
  one. _"6 of 14 of this agent's tools are governed by something"_ is the same wedge with a number
  attached, and it is the identical move that carried the Overlay launch — absence, not distance;
  addition, not replacement. Lead with the number, keep the sentence as the second beat.
- **The page gains a modes toggle**, `AgentOpsModes`, in the shape `OverlayModes` already ships:
  Inspect default, Rehearse one click away rather than in the scroll path, so a platform lead never
  has to read the deployment pitch to reach the FAQ.
- **The page gains an install-and-trust section**, because on the Overlay those two objections are
  one section for one reason — _what does this cost me to try, and what does it do to my product_ —
  and for an agent the second half is sharper: what does this do to my agent's latency, its failure
  mode, and its behaviour when your service is down. The answers are good and all three are already
  enforced: a local snapshot so there is no call at decision time, staleness reported and never
  permitting, and a recorder whose bad day is swallowed off the critical path.

## 9. Open decisions

- **Is `@dna/agent-ops` a package or a doc?** The `Operation` wrapper is perhaps thirty lines over
  `@dna/guard`. A package makes it installable and gives the page an install line; a doc makes it
  one less thing to version. Recommend the package, for the same reason `@dna/guard` is separate from
  `@dna/react`: a host that runs an agent and renders nothing should not install a React adapter.
- **Does Rehearse need its own capability?** It reads rules and writes nothing, so `inspect` covers
  it. But a rehearsal enumerates a queue and reveals what would happen to every item in it, which is
  more than a read of one act. Worth deciding before it ships, not after somebody asks.
- **Does an agent's manifest expire?** An anchor becomes `orphaned` when a build stops carrying it.
  The agent equivalent is an agent that stops publishing — but agents restart constantly and a
  three-hour outage must not orphan every grant. Probably a longer horizon and a distinct state;
  definitely not the build's rule copied over.
- **How do grants scope to a fleet?** One `Agent` node per deployed process makes audit precise and
  the console unusable at fifty. One node per role makes the console readable and the audit coarse.
  The pricing position in the proposal ("an acting agent is an editor seat") assumes the second and
  should be revisited if the first turns out to be what customers want.
