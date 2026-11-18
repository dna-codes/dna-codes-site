# Proposal

## Why

The Playground holds the site's strongest proof: six complete company genomes (Meridian Partners
and five others), compiled and schema-validated at build time. Today a visitor sees them only one
artifact at a time, after picking an industry and a set of lenses, and a search engine sees none
of it, because the artifacts render in the browser.

Each genome deserves a page that a person can open, explore, share and copy, and that a search
engine can read. The Playground is the place for those pages. A separate gallery would show the
same six companies a second time, and a visitor would have to ask which of the two to use.

The site also skips the keyword `operating model template`, because it offers no template to
download. Each genome's JSON is that template.

The homepage does not change. Its helix hero and its product section stay as they are, and the
hero's second action stays the Playground.

## What Changes

- **One static page per genome at `/playground/<key>/`.** Each page is readable with no
  JavaScript. It shows:
  - an explorable **genome map**: roles in their hierarchy, the process as an ordered rail with
    the role on each step, the resources, and the rules on the steps they govern;
  - **three questions the genome answers**, derived generically from the compiled genome: who may
    perform an operation, what stalls when a role is out, and who touches a resource;
  - every Playground artifact for that genome, rendered at build time by the existing renderers;
  - the vocabularies the genome is modeled on;
  - a **"make yours"** close: download the genome as JSON, a copyable prompt that starts an agent
    from this genome through the DNA MCP server, and the shared waitlist form.
- **The Playground links to them.** When a visitor picks an industry in Act I, a link to that
  company's page appears under the picker. The Playground flow does not otherwise change.
- **A Use Cases page at `/operating-model-template`.** It lists every genome as a card (company
  name, industry, description, provenance, and counts of roles, processes, rules and systems), and
  each card links to the genome's Playground page. It owns `operating model template` in the
  keyword registry and appears in the Use Cases menu and the footer.
- **Share cards.** Each genome page and the template page has its own Open Graph image, generated
  at build time from the compiled genomes. No image is drawn by hand.
- **Provenance on every genome.** A genome declares whether it is fictional or modeled from public
  sources. A public-sources genome must cite its sources and shows a not-affiliated notice. All six
  current genomes are fictional. A later genome of a well-known company is then a data change with
  a clear bar.

Out of scope:

- Any change to the homepage.
- A new top-level navigation entry. The Playground and Use Cases menus carry the new pages.
- The genome map or the questions on the main `/playground` page. It links to the sub-pages only.
- A genome of a real, named company. The provenance bar ships here. The first such genome is a
  separate, data-only change.
- Marking a role as performed by a person or by an agent. `@dna-codes/dna-schemas` has no field
  for it today.

## Capabilities

### New Capabilities

- `playground-genome-pages`: the `/playground/<key>/` pages, the genome map, the derived
  questions, the share cards, and the "make yours" close.

### Modified Capabilities

- `industry-genomes`: every genome declares its provenance, and a public-sources genome must meet a
  sourcing bar that the build enforces.
- `industry-dna-landing`: Act I links the picked industry to its genome page.
- `search-landing-pages`: `/operating-model-template` joins the landing pages and owns
  `operating model template`. `/operating-model` links to it.

## Impact

- **New pages:** `src/pages/playground/[key].astro`, `src/pages/playground/[key].png.ts`,
  `src/pages/operating-model-template.astro`, `src/pages/operating-model-template.png.ts`.
  `/playground` stays at `src/pages/playground.astro`. `src/pages/genome/[key].json.ts` stays and
  becomes the template download.
- **New modules (relative imports, tested with `node --test`):** genome-map and question
  derivations, the provenance check, the share-card SVG builder, and the agent-prompt template.
- **Renderers:** `src/utils/genome-render.ts` gains the map and question-answer renderers. The
  twelve existing renderers do not change. Their CSS moves to a shared stylesheet so the new pages
  can use it.
- **Types and validation:** `src/utils/genome-types.ts` and `src/utils/genome-validate.ts` gain
  provenance. The six genome files each declare `fictional`.
- **Data:** `src/navigation.ts` (Use Cases and footer), `src/data/seo/keywords.json`, `/llms.txt`.
- **Unchanged:** `src/pages/index.astro`, the `Hero` widget, the header's top-level links.
