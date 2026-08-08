# Launch DNA Overlay on dna.codes

## Why

The Overlay is the first thing the DNA platform has that a stranger can _see working_ in sixty
seconds, on an application they already understand. Everything currently on dna.codes is an argument
about a model — the helix, the Operations Layer, the Playground, the docs. The Overlay is the model
doing something, inside somebody else's running product, and both walkthroughs in
`dna-codes-platform/docs` are already screenshot-complete against a live stack.

**The wedge is absence, not features and not distance.** Most controls in most products are governed
by nothing — no rule about who may use them, no flag, no record that anyone ever did — and no team
can say _which_ ones, because nothing they own is in a position to compute that number. The controls
that _are_ governed are described in systems that have never rendered the application: a flag console
holding `checkout_new_flow_v2`, a policy editor holding roles, an analytics workspace counting
events, an audit trail exported for somebody else.

The Overlay puts all of it on the control itself. Stand on the button, and who may press it, whether
it is on, how often it has been pressed and by whom, and what has been refused are one reading.

Framing it as absence rather than distance is also the better sale: distance implies replacement,
absence implies addition — and addition is the only ask a pre-GA product should be making.

Two constraints shape everything below:

- **It is pre-GA.** `@dna/react` is `private` and not on npm; the console reads eleven of its fifteen
  resources; two panel defects (gap **J** and the performer-kind sibling) turn silence into a claim.
  The page must sell early access, not self-serve signup.
- **`/pricing` is still AstroWind lorem ipsum** (`price: 29`, "Etiam in libero, et volutpat"). It is
  unlinked from `navigation.ts` today, which is the only reason that is not already a problem. Any
  pricing hook from the Overlay page makes rewriting it a blocker, not a follow-up.

## Naming

**Ship as "DNA Overlay." Do not rename before launch.**

"Overlay" is an established category word — Vercel Toolbar, Storyblok's bridge, LaunchDarkly's
in-app widget — so it costs a reader nothing to parse, and the codebase, the API namespace
(`/v1/overlay`), the console section and both walkthroughs already say it. Renaming now means
renaming those too, or shipping a marketing name that nothing in the product answers to.

Candidates considered and rejected: _DNA Inspect_ (names one of two modes), _DNA Lens_ (collides with
the lens vocabulary already in `/docs/lenses`), _DNA Live_ (says nothing). If a rename becomes
necessary later, `/overlay` stays canonical with a redirect, not the other way around.

## Related naming decision: the tagline

**Adopt "Model it. Govern it. Run it."** — with **`Model · Govern · Run`** as the single-word labels
on the three-pillar strip in §4 and anywhere a nav rail needs them. Same words at two altitudes, so
they reinforce rather than compete.

Chosen over the tighter _"Model. Govern. Operate."_ for two reasons, the first decisive:

- **The repeated "it" is the thesis.** _It_ is the same object throughout — one model, three
  surfaces — and that repetition is the grammatical form of the argument §4 exists to make. Strip
  the pronoun and a thesis becomes a feature list.
- **"Run" matches the pillar's name; "Operate" does not.** A verb the product is not called forces
  the reader to hold a translation. If the pillar is ever renamed to _Operate_, the tagline follows —
  not the other way round.

**Cross-repo impact, and it is a real one.** `master-plan.md` §8.2 records _"Model it. Share it. Run
it. Together."_ as already established **by the vision art** (`docs/vision-*.jpg`), mapping to
Organization / Marketplace / Cells / Enterprise. Replacing _Share_ with _Govern_ drops Marketplace
from the tagline and needs the art updated or the divergence accepted deliberately.

Recommend accepting it: Marketplace and Enterprise are not what dna.codes is selling this quarter,
and a tagline should carry the three pillars a buyer will actually meet. Keep **"Together."** as an
optional fourth beat on enterprise and marketplace surfaces, where federation is the point.

## What Changes

