# API Operations on dna.codes

> The product this page is about is designed in [`design.md`](./design.md), by taking the same
> five-part pattern the Overlay and Agent Operations were each designed against and asking what each
> part is when the thing being governed is an HTTP endpoint. The finding that drives everything below
> is that **part one is already written, and it is called OpenAPI.**

## Why

The site sells three surfaces and every one of them is a surface a _person_ or an _agent_ touches.
Nothing on dna.codes governs the surface that other **software** calls — which is, for most
companies, the surface where the money actually moves.

That gap is visible in the repo already:

- `/docs/product` publishes **Endpoint · Namespace · Param · Schema** as first-class primitives and
  calls the API group _"the REST surface."_ The model has always had a place for endpoints. No
  product reads it.
- `src/data/post/execution-model-one-operation-many-surfaces.md` — Layer 05 of _The Future of
  Programming_, drafted and scheduled — argues that _"a REST endpoint, an MCP tool, a workflow step
  and a button are four descriptions of the same operation."_ The essay ships in three weeks. Two of
  the four surfaces have products behind them; the REST endpoint, which is the one the essay opens
  on, does not.
- `/overlay` already prints the sentence that licenses this whole change: _"The Overlay is a surface
  on your model, not a product beside it."_ It then ships exactly one surface.

**The wedge is that OpenAPI describes capability and nothing describes authority.** A company's spec
says `POST /payments` exists, what it takes and what it returns. It does not say who may call it,
under what conditions, whether a flag gates it, or whether anyone will ever know it happened. Those
answers exist — in a middleware file, in a decorator, in someone's head, in four places that disagree
— and none of them are in the document the whole company treats as the API's definition.

**And the transposition is unusually cheap.** On the React Overlay, the expensive part was the
adapter: a package that walks a tree and stamps an address on every element so the platform can talk
about a button it did not write. On Agent Operations, the adapter was a wrapper somebody has to put
around each tool. Here there is no adapter to write. **An OpenAPI document is a machine-readable
manifest of every address in the system, published on purpose, by the customer, before we arrived.**

That is the argument, and it has a consequence the other two products do not get:

> **A visitor can get a real reading out of this product with nothing installed.**

Paste a spec. We resolve every endpoint to a resource and an action, and report how much of the API
can even be named — before any account, any key, any code. No other product on this site has a rung
zero. This one's top of funnel is the product.

## Naming

**Ship as "API Operations." Path `/api-operations`.**

