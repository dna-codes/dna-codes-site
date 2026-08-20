# Design — What's your DNA?

## Context

The site already owns every piece this page needs, in the wrong arrangement for a stranger:

- `DnaHelix.astro` / `src/utils/dnaHelix.ts` draw an animated double helix on canvas and an
  equivalent single frame as SVG. `computeRungs()` already produces exact per-rung geometry —
  it is just not exported.
- `src/utils/lens-demo.ts` already turns a resource-graph DNA document into view-models (org
  chart, process flow, runbook, job description) with no industry-specific logic in the
  renderers. Four sample graphs already exist, one of them e-commerce.
- `/docs/{operational,product,technical}` enumerate the three layers' primitives directly from
  `@dna-codes/dna-schemas`, so the layer vocabulary is fixed and published.
- `/playground` established the house pattern for shipping an interactive surface before its API
  exists: a real client signature, an in-browser stub, and a visible demo-mode marker.

What is missing is a path that starts at "who are you" instead of "here is what we built."

## Goals / Non-Goals

**Goals**

- A stranger understands DNA in under ninety seconds, without reading a definition.
- The visitor's industry and its value proposition are on screen continuously after Act I.
- Every artifact shown is genuinely derived from a validated DNA document, not mocked.
- Adding a seventh industry is a data change: one genome file plus one entry in `industries.ts`.
- The page works with JavaScript-heavy interaction but degrades to readable content without it.

**Non-Goals**

- Live generation against a real API (deferred; the seam is built for it).
- Letting a visitor author, edit, or upload a genome.
- Replacing the homepage, or moving the existing lens demo off `/operations`.
- Points, badges, streaks, or any scoring. "Gamified" here means _agency and payoff_, not arcade.

## Decisions

### D1 — Three acts on one page, advanced by choice, not by scroll

Each act is a full-viewport section. Advancing is a consequence of a decision — selecting an
industry scrolls to Act II; pressing **Go** scrolls to Act III. Free scrolling is never blocked
and no act is hidden behind an overlay, so a visitor who just wants to read down the page can.

_Alternative rejected:_ a three-step wizard with the previous step unmounted. It hides the trail,
breaks browser back, and makes the "one genome, many views" claim harder to see, because you can
no longer look up and find the industry you picked still lit on the helix.

_Alternative rejected:_ scroll-jacked full-page snapping. Fights the visitor, fails badly on
mobile, and is the single most common way "slick" becomes "unusable."

### D2 — One prominent listbox, with the helix behind it — REVISED TWICE DURING APPLY

**What the original decision said:** a vertical strand with six labelled rungs, chips alternating
left and right at fixed positions, and a connector drawn each frame from every chip to its rung's
current node. It required exporting rung geometry and a per-frame draw hook from `dnaHelix.ts`.

**Three shapes, one reason.** Built as specified, then cut to a horizontal row of six cards, then
to a single dropdown. Each cut was made for the same reason: the _choice_ was not obvious enough.
The vertical strand was 26rem of mostly empty space. The card row was tight but read as
decoration — six equal cards look like a feature grid, not a control. One large element saying
**Select Model** reads as the thing to do.

**What it is now.** A prominent listbox, centred, with the helix running behind the whole section
as background exactly as the homepage hero uses it. The chosen model's value proposition sits in a
line underneath, and moves into the sticky bar on selection.

**Why a listbox and not a `<select>`.** It was a native `<select>` first, for the keyboard and
screen-reader behaviour that comes free. macOS draws native option popups with system chrome and
ignores page styles on them — the house pattern in `LensDemo` (`.example-select option { … }`)
hits the same wall — so the control rendered as a white system dropdown in the middle of a dark
page. Hand-rolling it costs an ARIA implementation and buys two things: the popup matches the
page, and **each option carries its industry's value proposition inline**, so a visitor reads what
they are choosing before choosing rather than after.

The implementation owes what the native control was giving away, and pays it: button with
`aria-haspopup`/`aria-expanded`, listbox holding focus with `aria-activedescendant`, Up/Down,
Home/End, Enter, Escape and Tab to close, click-outside, and focus returned to the button on
close. **This is the least-tested part of the change** — see the verification note in `tasks.md`.

Three consequences worth recording:

