# Tasks

Write each test before the code it covers (red, then green, then refactor). Run `npm run check`
after each group.

This change replaces an earlier draft (`add-genome-gallery`) that put the genomes in a gallery at
`/genome/` and rewrote the homepage hero. Groups 1 to 4 carry over from that draft unchanged and
are done. Group 5 removes what the draft added that this change does not want.

## 1. Test harness

- [x] 1.1 Add an `npm test` script that runs `node --test` over `src/**/*.test.ts`. Verify that
      `npm test` runs the existing `src/utils/schema-doc.test.ts` and passes.

## 2. Provenance

- [x] 2.1 Write failing tests for a relative-import provenance check: a missing provenance fails;
      a public-sources genome with fewer than three sources fails; a source without a title, an
      `https` URL or a `supports` note fails; `fictional` passes. Verify with `npm test`.
- [x] 2.2 Add the `provenance` union to `AuthoredGenome` in `src/utils/genome-types.ts`. Document
      the no-individuals rule in its comment. Implement the check and call it from
      `src/utils/genome-validate.ts`. Verify that the 2.1 tests pass.
- [x] 2.3 Declare `provenance: { kind: 'fictional' }` in all six `src/data/genome/*.genome.ts`
      files. Verify that `npm run check:genomes` passes. Then remove one declaration and verify
      that the check fails and names that genome. Restore the declaration.

## 3. Genome-map and question derivations

- [x] 3.1 Write failing tests for `genomeMap` against a small fixture genome: every role, step,
      resource and rule appears; each rule attaches to the step whose operation it governs; each
      role's reach (steps, rules, resources) is correct. Verify with `npm test`.
- [x] 3.2 Implement `genomeMap` in a relative-import module, and export it from
      `src/utils/genome.ts` next to `DERIVATIONS`. Verify that the 3.1 tests pass.
- [x] 3.3 Write failing tests for `genomeQuestions`: the three lookup tables; the "no rule
      governs this operation" case; the default subjects and their name-order tie-breaks;
      identical output on two calls. Verify with `npm test`.
- [x] 3.4 Implement `genomeQuestions`. Verify that the 3.3 tests pass. Then run both derivations
      on all six compiled genomes in a test, and verify that none throws and that every default
      subject is set.

## 4. Renderers, share cards and the agent prompt

- [x] 4.1 Write failing tests for `renderGenomeMap`: a `data-role`, `data-step`, `data-rule` or
      `data-resource` attribute for every element in the view-model, the reach JSON on the root,
      roles as buttons, and escaped text. Implement it in `src/utils/genome-render.ts` with its
      styles. Verify with `npm test`.
- [x] 4.2 Write the client script for role selection: pointer, Tab plus Enter or Space, Escape to
      clear, and no transitions under reduced motion.
- [x] 4.3 Add `renderQuestionAnswer`, used by the build and the browser.
- [x] 4.4 Write failing tests for the share-card SVG builder: company name, industry and
      provenance label; the role tree and step rail truncate as the design states; escaped text.
      Implement it. Verify with `npm test`.
- [x] 4.5 Write a failing test for the agent-prompt template: it names `/genome/<key>.json` and
      `https://agents.dna.codes`, and it tells the agent to save only when asked. Implement it.
      Verify with `npm test`.
- [x] 4.6 Move the twelve renderers' CSS from `GenomeGenerator.astro` to
      `src/assets/styles/genome-artifacts.css`, and import it there. Verify that `/playground`
      still renders its artifacts.
- [x] 4.7 Let `adaptOpenGraphImages` pass through an absolute image URL with an explicit size,
      and state the Open Graph image as `twitter:image` in `Metadata.astro`.

## 5. Remove the draft's gallery and homepage changes

- [x] 5.1 Restore `src/pages/index.astro` and `src/components/widgets/Hero.astro` to `HEAD`.
      Remove `FEATURED_GENOME` from `src/data/industries.ts`. Verify that `git diff HEAD` shows
      no change to either file, and that `dist/index.html` has the helix and the "Playground"
      action.