**The name follows the design, and the design refuses to be an overlay.** _Overlay_ on this site is
earned by a specific thing: a panel that appears **on the running surface itself**, addressing the
element the reader is already looking at. This product does not do that. It reads the same document
Swagger reads, answers beside it, and enforces at a middleware — and the deliberate decision not to
paint DNA chrome onto Swagger UI is [design.md §3](./design.md#3-the-explorer-and-what-it-is-allowed-to-be).
A product named Overlay that is not visually an overlay would teach a reader that our nouns are
decorative, and this platform's entire argument is that its nouns are load-bearing.

What is left is the parallel that was always there: **Operations, extended to a surface.** Agent
Operations is Operations extended to a second kind of actor; API Operations is Operations extended to
the surface other software calls. Same construction, same recognition, and it is what a buyer types.

Candidates considered and rejected:

- **_API Overlay_** — the first recommendation of this proposal, withdrawn on the rule above. It
  inherits the Overlay's recognition, which is exactly the problem: it promises a panel on the thing
  itself, and then the page spends §4 explaining that we do not do that. A name should not create the
  objection the page has to answer.
- **_DNA API Explorer_** — the conversation's own working title, and it names the weakest component.
  The explorer is the least defensible thing we would ship: Swagger UI already exists, developers
  like it, and "ours is nicer" is a fight over taste. The explorer is a consequence of the product,
  not the product.
- **_Gateway_** — invites a line-item comparison against Kong, Apigee and Zuplo that we lose on
  features and do not want to be in. We are not in the request path; the host asks us for a decision
  at its own edge, exactly as `@dna/guard` does today.
- **_DNA Swagger Extension_** — describes an integration point as though it were a product, and
  chains the name to one vendor's UI. Swagger is an adapter. So is Redoc, so is GraphQL, so is gRPC.

## Where it sits: a fourth product, and still three rungs of pricing

**Decided: a fourth product, on the standalone test.** It is a companion to the Overlay when a
customer has both — the same operation, governed at the button and at the endpoint — and it is a
complete purchase when they have neither a React app nor an agent. A thing that can be bought alone
is a product; a thing that only makes sense beside another one is a section. This passes.

Adding a fourth product does put pressure on a trichotomy the last change deliberately repaired —
**Model it · Govern it · Run it**, three verbs, three products, published as a ladder on `/pricing`.

**Decision: the verbs stay at three, and _Govern it_ gains a second surface.**

| Product            | Verb          | Governs                   | Status        |
| ------------------ | ------------- | ------------------------- | ------------- |
| Operations         | Model it      | —                         | Live demo     |
| Overlay            | **Govern it** | what a person presses     | Early access  |
| **API Operations** | **Govern it** | what other software calls | **In design** |
| Agent Operations   | Run it        | what an agent calls       | In build      |

Three reasons this is not a fudge:

1. **The site already committed to it in writing.** `/overlay` says _"we charge for authority, not
   for looking,"_ and that the Overlay _"is never sold separately"_ because it is a surface on the
   model rather than a product beside it. A second surface changes what a plan covers; it does not
   change what a plan costs. **`src/data/pricing.ts` gains rows, not a tier.**
2. **A verb is a thing you do to your business. A product is a place you meet it.** There were always
   going to be more places than verbs — the essay that ships in three weeks says four surfaces, and
   MCP, gRPC and GraphQL are all named in it. Pinning the count of products to the count of verbs
   guarantees we mis-name the fourth thing to protect a slogan.
3. **The alternative is worse.** Folding this into `/overlay` as a section gives the strongest
   zero-install demo on the site a subordinate slot on a page whose buyer is a frontend engineer,
   and asks one page to change audience mid-scroll — the objection that earned Agent Operations its
   own page, unchanged.

`src/navigation.ts` and `Footer` need **no edit at all**; both map over `PRODUCTS`. The nav dropdown
goes from three items to four, which it holds.

**Out of scope:** GraphQL, gRPC and AsyncAPI adapters; a hosted gateway or proxy; replacing Swagger
UI as a documentation tool; MCP (that is Agent Operations' adapter and already shipped there — see
[Boundaries](#boundaries)); an `x-dna` submission to the OpenAPI registry.

## What changes

- **NEW** `src/pages/api-operations.astro` — a product page in **four sections** between hero and close,
  alternating side to side, in the house shape.
- **NEW** `ApiOpsDemo` — the hero artifact and the reason to ship the page early. **The visitor
  pastes their own OpenAPI document** (or picks one of three bundled samples) and watches endpoints
  resolve to resources and actions with the coverage reading computing live. Entirely client-side —
  no backend, no account, no key. This is the stub-first pattern from `/playground` and `/overlay`,
  except that here the data is real because the visitor brought it.
- **NEW** `ApiCoveragePanel` — the reading, rendered wherever the number appears (homepage card,
  §1, demo) so it cannot disagree with itself. Same discipline as `AgentCoveragePanel`.
- **NEW** `ApiOpsBind` — §2. `POST /payments` becoming `Payment.Create`, the `x-dna` block, and the same
  four reconciliation outcomes the other two products publish.
- **NEW** `ApiOpsEdge` — §3. One middleware, three calls through one rule, three different outcomes, and
  the audit record with the actor's name on it.
- **NEW** `ApiOpsExplorer` — §4. Execute as an actor, with the policy evaluation shown _before_ the
  button, and the Swagger question answered in the same breath.
- **NEW** `src/data/openapi-samples/` — three specs a visitor can click instead of pasting: a
  payments API, a clinic API, an internal ops API. Matches the existing `lens-demo-*.json` pattern.
- **MODIFIED** `src/data/products.ts` — a fourth `Product`; the `key` union gains `'api-operations'`.
  Icon: `tabler:api` (the mark is the thing, per the file's own rule).
- **MODIFIED** `src/components/widgets/ProductsHighlight.astro` — **the one real layout cost.**
  Heading becomes "Four products, one model," and `lg:grid-cols-3` no longer divides evenly. Options
  are a 2×2 at `lg` or a 4-up at `xl` with 2×2 below; 4-up at `lg` will not hold the two-sentence
  cards. This needs a look in a browser, not a decision in a document.
- **MODIFIED** `src/components/widgets/WaitlistForm.astro` — a fourth interest, and the `preselect`
  union gains `'api-operations'`. Blurb: _"Govern the endpoints other software calls."_
- **MODIFIED** `src/data/pricing.ts` — a new **API** feature group. **No new tier and no new price.**
- **MODIFIED** `src/pages/overlay.astro` — one teaser paragraph and one link, in the shape
  `AgentOpsTeaser` uses: _the same panel, at your API edge._
- **MODIFIED** `src/pages/index.astro` — nothing structural; `ProductsHighlight` carries it.

## The page: `/api-operations`

```
Hero + ApiOpsDemo                          paste a spec, watch it resolve
 1. The wedge         prose ◀ │ ▶ visual       your API says what it can do, not who may
 2. ApiOpsBind           visual ◀ │ ▶ prose       POST /payments is Payment.Create
 3. ApiOpsEdge           prose ◀ │ ▶ visual       one middleware, the same decision, a record
 4. ApiOpsExplorer       visual ◀ │ ▶ prose       execute as an actor — and no, we are not Swagger
Close                                          FAQ, then the waitlist
```

**Hero.**

Headline: **"Operational controls for your API."**
Sub: _OpenAPI says what your endpoints do. DNA says who may call them, and what gets recorded._
Actions: `Join the waitlist` (primary) · `Read your own spec` (anchor to the demo).

**Shipped after a first draft was rejected as too verbose.** That draft — _"Your API says what it can
do. It doesn't say who may."_ — is an argument, and a hero is not the place to make one. It takes
two clauses and a beat to land, and a reader skimming at speed gets neither.

The shipped line names the category in five words and inherits the Overlay's own framing: the
Overlay is _"operational controls inside your running app"_, this is operational controls at the API
edge. Same product, second surface, and the parallel does the work the long version was trying to do
with syntax. The rejected line survives as §1's heading, one altitude down, where a reader has
already decided to keep reading and an argument is what they came for.

Rejected: _"Swagger, but governed"_ — makes a competitor the subject of our own headline.

**1. Your API describes capability. Nothing describes authority.**

**Measured, not estimated.** The resolver was built and run over nine real public specifications
before this copy was written — 3,496 operations, 88% of them resolvable to a resource and an action,
with a spread from 45% (Slack, RPC-shaped) to 100% (Asana, Adyen). Full table and method in
[`findings.md`](./findings.md).

**The measurement changed this section.** An earlier draft printed one figure — _"23 of 112 endpoints
resolve to something your model governs"_ — and the corpus says that is the wrong shape. The
structural reading is **high** and the governed reading is **zero**, so the wedge is two numbers and
the gap between them:

> **_22 of 26 endpoints are governed. 4 gaps._**
>
> _Nothing governs Payment.Refund, Payment.Void or Payout.Create._

**Revised from _"none of them are governed by anything"_ during the build.** That version was a
stronger sentence and a weaker demo: nobody has left their whole API open, so a panel claiming they
have is one a technical reader argues with rather than reads. The gap report is the shape a security
or compliance reader is already looking for — most of the estate is fine, and the finding is the
handful nothing covers. It also makes the ungoverned endpoints _nameable_, which the zero version
never could.

Four properties, three inherited from the Overlay's reading and one new:

- **The first number buys the credibility the second one spends.** Naming 88% of a stranger's API in
  a few seconds, in their own browser, is a demonstration rather than a claim — and it earns the
  right to say something uncomfortable in the very next sentence.
- **Absence rather than distance.** The ask is addition, not replacement. Nobody has to rip out a
  middleware.
- **A figure nobody else can produce.** A gateway knows which routes have a policy attached to them;
  it does not know that `POST /payments` and the CFO's approval limit are the same fact.
- **A moving denominator, and the copy must say it moves.** A page implying a fixed score gets caught
  by the first person who runs it twice.

**The pairing is also what makes it honest**, which is the risk this whole section was flagged for:
a resolver improvement raises the first number and leaves the second at zero, so the claim cannot be
inflated by making our own tooling better. The two readings must appear in that order and the
governed one must be visibly gated on having a model.

**2. `POST /payments` is `Payment.Create`.**

An endpoint already carries a resource and an action; REST has been arguing that for twenty years and
mostly meaning it. The bind is therefore usually a **read**, not an authoring task — and where the
convention does not hold, one block says so:

```yaml
paths:
  /payments:
    post:
      summary: Create a payment
      x-dna:
        operation: payment.create
        target: $.body.customerId
```

**`operation` and `target`, and that is the whole contract** — the same two words the Overlay stamps
on an element and the same two the agent wrapper binds to a tool call. Three surfaces, one
vocabulary, deliberately.

Swagger ignores `x-dna` because specification extensions are ignorable by design. The customer's
existing toolchain does not know we exist and does not break. **That is the integration story, and it
is the entire integration story.** Progressive: `operation` alone is a complete declaration;
authorization, scope, audit and flags are things the _model_ already knows, looked up rather than
restated in YAML. An endpoint with no `x-dna` is not broken — it is the read-only case and it is the
common one, exactly as an unlabelled control is on the Overlay.

Same four reconciliation outcomes as everywhere else — created · corroborated · disagreed ·
unresolved — because _a machine may observe; a person decides._

**3. The decision happens at your edge, not ours.**

One middleware, the same evaluator `@dna/guard` runs behind a React control, refusing before the
handler. Three calls through one rule landing on three outcomes — allowed, refused, escalated — and
each one leaving a record that names the actor rather than the API key. The distinction that keeps us
out of the gateway fight: **we are not in your request path. Your edge asks us a question.**

**4. Swagger documents. DNA operates.**

The section that must exist, because it is the objection the reader has been holding since the
headline. Said plainly: **keep Swagger UI.** It is good at what it does and we do not want that job.
What the explorer adds is the thing Swagger structurally cannot do — pick an actor, see the policy
evaluate _before_ you execute, and get an audit ID afterward. Documentation asks _what does this
endpoint take_. An operational console asks _may I, as me, right now_.

And the cheapest version of this product is one link in your existing Swagger page: **`View in DNA
→`**. Ship that first.

## Visual language: Swagger's chrome, one column added

**Decided during the build, and it changes the page more than any copy decision.** Every visual on
the page is drawn in the idiom a developer already reads an API in — Swagger UI's method palette
(`#61affe` GET, `#49cc90` POST, `#f93e3e` DELETE), its tinted left-barred operation blocks, its tag
groupings, its expanded operation with Parameters and Responses, its Try it out panel, its server
response block with a status code.

The argument for this is the same one that named the product. We are not asking anyone to learn a new
way of looking at an API; we are **adding one column to the way they already look at it.** Three
consequences the components are built to:

- **§2 shows DNA as another section of the operation** — sitting where Parameters and Responses sit,
  not floating above them. That is the literal answer to the source conversation's objection that a
  visual overlay on Swagger would feel awkward: we agree, so we are a section rather than an overlay.
- **§3 answers in status codes** — 200, 403, 202 — because a status code is what the reader's client
  actually receives, and it is a more convincing claim than a green tick.
- **§4 puts the DNA block above the Execute button**, which is the only position that carries the
  claim: the evaluation happens _before_ you press.

The palette is shared between the Astro components and the live demo renderer through
`src/utils/openapi-ui.ts`, because a page arguing that one operation should not be described twice
cannot describe its own rows twice.

## Boundaries

| Surface          | Product              | Why not this one                                                                |
| ---------------- | -------------------- | ------------------------------------------------------------------------------- |
| MCP tools        | **Agent Operations** | Already has an adapter there. An MCP tool is an agent's hand, not a public API. |
| React controls   | **Overlay**          | Shipped.                                                                        |
| GraphQL / gRPC   | **Later**            | Same pattern, different manifest. Named on the page as adapters, not sold.      |
| The model itself | **Operations**       | Unchanged. This product reads it; it does not author it.                        |

## Impact

- **Cross-repo, and this is the gating item.** `x-dna` needs a schema in `@dna-codes/dna-schemas`
  before `/docs/product` can document it. The API primitives — `Endpoint`, `Namespace`, `Param`,
  `Schema` — already exist there, which is most of the work, but the extension block itself does not.
  **Until it lands, the page must not link to a `/docs` page that does not exist**, the same
  restraint the agent change applied to `/docs/agents`.
- **The blog and the page are a pair.** The Layer 05 post is scheduled for 2026-09-20 and is
  currently `draft: true`. Its planned interactive figure — one operation fanning into four surfaces,
  with a drift toggle — shares most of its machinery with `ApiOpsDemo`. **Build them as one
  component with two configurations**, and check `OperationsDemo.astro` first, as the post's own
  brief instructs. Shipping the page in the same fortnight as the essay is worth scheduling for.
- **Status word.** `In design` would be a fourth status on a site with three. The alternative is to
  hold the page until the middleware exists and ship at `In build`. **Recommendation: ship the page
  early anyway**, because rung zero is real — the demo genuinely computes a real reading on the
  visitor's real spec with no backend — and a page whose main artifact works is not a promise.
- **Build discipline.** `npm run build`, not `astro check`, per the standing note: `astro check`
  never renders. The demo parses untrusted JSON in the browser and must fail visibly rather than
  silently on a malformed or enormous spec.

## Risks

1. **The coverage number can be dishonest, and this is the one that matters.** A spec with no `x-dna`
   read by a visitor with no model resolves to _0 of 112_, which is true, useless and insulting. The
   demo must compute the **structural** reading for an anonymous visitor — _how many of your
   endpoints name a resource and an action we can resolve at all_ — which is a real finding on most
   real specs, because naming is inconsistent across teams and everybody knows it. The
   **governed** reading requires a model and must be labelled as requiring one. Conflating the two
   is the fastest way to lose a technical reader.
2. **CORS.** Fetching an arbitrary `openapi.json` from the browser fails cross-origin more often than
   it succeeds. **Paste is the primary input**, URL is best-effort with an honest failure message,
   and three bundled samples carry anyone who wants to look without committing.
3. **Four cards.** `ProductsHighlight` is built on threes, in the markup and in the heading.
4. **Gateway confusion.** Mitigated by §3's framing and reinforced in the FAQ; if it still tests as
   confusing, the fix is a comparison row, not a softer claim.
5. **The APIOps collision, which the name does not escape and must be managed rather than solved.**
   _APIOps_ is an existing term of art meaning CI/CD for API specifications — linting, diffing,
   versioning, gating a spec change in a pipeline. A reader who compresses "API Operations" to
   "APIOps" arrives expecting Spectral and gets a policy engine. Two mitigations, both cheap and both
   binding: **never abbreviate it**, in copy, in the nav, in a URL or in a component name that a
   customer sees; and make the meta description do the disambiguating work in its first clause —
   _who may call your endpoints_, not _your API operations_. It is worth watching in search terms
   before it is worth renaming over.
6. **"UI Overlay."** The decision that produced this name arrived phrased as _"a companion to the UI
   Overlay"_ — which is a signal, not a slip. Once a second surface exists, the unqualified
   **Overlay** may start wanting the qualifier too. Not in scope here, and renaming a shipped product
   to accommodate an unshipped one would be the wrong order. Recorded so that if the copy starts
   reaching for "UI Overlay" unprompted, it is a decision rather than a drift.