- **`~/utils/dnaHelix.ts` needed no changes at all.** The rung-geometry export and per-frame hook
  were written, used by the connectors, and reverted when the connectors went. A shared module
  ends this change byte-identical to how it started, which is the right outcome — the additions
  had no second caller and would have been dead API.
- **The strand needs holding back.** At full strength its nodes ran straight through the heading.
  It sits at 0.3 opacity under a radial scrim that is darkest at the centre, which is exactly
  where the heading and the control are.
- **One implementation trap, recorded because it cost a debugging pass:** `mountDnaHelixCanvas`
  writes `position: relative` onto its host unless the host already has one, and an inline style
  beats a Tailwind class. A host classed `absolute inset-0` therefore collapsed to zero height and
  the strand rendered invisibly. The host sets `position: absolute` inline instead.

### D2a — No default industry

The page loads with nothing selected. A default was tried and pulled: pre-selecting an industry
means the sticky bar answers its own question before the visitor has been asked, and it dims five
of the six cards on arrival, which reads as "disabled" rather than "not chosen yet".

The cost is that Act II and Act III are inert until a choice is made, and that is the correct
trade — the whole page is built around the visitor answering a question, and handing them a
pre-filled answer removes the only thing they are there to do.

### D3 — Six industries, chosen for spread rather than coverage

E-commerce, Health care, M&A, Security & compliance, Financial services, Professional services.

Six is the largest number that fits one readable row at desktop width — and scrolls without
feeling endless at mobile width — and the smallest that makes a visitor believe the seventh
exists. The set deliberately spans
transactional (e-commerce), regulated (health care), analytical (M&A), governance
(security & compliance), and services (professional) — so whoever arrives finds either
themselves or an obvious neighbour.

Each carries a value proposition written as _what DNA models for you_, not as a benefit claim:

| Industry              | Value proposition                                      |
| --------------------- | ------------------------------------------------------ |
| E-commerce            | Modelling across inventory, catalog, and fulfillment   |
| Health care           | Care pathways, staffing, and the rules that bind them  |
| M&A                   | Operational modelling and business valuation           |
| Security & compliance | Controls mapped to the operations they actually govern |
| Financial services    | Products, approvals, and the authority behind each one |
| Professional services | Engagements, delivery teams, and the work they own     |

The two the request specified (M&A, e-commerce) are quoted verbatim.

### D4 — The genome is authored compact and compiled to canonical DNA — REVISED DURING APPLY

**What the original decision said:** a genome is a flat resource graph — `{ name, description,
resources[], relationships[] }`, the shape `src/data/lens-demo-*.json` already uses — validated
against `@dna-codes/dna-schemas`.

**Why that was wrong.** Reading the published schemas during implementation showed that flat shape
is not DNA at all. It is a display convenience the lens demo invented. Canonical Operational DNA is
a _nested_ document — `{ domain: { resources[], persons[], roles[], groups[] }, memberships[],
operations[], tasks[], processes[], triggers[], rules[] }` — where every operational primitive
carries a UUID and a schema `version`, names are PascalCase, task ids are kebab-case, operations
are `Target.Action`, and `unevaluatedProperties: false` everywhere. The existing lens-demo samples
(`type: "position"`, `id: "person:alex"`) would fail that validation instantly. The original spec
promised schema validation over a shape that cannot pass it — a promise that would have been
quietly dropped at implementation time, on the one page whose entire argument is that the
artifacts came from real structure.

**The revision.** Each genome is authored in a compact, readable format — names and edges, no
UUIDs, no version strings — at `src/data/genome/<industry>.genome.ts`. A build-time **compiler**
(`src/utils/genome-compile.ts`) expands it into three canonical documents: an Operational DNA
document, a Product document (core + api + ui), and a Technical document. The compiler assigns
deterministic UUIDs (a UUIDv5-style hash over the genome key plus the primitive's type and name,
so ids are stable across builds and diffs stay readable) and stamps `version` from the schemas'
own `operational/versions.json`. **The compiled output is what gets validated with Ajv, and what
every renderer reads.** A genome that cannot compile into valid DNA fails the build.

This costs one module and buys three things. The validation claim becomes true. The authoring
burden stays human — a genome file reads like an outline, not like a database dump. And the
pipeline is the product's own claim, executed on our own marketing page: **you author knowledge,
DNA gets compiled, artifacts get derived.** The page demonstrates the thesis rather than asserting
it.

