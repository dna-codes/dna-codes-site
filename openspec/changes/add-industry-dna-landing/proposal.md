# What's your DNA? — an industry-driven landing page

> The mechanics of the three acts, the helix selector, and the per-industry ontology are
> designed in [`design.md`](./design.md). The page below is written to that design, and the
> two must be edited together.

## Why

DNA is a new concept, and every surface on the site currently teaches it the same way: by
explaining it. The homepage names two products. `/operations` argues "one model, many views"
with a demo you have to already care about to reach. `/docs` enumerates thirty-odd primitives.
All of it is correct, and all of it asks a stranger to hold an abstraction in their head before
anything of theirs is on screen.

**The fastest way to understand DNA is to watch your own industry come out of it.** A visitor
who picks "E-commerce" and sees a fulfillment process, an org chart, an admin UI, and a
deployment diagram all fall out of one model has learned what DNA is without a single sentence
of definition. That is the page this proposal adds — not a better explanation, a demonstration
with the visitor's hand on it.

Three things are broken today that this fixes:

- **No self-selection.** Nothing on the site lets a visitor say "I am in M&A" and be answered.
  Every page speaks to a generic operator, so the value proposition is generic too.
- **The payoff is buried.** The lens demo — the single most convincing thing we have — sits
  mid-page on `/operations` behind a product choice the visitor is not ready to make.
- **The concept costs more than it should.** "Living operating model" is four words that mean
  nothing on first contact. "Here is your org chart, your process, your admin screens, and your
  architecture, all from one file" means something immediately.

The gamified frame is the delivery mechanism, not decoration. Choosing an industry, picking what
you want generated, and pressing **Go** converts a reader into a participant, and a participant
who has just watched fourteen artifacts appear from one genome is the person who clicks
**Create your DNA**.

## What Changes

- **New route** `src/pages/whats-your-dna.astro` at `/whats-your-dna`, using `PageLayout`'s
  named `header` slot to replace the site header with a page-specific sticky bar. Three acts,
  each a full-height section, advanced by the visitor's own choices.

- **Act I — Pick your industry.** A vertical, rotating variant of the homepage helix where a
  fixed set of rungs are labelled with industries (E-commerce, Health care, M&A, Security &
  compliance, Financial services, Professional services). The strand animates behind; the
  industry chips are stable click targets pinned to their rung, joined to the live strand by a
  connector drawn each frame. Selecting one lights that rung, dims the rest, writes the industry
  and its value proposition into the sticky header, and scrolls to Act II.

- **Act II — Pick your lenses.** A grid of selectable output types in three columns, one per DNA
  layer — **Operations** (process flow, SOP, key positions, RACI, policies & rules), **Product**
  (data model, screen map, example UI, API surface), **Technology** (architecture diagram,
  environment topology, access-control matrix). Each industry's genome declares a spotlight set
  that arrives pre-selected, so the visitor starts from a good answer rather than an empty form.
  A **Go** button ends the act.

- **Act III — Generation.** A short, honest generation sequence (the genome resolving, then each
  chosen lens resolving in turn), followed by the artifacts themselves rendered as real views
  over that industry's DNA. Closes on **Create your DNA** into `app.dna.codes`, carrying the
  chosen industry and lenses as query parameters so the app can seed the session.

- **Sticky header** (`GenomeBar`) present from the first pixel to the last: the DNA mark, the
  question **"What's your DNA?"** before a choice and `<Industry> — <value proposition>` after
  it, a three-dot act indicator, and a **Get Started** action that never leaves. The value
  proposition stays on screen through every scroll, which is the point of putting it there.

- **Per-industry genomes** — the ontology foundation. One validated DNA document per industry at
  `src/data/genome/<industry>.json`, spanning all three layers, in the same resource-graph shape
  the lens demo already uses. Every artifact on the page is derived from these by a renderer that
  is industry-agnostic: **no output view may contain industry-specific copy.** Twelve outputs ×
  six industries is seventy-two artifacts and zero hand-written ones, which is both the
  engineering economy and the product argument.

- **Deep-linkable state.** `?industry=<key>&lenses=<csv>` restores a configuration, so a chosen
  run is shareable in a sales conversation, a post, or an ad.

- **No live API.** Generation is derivation from the bundled genome, executed behind the same
  client signature a live `generate({ genome, lenses })` call will have, with a demo-mode marker
  the way `/playground` does it. The theater is in the pacing, never in the content.

## Capabilities

### New Capabilities

- `industry-dna-landing`: A public, self-guided page at `/whats-your-dna` that lets a visitor
  select their industry from an interactive DNA helix, choose which artifacts to generate across
  the Operations, Product, and Technology layers, and watch all of them derive from one
  industry genome — with a sticky header that carries the industry's value proposition
  throughout and a terminal call to action into `app.dna.codes`.

- `industry-genomes`: A validated per-industry DNA corpus spanning all three layers, with a
  declared spotlight set and value proposition per industry, and a minimum ontology bar each
  genome must clear. Consumed by the landing page today; reusable by any future surface that
  needs a realistic worked example.

### Modified Capabilities

- `lens-demo`: unchanged in behaviour. Noted only because the landing page's Operations-layer
  renderers generalise the view-models in `src/utils/lens-demo.ts`; that module's existing
  consumers must keep working unmodified.

## Impact

- **New files**: `src/pages/whats-your-dna.astro`; widgets `GenomeBar.astro`,
  `IndustryHelix.astro`, `LensPicker.astro`, `GenomeGenerator.astro`; a renderer per output type
  under `src/components/genome/`; `src/data/genome/*.json` (six genomes) and
  `src/data/industries.ts` (keys, labels, value propositions, spotlight sets);
  `src/utils/genome.ts` (graph → view-model derivations) and `src/utils/generate.ts` (the client
  signature + demo-mode stub).
- **Modified files**: `src/utils/dnaHelix.ts` (export rung geometry so chips can pin to live rung
  positions); `src/navigation.ts` (add `APP_HREF`, and the landing page's entry point).
- **External dependency**: none at runtime. `app.dna.codes` is a link, not a call.
- **Build/deploy**: statically rendered; all derivation happens at build time or in the browser
  from bundled JSON. No new npm dependencies, no server routes.
- **Bundle weight**: six genomes is the one real cost. Mitigated by keeping each genome under a
  few hundred resources and loading non-selected industries' data on demand rather than shipping
  all six in the initial payload.
- **Open question for review**: `app.dna.codes` does not exist publicly yet and every other
  primary button on the site is the waitlist. The page is written so the terminal CTA reads from
  a single `APP_HREF` constant — point it at the app when it opens, at
  `/waitlist?industry=<key>` until then. **Flagging rather than deciding.**
- **Risk — the page over-promises.** A visitor could read the generated artifacts as "the product
  did this live for my company." Mitigated by the demo-mode marker and by naming the genome on
  screen ("BrightBox Commerce — a worked e-commerce genome"), the same posture `/playground` took.
- **Out of scope**: authoring or editing a genome on the page, uploading your own data, saving a
  run server-side, auth, more than six industries, and any live generation call.
