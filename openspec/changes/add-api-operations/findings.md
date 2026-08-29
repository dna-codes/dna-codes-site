# Finding — what the resolver actually returns on real specifications

Task 1.5 was the gate on this change: the page's central claim is a number, and until this ran the
number was an estimate. `scripts/resolve-report.mjs` runs `src/utils/openapi-resolve.ts` over nine
public OpenAPI documents. Reproduce with `node scripts/resolve-report.mjs`.

## The reading

| Spec              | Operations | Resolved       | via `operationId` | via path | Unresolved |
| ----------------- | ---------: | -------------- | ----------------: | -------: | ---------: |
| Asana             |        249 | **248 (100%)** |                 3 |      245 |          1 |
| Adyen (Checkout)  |         28 | **28 (100%)**  |                 2 |       26 |          0 |
| Stripe            |        594 | **578 (97%)**  |                 2 |      576 |         16 |
| Box               |        296 | **272 (92%)**  |                30 |      242 |         24 |
| Twilio (Core)     |        197 | **180 (91%)**  |                 7 |      173 |         17 |
| Kubernetes (apps) |         77 | **70 (91%)**   |                 0 |       70 |          7 |
| GitHub            |       1222 | **1057 (86%)** |                 2 |     1055 |        165 |
| DigitalOcean      |        659 | **548 (83%)**  |                 0 |      548 |        111 |
| Slack (Web API)   |        174 | **79 (45%)**   |                79 |        0 |         95 |
| **Total**         |   **3496** | **3060 (88%)** |               125 |     2935 |        436 |

Unresolved by reason: ambiguous tail 339 · RPC route 95 · no resource 1 · no conventional method 1.
Declared via `x-dna`: **0**, as expected — nobody has written any yet.

## What it means for the page

**Both branches of task 1.6 were wrong, and the real answer is better than either.** The proposal
anticipated either a high structural reading (_"your API is already most of the way modelled"_) or a
low one (_"four teams named your endpoints five ways"_). What the corpus shows is a **high
structural reading and a governed reading of zero**, and the gap between those two numbers is the
product.

So §1's number is not one figure but two, and the second is the wedge:

> **107 of 112 endpoints can be named. None of them are governed by anything.**

This is stronger than the single figure the proposal drafted, for three reasons:

1. **The first number buys the credibility the second one spends.** Naming 88% of a stranger's API
   in a few seconds, in the browser, is a demonstration rather than a claim — and it earns the right
   to say something uncomfortable immediately afterward.
2. **It keeps the "absence, not distance" property** the Overlay's wedge depends on. The ask is
   addition. Nobody has to rip out a gateway.
3. **It cannot be gamed by the resolver getting better.** A resolver improvement raises the first
   number and leaves the second at zero, which is the honest relationship between them.

**Consequence for the demo:** the structural reading must be visibly the _first_ result and the
governed reading visibly the _second_, gated on having a model. The spec's requirement that the two
readings never be conflated is now load-bearing on the page's argument, not just on its honesty.

## The residue is a second, smaller finding

The 12% that does not resolve is not noise, and it splits cleanly:

- **RPC-shaped routes (95).** Slack's entire Web API is `/chat.postEphemeral`, `/conversations.setTopic`.
  These are calls, not resources. They resolve at 45% and only via `operationId`. **An RPC-shaped API
  is a worse fit for convention-based resolution and the page should not pretend otherwise** — it is
  precisely the population `x-dna` exists for, and that is the honest way to sell the extension.
- **Ambiguous tails (339).** `GET /orgs/{org}/public-key` (a singleton sub-resource) and
  `GET /enterprises/{id}/reports/latest` (neither a resource nor an act) are structurally identical
  and nothing in the document separates them. Declining both is correct.

## What the measurement changed in the resolver

Recorded because each was a wrong answer that a count alone would have hidden, and because the first
one is the reason this task existed at all:

1. **The first run scored 100% on every spec, which meant the resolver was declining nothing.** It
   filed every ambiguous trailing segment under the item actions, inventing names like
   `Latest.Read`. Fixed by declining ambiguous tails — and the rate fell to 90%, which is what an
   honest resolver looks like.
2. **Precedence was backwards: path beats `operationId`.** An `operationId` is free text and Stripe
   generates its own from its paths, so parsing it as verb-plus-noun produced
   `TestHelpersIssuingAuthorizationsAuthorizationIncrement.Create` while the path beside it read
   cleanly as `Authorization.Increment`. Flipping the order also fixed a whole class of wrong-but-
   plausible answers — `GET /v1/customers` is `Customer.List`, and only the path knows the route
   ends in a collection. Path now carries 2935 of 3060 resolutions; `operationId` is a fallback.
3. **Slack scored a false 100%.** Dotted single-segment paths read as singleton resources and gave
   `AdminAppsApprove.Create`. Now detected as RPC, which drops Slack to an honest 45%.
4. **Generated `operationId`s are refused.** A resource name of four or more words, or one repeating
   a word, is a concatenated path rather than a name of an act.
5. **Real-world path shapes.** Twilio suffixes every path with `.json` (which defeated the plural
   rule, so `Messages.json` was not a collection); Box puts `#fragment` on some paths. Both are
   stripped before the segment is read. Twilio went from 73% to 91% on the first alone.

## A second finding, from the demo rather than the corpus

**The paste feature shipped broken and only a DOM found it.** `rowHtml` built all four verdict
branches in an object literal and then indexed one; the governed branch dereferenced the governance
map, which is `null` for every document a visitor pastes. It threw on the first row, after the
headline had already been written — so the panel showed the new spec's count above the old spec's
rows, under the old spec's title.

`npm run build`, `astro check`, ESLint and Prettier all passed it, and the render functions had been
exercised directly in Node against all three samples — but always _with_ a governance map, because
that is the path the samples take. The bug lived entirely in the branch a real visitor takes first.

`scripts/demo-smoke.mjs` now drives the built page in jsdom and presses the buttons. It is not a
browser and cannot see a layout defect, but it is the difference between a feature that is asserted
to work and one that is observed to.

## Limits of this measurement

- Nine specs, weighted heavily toward large public developer APIs. **Internal enterprise APIs are
  the actual buyer and are not represented here**, and they are likely to be messier. Re-run against
  a design partner's spec before quoting 88% anywhere a customer can see it.
- Resolution rate is not accuracy. The samples were eyeballed for correctness at each iteration and
  the remaining known imprecision is `POST` to an item — Twilio means update, this resolver says
  `Create`. That ambiguity is industry-wide and the demo shows which rule fired, so a reader can
  see the reasoning rather than only the verdict.
- **No figure from this table should be printed on the page as a claim about the reader's own API.**
  The page computes the reader's number in front of them; that is the entire point of rung zero.
