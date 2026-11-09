# Tasks: add-search-keyword-targets

Ordered so the registry and its check exist before any page depends on them (§1–§2), the
commercial pages land before the posts that link to them (§3–§4), and agent surfaces are updated
once every route is real (§5). Three landing pages and two posts. The template, the
how-to, the small-business variant and the second modeling post are sections on those pages,
not routes.

## 1. Registry and import

- [x] 1.1 Write `scripts/keywords-import.mjs`: read a CSV whose header row exactly matches
      `keywords.seed.csv`, map snake_case headers to camelCase keys, coerce empty cells to `null`
      and numeric columns to numbers, sort by cluster then volume descending, write
      `src/data/seo/keywords.json`. Refuse a CSV with missing, extra or reordered columns
      (design D2).
- [x] 1.2 Add `"keywords:import": "node scripts/keywords-import.mjs"` to `package.json`.
- [x] 1.3 Seed the registry: `npm run keywords:import openspec/changes/add-search-keyword-targets/keywords.seed.csv`.
- [x] 1.4 Add `src/utils/seo.ts` with `seoFor(route)` and `keywordsFor(route)` (design D4).
      `seoFor` throws when the route has no primary row.
- [x] 1.5 Add optional `targetKeyword: z.string().optional()` to the post schema in
      `src/content.config.ts`, and resolve it in `src/utils/blog.ts` when a post has no explicit
      `metadata.title`.

## 2. The check

- [x] 2.1 Write `scripts/check-keywords.mjs` covering every fail and warn rule in design D5,
      reading `src/data/seo/keywords.json`, the post collection's frontmatter, and `dist/`.
- [x] 2.2 Add `"check:keywords": "node scripts/check-keywords.mjs"` and run it at the end of
      `npm run build`, after `emit-homepage-markdown.mjs`.
- [x] 2.3 Prove each fail rule once: a primary pointing at a missing route, two primaries on one
      page, a 61-character title, a 156-character description, a post with an unknown
      `targetKeyword`. Revert each.
- [x] 2.4 Add the check to the CI workflow next to `check:agentic` and `check:ax`, and to the
      verification checklist in `AGENTS.md`.

## 3. Landing pages

- [x] 3.1 `src/pages/sop-software.astro`: owns **sop software**. Opens on the buyer's problem
      (SOPs nobody follows, docs that drift from the work), shows one SOP from a genome becoming a
      runnable process, ends on the shared waitlist form. `metadata = seoFor('/sop-software')`.
      A heading uses **sop software for small business** and absorbs the backlog's "Google Docs
      Is Not a Process System" angle. No separate post.
- [x] 3.2 `src/pages/operating-model.astro`: owns **target operating model**. Shows an industry
      genome's roles, processes, rules and systems as one operating model, and contrasts it with
      the slide-deck operating model. A section headed **operating model template** shows a
      filled-in example, then the three ungated downloads. A section headed **how to build an
      operating model** covers the how-to and operating model design. No template route and no
      how-to post.
- [x] 3.3 Add a build step that compiles one genome with sample values stripped into a blank
      operating model template, written to `public/operating-model/template.xlsx`,
      `template.csv` and `template.json` (design D7). Open each download and confirm it is usable
      without DNA: headers make sense, no ids or schema noise in the spreadsheet.
- [x] 3.4 `src/pages/business-process-software.astro`: owns **business process management
      software**. Written to design D6: names the drift problem, shows DNA against BPM suites, says
      plainly where a BPM engine is the right choice. Links to both posts under "Read more".
- [x] 3.5 Each landing page embeds `WaitlistForm` with its interest pre-ticked, per the waitlist
      spec.
- [x] 3.6 Read each page as the searcher: does the first screen answer the query the page owns
      before it introduces DNA? Does each folded keyword appear as a heading?

## 4. Posts

Each post sets `targetKeyword`, carries `coAuthor: Claude (Anthropic)`, links to
`/business-process-software` (design D8), and follows the prose rules in `AGENTS.md`.

- [x] 4.1 **Business Process Management, With Real Examples** (`business-process-management`),
      target `business-process-management`. Worked examples. This is the 1,097-volume definition
      query, so it stays its own post.
- [x] 4.2 **Business Process Modeling Notation, Explained** (`business-process-modeling`), target
      `business-process-modeling-notation`. One process from a genome, drawn in BPMN and written
      in DNA side by side. A heading uses **business process modeling** and covers roles, steps,
      rules and handoffs, so that keyword does not get a second post. Links to `/docs/frameworks`
      and `/business-process-software`.
- [x] 4.3 Update `planned_posts.md`: add the two posts with their target keywords and cluster,
      and mark the backlog items the landing pages absorb (small-business SOP, how to build an
      operating model). Do not add posts for those.

## 5. Agent and crawler surfaces

- [x] 5.1 Add the three landing pages and the two posts to `/llms.txt` under a section that says
      what each is for. Confirm the "not a BPM engine" line still reads true next to the BPM page.
- [x] 5.2 Add the landing pages under a header Use cases menu, and the same column in the
      footer, in `src/navigation.ts`. Building With AI stays in Learn.
- [x] 5.3 Confirm all five routes are in the sitemap and pass `npm run check:agentic`.

## 6. Measurement

- [ ] 6.1 Add every primary and secondary keyword to the Moz campaign's tracked keywords.
- [ ] 6.2 Record a baseline rank (most will be unranked) in the sheet's notes column on launch day.

These two need the Moz account and the research sheet. They are not something the repository can do.

## 7. Verify

- [x] 7.1 `npm run build`, `npm run check`, `npm run check:agentic`, `npm run check:ax`,
      `npm run check:keywords` all pass.
- [x] 7.2 Rehearse a pivot end to end: in a scratch branch, move **sop software** from primary to
      secondary and promote **sop management software**, export, import, build. The check should
      pass with one warning (title lacks keyword) until the title is rewritten.
- [x] 7.3 Visual check of the three new pages and two posts: desktop, mobile, dark mode, and the
      `<br>` spacing rule in `AGENTS.md`.
