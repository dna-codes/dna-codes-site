# Editorial Plan

## The Future of Programming — a series

> From intent to execution: the missing abstractions between what a business wants and
> what a machine does.

The published manifesto is the map. Each subsequent piece is a deep dive that makes a
different argument, escalating toward the Operational Model as the flagship. This is a
point-of-view series, not eight articles explaining eight layers — if a draft starts
reading like a definition, it has gone wrong.

Every DNA article exists as a stub in `src/data/post/` with `draft: true` and its
scheduled `publishDate` already set. Drafts are filtered in `src/utils/blog.ts`, so they
produce no route, no sitemap entry and no RSS item until the flag comes off — and they
render under `astro dev` with a Draft badge so a preview is never mistaken for a live
page. Each stub carries a brief in an HTML comment: thesis, spine, prior art, DNA's one
novel claim, figure notes and the LinkedIn hook. Delete the comment when you write it.

**Keep briefs out of `.mdx` files.** The moment a post needs a component it gets renamed
to `.mdx`, and MDX rejects HTML comments — the page 500s with a bare `MDXError`. The JSX
comment that replaces it is worse: Prettier escapes the asterisks to `{/\*`, which is
invalid JS, so `npm run check` passes and the build fails. Once a post goes `.mdx`, its
open items live here under "Open items per post" instead.

### Open items per post

**Semantics — Software Runs on Words Nobody Defined** (Aug 23, drafted, `.mdx`)

1. Replace the placeholder hero. Shoot it from the `<AmbiguityResolver />` figure, dark
   mode, 1200×628, in the `Undefined` state — that is the status quo and where the
   article opens.
2. Add the "Next: Ontology" link in the closing section once that post ships Aug 30.
   Deliberately unlinked for now; it would 404 on publish day.
3. Add the series nav block to the manifesto (see the series rules below).

### Calendar

Sundays, matching the manifesto's publish day. The series runs 10 weeks, Aug 9 – Oct 18.

| Week | Date   | Venue        | Piece                                                                                    | Status                                |
| ---- | ------ | ------------ | ---------------------------------------------------------------------------------------- | ------------------------------------- |
| 1    | Aug 9  | DNA          | The Future of Programming: The Abstraction Layers Between Intent and Execution           | **Published**                         |
| 2    | Aug 23 | DNA          | Semantics: Software Runs on Words Nobody Defined                                         | **Drafted** — needs figure + OG image |
| 3    | Aug 30 | DNA          | Ontology: Your Database Is Not Your Business Model                                       | Stub                                  |
| 4    | Sep 6  | DNA          | The Operational Model: The Missing Abstraction for What a Business Can Do — **flagship** | Stub                                  |
| 5    | Sep 13 | HackerNoon   | AI Can Write the Code. Who Defines What the Code Is Supposed to Mean?                    | Brief below · _submit by Aug 30_      |
| 6    | Sep 20 | DNA          | The Execution Model: Your API and Your MCP Tool Should Not Be Written Twice              | Stub                                  |
| 7    | Sep 27 | freeCodeCamp | From Writing Code to Designing Systems: Programming After AI                             | Brief below · _submit by Sep 13_      |
| 8    | Oct 4  | DNA          | Code Isn't Disappearing. It's Moving Down the Stack                                      | Stub                                  |
| 9    | Oct 11 | DNA          | You Choose Your Technology Stack Too Early                                               | Stub                                  |
| 10   | Oct 18 | DNA          | The Best Abstraction Layer Is the One You Never Think About                              | Stub                                  |

Aug 16 is deliberately left empty to give the first deep dive a full writing week. The
gap is invisible to readers — the manifesto is a week old and still the top post.

Weeks 5 and 7 have no DNA post. LinkedIn points at the external piece instead. That is
the point of those weeks, not a hole in the schedule.

**The canonical piece runs before its syndicated version.** Semantics → Ontology →
Operational Model is the escalating argument, and interrupting it the week before the
payoff deflates it. It also settles a real SEO question: HackerNoon's domain authority is
far above dna.codes, so on near-duplicate framing they will outrank you for your own
idea. Publishing the flagship first gives the original a clear head start and gives the
syndicated piece a canonical URL to point at — which matters under HackerNoon's roughly
one-brand-link-per-500-words guidance.

The cost is that the flagship now lands three weeks out instead of four, in the same
window as two other deep pieces. So draft it in parallel starting now rather than in its
own week. If it isn't ready by Sep 6, swap it back with the HackerNoon week — those two
slots are interchangeable by design. Nothing else in the calendar is.

