# Tasks: add-search-keyword-targets

Ordered so the registry and its check exist before any page depends on them (§1–§2), the
commercial pages land before the posts that link to them (§3–§4), and agent surfaces are updated
last, once every route is real (§6).

## 1. Registry and import

- [ ] 1.1 Write `scripts/keywords-import.mjs`: read a CSV whose header row exactly matches
      `keywords.seed.csv`, map snake_case headers to camelCase keys, coerce empty cells to `null`
      and numeric columns to numbers, sort by cluster then volume descending, write
      `src/data/seo/keywords.json`. Refuse a CSV with missing, extra or reordered columns
      (design D2).
- [ ] 1.2 Add `"keywords:import": "node scripts/keywords-import.mjs"` to `package.json`.
- [ ] 1.3 Seed the registry: `npm run keywords:import openspec/changes/add-search-keyword-targets/keywords.seed.csv`.
- [ ] 1.4 Add `src/utils/seo.ts` with `seoFor(route)` and `keywordsFor(route)` (design D4).
      `seoFor` throws when the route has no primary row.
- [ ] 1.5 Add optional `targetKeyword: z.string().optional()` to the post schema in
      `src/content.config.ts`, and resolve it in `src/utils/blog.ts` when a post has no explicit
      `metadata.title`.

## 2. The check

- [ ] 2.1 Write `scripts/check-keywords.mjs` covering every fail and warn rule in design D5,
      reading `src/data/seo/keywords.json`, the post collection's frontmatter, and `dist/`.
- [ ] 2.2 Add `"check:keywords": "node scripts/check-keywords.mjs"` and run it at the end of
      `npm run build`, after `emit-homepage-markdown.mjs`.
- [ ] 2.3 Prove each fail rule once: a primary pointing at a missing route, two primaries on one
      page, a 61-character title, a 156-character description, a post with an unknown
      `targetKeyword`. Revert each.
- [ ] 2.4 Add the check to the CI workflow next to `check:agentic` and `check:ax`, and to the
      verification checklist in `AGENTS.md`.

## 3. Landing pages

- [ ] 3.1 `src/pages/sop-software.astro`: owns **sop software**. Opens on the buyer's problem
      (SOPs nobody follows, docs that drift from the work), shows one SOP from a genome becoming a
      runnable process, ends on the shared waitlist form. `metadata = seoFor('/sop-software')`.
- [ ] 3.2 `src/pages/operating-model/index.astro`: owns **target operating model**. Shows an
      industry genome's roles, processes, rules and systems as one operating model, and contrasts
      it with the slide-deck operating model. Links to the template and the how-to post.
- [ ] 3.3 `src/pages/business-process-software.astro`: owns **business process management
      software**. Written to design D6: names the drift problem, shows DNA against BPM suites, says
      plainly where a BPM engine is the right choice.
- [ ] 3.4 Each page embeds `WaitlistForm` with its interest pre-ticked, per the waitlist spec.
- [ ] 3.5 Read each page as the searcher: does the first screen answer the query the page owns
      before it introduces DNA?

## 4. Template lead magnet

- [ ] 4.1 Add a build step that compiles one genome with sample values stripped into a blank
      operating model template, written to `public/operating-model/` as `.xlsx`, `.csv` and
      `.json` (design D7).
- [ ] 4.2 `src/pages/operating-model/template.astro`: owns **operating model template**. A
      filled-in example first, then the three ungated downloads, then the waitlist form.
- [ ] 4.3 Open each download and confirm it is usable without DNA: headers make sense, no ids
      or schema noise in the spreadsheet.

## 5. Posts

Each post sets `targetKeyword`, carries `coAuthor: Claude (Anthropic)`, links to its cluster hub
(design D8), and follows the prose rules in `AGENTS.md`.

- [ ] 5.1 **Business Process Modeling Notation vs. DNA** (`bpmn-vs-dna`), target
      `business-process-modeling-notation`. One process from a genome, drawn in BPMN and written
      in DNA side by side. Links to `/docs/frameworks` and `/business-process-software`.
- [ ] 5.2 **Business Process Modeling: A Practical Guide** (`business-process-modeling`), target
      `business-process-modeling`. Roles, steps, rules, handoffs, with a worked example.
- [ ] 5.3 **Business Process Management, With Real Examples** (`business-process-management`),
      target `business-process-management`.
- [ ] 5.4 **How to Build an Operating Model That Runs** (`how-to-build-an-operating-model`),
      target `how-to-build-an-operating-model`. Links to the template and `/operating-model`.
- [ ] 5.5 **SOP Software for Small Business** (`sop-software-for-small-business`), target
      `sop-software-for-small-business`. Absorbs the backlog's "Google Docs Is Not a Process
      System" angle. Links to `/sop-software`.
- [ ] 5.6 Update `planned_posts.md`: add the five posts with their target keywords and cluster,
      and mark which backlog items they absorb.

## 6. Agent and crawler surfaces

- [ ] 6.1 Add the three landing pages and the template to `/llms.txt` under a section that says
      what each is for. Confirm the "not a BPM engine" line still reads true next to the BPM page.
- [ ] 6.2 Add the landing pages to the footer's Learn or Operations column in
      `src/navigation.ts`. Not the header: the header's job is the conversion path.
- [ ] 6.3 Confirm all four routes are in the sitemap and pass `npm run check:agentic`.

## 7. Measurement

- [ ] 7.1 Add every primary and secondary keyword to the Moz campaign's tracked keywords.
- [ ] 7.2 Record a baseline rank (most will be unranked) in the sheet's notes column on launch day.

## 8. Verify

- [ ] 8.1 `npm run build`, `npm run check`, `npm run check:agentic`, `npm run check:ax`,
      `npm run check:keywords` all pass.
- [ ] 8.2 Rehearse a pivot end to end: in a scratch branch, move **sop software** from primary to
      secondary and promote **sop management software**, export, import, build. The check should
      pass with one warning (title lacks keyword) until the title is rewritten.
- [ ] 8.3 Visual check of the four new pages: desktop, mobile, dark mode, and the `<br>` spacing
      rule in `AGENTS.md`.