- **NEW** `/overlay` — a product page, **five sections** plus hero and closing CTA.
- **NEW** `OverlayDemo` component — an in-page, scripted walkthrough of the Inspect panel, following
  the stub-first pattern established on `/playground`: real component signature, staged data, a
  demo-mode badge. Lives in the hero's `image` slot, the way `LensDemo` does on the homepage.
- **NEW** `OverlayTeaser` homepage section, slotted after `OperationsLayerC` — the product-layer band
  that `index.astro` already has commented-out scaffolding and an arrow connector for.
- **MODIFIED** `src/pages/pricing.astro` — replace the template placeholder content entirely with the
  suite ladder below. Blocker for linking pricing from anywhere.
- **MODIFIED** `src/components/widgets/WaitlistForm.astro` — real endpoint, five fields.
- **MODIFIED** `src/navigation.ts` — header gains `Overlay` and `Pricing`.
- **MODIFIED** `src/pages/index.astro` — hero actions, the teaser section, the closing CTA.
- **NEW** `public/images/overlay/*` — marketing-cropped exports of the walkthrough screenshots.

**Out of scope:** self-serve checkout; a public `@dna/react` install path; `/docs/overlay`;
**selling Prototype mode** (see §3 below — it is mentioned, not pitched).

## The page: `/overlay`

Hero and closing CTA are furniture. Five sections carry the page.

**Hero — headline, sub, CTA, and the live demo underneath.**

Headline: **"Every control, under control."**
Sub: _Who may press it, whether it's on, how often it's been pressed and by whom — on the button
itself, inside your running product. Two lines to install. Nothing else about your app changes._
Actions: `Get early access` (primary) · `See how it installs`.

Both senses of _control_ are literally true here, and `every` carries the coverage finding that §1
opens on. The sub must disambiguate within its first five words, because the dominant first parse of
"controls" for a software buyer is _UI widgets_ — and a headline that reads as **more widgets** fights
§3, whose entire argument is that the rendered output is byte-identical. The closing sentence of the
sub neutralizes that read immediately and is then proved seven ways in §3.

Alternates, in order: _"Your product, under control."_ (safest, no misread, loses the coverage nod);
_"More control over your product. Not more product."_ (sharpest, but argumentative for a hero —
**reserve it as the `OverlayTeaser` line on the homepage**, where a single sentence has to make the
whole case); _"Your product, with its rules showing."_ (evocative but passive — it reveals, it does
not grant). Rejected: _"Your product, more controls"_ — the notion is right, but the literal phrase
promises to add things to somebody's product, and the one mode where that is true (Prototype) is cut
from this launch.

The `OverlayDemo` sits in the hero's `image` slot, exactly where `LensDemo` sits on the homepage — a
miniature storefront with the panel docked right, and two or three scripted steps: _pick a control →
read the facets → pick "Add to bag" → "Nothing governs this control."_ A `Demo mode` badge sits where
the real panel shows the signed-in person. Fusing this with the hero saves a section and matches the
site's existing pattern; a visitor who steps through it has understood the product.

**1. Most of your product is ungoverned.**

The wedge is **absence, not distance.** An earlier draft opened on _your governance is in another
tab_, which is wrong twice: "tab" makes the gap sound like an inconvenience, and the whole frame
assumes the reader already has governance that is merely badly located. The product's own sharpest
beat says otherwise — `08-add-to-bag-ungoverned`, where the busiest control in the shop is governed
by nothing at all.

It is also the better _sale_. Distance framing implies replacement — rip out the flag vendor — which
is a brutal ask for a pre-GA product. Absence framing implies addition: govern what currently has
nothing. That is the one claim no incumbent disputes, and it is the right ask for an early-access
cohort.

Copy, roughly:

> Not badly governed — **ungoverned**. No rule about who may use it, no flag, no record that anyone
> ever did. Open the panel on any screen and it tells you the number: _2 of 3 controls are governed
> by something._ Most teams have never seen that figure for their own product, because nothing they
> own is in a position to compute it. A flag console does not know what is on the screen.
>
> And the controls that _are_ governed are described somewhere that has never rendered your
> application — a policy editor holding roles, a flag list where `checkout_new_flow_v2` is a string
> somebody typed hoping it would still mean the right button a year later.