Only operational primitives carry the id/version burden; product and technical primitives do not
extend the operational base, which is what keeps the compiler small.

**One genome per industry still holds.** Three compiled documents come out of one authored source.
Not three authored files, not a fragment per output type. **One document, many lenses** is the
product thesis; the data layout has to be the thesis or the page is lying.

Each genome must clear a stated minimum bar, which is what makes "strong ontology foundation"
checkable instead of aspirational:

- **Operational** — one company or department; ≥4 positions wired by `reports_to`; ≥1 person per
  senior position via `fills`; ≥1 process with ≥5 ordered steps, each step owned by a position;
  ≥3 rules; ≥1 trigger; ≥1 domain.
- **Product** — ≥4 core resources with ≥3 fields each; ≥1 API namespace with ≥4 endpoints; ≥1
  route/page set with ≥3 pages covering list, detail, and an action.
- **Technical** — ≥4 cells with connections between them; ≥2 environments; ≥1 provider.

Industry realism is judged on names and relationships, not volume. A health-care genome whose
process is `Intake → Triage → Diagnose → Order → Discharge`, owned by roles a clinic actually has,
teaches more than one with two hundred generic resources.

Compiled genomes are validated against `@dna-codes/dna-schemas` with Ajv as a build-time script, so
a malformed genome fails `npm run build` rather than shipping.

_Alternative rejected:_ authoring the canonical documents directly. Hundreds of hand-written UUIDs
across six industries and three layers, diffs nobody can review, and an authoring experience that
makes adding the seventh industry a day's work instead of an hour's.

_Alternative rejected:_ keeping the flat lens-demo shape and dropping the validation claim. Cheaper,
and defensible for a demo — but this page's whole argument is that the artifacts came from real
structure, and "real structure" that our own published schemas would reject is the weakest possible
version of that argument.

_Alternative rejected:_ generating genomes from an LLM at build time. Non-deterministic builds,
unreviewable diffs, and the one thing on this page that must be beyond question is that the
artifacts came from real structure.

### D4a — Every genome is grounded in that industry's published vocabulary

**The failure mode this exists to prevent:** six genomes that are structurally different and
lexically identical — `Item`, `Request`, `Record`, `Manager`, `Approve` — which would look fine
in review and be worthless to a practitioner. "Plausible-sounding nouns" and "the nouns this
industry's own standard uses" are indistinguishable from the outside, and only one is worth
anything.

So each genome declares the published vocabularies it draws on, and its names come from them:

| Industry              | Modelled on                                                             |
| --------------------- | ----------------------------------------------------------------------- |
| Health care           | HL7 FHIR R4 · HL7 v3 ActCode · LOINC · ICD-10-CM                        |
| Financial services    | FIBO · BIAN · Basel III · ISO 20022                                     |
| Security & compliance | SOC 2 Trust Services Criteria · NIST SP 800-53 Rev. 5 · NIST OSCAL      |
| E-commerce            | GS1 · EDI X12 · schema.org                                              |
| M&A                   | ASC 805 / IFRS 3 · Quality of Earnings · standard diligence workstreams |
| Professional services | PMBOK · Statement of Work conventions · utilisation & realisation       |

Health care is the clearest case and the template for the rest: the resources are FHIR resource
names (`Patient`, `Encounter`, `ServiceRequest`, `CarePlan`, `Consent`, `Observation`,
`Condition`), the fields are FHIR field names (`birthDate`, not `dateOfBirth`;
`effectiveDateTime`, not `takenAt`), encounter classes are the HL7 v3 ActCode values a real
system stores (`AMB`, `EMER`, `IMP`, `VR`), and codes sit in the system that owns them — LOINC on
observations, ICD-10-CM on conditions. A clinical informaticist should recognise every field on
sight.

The ontologies are **named on the page**, under the generated artifacts. A claim nobody can see
is a claim nobody can check.

**And it is enforced, not promised.** A fifth validator pass (`distinctness`) fails the build if
any resource, role, person, group, step, rule, cell, provider, page, or non-CRUD action name
appears in three or more genomes, and if any genome declares fewer than two vocabularies. The
cheapest way to add a seventh industry will always be to copy the sixth; this is what stops that
from shipping. CRUD verbs are exempt — `List` is not a domain noun and sharing it proves nothing.