- [x] 5.2 Remove "Genomes" from the header and the footer in `src/navigation.ts`.
- [x] 5.3 Remove `src/pages/genome/index.astro` and `src/pages/genome/og.png.ts`. Keep
      `src/pages/genome/[key].json.ts`.

## 6. Genome pages in the Playground

- [x] 6.1 Move `src/pages/genome/[key].astro` to `src/pages/playground/[key].astro` and
      `src/pages/genome/[key].png.ts` to `src/pages/playground/[key].png.ts`. Point the page's
      `og:image` at `/playground/<key>.png`, its breadcrumb at `/playground`, and its "other
      companies" link at `/operating-model-template`. Verify that `npm run build` emits
      `dist/playground/<key>/index.html` and a 1200 × 628 `dist/playground/<key>.png` for all six
      genomes, and that `dist/playground/index.html` still exists.
- [x] 6.2 Add the Act I link in the Playground: hidden with no industry, and pointing at
      `/playground/<key>/` once one is picked or restored from the URL. Verify in the browser for
      a pick, a change of pick, and `/playground?industry=ma`.
- [x] 6.3 Compare every artifact on each genome page with the same artifact the Playground's code
      renders from `/genome/<key>.json`. Verify that the content is the same.
- [x] 6.4 Verify by keyboard alone on one genome page that Tab reaches a role, Enter or Space
      selects it, and Escape clears it.

## 7. Operating model template page

- [x] 7.1 In `src/data/seo/keywords.json`, make `operating model template` primary on
      `/operating-model-template` with a search title of 60 characters or fewer with the site
      suffix and a description of 155 characters or fewer. Make
      `business operating model template` secondary on the same page. Verify with
      `npm run check:keywords`.
- [x] 7.2 Build `src/pages/operating-model-template.astro` with one card per genome (name,
      industry, description, provenance, role/process/rule/system counts), each linking to
      `/playground/<key>/`, and the shared `WaitlistForm` with `preselect="operations"`. Take the
      metadata from `seoFor`. Add `src/pages/operating-model-template.png.ts`. Verify the six cards
      and their counts in the built page, and that its `og:image` is 1200 × 628.
- [x] 7.3 Add "Operating Model Template" to the Use Cases menu and the footer's Use Cases list in
      `src/navigation.ts`.
- [x] 7.4 Point the `/operating-model` link at `/operating-model-template` as the place to start
      from a filled operating model.
- [x] 7.5 In `/llms.txt`, list `/operating-model-template` in the Search section and every
      `/playground/<key>/` page with a one-line statement.

## 8. Checks

- [x] 8.1 Change the gallery assertions in `scripts/crawl-check.mjs` to assert, against `dist/`:
      every genome page and its share card exist; every genome page has its `og:image` and
      `twitter:image`; `/operating-model-template` has one card per genome and its own card; the
      sitemap and `/llms.txt` list every genome page and the template page; the homepage hero's
      secondary action still reads "Playground". Verify that it fails when one card is missing,
      then passes. Run `npm run check:crawl`.
- [x] 8.2 Check `/operating-model-template` and one genome page at 375 pixels wide. Verify that
      the page does not scroll horizontally, and that the map and wide artifacts scroll inside
      their frames.
- [x] 8.3 Run `npm test`, `npm run check` and `npm run build`. Verify that all three pass.
- [x] 8.4 Add a scratch seventh genome (a copy of an existing one under a new key and industry)
      and build. Verify that its page, template card and share card appear with no change to any
      page, component or renderer. Remove the scratch genome.
- [x] 8.5 Run `openspec validate add-playground-genome-pages --strict`. Verify that it passes.

## Workflow follow-up

- Archive the change with `/opsx:archive` after it merges.
- Propose the first public-sources genome (for example Netflix) as a separate data-only change.
- Request a person-or-agent performer field on Role from dna-codes-platform (ws-spec), so a later
  change can answer "which roles could an agent take?"