Screenshots `03-panel-open-coverage` then `08-add-to-bag-ungoverned`. Copy must say the denominator
moves per screen — a marketing page implying a fixed score gets caught by the first real install.

Two notes on wording:

- **Never "another tab."** Where the distance argument is needed, _"a system that has never rendered
  your application"_ does the work better than any noun, because it names the defect rather than the
  inconvenience.
- **Disagreement is a consequence, not the wedge.** Because access and release live on one act, the
  panel can report that two rules conflict — one short paragraph and screenshot
  `13-flag-on-conflict`, not its own section. Two products holding half the model each cannot
  produce that reading. Three sentences, and it lands harder for being an aside.

**2. Read it and change it, standing on the control.**
What you actually do. Pick a control and the panel answers Address · Operation · Outcome · Access ·
Policies · Use · Activity — the verdict on the closed row, the reasoning when you open one
(screenshots `06-picked-fulfillment-facets`, `07-access-expanded`). Then author: add a seat to the
rule in force, write a release policy, put it in force — _and writing a rule is not putting it in
force_, which is the sentence that lands with anyone who has been near an audit
(`11-flag-off-and-proposed`, `23-picker-carries-the-seat-in-force`, `25-restricted-to-two-seats`).
Then **View as** — _You_, any seat, or _Nobody — signed out_ — asked against the running product
rather than a simulator (`14-view-as-nobody`).

Absorbed into this section as short paragraphs rather than sections of their own: one address lights
up every occurrence; usage is **read**, never collected; the build publishes its manifest and the
console reads back created / corroborated / disagreed / unresolved, because _a machine may observe, a
person decides._

**3. It installs in two lines, and it will not touch your application.**
Install and trust are one objection — _what does this cost me to try, and what does it do to my
product_ — so they are one section. The two code blocks verbatim from the walkthrough, the three-row
vocabulary table (`resource` / `resource + action` / neither), and the honest note that `@dna/react`
is in private beta and early-access customers get the package plus setup with us.

Then the seven claims, as a tight list — the section most likely to close a technical buyer, and
every one of them enforced somewhere real:

- Rendered output is byte-identical apart from `data-dna` attributes; the transform is
  insertion-only, and deleting the plugin restores every file byte-for-byte.
- It never attaches a listener to your buttons. Usage is read from occurrences the platform already
  writes, never collected from your DOM.
- Publishing a manifest never fails your build. The key is never printed, including in transport
  errors.
- The publishable key in your markup carries no capabilities. Environment, application identity and
  viewer authority are all the server's answer.
- Nothing publishes without a key, so a local build and a fork's pull request send no request at all.
- Refusals are enforced twice, and the server's is the real one.
- Removal is `stop()`, returned to whoever installed it.

**Prototype mode is mentioned here in one sentence and nowhere else.** It is a second product story,
it dilutes a launch built on the governance wedge, and its console support is still partial (gap
**C**). One line — _the same panel can place a control that does not exist yet, and hand a developer
an address_ — and a link to the walkthrough post for anyone who bites.

**4. One model. Three surfaces.**
The wedge invites an obvious retort — _so you are a fourth tool_ — and this section is the answer, so
it is not optional furniture. **Design** (model your operations, your ontology, what gets built) ·
**Overlay** (govern it, where it runs) · **Run** (operate it, live architecture, agents under gates).
One graph underneath all three. Overlay is marked live; the other two are marked in build, described
by shape and never by ship date.

The sentence that does the work: _the Overlay is not a system beside your product. It is your model,
read where the work happens — and the same model is what Design writes and Run executes._

**5. Pricing summary, then FAQ, then the closing CTA.**
Three cards — Starter / Team / Business — price, one line, `Get early access`, and _See the full
comparison →_ to `/pricing`. Not a repeat of the table. See below.

## Prototype mode and the tracker claim — hint now, argue later

Prototype mode is one sentence in this launch (§3). It is worth writing down what that sentence is
deliberately not saying yet, because the claim underneath it is the largest one this product has.

### The thesis

