# Search keyword targets: a registry, three landing pages, two posts

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
  waitlist form. Variants that would have been their own URLs are sections on the page that
  already owns the phrase, so the keyword stays assigned without a second thin page:
  - `/sop-software`: **sop software** (539, 30), plus sop management software and system, sop
    automation, and **sop software for small business** (24). The executable-SOP wedge, said in
    the buyer's words. A heading uses the small-business phrase.
  - `/operating-model`: **target operating model** (216, 22), plus digital operating model and
    operating model definition. The same page carries the ungated template download
    (**operating model template**, 45) and a how-to section (**how to build an operating model**,
    39, and operating model design). Those phrases are headings, not routes.
  - `/business-process-software`: **business process management software** (889, 27), plus BPM
    tools, BPM software, business process workflow software. Written as DNA against BPM suites,
    not as one (see design D6).

- **Two posts**, each owning an informational head term the commercial page cannot title for,
  and linking to the landing page in its cluster:
  - **Business Process Management, With Real Examples** (`/blog/business-process-management`):
    **business process management** (1,097, 28), plus bpm examples. This is the largest keyword
    we measured, and it is a definition query, not a software query.
  - **Business Process Modeling Notation, Explained** (`/blog/business-process-modeling`):
    **business process modeling notation** (534, 28), plus bpmn model and bpmn examples.
    **Business process modeling** (467, 32) stays on this post as a secondary. The notation title
    already contains that phrase, and a heading uses it exactly. One post, not two.

- **Agent and crawler surfaces.** The three landing pages and the two posts join `/llms.txt` and
  the sitemap. The landing pages join a Use Cases menu in the header and the same column in the footer. An agent reading the site finds them the way a
  search engine does.

## Capabilities

### New Capabilities

- `keyword-registry`: A single data file naming every measured keyword, which page owns each
  primary keyword, and that page's search title and description; a CSV import from the research
  sheet; and a build check that fails on broken or conflicting assignments.

- `search-landing-pages`: Public pages at `/sop-software`, `/operating-model` and
  `/business-process-software`, plus posts at `/blog/business-process-management` and
  `/blog/business-process-modeling`. Each owns one primary keyword and reads its metadata from
  the registry. The landing pages convert through the shared waitlist form. The posts link to
  the hub in their cluster. Folded keywords stay on those pages as secondaries with their own
  headings.

### Modified Capabilities

- `waitlist`: unchanged in behaviour. The new pages embed the one shared form, as the spec already
  requires of any page with a conversion section.

## Impact

- **New files**: `src/data/seo/keywords.json`, `src/utils/seo.ts` (`seoFor`, `keywordsFor`),
  `scripts/keywords-import.mjs`, `scripts/check-keywords.mjs`; pages `src/pages/sop-software.astro`,
  `src/pages/operating-model.astro`, `src/pages/business-process-software.astro`; the template's
  downloadable files under `public/operating-model/`; two posts in `src/data/post/`.
- **Modified files**: `src/content.config.ts` (optional `targetKeyword` on posts);
  `package.json` (`keywords:import`, `check:keywords`, and `check:keywords` in `build`);
  `src/pages/llms.txt.ts`; `src/navigation.ts` (footer links); `planned_posts.md` (the two
  posts, and the backlog items the new pages absorb).
- **Dependencies**: none. CSV parsing is small enough to write; the check is plain Node.
- **Existing pages**: not retitled in this change. The homepage and `/operations` keep their
  brand titles. Whether `/operations` should take a secondary operating-model keyword is an open
  question in `design.md`.
- **Risk: the BPM page over-claims.** `/llms.txt` tells agents DNA is not a BPM engine. The BPM
  landing page has to win BPM searches without saying otherwise. Design D6 sets the line.
- **Risk: thin pages.** Pages written to keywords can read like SEO filler, which hurts both
  conversion and ranking. That is also why the low-volume variants are sections instead of their
  own URLs. Each page carries a real worked example from a genome, the same way `/playground`
  does, rather than paraphrased copy.
- **Out of scope**: competitor alternative pages (Process Street, Tallyfy, Dozuki; measured as
  navigational brands, the "alternative" phrasings still need measuring), a free SOP generator
  tool, paid search, and retitling existing posts.
