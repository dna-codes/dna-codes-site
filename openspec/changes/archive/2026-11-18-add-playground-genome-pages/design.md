# Design

## Context

See `proposal.md` for the motivation. The parts of the site this change builds on:

- **The genome corpus.** Six authored genomes in `src/data/genome/*.genome.ts`, each a fictional
  company. `npm run check:genomes` compiles and validates each one against
  `@dna-codes/dna-schemas` before `astro build`.
- **The compile and render pipeline.** `src/utils/genome-compile.ts` produces a
  `CompiledGenome`. `src/utils/genome.ts` derives twelve view-models from it (`DERIVATIONS`).
  `src/utils/genome-render.ts` turns each view-model into an HTML string (`RENDERERS`). The
  renderers return strings so that the browser can run them. The same strings work at build time
  with `set:html`.
- **The payload rule.** `src/data/genome/index.ts` imports the whole corpus. Only build-time code
  may import it. Browser code loads one genome at a time from `/genome/<key>.json`.
- **Share cards.** The existing cards are SVG strings rendered to PNG with `sharp` at 1200 × 628
  (`scripts/generate-*-og.mjs`). Those scripts run by hand and the PNGs are committed.
- **Tests.** The site has one `node:test` file (`src/utils/schema-doc.test.ts`) that uses relative
  imports. Node cannot resolve the `~/` alias, so `scripts/validate-genomes.mjs` bundles with
  esbuild before it runs.
- **Use Cases pages.** `/sop-software`, `/operating-model` and `/business-process-software` each
  take their title and description from the keyword registry through `seoFor`, and each ends on
  the shared `WaitlistForm`.

## Goals / Non-Goals

**Goals:**

- Every genome gets a static, indexable page inside the Playground.
- All question answers are computed at build time and embedded in the page. A change of subject
  makes no request.
- A new genome is a data change. It gets its page, its template card and its share card with no
  code change.

**Non-Goals:**

- Any change to the homepage or to the header's top-level links.
- A graph layout engine. The map is a structured layout (hierarchy, rail, lists), not a
  force-directed graph.
- Client-side routing or a framework island. The interactivity is a small vanilla script.
- Changes to the twelve existing renderers.

## Decisions

### Routes: `/playground/<key>/` beside `/playground`

`src/pages/playground/[key].astro` sits beside `src/pages/playground.astro`. Astro emits
`/playground/index.html` and `/playground/<key>/index.html` with no clash. The compiled JSON stays
at `/genome/<key>.json`, because the Playground already fetches it there and outside clients may
too. The genome page's download link points at it.

_Alternatives:_ a separate gallery at `/genome/`, with a homepage hero and a "Genomes" header link
leading to it. We rejected it. It shows the same six companies as the Playground, so a visitor has
two places for one thing, and it changes a homepage that works.

### The Playground links to the genome page from Act I

When a visitor picks an industry, a link under the Act I picker reads "Open the whole company" and
points at `/playground/<key>/`. The link is hidden while no industry is picked, and it follows the
URL state, so a deep link to `/playground?industry=ma` shows it too. Act II and Act III do not
change.

### The template list is a Use Cases page

`/operating-model-template` is a search landing page like the other three. It lists one card per
genome, takes its title and description from the registry row for `operating model template`, and
ends on `WaitlistForm`. It joins the Use Cases menu and the footer. `/operating-model` links to it
as the place to start from a filled model.

_Alternatives:_ a section on `/operating-model`, or a list on `/playground`. We rejected both. The
search intent for a template is "give me one to download", and a page whose first heading says so
answers that better than a section halfway down a page about target operating models.

### One genome-map view-model and one renderer

We add `genomeMap(g)` beside `DERIVATIONS`. It returns:

- the role tree;
- each process as an ordered list of steps (title, actor role, operation, resource);
- the resources;
- each rule, attached to the step whose operation it governs, or listed as unattached;
- for each role, its reach: the step ids it performs, the rule ids that allow it, and the
  resource names those steps act on.