From the prototyping walkthrough's own opening: **the request, the specification, the acceptance test
and the release gate are one object, and the address is all four.** A product manager places a control
that does not exist, writes a sentence about why, and hands a developer an address. The developer
stamps that address on a real control. On the next build the overlay stops drawing the sketch and the
proposal reports the surface `BUILT` — _with nobody touching anything_. Somebody holding `ratify`
then makes it `LIVE`.

### What it actually replaces, and it is not "Jira"

Decompose a ticket and the overlap is partial but lands on the worst part:

| A ticket holds                               | The Overlay                                                                                    |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| What is wanted                               | the sketch, drawn from your own design system                                                  |
| **Where it goes**                            | the address — no prose, no ambiguity, no "which button did you mean"                           |
| Acceptance criteria                          | the address is bound. Machine-checkable rather than negotiated                                 |
| **Status**                                   | **derived, never asserted** — `BUILT` means a build published a manifest carrying that address |
| Link to the PR                               | the manifest names the build                                                                   |
| Assignee, priority, sprint, estimate         | **nothing**                                                                                    |
| Epics, dependencies, roadmaps                | **nothing**                                                                                    |
| Bugs, backend work, anything with no address | **nothing**                                                                                    |

So the honest line is not _replace your tracker_. It is: **it replaces the part of the tracker that
lies.** Status in Jira or Linear is a human assertion, and it drifts the moment somebody forgets to
move a card — "Done" means somebody dragged a rectangle. Here `BUILT` is a fact about what a build
emitted, and `LIVE` is a decision a named person with the grant made. Nobody reopens a ticket and
nobody closes one.

That is the same argument as the rest of the product, which is why it belongs to this platform and
not to a tracker vendor: _the model and the application are the same thing._ A tracker is a
description of work kept beside the work; this is the work describing itself.

### Why it is a hint and not a section, for this launch

Four reasons, and the first is the one that decides it:

- **Six replacement claims read as vaporware where four read as focused.** The page already says it
  replaces permissions, feature flags, analytics and audit. Adding "and your issue tracker" to that
  list is the sentence a skeptical reader stops at.
- **It changes the buyer.** Governance sells to a platform lead or a head of engineering. Tracker
  replacement sells to product management. Two motions, two objection sets, one page — and the
  governance motion is the one with the priced comparison behind it.
- **It invites questions the answer to which is no.** Sprints, estimates, capacity, dependencies,
  cross-team roadmaps, and any work that is not a UI control. A prospect who asks and gets four
  "no"s remembers the no's.
- **Console support is still partial.** A library's per-component mapping cannot be edited in the
  console (gap **C**), so the shelf that makes a sketch read as _their_ product needs us in the room.

### What the hint should say

One clause more than the current sentence, carrying the derived-status point, because that is the
whole differentiator and it costs eight words: _when the address turns up in a build, the request
marks itself delivered — nobody moves a card._ That is enough for a reader who has felt the problem
to lean in, and not enough to constitute a claim we would have to defend.

### What would have to be true to lead with it

- Prototype mode reachable without us in the room — which means gap **C** closed.
- A worked before/after against a real customer's tracker, with numbers.
- An answer to assignment and discussion, or an explicit, comfortable integration story with the
  tracker rather than a replacement one. _Proposals sync to Linear as issues, status flows back from
  the build_ is a far easier sale than replacement, and it may be the better product.

### The pricing note

It reinforces the ladder rather than disturbing it. Prototype is gated at **Team ($499)**, and a
20-person team on Linear-class per-seat pricing is already paying roughly $250–350/mo for the tracker
alone. So the tier that includes Prototype is defensible against a budget line the buyer already has,
without inventing a meter. Worth stating on a sales call; **not** worth putting on the pricing page,
because a published comparison to a tracker commits us to the replacement claim above.

## Homepage hooks

Unchanged from the prior draft, and none of it disturbs the existing narrative:

1. **`Announcement.astro` above the header** — _DNA Overlay is in early access → See it working._
   Cheapest, reversible, and the widget already exists unused.