**Syndication dates are submission targets, not publish dates.** Both publications run
editorial review, and when a piece goes live is the editor's call, not yours. Submit
about two weeks ahead and treat the calendar date as the week you expect it to land.
Build the LinkedIn post after acceptance, not before.

Two scheduled reminders fire two weeks ahead of each submission deadline. Each one reads
this file, checks whether a draft exists, and reports the brief back — manage or disable
them at https://claude.ai/code/routines.

| Fires                | Reminds about      | Submit by |
| -------------------- | ------------------ | --------- |
| Mon Aug 17, 9:00 MDT | HackerNoon piece   | Aug 30    |
| Mon Aug 31, 9:00 MDT | freeCodeCamp piece | Sep 13    |

**If something slips**, the three consequence pieces (Code, Technology Stack,
Machine/Runtime) absorb it — they are the least time-sensitive and read fine at any
spacing. Never move the flagship to make room for them.

### Rules for the series

**Lead with the layer name, and make the hook carry the stakes.** Titles follow
`Layer: Hook`. The prefix is what makes the series scan as a series and what installs the
vocabulary — that is the whole GTM motion, so it stays.

But the prefix cannot be the part that sells the click, because most readers do not know
what semantics means in a software context and fewer know ontology. Worse, several of
these words are already mush: "semantic" is attached to semantic HTML, semantic
versioning, the semantic web and semantic search, all unrelated. So the reader arrives at
the colon with either nothing or the wrong thing.

Which means the hook after the colon has to do two jobs at once — say what the layer
covers, and say why it costs something. _Software Runs on Words Nobody Defined_ does both
in six words. _The Most Dangerous Word in Software Is 'Customer'_ does neither; it is a
clever line about an example rather than about the layer.

Then the article's opening has to finish the job. Each piece needs an early passage that
plainly says what this layer is and why it is a layer rather than a discipline — before
the argument assumes it. Reading the draft and asking "would someone who has never heard
this term know what it means by paragraph five?" is the check.

**Every piece states its layer's purpose, and shows both handoffs.** Two required
sections, in every article.

_Purpose_ — an early passage saying plainly what this layer is and why it is a layer
rather than a discipline, before the argument assumes it. In the Semantics draft that is
"What semantics means here," and it does the work by first clearing away the four
unrelated things "semantic" already means to a developer, then giving the one-line
definition, then the argument that makes it matter: every other layer has an artifact the
machine reads, so every other layer has somewhere a correction can land.

_Handoffs_ — a section showing what the layer receives from above and what it produces
for the layer below, worked through on `customer` / `invoice` / `pay`. Not described,
demonstrated: show the actual input, the actual output, and why the transformation is
mechanical rather than creative. The Semantics draft's "What comes in, and what goes out"
is the template.

This is what keeps the series from being eight disconnected essays. `AbstractionStack.astro`
already names all seven handoffs, and the series should use those names:

| Handoff     | Between                             | Owned by                                      |
| ----------- | ----------------------------------- | --------------------------------------------- |
| Elicitation | Intent → Semantics                  | Semantics (in)                                |
| Structuring | Semantics → Ontology                | Semantics (out), Ontology (in)                |
| Derivation  | Ontology → Operational Model        | Ontology (out), Operational Model (in)        |
| Projection  | Operational Model → Execution Model | Operational Model (out), Execution Model (in) |
| Generation  | Execution Model → Code              | Execution Model (out), Code (in)              |
| Binding     | Code → Technology Stack             | Code (out), Technology Stack (in)             |
| Compilation | Technology Stack → Machine          | Technology Stack (out), Machine (in)          |

Each handoff therefore gets written twice, from both sides, a few weeks apart. That is a
feature — the second pass is a callback, and the repetition is how the vocabulary sets.
The closing piece can then argue about the handoffs themselves, having shown all seven.

**Every piece should be interactive if the argument allows it.** The manifesto works
because `<AbstractionStack>` lets the reader flip between the leap and the ladder and
_see_ the gap rather than be told about it. That is the house standard now, not a
one-off. Before writing, ask what the reader could manipulate that would make the claim
land harder than a paragraph — a toggle between two states, a definition the reader
changes with the downstream artifacts updating live, a thing that fans out.

The bar is that the interaction carries the argument. A diagram that merely animates is
decoration and costs more than it returns; if the honest answer is that a piece has no
manipulable claim, a good static figure beats a weak widget. But start from "what moves
here," not from "does this need a figure."

Existing components to read before building a new one — the pattern is vanilla
`<script>` plus data attributes, no framework:

- `AbstractionStack.astro` — mode toggle, expandable layer cards, locked-mode prop
- `OperationsDemo.astro` — define resources and actions, watch the API surface fall out
- `LensDemo.astro`, `AgentOpsDemo.astro`, `OverlayDemo.astro` — other worked examples

Reuse beats rebuild. `OperationsDemo` in particular already does most of what the
Operational Model and Execution Model pieces need; check it before starting from scratch.
Any post embedding a component must be renamed `.md` → `.mdx`.

**Each post's hero is a still of its own figure.** Every piece needs its own image —
seven posts sharing one OG card looks like a content farm, and the card is most of what
a LinkedIn or Slack preview actually shows. But they shouldn't be seven unrelated
illustrations either.

Since each piece already has a specific interactive figure in its brief, shoot the hero
from that: the ontology-with-two-schemas panel, the Pay Invoice definition mid-edit with
a precondition dropped, the one-operation-four-surfaces fan-out. Screenshot it in dark
mode at 1200×628, at whatever state of the interaction makes the argument clearest.

That gets three things from one piece of work:

- Every post has a distinct hero that is actually about that post
- The series looks like a series, because the figures share a visual system
- The syndicated HackerNoon and freeCodeCamp versions need exactly these stills, since
  neither platform runs our components — and captioning them "the live version is on
  dna.codes" is the most natural backlink either piece will get

It also sets the build order per post: figure first, then prose, then screenshot. The
figure was already the recommended starting point for the flagship; this makes it the
default everywhere.

**Reuse the one example.** `customer`, `invoice`, `pay` — every piece, every layer. The
series compounds because the same three words keep revealing new structure. Introducing a
new domain to look fresh would throw that away.

**One novel claim per piece, and name the prior art first.** Each stub has a
`PRIOR ART` block and a `DNA'S ONE NOVEL CLAIM` block. Fill in the first generously
before making the second. DNA leverages existing models and fills gaps; a piece that
implies DNA invented ontologies or state machines loses the exact reader it wants. The
honest claim across every layer is roughly the same one: these traditions exist, each
models one slice, and nothing carries a definition from one layer into the next.

**Product links are earned, not default.** The Operational Model piece has obvious cause
to link `/operations`; the tech-stack and machine/runtime pieces are better with zero.
The manifesto's pattern — argument first, one short "what we're building" section near
the end — is the ceiling, not the floor.

**The last three pieces are consequences, not pitches.** Code, Technology Stack and
Machine/Runtime should read as arguments about software. They will be the most shared
precisely because they are the least about DNA.

**Build the series nav in week 2, not week 10.** The manifesto is already the most-read
post and will keep collecting traffic for the whole run. Add a "The Future of
Programming series" block to it as soon as Semantics ships, listing the published pieces
and naming the ones still coming — then extend it each week. Deferring it to the wrap-up
wastes ten weeks of the one page readers actually land on. This is an edit to a live,
indexed article; keep it additive and leave the argument untouched.

### Pre-publish checklist per piece

- [ ] Delete the `<!-- BRIEF -->` block
- [ ] Remove `draft: true`
- [ ] Replace the placeholder hero with a still of this post's own figure (see the
      titling and figure rules above). Every stub currently points `image:` at the series
      image so drafts preview with a header; the line is tagged `# PLACEHOLDER` so it
      greps. `grep -rn PLACEHOLDER src/data/post/` before any publish.
- [ ] Interactive figure built, or a written reason why this piece doesn't support one
- [ ] Rename `.md` → `.mdx` if the piece embeds a component
- [ ] Figure checked on mobile and in dark mode, and degrades to something readable
      without JS — it carries the argument, so it can't be the part that breaks
- [ ] Link back to the manifesto; add the new piece to the manifesto's series links
- [ ] Confirm the excerpt reads as a standalone claim (it is the blog-list and OG copy)
- [ ] LinkedIn post drafted from the hook — the observation, not a summary of the article

## Syndication

Do not republish the DNA pieces. Reframe the idea for each publication's audience. DNA
blog is the canonical IP; LinkedIn is distribution and conversation; HackerNoon and
freeCodeCamp are independent audience acquisition.

Neither platform runs our components, so the syndicated pieces get static images of the
figures. Use that: a still of an interactive figure with "the live version is on
dna.codes" is the most natural backlink either piece will ever have, and it sends the
reader to the canonical article for a reason they actually care about rather than a
promotional one. It is also the clearest argument for why the interactive figures are
worth the build — they are the one thing the syndicated versions can't have.

### HackerNoon — week 5 (target Sep 13, submit by Aug 30)