That pass caught the three real leaks in the first draft: `Employee` as the person template in
four genomes (now `Practitioner`, `Associate`, `WorkforceMember`, `Banker`, `Consultant`,
`Employee`), and `AWS`/`RDS`/`Okta` as the infrastructure in four (now differentiated down to
`Redox` and `Epic` for the clinic, `Datasite` for the data room, `Swift` and `Temenos` for the
bank, `S3ObjectLock` and `Splunk` for the auditor, `OpenAir` for the practice).

### D5 — Twelve outputs, three columns, zero industry-specific renderers

| Layer          | Outputs                                                                       |
| -------------- | ----------------------------------------------------------------------------- |
| **Operations** | Process flow · SOP / runbook · Key positions · RACI matrix · Policies & rules |
| **Product**    | Data model · Screen map · Example UI · API surface                            |
| **Technology** | Architecture diagram · Environment topology · Access-control matrix           |

The hard constraint: **a renderer receives a view-model derived from the genome and nothing
else.** No `if (industry === 'healthcare')` anywhere in `src/components/genome/`. Any industry
flavour a renderer appears to have must be traceable to a resource name in the genome. This is
enforceable by review and worth enforcing — it is simultaneously the maintenance story (six
genomes cost one renderer each, not six) and the demonstration (the visitor is watching the same
code produce different worlds).

`src/utils/genome.ts` generalises what `lens-demo.ts` already does for four Operations views and
adds the Product and Technology derivations. `lens-demo.ts` stays as it is; `/operations` must not
regress.

**Example UI** is the one that earns its keep and the one most likely to go wrong. It renders an
actual admin table and detail form from a core resource's fields — column headers from field
names, control types from field types, row actions from the resource's actions. Rows are sample
values declared on the genome's fields, not invented at render time.

### D6 — Spotlight sets: pre-selected, and unexplained — REVISED DURING APPLY

Each industry declares 4–5 spotlight outputs in `industries.ts`, and they arrive checked.

An empty grid asks the visitor to do work before they know what any option means; a fully-checked
grid produces an unreadable wall in Act III. Four or five, chosen to make that industry's value
proposition self-evident, with everything else one click away.

**What changed:** the original decision paired the pre-selection with a line above the grid saying
why that set was chosen for that industry ("Pre-selected for what a diligence read needs first").
It was built and cut. The grid already shows what is ticked, and a sentence justifying it was more
copy than the point could carry — Act II now runs on one heading and one line. The
`spotlightReason` field went with it rather than lingering as data nothing reads.

Constraints: at least one output must stay selected (deselecting the last is refused, with the
control explaining why), and **Go** is enabled from the moment an industry is chosen.

### D7 — Generation is derivation, paced into one tabbed pane — REVISED DURING APPLY

**What changed:** the artifacts were a responsive grid of cards, each revealing as its lens
resolved. They are now **one pane with a tab strip that grows as the run proceeds**.

Twelve cards dropping into a grid is a wall — everything arrives, nothing is legible, and a
visitor cannot tell what they are looking at. A pane whose tab strip populates in front of them
reads as something being built, and it gives one artifact the whole width instead of twelve
artifacts a twelfth of the attention each.

Every selected lens gets its tab immediately, in a pending state with a pulsing layer dot, and
fills in as its derivation lands. The strip is therefore the progress indicator and the result at
once — no separate log. Tab dots are coloured by DNA layer, so the strip also shows at a glance
that all three layers are represented.

The pane follows each new tab as it arrives, **until the visitor picks a tab themselves** — after
that it stops moving under them for the rest of the run. Same principle as the lens demo's
auto-cycle: volunteer motion yields to intent immediately and permanently.

Pressing **Go** runs the sequence: the genome resolves (a beat), then each selected lens in turn,
roughly 300–500ms apart, capped at about three seconds total regardless of how many were selected.
Then straight to the call to action.

**No closing summary.** A line reading _"14 artifacts. One genome. No code."_ and a paragraph
under it explaining that none of it was hand-written were both built and cut. The artifacts have
already made that argument by existing; restating it underneath is the page explaining a joke it
just told, and it puts two paragraphs between the payoff and the button.