2. **Header nav** — `Overlay · Playground · Docs · Pricing · Blog`. Overlay leads because it is the
   only one a stranger can evaluate. `Pricing` goes in only after the rewrite.
3. **`OverlayTeaser` after `OperationsLayerC`** — the real hook. The homepage argument currently ends
   at the Operations Layer; `ProductLayer` and `TechnologyLayer` are commented out and the arrow
   connector between them is already sitting in `index.astro` waiting for a section that never
   shipped. Mirror `OperationsLayerC`'s shape: eyebrow pill `Product Layer · DNA Overlay`, one
   sentence, one cropped screenshot, one link.

   The sentence is **"More control over your product. Not more product."** — too argumentative to
   carry a hero, but exactly right where a single line has to make the whole case, and it pre-empts
   the _you are adding things to my app_ read before the visitor ever reaches `/overlay`.

4. **Hero and closing CTA** — hero gains a third action `Overlay` with `Playground` staying primary;
   the closing `CallToAction` becomes `Get early access` · `Playground`.

## Call to action

**Primary, everywhere: `Get early access`.** Not "Start free" — the npm package is private and setup
needs a key, an application record and usually a `ComponentLibrary` binding, so a self-serve button
landing on a form burns the credibility §3 just bought. Not "Book a demo" — the page _is_ the demo,
and asking for a calendar slot after somebody has stepped through the panel is friction charged for
nothing.

Five fields: name, work email, company, _what your application is built with_, and **what governs
your controls today** — free text, and the single most valuable field on the page. An answer naming a
flag vendor plus an authz vendor is a qualified install and a priced comparison in one line.

Secondary: `See how it installs` (an anchor, zero cost) and a customer-facing rewrite of the overlay
walkthrough published as a long-form post. `Try the Playground` stays present but never primary.

---

# Pricing

## Where it goes

Two surfaces, two jobs.

- **`/pricing` is canonical.** It owns the full ladder, the comparison table, add-ons, the definitions
  (_what counts as an application_, _what an editor is_), and the pricing FAQ. This is the page a
  champion circulates internally.
- **`/overlay` §5 is a three-card strip** — Starter / Team / Business, price, one line, `Get early
access`, and a link to the comparison. A visitor who has just watched the demo is answering one
  question: _is this $200 or $20,000._ One number answers it. Repeating the table there costs a
  scroll and gains nothing.
- **Header gains `Pricing`** only after the rewrite lands.
- **Every price CTA routes to the early-access form**, never to checkout.

Publish numbers pre-GA rather than "contact us." A page with prices can be forwarded to a manager;
"contact us" cannot. And publishing before the numbers harden means the first twenty conversations
calibrate them.

## The structural decision: one ladder, not three products

The risk is not the numbers, it is the **shape**. Overlay's natural meters are governed applications
and editor seats. Design's natural meter is authors and models. Run's is agents, cells and
environments. If the ladder published today is shaped around Overlay's meters, the second pillar
forces a public repricing — and a public repricing turns every renewal into a negotiation.

So: **one ladder, priced on meters all three pillars share, with pillars as row groups rather than
line items.**

- **Applications** — Design models them, Overlay governs them, Run executes against them.
- **Editors** (may `write`) — a Design author, an Overlay rule-writer and a Run operator are the
  same grant.
- **Ratifiers** (may `ratify`) — genuinely scarce, genuinely audited, and pillar-independent. This
  is the seat that should never be free.
- **Inspectors** — unlimited at every tier, forever. See below.

Two consequences worth stating explicitly on the page:

1. **Overlay is not a separate SKU.** It is included from the first paid tier up. Selling the in-app
   surface apart from the graph underneath it commits in public exactly the error the wedge attacks,
   and it makes _can I just buy the overlay_ the first question on every call. Say it in one line:
   _the Overlay is a surface on your model, not a product beside it._
2. **Design and Run will light up rows on the plan you already have.** Do not put unshipped pillars
   in the table — selling futures. Put them in a strip under it with one promise: _your seats and
   applications carry forward._ That promise is what makes it safe to publish a ladder now, because
   the tiers get _more_ at the same price rather than needing new tiers.