**Working title:** AI Can Write the Code. Who Defines What the Code Is Supposed to Mean?

HackerNoon wants technically substantive stories: a real problem, the approaches tried,
the solution, implementation details, and why the technical choices matter. Build the
piece around the concrete transformation chain rather than an abstract essay.

```
Customer pays invoice
    ↓  Semantic model      Customer = … · Invoice = … · Pay = …
    ↓  Ontology            Customer → owns → Invoice · Invoice → settled_by → Payment
    ↓  Operational model   Customer → pay → Invoice · status = Issued · amount == amount_due
    ↓  Execution model     REST API · MCP tool · workflow step · UI command
    ↓  Code                TypeScript / Python / SQL
```

Then ask the question the piece exists to ask: what would it take to make those
transformations mechanical? Show real artifacts at each step — this is the audience that
will want to see the shape of the thing, not a description of it.

The reader should finish thinking "DNA is an implementation of this idea," not "I just
read a DNA marketing article." Introduce DNA without making DNA the subject. HackerNoon
permits republished corporate-blog content if retitled with a rewritten intro, asks for
disclosure of vested interests, and limits brand backlinks to roughly one per 500 words.

Alternate titles: _The Missing Abstraction Layer Between AI Agents and Your Business
Logic_ · _What Happens When AI Agents Stop Writing Code and Start Compiling Business
Operations?_

### freeCodeCamp — week 7 (target Sep 27, submit by Sep 13)

**Working title:** From Writing Code to Designing Systems: Programming After AI

The developer-facing consequences piece. Not the eight layers — the three eras, and what
each one asks of a programmer:

```
Yesterday   Human → Code → Machine
Today       Human → Prompt → AI → Code → Machine
Tomorrow    Human → Intent → Semantics → Ontology → Operations → Execution → Code → Machine
```

Then walk each layer from a developer's point of view: what you would actually write,
what it saves you, what still needs judgment. Career-relevant and concrete, not
visionary. freeCodeCamp's audience is early-to-mid career; the piece should leave a
reader with a clearer sense of what to get good at, not an argument to agree with.

Note the overlap with the week-8 DNA piece (Code Isn't Disappearing) — the three-era
figure does load-bearing work here first. Keep the DNA piece focused on the
programming-vs-writing-code distinction and let this one own the career framing.

## Strategy note

The series is the outer ring of the market-playground idea. It gradually introduces a
vocabulary — intent → semantics → ontology → operational model → execution model → code
— which readers then encounter in LinkedIn posts, then in the diagrams on the site, then
in the Operations demo. The eventual recognition is "DNA is the thing that implements the
operational layer," which is a stronger motion than "here's our product, come try it."

The content does not have to sell DNA. It has to make the world in which DNA makes sense
increasingly obvious.

## Backlog

Kept from the earlier plan. These target a different audience (ops leaders, not
engineers) and different search intent. Worth resuming after the series concludes in
late October — running them concurrently would split the blog's voice mid-argument.

### Pain-point / problem awareness

- **The Hidden Cost of Process Debt: When Your Team Works Off Bad Docs** — the financial
  and operational cost of teams running on outdated processes: slow onboarding,
  inconsistent execution, compliance exposure.
- **Google Docs Is Not a Process System** — why wiki-style tools fall short for
  operational documentation, and what a real process system does differently.
- **The 5 Signs Your Team Has Outgrown Notion for Operations** — for teams at the 20–100
  person inflection point.

### Thought leadership / positioning

- **What "Living Documentation" Actually Means (and Why Static SOPs Fail)** — what
  properties make a process document genuinely maintainable.
- **Who Owns This Process? The Ownership Problem in Team Operations** — why "everyone's
  responsible" means nobody is.
- **SLAs Are Promises — Are Your Processes Built to Keep Them?** — the gap between SLA
  commitments and the processes that deliver on them.

### Practical / how-to (SEO-friendly)

- **How to Write an SOP That Doesn't Get Ignored** — structure, length, format, ownership.
- **Building a Process Review Cadence That Teams Actually Follow** — triggers, owners,
  frequency, lightweight formats.
- **How to Audit Your Team's Operational Knowledge Before It Walks Out the Door** — a
  framework for capturing undocumented institutional knowledge.
- **The Difference Between a Checklist, a Runbook, and a Process Spec** — when to use
  each and how they relate.

### Audience-specific

- **Operations at 10 vs. 50 vs. 100 People: What Changes and When** — stage-by-stage
  breakdown of how operational needs evolve.
- **What Ops Managers Wish Founders Understood About Process Documentation** — founder
  assumptions that create operational debt downstream.
