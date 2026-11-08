# Design: search keyword targets

## Context

- Page metadata is written inline. Each page declares a `metadata` object with `title` and
  `description` and passes it to `Layout`; posts carry `title`, `excerpt` and an optional
  `metadata` block in frontmatter. `src/config.yaml` appends ` — DNA Codes` to every title unless
  `ignoreTitleTemplate` is set.
- The last commit (#54) trimmed five post titles that the suffix pushed past what a search result
  shows. Title length is already a thing we get wrong by hand.
- `/llms.txt` tells agents what DNA is and is not, including "not a fit for … BPM engines that
  execute long-running workflows". Anything we publish to win BPM searches has to agree with it.
- `/docs/frameworks` already maps DNA onto BPMN, DDD, ArchiMate, C4, Event Storming and TOGAF.
  The BPMN post has somewhere authoritative to link.
- Every genome under `src/data/genome/` compiles to validated Operational, Product and Technical
  documents at build time. That is the raw material for worked examples and for the template.
- `planned_posts.md` keeps an ops-leader backlog ("How to Write an SOP That Doesn't Get Ignored",
  "Google Docs Is Not a Process System", …) parked until the Future of Programming series closed.
  The series closed on Nov 1.

## Goals / Non-Goals

**Goals**

- Each measured keyword cluster has exactly one page that owns it.
- Swapping a page's target keyword, or moving a keyword to a different page, is a data edit that
  the build checks, not a search through `.astro` files.
- Research lives where research is comfortable (a spreadsheet), and the site cannot drift from it
  silently.
- Every new page converts through the shared waitlist form and teaches DNA with a real worked
  example.

**Non-Goals**

- Live keyword data at build time. The build never calls Moz or Google.
- Automatic copy generation. The registry owns titles and descriptions, not page copy or H1s.
- Rank tracking inside the site. That stays in the Moz campaign.
- Retitling the homepage, `/operations` or the published series.

## Decisions

### D1: One registry file, one row per keyword

`src/data/seo/keywords.json` is an array of rows with the same columns as the research sheet:

```jsonc
{
  "id": "sop-software", // stable slug, referenced from posts
  "keyword": "sop software",
  "volume": 539, // monthly, null when unmeasured
  "difficulty": 30, // Moz 1–100, null when unmeasured
  "intent": "commercial", // informational | commercial | transactional | navigational | null
  "cluster": "sop",
  "fit": 3, // 1 loose … 3 exact, our judgement
  "role": "primary", // primary | secondary | candidate | to-measure | skip
  "page": "/sop-software", // required for primary and secondary
  "pageType": "landing", // landing | post
  "title": "SOP Software That Runs, Not Just Documents", // primary only, without the site suffix
  "description": "SOP software that turns written procedures into …", // primary only
  "measuredAt": "2026-11-08",
  "source": "moz",
  "notes": "Commercial anchor.",
}
```

Keeping candidates, to-measure and skip rows in the same file is deliberate. A pivot usually
promotes a keyword we already measured and passed over, and the reason we passed is in its row.

_Alternative rejected:_ metadata in each page plus a keyword list on the side. Two places to edit
on every pivot is the drift this change exists to remove.

_Alternative rejected:_ YAML. The rest of `src/data/` is TypeScript and JSON, and JSON round-trips
from CSV without a parser dependency.

### D2: The sheet is the workspace, the registry is the truth

Research happens in the **DNA Keyword Targets** Google Sheet: new Moz pulls get pasted in, roles
get argued over, titles get drafted. The site never reads the sheet. Instead:

1. File → Download → CSV.
2. `npm run keywords:import ~/Downloads/DNA\ Keyword\ Targets.csv`
3. Review the diff of `src/data/seo/keywords.json` in the pull request.

The import maps the sheet's snake_case headers to the registry's camelCase keys, coerces empty
cells to `null`, sorts by cluster then volume, and writes the file. It refuses a CSV whose header
row does not match, so a reordered or renamed column fails loudly instead of shifting every value
one column over.

_Alternative rejected:_ reading the sheet with the Sheets API at build time. It puts a Google
credential in CI, makes builds depend on a network call, and means a typo in the sheet ships
without review. The pull-request diff is the review step.

### D3: One primary per page, one page per primary

A page owns exactly one primary keyword, and a primary keyword belongs to exactly one page. Two
pages chasing the same query split their own ranking. Secondary keywords belong to a page too, but
only inform its copy: they never set the title.

The check enforces both directions (D5). When a commercial phrase and an informational phrase
name different searches, they get different pages: `/business-process-software` owns
**business process management software**; the post owns **business process management**.

A variant does not get its own page when the owning page can say the phrase in a heading, or
when the primary title already contains it. **sop software for small business**, **operating
model template** and **how to build an operating model** are headings on their hubs. **Business
process modeling** is a heading on the notation post, whose title already contains those words.
Splitting any of those into another URL would thin the page that should rank and add a route
nobody asked to maintain.

### D4: Pages ask the registry, and fail if it has no answer

`src/utils/seo.ts` exports:

- `seoFor(route)` → `{ title, description }` for the route's primary row. It throws at build time
  if no primary row names that route, so a page cannot opt in and then silently fall back to
  inline copy.
- `keywordsFor(route)` → the primary and secondary rows for a route, for authors who want the
  cluster in front of them while writing.

A page opts in with one line:

```astro
const metadata = seoFor('/sop-software');
```

Posts opt in with `targetKeyword: business-process-management` in frontmatter. The blog
utility resolves it the same way when the post has no explicit `metadata.title`. An explicit
title in frontmatter still wins, so the published series is untouched.

### D5: What the check fails on, and what it only warns on

`npm run check:keywords` runs inside `npm run build`, after the build so it can see `dist/`.

Fails:

- A primary or secondary row whose `page` has no built HTML in `dist/`.
- Two primary rows with the same `page`, or the same `keyword`.
- A primary row with no `title` or no `description`.
- A title that, with the ` — DNA Codes` suffix, runs past 60 characters.
- A description past 155 characters.
- A post whose `targetKeyword` is not a primary row, or whose row's `page` is not that post's URL.
- A page that calls `seoFor` for a route with no primary row (this one surfaces as a build error
  from D4).

Warns:

- A primary title that does not contain its keyword.
- A primary keyword with difficulty over 40.
- A measurement older than 180 days.

The warnings are judgement calls. A title can be stronger without its exact keyword, and a hard
keyword can still be worth owning. They print so a pivot is made on purpose.

### D6: The BPM page argues with BPM suites, it does not pretend to be one

`/business-process-software` owns **business process management software**, the biggest
commercial cluster we measured. DNA is not a BPM engine, and `/llms.txt` says so. The page wins the
search by meeting the searcher's actual problem: process documentation that drifts from what the
software does. It then shows the difference:

- BPM suites draw the process and execute it on their own engine.
- DNA models the process as data, and every doc, workflow, app and agent reads that one model.

It names where a BPM suite is the right answer. That honesty is also the defence against the
bounce rate a mismatched page earns.

**Open question:** if this page converts poorly after a quarter, demote the cluster to `candidate`
and redirect the route to `/blog/business-process-management`. The registry makes that a two-row
change.

### D7: The template is a section of the operating-model page

**Operating model template** (45 searches a month) does not get its own route. `/operating-model`
owns **target operating model**, and a section on that page owns the template phrase as a
heading. The file is still generated at build time from a genome compiled with its sample values
stripped: roles, processes and steps, rules, systems. It ships two ways, linked from that section:

- A spreadsheet download (`.xlsx` and `.csv`), because that is what the searcher wants today.
- The same template as DNA (`.json`), because that is what it turns into.

The files live at `/operating-model/template.xlsx`, `/operating-model/template.csv` and
`/operating-model/template.json`, so they do not collide with the page. No email gate. A gate
blocks crawlers and agents from the content that earns the ranking, and the waitlist form sits
further down the same page. The section shows a filled-in example from one industry genome so
the empty template is never the first thing a visitor sees.

The same page has a how-to section headed with **how to build an operating model**. That query
is 39 searches a month at difficulty 41. A separate post would be a second operating-model URL
chasing the same reader.

### D8: One URL per head term, headings for the rest

Each commercial landing page is a hub. A post exists only when its primary keyword is a
different search from the hub's, large enough that a heading on the hub would not carry it.
The post links to the hub in its closing section, and the hub links back under "Read more".

| Cluster         | Hub (commercial)             | On the hub, as headings                                    | Own post                                 |
| --------------- | ---------------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| sop             | `/sop-software`              | sop software for small business; later How to Write an SOP | none                                     |
| operating-model | `/operating-model`           | operating model template; how to build an operating model  | none                                     |
| bpm             | `/business-process-software` | the software, tools and workflow phrases                   | Business Process Management (1,097)      |
| bpmn            | the modeling post            | business process modeling, bpmn model, bpmn examples       | Business Process Modeling Notation (534) |

The modeling post is the hub for the bpmn cluster because both head terms are informational.
Its title is "Business Process Modeling Notation, Explained", which also contains "business
process modeling", and a heading uses that phrase on its own. The two terms share a page
instead of competing as `/blog/bpmn-vs-dna` and `/blog/business-process-modeling`.

The posts follow the house rules in `AGENTS.md`: `coAuthor: Claude (Anthropic)`, em dashes rare.
They are written for ops leaders, the backlog's audience, not for the series' engineers.

### D9: How a pivot works

**Change a page's target keyword.** In the sheet, set the old primary's role to `secondary` or
`candidate`, set the new keyword's role to `primary` with the same page, write its title and
description, export, import, open a pull request. The check confirms the title fits and nothing
else claims the keyword. The H1 and body copy are a separate, deliberate edit.

**Move a cluster to a new page.** Add the page, then repoint the cluster's rows to the new route.
If the old route goes away, add a redirect in `astro.config.ts` the way `/whats-your-dna` was
handled, so earned links keep working.

**Drop a cluster.** Set its rows to `candidate` or `skip`. The check then fails on the orphaned
page's `seoFor` call, which is the reminder to delete or redirect the page.

**Evaluate a new positioning phrase** (for example, "company brain"). Add rows with role
`to-measure`, pull them in Moz, paste the numbers back. The row stays in the file either way, so
the next person sees it was tried.

## Open questions

- **Should `/operations` take a secondary operating-model keyword?** It is the closest existing
  page, but its title is the product name. Leaving it alone for now; revisit after
  `/operating-model` ranks.
- **Measuring conversion by page.** The waitlist form records interest but not the landing page.
  A hidden `source` field would tell us which cluster converts. That touches the waitlist spec
  and is left for a follow-up.
- **Moz subscription.** The trial converts to paid Moz Pro Medium on 2026-11-14. The registry
  does not depend on Moz, and `source` records where each number came from, so switching tools
  later is a column value.
