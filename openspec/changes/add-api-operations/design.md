# API Operations — the product, designed on the same pattern as the other two

The [proposal](./proposal.md) argues for the page. This designs the thing the page is about, by
taking the pattern the Overlay established, that Agent Operations was designed against, and asking
what each part is when the governed thing is an HTTP endpoint.

The reason to do it this way a third time is that the answer keeps getting cheaper, and the third
answer is the cheapest yet.

## 1. The pattern, and what each part costs here

Read generically, the pattern is five parts:

1. **An adapter makes a thing the platform did not write _declarable_** — everything gets an address,
   and a thing may declare the act it performs.
2. **The build tells the platform what it declared**, and the platform reconciles that against what
   it holds, four ways: created · corroborated · disagreed · unresolved.
3. **A coverage number, computed on the surface the reader is looking at.**
4. **A panel that answers on the thing itself** — the facets, the verdict, the reasoning.
5. **Enforcement at the host's own edge**, reaching the _same_ decision the platform reaches.

| #   | Overlay (a control)               | Agent Operations (a tool call)        | **API Operations (an endpoint)**                           | New code?        |
| --- | --------------------------------- | ------------------------------------- | ---------------------------------------------------------- | ---------------- |
| 1   | `@dna/react` stamps every element | a wrapper names the act per tool      | **nothing — OpenAPI already addressed every endpoint**     | **None**         |
| 2   | the build publishes a manifest    | the agent publishes its tool manifest | **the spec _is_ the manifest**; a parser reads it          | **Small**        |
| 3   | _2 of 3 controls_                 | _6 of 14 tools_                       | _23 of 112 endpoints_ — **and computable with no install** | **Small**        |
| 4   | seven facets on a picked control  | seven facets on a picked grant        | the same seven facets on a picked **endpoint**             | **New surface**  |
| 5   | `@dna/guard` at the host's edge   | `@dna/guard` in the tool-call path    | `@dna/guard` in middleware                                 | **Adapter only** |

**Part one is free, and that is the finding.** On both prior products the adapter was the whole cost
and the whole install friction — a package that walks a tree, or a wrapper a developer has to put
around every tool by hand. Here the customer wrote the adapter before we met them, for their own
reasons, and keeps it current because their own developers depend on it. `method + path` is an
address, `operationId` is a name, and the document is already published and already in CI.

**Part three inverts the funnel.** Because part one is free, the reading is computable from a
document alone — so the first honest thing this product does for a stranger happens before an
account exists. Neither other product can do that. It should shape the page, the demo and the launch.

## 2. The three rungs, and rung zero

A customer may stop at any rung. Rung zero is new to the suite.

### Rung zero — read (no account, no install)

Point us at a spec — or paste it into the browser, which is the primary path because CORS makes
fetching arbitrary specs unreliable. We parse it and report:

- how many endpoints resolve to a **resource** and an **action** by convention;
- where the convention breaks — the endpoints whose naming does not survive a resolver, which on a
  real spec authored by four teams over five years is the interesting half;
- and, once a model exists, how many of the resolved ones are governed by anything.