All of it goes through `generate({ genome, lenses })` in `src/utils/generate.ts` — the signature a
live call will have — implemented as in-browser derivation with a simulated delay. Loading and
error paths are real paths, exercised now, so swapping in the network call is one file. A failed
derivation shows its error inside its own tab and the rest still land.

**The disclosure is words, not a badge.** An amber "Demo mode" pill was built and cut as visual
noise; what it was actually for survives in the line under the artifacts — the genome is named,
and it says _not your data_. That is the `/playground` posture kept and the chrome dropped.

**The vocabularies stay inline rather than behind an info icon.** Hiding them behind hover was
considered and rejected twice over: hover reaches neither touch nor keyboard, and for a domain
buyer that list is the strongest credibility signal on the page — it is the moment a health
system's evaluator sees `HL7 FHIR R4 · LOINC · ICD-10-CM` and believes we know their world.
Something that load-bearing does not go behind a tooltip.

Under `prefers-reduced-motion: reduce` every tab arrives at once with no stagger and no arrival
animation, and the first is selected.

### D8 — The sticky bar is the page's spine

`GenomeBar` replaces the site header via `PageLayout`'s named `header` slot — two sticky bars is
a bug, and the standard nav is a set of exits from a page whose job is to hold you. It carries:

- the DNA mark, linking home (the only exit, and it should be one);
- the question **"What's your DNA?"**, which after Act I crossfades to
  `<Industry> · <value proposition>` — the industry in the accent, the proposition in muted
  weight beside it, truncating to the industry alone at small widths;
- a three-dot act indicator, filled as acts complete;
- **Get Started**, present from the first pixel, resolving to `APP_HREF`.

The footer stays. Someone who scrolls past the CTA without converting should still find the docs.

### D9 — State lives in the URL

`?industry=<key>&lenses=<comma-separated-ids>`, written with `history.replaceState` as choices are
made and read on load to restore a configuration. Unknown keys are ignored rather than erroring.
The same parameters are forwarded to `APP_HREF` on **Create your DNA**, so the app can seed a
session with what the visitor already told us. A shareable "here is our industry's DNA" link is
worth more in a sales thread than any screenshot.

### D10 — Route and entry points

The route is `/whats-your-dna`, matching the question in the bar — it survives being read aloud in
a meeting, which a route like `/build` does not.

**Entry points: campaign-only. Decided.** The page is a standalone campaign destination and is
linked from nowhere on the site — not the header nav, not the footer, not the homepage hero. A
landing page earns its placement with numbers, and a link from the homepage would also muddy what
the homepage is for. It stays reachable by URL, which is all a campaign needs.

This has a consequence worth stating: the page must stand alone completely. A visitor arrives cold
with no prior exposure to DNA and no surrounding site context, so every act has to carry its own
framing rather than assume the homepage was read first.

## Risks / Trade-offs

- **Six genomes is real authoring work.** Each must be realistic enough that a practitioner
  recognises their world. Mitigation: build the page against e-commerce (adapting the existing
  sample) and M&A only, prove the derivations, then author the remaining four against a fixed
  contract. The minimum bar in D4 is the acceptance test.
- **Bundle weight.** Six full-layer genomes shipped eagerly is a heavy first paint. Mitigation:
  the initial payload carries only `industries.ts` metadata; a genome loads on selection.
- ~~**The helix connector is the fragile part.**~~ Gone with the D2 revision — the strand is
  background and nothing reads its geometry, so the canvas/DOM coupling that would have broken
  across resize does not exist.
- **Over-promise.** Named genome plus demo-mode badge, per the proposal.
- **Renderer purity erodes.** The first `if (industry === …)` will be added under deadline
  pressure and will be reasonable. Mitigation: the constraint is in the spec as a requirement,
  not a convention.

## Open Questions

1. ~~**`APP_HREF` target.**~~ **Resolved: `https://app.dna.codes`,** as specified in the request.
   It is a single constant in `src/navigation.ts`; repointing it at `/waitlist` is a one-line
   change if the app is not open when the campaign runs.
2. ~~**Homepage relationship.**~~ **Resolved: campaign-only,** see D10.
3. **Value propositions for the four industries not specified in the request** — the D3 table is a
   first draft and should be read as such.
4. ~~**Does "Example UI" ship in v1?**~~ **Resolved: yes.** It is the output that most directly
   shows a stranger what came out of their genome, and the spec requires all twelve.