## The free/paid boundary is one the platform already enforces

Free plans get **development and staging keys only, never a production key.** Not a constructed
limit — the environment is read off the `Key`, and the platform already refuses the development
identity chooser outright for any production key whatever the configuration says. So the boundary
needs no new enforcement code, cannot be argued around, and explains itself: _build against it for
free, pay when it faces your users._

## The ladder

Monthly, billed annually at two months free. Every tier includes the console, the Playground, the
docs and the MCP tool surface — the graph is the same graph.

|                                 | **Free**          | **Starter** | **Team**       | **Business**   | **Enterprise**     |
| ------------------------------- | ----------------- | ----------- | -------------- | -------------- | ------------------ |
|                                 | $0                | **$99**/mo  | **$499**/mo    | **$1,499**/mo  | custom             |
| Applications                    | 1, non-production | 1           | 3              | 10             | unlimited          |
| Editors (`write`)               | 1                 | 2           | 5              | 20             | unlimited          |
| Ratifiers (`ratify`)            | —                 | 1           | 3              | 10             | unlimited          |
| Inspectors                      | unlimited         | unlimited   | unlimited      | unlimited      | unlimited          |
| Production keys                 | —                 | ✓           | ✓              | ✓              | ✓                  |
| Access rules + release policies | ✓                 | ✓           | ✓              | ✓              | ✓                  |
| Conflict detection              | ✓                 | ✓           | ✓              | ✓              | ✓                  |
| Build manifest publishing       | ✓                 | ✓           | ✓              | ✓              | ✓                  |
| Occurrence history              | 7 days            | 30 days     | 90 days        | 1 year         | configurable       |
| Audit export (SIEM / webhook)   | —                 | —           | —              | ✓              | ✓                  |
| Prototype mode                  | —                 | —           | ✓              | ✓              | ✓                  |
| Your own component library      | —                 | —           | ✓              | ✓              | ✓                  |
| SSO / SAML                      | —                 | —           | ✓              | ✓              | ✓                  |
| SCIM provisioning               | —                 | —           | —              | ✓              | ✓                  |
| Marketplace packs               | read              | read        | read           | read + publish | read + publish     |
| Rollup across organizations     | —                 | —           | —              | —              | ✓                  |
| Self-host / VPC                 | —                 | —           | —              | —              | ✓                  |
| Support                         | community         | email       | 1 business day | shared Slack   | named contact, SLA |

Add-ons, so nobody jumps a tier for one dimension: **+$149/mo per application**, **+$59/editor/mo**,
**+$99/mo per additional year of retention**.

## Who each tier is, and what they are actually buying

- **Free — a developer proving it to themselves.** Non-production keys, one app, one editor, 7 days
  of history. They are not a lead until they ask for a production key, and asking is the conversion
  event.
- **Starter, $99 — one team, one product.** A team lead expensing it without a suite decision. They
  get the panel in production, real access rules and release policies, and 30 days of who-did-what.
  This tier is a wedge, not a business: every one of them becomes a Team upgrade the moment a second
  application appears.
- **Team, $499 — the volume tier, and the one that will actually convert in year one.** Three
  applications, five editors, three ratifiers, Prototype mode, their own component library, 90 days
  of history, **and SSO/SAML**. This is the engineering-led buyer: a platform lead who wants the
  coverage number for their own product. This is where the wedge is priced.