**The first two are honest for an anonymous visitor. The third is not, and must be labelled.** See
[Limits](#5-limits-stated-on-the-page-not-in-the-footnotes).

### Rung one — declare

Most endpoints need nothing. REST already encodes resource and action, and where it does:

```
POST   /payments        →  Payment.Create
GET    /customers       →  Customer.Read
DELETE /customers/{id}  →  Customer.Delete
```

Where the convention does not hold — RPC-shaped routes, verbs in paths, legacy names — one block
settles it, and it travels with the document rather than in a sidecar file that drifts:

```yaml
paths:
  /payments/{id}/refund-with-approval:
    post:
      x-dna:
        operation: payment.refund
        target: $.path.id
```

**Two words, and it is the same two words on every surface.** `operation` names the act; `target`
resolves the thing acted on. `dna({ address, operation })` stamps a control, `Operation('…', {
target })` binds a tool call, and `x-dna: { operation, target }` binds an endpoint. A third spelling
for the platform's central concept would be the first thing a careful reader distrusted.

| Declared               | The endpoint                               | The question it raises            |
| ---------------------- | ------------------------------------------ | --------------------------------- |
| `operation` only       | performs an act                            | may this caller perform it        |
| `operation` + `target` | performs it **on something**               | may they perform it _on this one_ |
| neither                | resolves by convention, or is not governed | none — declared, ungoverned       |

**Authorization, scope, audit and feature flags are deliberately not in the YAML.** They are facts
the model already holds about `payment.refund`, and restating them in a spec file creates a second
copy that can disagree with the first. This is the sharpest departure from the source conversation,
which sketched a fuller `x-dna` block with `authorization`, `scope`, `audit` and `featureFlag`
nested inside it. That version is more impressive on a slide and worse in practice: it turns the
spec into a policy store, puts governance under a developer's commit rather than a ratifier's
decision, and guarantees that the answer in YAML and the answer in the graph diverge the first time
somebody changes a limit. **The spec says which operation. The model says everything else.**

### Rung two — publish

A CI step posts the spec's resolved bindings the way a build posts its addresses: same write path,
same key discipline, publishing never fails the build, and the key is never printed — including in
transport errors.

```
npx dna publish --openapi ./openapi.json
```

Four outcomes, meaning what they mean everywhere else:

| Outcome          | What the platform did                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------- |
| **created**      | nothing was bound to that act; a `planned`, inert binding was written, attributed to the key  |
| **corroborated** | already bound; agreement recorded, **nothing moved**                                          |
| **disagreed**    | the endpoint names a different act than the binding reaches — reported, and **nothing moves** |
| **unresolved**   | the declared act is one the platform does not hold; it is **not invented**                    |

### Rung three — enforce

```ts
app.use(dnaGuard({ openapi: './openapi.json' }));
```

The middleware resolves the endpoint to its operation, resolves the target from the request, and asks
the same evaluator a React control asks. Refusal happens before the handler. There is deliberately no
parameter naming who is asking — a caller that could describe its own actor could authorize itself —
so the actor comes from the credential the edge already authenticated.

**We are not a gateway and the design has to keep proving it.** No proxy, no traffic, no residency
question, no new failure domain in the request path. The host's edge asks a question and acts on the
answer; the fail-open/fail-closed choice belongs to the host and must be explicit rather than
defaulted quietly.

## 3. The explorer, and what it is allowed to be

Swagger UI stays. The explorer is not a documentation tool and must not accumulate into one.

What it does that Swagger structurally cannot: **pick an actor, evaluate before you execute.**

```
POST /payments — Create a payment

ACTOR          Tim Kleier · Finance.Admin
AUTHORIZATION  Payment.Create  ✓
SCOPE          Acme Corp       ✓
FEATURE        payments_v2     ✓
AUDIT          required

                                      [ Execute ]
```

Afterward: the outcome, and an audit ID.

The evaluation is the product — it is the model answering _may I, as me, right now_, which is a
question no documentation tool has ever been asked. Everything else on that panel exists to make the
answer legible.

**Ship the cheap version first.** One link in the customer's existing Swagger page —
`View in DNA →` — takes a reader from an endpoint to its operation in the graph. It is a day of work,
it requires nothing of the customer's toolchain, and it tests whether anyone wants the panel before
we build the panel.

## 4. Build order

Ordered so that each rung is sellable if the next one slips.

1. **The resolver** — endpoint → resource + action, plus the honest "does not resolve" case. Everything
   else depends on it, and it is testable against real public specs on day one.
2. **`ApiOpsDemo`** — client-side, paste-first, three bundled samples. Ships the page.
3. **`View in DNA →`** — the one-link integration.
4. **`npx dna publish --openapi`** — reuses the existing write path.
5. **The middleware** — `@dna/guard`, which already exists, behind an Express adapter first.
6. **The explorer** — last, and only if steps 3 and 5 produce someone asking for it.

## 5. Limits, stated on the page and not in the footnotes

- **A reading from a spec alone measures naming, not governance.** Say which one is on screen. An
  anonymous visitor gets the structural reading; the governed reading needs a model and the label
  must say so.
- **Convention-based resolution is a guess, and guesses get shown as guesses.** An endpoint we cannot
  resolve is reported unresolved. It is never invented, for the same reason the Overlay refuses to
  infer a verb: a resolver that filed everything ambiguous under a plausible name would be wrong
  quietly, which is the worst way to be wrong.
- **Specs drift from implementations.** Every company has an endpoint the document does not describe.
  We govern what is declared, and the gap between the spec and the router is a real one we should
  name before a customer finds it — it is also, usefully, a finding the product can report.
- **Surfaces are not interchangeable.** A REST endpoint needs status codes and idempotency; a UI needs
  affordances; a tool description is written for a model's benefit. Projection settles the contract,
  not the presentation. Saying so out loud is what makes the rest credible — the Layer 05 essay
  reaches the same conclusion in its section 6, and the page should not claim more than the essay.