We add `renderGenomeMap(vm)` to `src/utils/genome-render.ts`. It returns an HTML string with
`data-role`, `data-step`, `data-rule` and `data-resource` attributes, and the reach as JSON on the
root element, so the client script needs no second copy of the data. Roles are `<button>`s, so Tab,
Enter and Space work with no extra code. The script toggles `data-active` on the reach. CSS draws
the highlight. Under `prefers-reduced-motion`, CSS turns off the transitions.

### Questions are answered at build time and embedded as lookup tables

`genomeQuestions(g)` returns three lookup tables:

- operation → roles that an access rule allows, and the rules on it;
- role → steps it performs and processes it operates;
- resource → roles that act on it, by a step or by an access rule.

It also returns a default subject for each question. One answer renderer,
`renderQuestionAnswer`, serves the build and the browser. The page renders the default answers in
HTML and embeds the tables as JSON. A `<select>` per question changes the subject.

Default subjects are fixed by rule so that two builds agree:

- the operation with the most allowed roles;
- the role with the most steps;
- the resource with the most steps acting on it.

Each rule breaks ties by name order.

### Share cards render at build time from Astro endpoints

`src/pages/playground/[key].png.ts` is a static endpoint. It builds an SVG from the genome-map
view-model (company name, industry, provenance label, the first two levels of the role tree and
the first six steps) and returns `sharp(svg).png()`. `src/pages/operating-model-template.png.ts`
renders the template page's card. Each page passes its card to `metadata.openGraph.images` with
an absolute URL and an explicit size. `adaptOpenGraphImages` passes such an image through
unprocessed, because the PNG does not exist yet when the page renders. `Metadata.astro` also
states the image as `twitter:image`.

_Alternative:_ a script like `generate-modeling-og.mjs` whose PNGs are committed. We rejected it
because adding a genome would then need someone to run a script by hand.

### Provenance is a discriminated union on the authored genome

```ts
provenance:
  | { kind: 'fictional' }
  | { kind: 'public-sources'; sources: { title: string; url: string; supports: string }[] };
```

`genome-validate.ts` enforces the bar: a provenance kind is present; a public-sources genome has
at least three sources, and each source has a title, an `https` URL and a non-empty `supports`
note. The build cannot check the rule against naming real people, so a reviewer checks it. The
authoring comment on the type states that rule. `/genome/<key>.json` does not carry provenance, so
its shape does not change.

### The agent prompt is a template in data

The "make yours" prompt is a function of the genome key and company name. It names
`/genome/<key>.json` and `https://agents.dna.codes`, the DNA MCP host that the site's agent
documents already publish. It tells the agent to use the genome as a starting point, to draft the
visitor's own company in conversation, and to call `apply` only when the visitor asks. That last
instruction matches the MCP server's stated default.

### Tests run with `node:test` against relative-import modules

New pure logic goes in modules that use relative imports only: the map and question derivations,
the provenance check, the share-card SVG builder and the agent prompt. `node --test` loads them
directly. A test that needs the real corpus bundles it with esbuild first. A new `npm test` script
runs `node --test 'src/**/*.test.ts'`. Page-level behaviour (routes emitted, links, `og:image`,
sitemap, `/llms.txt`) is checked against `dist/` by extending `scripts/crawl-check.mjs`.

## Risks / Trade-offs

- **Share card fonts differ by machine.** `sharp` renders SVG text with the fonts installed on the
  build machine. → The cards use the same font stack as the existing cards. The crawl check
  verifies the size and the presence of each card, not its pixels.
- **A large genome makes a crowded map.** → The map scrolls inside its frame, and it changes to
  two columns only when its own frame is wide enough (a container query).
- **Six near-identical page shapes can read as thin content.** → Each page carries the genome's
  own description, map, answers and twelve artifacts, all specific to that company.
- **A real-company genome can misrepresent the company.** → The sourcing bar, the not-affiliated
  notice and the no-individuals rule ship now. The first real-company genome is a separate change
  that a person reviews.

## Migration Plan

This is a static site with no data migration. The change ships in one deploy. To roll back, revert
the commit. `/genome/<key>.json` keeps its shape, so nothing outside the site breaks either way.