- **Business, $1,499 — bought for the audit story, not the seat count.** Ten applications, twenty
  editors, SCIM provisioning, a year of occurrence history and **export to their SIEM**. The buyer is
  carrying a compliance obligation, and what they are purchasing is a defensible answer to _who could
  do this, who did, and when did the rule change_ — which the incumbent arrangement cannot produce
  without a spreadsheet.

  **Decision: Business holds at $1,499, and SSO moves down to Team.** The question was whether $1,499
  overprices a tier whose buyer is not yet reachable — a compliance officer will not buy pre-GA
  software with no SOC 2, no DPA and no references, so year one is engineering-led and Business would
  sit empty. But cutting to $999 is the wrong fix, because the founding-rate lock makes whatever is
  published sticky for two years, and a price is far easier to lower later than to raise.

  The actual defect was bundling: **SSO/SAML is an engineering need and audit export is a compliance
  need**, and they had been put in one tier. Gating SSO at $1,499 is the SSO tax that developer-tool
  buyers resent and mock in public. Moving it to Team gives the year-one buyer what they need at
  $499 without discounting a tier that has to survive contact with a real compliance purchase. SCIM
  stays at Business, where directory-driven provisioning genuinely belongs.

- **Enterprise — bought for federation and residency.** Self-host or VPC, rollup across organizations,
  ontology alignment for cross-org packs, SLA, named contact. The buyer is an enterprise architect,
  and none of the value here is a seat count, which is why it is quoted.

## Why the meters are these

- **Inspectors are unlimited, on purpose and permanently.** The panel's value compounds with how many
  people can ask _may I do this, and why._ A per-viewer price makes the answer "ask an admin," which
  is precisely the failure mode the product removes. Charge for authority, which is scarce and
  audited; give away the reading, which is the habit.
- **Applications, not monthly active users or events.** The occurrence log grows with the customer's
  own traffic. Metering it prices a customer for their success and gives them a reason to instrument
  less — fatal for a product whose coverage number is its opening line. Applications is also a figure
  the buyer can predict at signing.
- **Retention is the honest upsell axis.** It is a real cost, it maps directly to the compliance
  buyer's requirement, and it moves nobody's behavior in a bad direction.
- **Prototype starts at Team** because it is inherently multiplayer — a PM, a developer and somebody
  who may ratify — and because it needs the component-library binding whose console support is still
  partial. Gating it above the self-serve tiers means the tier that includes it is one we are in the
  room for.
- **$499 anchors against the pair it replaces.** A flag product plus a policy product at team scale
  is materially more than $499/mo, and neither reports a conflict or knows what is on the screen.
  Put that on `/pricing` as a two-column strip, stated as a range, without naming a competitor's
  list price.

## Launch framing

Show the full ladder, badge every paid tier **Early access**, and add: _founding pricing — the first
20 design partners keep these rates for two years._ That is a real concession with a real cap, it
gives the first cohort a reason to move now, and it buys the calibration room a published ladder
otherwise costs.

## Impact

- **`/pricing` must be rewritten before it is linked anywhere.** It currently ships AstroWind's
  placeholder content — three lorem-ipsum tiers, a stock Unsplash image, and FAQs about downloading
  templates. It is unlinked in `navigation.ts` today; linking it publishes that.
- **`Pricing.astro` fits three columns comfortably, not five.** Use the three-card row for
  Starter / Team / Business with Free and Enterprise as bookend rows, and build the full matrix as a
  separate comparison table. Less new code, and it puts the money tiers in the eye.
- **`WaitlistForm.astro` has `ACTION_URL = '#'`.** Every CTA is dead until it points somewhere, and
  the extra qualification fields change the form — pick the destination first.
- **Screenshots need marketing exports.** Clean and well-composed, but they carry `localhost` in at
  least one popup and a `Staging` badge in the shop header. Crop the former; keeping the latter is
  defensible and honest.
- **Claims register.** §3 makes seven falsifiable claims about platform behavior. All true today per
  the walkthroughs, and exactly the sort of thing that quietly stops being true. Re-walk the demo
  before each material edit to that section.

## Build order

1. `/pricing` rewrite — unblocks everything and is the shortest path to a page sales can send.
2. `/overlay` static sections with screenshots (wedge, read-and-change, install-and-trust, suite,
   pricing strip, FAQ, CTA).
3. The early-access form and its destination.
4. Homepage hooks — announcement bar, nav, `OverlayTeaser`, hero and closing CTA.
5. `OverlayDemo` — the interactive panel. Largest piece, and the page is publishable without it, so
   it ships second rather than blocking launch.
6. The customer-facing walkthrough post as the long-tail entry point.
