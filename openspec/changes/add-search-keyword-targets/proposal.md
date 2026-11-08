# Search keyword targets: a registry, three landing pages, a template, five posts

> How the registry is shaped, how a pivot works, and why each page owns the keyword it owns are
> in [`design.md`](./design.md). The research behind every number here is in
> [`keywords.seed.csv`](./keywords.seed.csv), pulled from Moz Keyword Explorer on 2026-11-08 and
> mirrored in the **DNA Keyword Targets** Google Sheet.

## Why

The site ranks for nothing anyone types. Every page is titled for a reader who already knows what
DNA is: "Living Operations for Your Team", "Operational DNA", "Playground". The blog series argues
a point of view (semantics, ontology, the operational model) and was never meant to catch search
traffic. So the only way onto the waitlist today is a link someone shares.

The phrases closest to how we describe DNA have no search demand. "Company brain" and "AI company
brain" get about one search a month. "Digital operating model" gets 20. Nobody searches for a
category that does not exist yet, so we cannot win the words we would choose.

We can win the words buyers already use for the problem DNA solves. A Moz pull across six seed
terms found a clear set with real volume, low difficulty (Moz score at or under 35) and a close
fit:

| Keyword                              | Volume / mo | Difficulty | Intent        |
| ------------------------------------ | ----------- | ---------- | ------------- |
| business process management          | 1,097       | 28         | informational |
| business process management software | 889         | 27         | commercial    |
| sop software                         | 539         | 30         | commercial    |
| business process modeling notation   | 534         | 28         | informational |
| business process modeling            | 467         | 32         | informational |
| business process management tools    | 469         | 26         | commercial    |
| target operating model               | 216         | 22         | commercial    |
| bpmn model                           | 175         | 25         | informational |
| business process workflow software   | 67          | 20         | commercial    |
| operating model template             | 45          | 31         | transactional |

Moz volumes run conservative. Read them as relative.

Two things follow from that table. First, the commercial terms cluster around **SOP software**,
**operating models** and **business process software**, which are the three doors an ops leader
walks through before they would ever hear the word DNA. Second, the informational terms are
mostly BPMN and process modeling, where DNA has a real argument to make: a process modeled as
data, not drawn as a diagram.

The waitlist is the conversion, not a search intent. Nobody searches "sign up for an operating
model waitlist." So every page below exists to catch a real search and then end on the shared
waitlist form, the same way the product pages do.

Keywords will change. Moz numbers move, positioning may shift toward or away from "company
brain", and the first pages will tell us which clusters convert. Today a pivot means hunting
through `.astro` files for title strings. This change makes a pivot a data edit.

## What Changes

- **Keyword registry.** One file, `src/data/seo/keywords.json`, holds every keyword we have
  measured: its volume, difficulty, intent, cluster, how well it fits, and its **role** (primary,
  secondary, candidate, to-measure, skip). A primary keyword names the one page that owns it and
  carries that page's search title and description.

- **Pages read their metadata from the registry.** Every page that targets a keyword calls one
  helper, `seoFor('/sop-software')`, for its `title` and `description` instead of writing them
  inline. Blog posts name their keyword with a new optional frontmatter field, `targetKeyword`.

- **A sheet-to-site pivot loop.** The Google Sheet is where research happens. Downloading it as
  CSV and running `npm run keywords:import <file>` rewrites the registry. `npm run check:keywords`
  then fails the build on anything a pivot can break: a primary keyword pointing at a page that
  does not exist, two pages claiming the same keyword, a title past what a search result shows.

- **Three landing pages**, each owning one commercial keyword cluster and ending on the shared
  waitlist form:
  - `/sop-software`: **sop software** (539, 30), plus sop management software and system, sop
    automation. The executable-SOP wedge, said in the buyer's words.
  - `/operating-model`: **target operating model** (216, 22), plus digital operating model and
    operating model definition. The closest search phrase to "living operating model".
  - `/business-process-software`: **business process management software** (889, 27), plus BPM
    tools, BPM software, business process workflow software. Written as DNA against BPM suites,
    not as one (see design D6).

- **One lead magnet.** `/operating-model/template` owns **operating model template** (45, 31): a
  free, ungated template generated from a DNA genome, downloadable as a sheet and as DNA, with the
  waitlist beside it.

- **Five posts**, each owning one informational cluster and linking to the landing page in its
  cluster:
  - **Business Process Modeling Notation vs. DNA** (`/blog/bpmn-vs-dna`): business process
    modeling notation (534, 28), bpmn model, bpmn examples.
  - **Business Process Modeling: A Practical Guide**: business process modeling (467, 32).
  - **Business Process Management, With Real Examples**: business process management (1,097, 28),
    bpm examples.
  - **How to Build an Operating Model That Runs**: how to build an operating model, operating
    model design.
  - **SOP Software for Small Business**: sop software for small business (24, 24).

- **Agent and crawler surfaces.** The three landing pages and the template join `/llms.txt`, the
  sitemap and the footer, so an agent reading the site finds them the way a search engine does.

## Capabilities

### New Capabilities

- `keyword-registry`: A single data file naming every measured keyword, which page owns each
  primary keyword, and that page's search title and description; a CSV import from the research
  sheet; and a build check that fails on broken or conflicting assignments.

- `search-landing-pages`: Public pages at `/sop-software`, `/operating-model`,
  `/operating-model/template` and `/business-process-software`, each owning one keyword cluster,
  reading its metadata from the registry, and converting through the shared waitlist form.

### Modified Capabilities

- `waitlist`: unchanged in behaviour. The new pages embed the one shared form, as the spec already
  requires of any page with a conversion section.

## Impact

- **New files**: `src/data/seo/keywords.json`, `src/utils/seo.ts` (`seoFor`, `keywordsFor`),
  `scripts/keywords-import.mjs`, `scripts/check-keywords.mjs`; pages `src/pages/sop-software.astro`,
  `src/pages/operating-model/index.astro`, `src/pages/operating-model/template.astro`,
  `src/pages/business-process-software.astro`; the template's downloadable files under `public/`;
  five posts in `src/data/post/`.
- **Modified files**: `src/content.config.ts` (optional `targetKeyword` on posts);
  `package.json` (`keywords:import`, `check:keywords`, and `check:keywords` in `build`);
  `src/pages/llms.txt.ts`; `src/navigation.ts` (footer links); `planned_posts.md` (the five
  posts, and the backlog items they absorb).
- **Dependencies**: none. CSV parsing is small enough to write; the check is plain Node.
- **Existing pages**: not retitled in this change. The homepage and `/operations` keep their
  brand titles. Whether `/operations` should take a secondary operating-model keyword is an open
  question in `design.md`.
- **Risk: the BPM page over-claims.** `/llms.txt` tells agents DNA is not a BPM engine. The BPM
  landing page has to win BPM searches without saying otherwise. Design D6 sets the line.
- **Risk: thin pages.** Three landing pages written to keywords can read like SEO filler, which
  hurts both conversion and ranking. Each page carries a real worked example from a genome, the
  same way `/playground` does, rather than paraphrased copy.
- **Out of scope**: competitor alternative pages (Process Street, Tallyfy, Dozuki; measured as
  navigational brands, the "alternative" phrasings still need measuring), a free SOP generator
  tool, paid search, and retitling existing posts.
